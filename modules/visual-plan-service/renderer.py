"""
Draw animated flowchart frames from structured plan data, then compile to GIF + MP4 via ffmpeg.

Frame size: 900x320 (drawn at 1800x640 for 2x supersampling, then downscaled).
"""

import asyncio
import os
import math
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# ── Design tokens (match SectionLap Tailwind theme) ──────────────────────────
BG = "#1A2332"
TEAL = "#6AA098"
TEAL_DIM = "#3D6B65"
BORDER = "#DDE8E6"
WHITE = "#F7FAFA"
MILESTONE_BG = "#243447"
STEP_BG = "#1E2D3E"

# ── Canvas dimensions (2x for supersampling) ─────────────────────────────────
W2, H2 = 1800, 640          # draw size
W, H   = 900,  320          # final output size
FPS    = 12
FRAMES_PER_STEP   = 10      # frames to animate one step appearing
HOLD_FRAMES        = 36     # hold after all steps shown

# ── Node geometry (at 2x scale) ───────────────────────────────────────────────
CIRCLE_D = 170
ARROW_W  = 50
GAP_X    = CIRCLE_D + ARROW_W
TITLE_H  = 80
PAD_X    = 60
PAD_Y    = 40

COLS_PER_ROW = 6            # max nodes per row

def _try_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial Bold.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def _hex(color: str) -> tuple[int, int, int]:
    c = color.lstrip("#")
    return int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)


def _blend(fg: str, alpha: float, bg: str = BG) -> tuple[int, int, int]:
    """Alpha-blend fg over bg."""
    fr, fg_, fb = _hex(fg)
    br, bg_, bb = _hex(bg)
    return (
        int(fr * alpha + br * (1 - alpha)),
        int(fg_ * alpha + bg_ * (1 - alpha)),
        int(fb * alpha + bb * (1 - alpha)),
    )


def _draw_arrow(draw: ImageDraw.ImageDraw, x0: int, x1: int, y: int, alpha: float):
    color = _blend(TEAL, alpha)
    mid_y = y
    draw.line([(x0, mid_y), (x1 - 16, mid_y)], fill=color, width=4)
    # arrowhead
    draw.polygon([
        (x1 - 16, mid_y - 10),
        (x1,      mid_y),
        (x1 - 16, mid_y + 10),
    ], fill=color)


def _wrap_label(draw: ImageDraw.ImageDraw, text: str, font, max_width: int, max_lines: int = 2) -> list[str]:
    """Greedy word-wrap into at most max_lines, truncating the last line with an ellipsis if words remain."""
    words = text.split()
    lines: list[str] = []
    current = ""
    i = 0
    while i < len(words) and len(lines) < max_lines:
        candidate = f"{current} {words[i]}".strip()
        if draw.textlength(candidate, font=font) <= max_width or not current:
            current = candidate
            i += 1
        else:
            lines.append(current)
            current = ""
    if current:
        lines.append(current)
    if not lines:
        return [text]

    if i < len(words):
        last = lines[-1]
        while last and draw.textlength(last + "…", font=font) > max_width:
            last = last[:-1]
        lines[-1] = last + "…"
    return lines


def _step_positions(n_steps: int) -> list[tuple[int, int]]:
    """Return (cx, cy) for each step node at 2x scale."""
    positions = []
    for i in range(n_steps):
        col = i % COLS_PER_ROW
        row = i // COLS_PER_ROW
        cx = PAD_X + col * GAP_X + CIRCLE_D // 2
        cy = TITLE_H + PAD_Y + row * (CIRCLE_D + 60) + CIRCLE_D // 2
        positions.append((cx, cy))
    return positions


def _draw_frame(
    steps: list[dict],
    title: str,
    visible_count: int,       # how many steps are fully visible
    partial_alpha: float,     # alpha for the step currently fading in (0..1)
    font_title,
    font_label,
) -> Image.Image:
    img = Image.new("RGB", (W2, H2), _hex(BG))
    draw = ImageDraw.Draw(img)

    draw.text((PAD_X, 32), title, font=font_title, fill=_hex(WHITE))

    positions = _step_positions(len(steps))
    r = CIRCLE_D // 2

    for i, step in enumerate(steps):
        cx, cy = positions[i]

        if i < visible_count:
            alpha = 1.0
        elif i == visible_count:
            alpha = partial_alpha
        else:
            alpha = 0.0

        if alpha <= 0:
            continue

        fill_col   = _blend(MILESTONE_BG if step.get("milestone") else STEP_BG, alpha)
        border_col = _blend(TEAL if step.get("milestone") else TEAL_DIM, alpha)
        text_col   = _blend(WHITE, alpha)

        draw.ellipse([(cx - r, cy - r), (cx + r, cy + r)], fill=fill_col, outline=border_col, width=4)

        if step.get("milestone"):
            dot_r = 9
            draw.ellipse([(cx - dot_r, cy - r + 18 - dot_r), (cx + dot_r, cy - r + 18 + dot_r)],
                         fill=_blend(TEAL, alpha))

        label = step.get("label", "")
        lines = _wrap_label(draw, label, font_label, max_width=r * 1.6)
        line_h = 36
        start_y = cy - (len(lines) - 1) * line_h / 2
        for j, line in enumerate(lines):
            draw.text((cx, start_y + j * line_h), line, font=font_label, fill=text_col, anchor="mm")

        # Arrow to next (same row)
        if i < len(steps) - 1:
            same_row = (i + 1) // COLS_PER_ROW == i // COLS_PER_ROW
            if same_row:
                nx, _ = positions[i + 1]
                next_alpha = 1.0 if i + 1 < visible_count else (partial_alpha if i + 1 == visible_count else 0.0)
                arr_alpha = min(alpha, next_alpha) if next_alpha > 0 else alpha * 0.3
                _draw_arrow(draw, cx + r, nx - r, cy, arr_alpha)

    return img.resize((W, H), Image.LANCZOS)


async def _run_ffmpeg(args: list[str]) -> None:
    """Run ffmpeg via asyncio's subprocess machinery — plain subprocess.run()
    called from FastAPI's sync-endpoint worker thread deadlocks under the
    active event loop's child watcher (reproduced: renderer/upload each work
    fine standalone, but the full /generate request hangs forever with no
    output). Native async subprocess avoids that thread/loop race.
    """
    proc = await asyncio.create_subprocess_exec(
        *args,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    _, stderr = await proc.communicate()
    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg failed ({proc.returncode}): {stderr.decode(errors='replace')}")


async def render(plan: dict, output_dir: str) -> dict[str, str]:
    """
    plan = { "title": str, "steps": [...], "totalDays": int }
    Returns { "gif": "/abs/path/out.gif", "mp4": "/abs/path/out.mp4" }
    """
    title = plan.get("title", "Learning Plan")
    steps = plan.get("steps", [])

    if not steps:
        raise ValueError("plan must have at least one step")

    font_title = _try_font(52)
    font_label = _try_font(28)

    total_frames = len(steps) * FRAMES_PER_STEP + HOLD_FRAMES

    with tempfile.TemporaryDirectory() as tmp:
        frame_paths = []
        for f in range(total_frames):
            # Determine visible_count and partial_alpha from frame index
            step_phase = f / FRAMES_PER_STEP
            visible_count = min(int(step_phase), len(steps))
            partial_alpha = math.sin((step_phase - int(step_phase)) * math.pi / 2) if visible_count < len(steps) else 1.0

            img = _draw_frame(
                steps, title,
                visible_count, partial_alpha,
                font_title, font_label,
            )
            path = os.path.join(tmp, f"frame_{f:04d}.png")
            img.save(path, "PNG")
            frame_paths.append(path)

        out_dir = Path(output_dir)
        out_dir.mkdir(parents=True, exist_ok=True)
        mp4_path = str(out_dir / "out.mp4")
        gif_path = str(out_dir / "out.gif")

        # MP4
        await _run_ffmpeg([
            "ffmpeg", "-y",
            "-framerate", str(FPS),
            "-i", os.path.join(tmp, "frame_%04d.png"),
            "-vf", f"scale={W}:{H}",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            mp4_path,
        ])

        # GIF (palettegen for quality)
        palette_path = os.path.join(tmp, "palette.png")
        await _run_ffmpeg([
            "ffmpeg", "-y",
            "-framerate", str(FPS),
            "-i", os.path.join(tmp, "frame_%04d.png"),
            "-vf", f"scale={W}:{H}:flags=lanczos,palettegen=stats_mode=diff",
            palette_path,
        ])
        await _run_ffmpeg([
            "ffmpeg", "-y",
            "-framerate", str(FPS),
            "-i", os.path.join(tmp, "frame_%04d.png"),
            "-i", palette_path,
            "-lavfi", f"scale={W}:{H}:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5",
            gif_path,
        ])

    return {"gif": gif_path, "mp4": mp4_path}
