"""
Draw animated flowchart frames from structured plan data, then compile to GIF + MP4 via ffmpeg.

Frame size: 900x320 (drawn at 1800x640 for 2x supersampling, then downscaled).

Visual model is a "debug stepper": every step card is visible from frame 1 as a
ghost outline (the whole path up front), one card at a time lights up as the
active/current step (glowing border, pulsing halo — like a debugger's current-line
highlight), and once passed it settles into a "done" state with a checkmark badge.
Steps that wrap to a new row are joined by a looping bezier connector so the path
never visually breaks.
"""

import asyncio
import os
import math
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ── Design tokens (match SectionLap Tailwind theme) ──────────────────────────
BG = "#1A2332"
TEAL = "#6AA098"
TEAL_DIM = "#3D6B65"
BORDER = "#DDE8E6"
WHITE = "#F7FAFA"
MUTED = "#64748B"
MILESTONE_BG = "#243447"
STEP_BG = "#1E2D3E"

# ── Canvas dimensions (2x for supersampling) ─────────────────────────────────
W2, H2 = 1800, 640          # draw size
W, H   = 900,  320          # final output size
FPS    = 12
FRAMES_PER_STEP = 10        # frames to animate one step appearing
HOLD_FRAMES     = 42        # hold after all steps shown (final state lingers)

# ── Card geometry (at 2x scale) ───────────────────────────────────────────────
CARD_W, CARD_H = 210, 130
CARD_R   = 20                # corner radius
BADGE_R  = 27
ARROW_W  = 60
GAP_X    = CARD_W + ARROW_W
ROW_GAP  = 110                # vertical room between rows for the loop-back curve
TITLE_H  = 90
PAD_X, PAD_Y = 70, 40

COLS_PER_ROW = 6             # max cards per row


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
    """Alpha-blend fg over bg (both opaque) — used for fixed-background fills/text."""
    fr, fg_, fb = _hex(fg)
    br, bg_, bb = _hex(bg)
    return (
        int(fr * alpha + br * (1 - alpha)),
        int(fg_ * alpha + bg_ * (1 - alpha)),
        int(fb * alpha + bb * (1 - alpha)),
    )


def _draw_glow(img: Image.Image, cx: float, cy: float, w: int, h: int, alpha: float, color: str = TEAL) -> None:
    """Paste a soft blurred halo behind a card — the pulsing 'active step' highlight."""
    if alpha <= 0:
        return
    pad = 36
    size = (w + 2 * pad, h + 2 * pad)
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [pad, pad, pad + w, pad + h], radius=CARD_R + 14, fill=int(255 * min(alpha, 1.0))
    )
    mask = mask.filter(ImageFilter.GaussianBlur(radius=18))
    glow = Image.new("RGB", size, _hex(color))
    img.paste(glow, (int(cx - w / 2 - pad), int(cy - h / 2 - pad)), mask)


def _draw_check(draw: ImageDraw.ImageDraw, cx: float, cy: float, size: float, color: tuple) -> None:
    """Hand-drawn checkmark — avoids relying on a glyph the fallback font may lack."""
    draw.line(
        [
            (cx - size * 0.5, cy + size * 0.05),
            (cx - size * 0.1, cy + size * 0.4),
            (cx + size * 0.55, cy - size * 0.45),
        ],
        fill=color, width=6, joint="curve",
    )


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
    """Return (cx, cy) for each step card at 2x scale."""
    positions = []
    for i in range(n_steps):
        col = i % COLS_PER_ROW
        row = i // COLS_PER_ROW
        cx = PAD_X + col * GAP_X + CARD_W // 2
        cy = TITLE_H + PAD_Y + row * (CARD_H + ROW_GAP) + CARD_H // 2
        positions.append((cx, cy))
    return positions


def _step_state(i: int, visible_count: int, n: int) -> str:
    """'done' (passed), 'entering' (the current/active step fading in), or 'pending' (ghost, not reached yet)."""
    if i < visible_count:
        return "done"
    if i == visible_count and visible_count < n:
        return "entering"
    return "pending"


def _draw_bezier(
    draw: ImageDraw.ImageDraw, p0: tuple, p1: tuple, ctrl: tuple, color: tuple, width: int, arrow: bool = True
) -> None:
    steps = 24
    pts = []
    for t in [k / steps for k in range(steps + 1)]:
        x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * ctrl[0] + t ** 2 * p1[0]
        y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * ctrl[1] + t ** 2 * p1[1]
        pts.append((x, y))
    draw.line(pts, fill=color, width=width, joint="curve")
    if arrow:
        dx, dy = pts[-1][0] - pts[-2][0], pts[-1][1] - pts[-2][1]
        ang = math.atan2(dy, dx)
        ah = 18
        a = (p1[0] - ah * math.cos(ang - 0.45), p1[1] - ah * math.sin(ang - 0.45))
        b = (p1[0] - ah * math.cos(ang + 0.45), p1[1] - ah * math.sin(ang + 0.45))
        draw.polygon([a, p1, b], fill=color)


def _connector_style(state_a: str, state_b: str, partial_alpha: float) -> tuple[tuple, int]:
    """Color/width for the connector between step i and i+1, keyed off their reveal state —
    ghost when neither side has been reached, a bright 'live' line while the next step is
    actively fading in, steady once both sides have settled into 'done'."""
    if state_a == "done" and state_b == "entering":
        return _blend(TEAL, 0.35 + 0.65 * partial_alpha), 6
    if state_a == "done" and state_b == "done":
        return _hex(TEAL_DIM), 5
    return _blend(TEAL_DIM, 0.28), 3


def _draw_frame(
    steps: list[dict],
    title: str,
    visible_count: int,
    partial_alpha: float,
    frame_idx: int,
    font_title,
    font_label,
    font_badge,
    font_tiny,
) -> Image.Image:
    n = len(steps)
    img = Image.new("RGB", (W2, H2), _hex(BG))

    pulse = 0.5 + 0.5 * math.sin(frame_idx * 0.3)

    positions = _step_positions(n)
    states = [_step_state(i, visible_count, n) for i in range(n)]

    # Glow halos first, so cards render crisply on top of the soft light.
    for i, step in enumerate(steps):
        cx, cy = positions[i]
        if states[i] == "entering":
            _draw_glow(img, cx, cy, CARD_W, CARD_H, 0.25 + 0.4 * partial_alpha)
        elif states[i] == "done" and visible_count >= n and i == n - 1:
            _draw_glow(img, cx, cy, CARD_W, CARD_H, 0.3 + 0.2 * pulse)

    draw = ImageDraw.Draw(img)

    draw.text((PAD_X, 30), title, font=font_title, fill=_hex(WHITE))
    shown = n if visible_count >= n else visible_count + (1 if partial_alpha > 0.5 else 0)
    draw.text((PAD_X, 32 + 56), f"STEP {shown} / {n}", font=font_tiny, fill=_blend(MUTED, 0.9, bg=BG))

    # Connectors (drawn under cards so card borders cleanly cap the line ends).
    for i in range(n - 1):
        color, width = _connector_style(states[i], states[i + 1], partial_alpha)
        (ax, ay), (bx, by) = positions[i], positions[i + 1]
        same_row = (i + 1) // COLS_PER_ROW == i // COLS_PER_ROW
        if same_row:
            p0 = (ax + CARD_W / 2, ay)
            p1 = (bx - CARD_W / 2, by)
            ctrl = ((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2)
        else:
            p0 = (ax + CARD_W / 2, ay + CARD_H * 0.2)
            p1 = (bx - CARD_W / 2, by - CARD_H * 0.2)
            loop_x = max(p0[0], p1[0]) + GAP_X * 0.55
            ctrl = (loop_x, (p0[1] + p1[1]) / 2)
        _draw_bezier(draw, p0, p1, ctrl, color, width)

    for i, step in enumerate(steps):
        cx, cy = positions[i]
        state = states[i]
        is_milestone = bool(step.get("milestone"))
        x0, y0, x1, y1 = cx - CARD_W / 2, cy - CARD_H / 2, cx + CARD_W / 2, cy + CARD_H / 2

        if state == "pending":
            fill = None
            border_col = _blend(TEAL if is_milestone else TEAL_DIM, 0.45)
            text_col = _blend(WHITE, 0.35)
        elif state == "entering":
            fill = _blend(MILESTONE_BG if is_milestone else STEP_BG, partial_alpha)
            border_col = _blend(TEAL, max(partial_alpha, 0.5))
            text_col = _blend(WHITE, max(partial_alpha, 0.4))
        else:  # done
            fill = _hex(MILESTONE_BG if is_milestone else STEP_BG)
            border_col = _hex(TEAL if is_milestone else TEAL_DIM)
            text_col = _hex(WHITE)

        draw.rounded_rectangle([x0, y0, x1, y1], radius=CARD_R, fill=fill, outline=border_col, width=4)

        label = step.get("label", "")
        lines = _wrap_label(draw, label, font_label, max_width=CARD_W - 60)
        line_h = 36
        start_y = cy + 6 - (len(lines) - 1) * line_h / 2
        for j, line in enumerate(lines):
            draw.text((cx, start_y + j * line_h), line, font=font_label, fill=text_col, anchor="mm")

        # Step badge, top-left corner: hollow number (pending) → filled number (entering) → checkmark (done).
        bx, by = x0 + BADGE_R * 0.75, y0 + BADGE_R * 0.75
        if state == "pending":
            draw.ellipse([bx - BADGE_R, by - BADGE_R, bx + BADGE_R, by + BADGE_R],
                         outline=_blend(TEAL_DIM, 0.5), width=3)
            draw.text((bx, by), str(i + 1), font=font_badge, fill=_blend(WHITE, 0.4), anchor="mm")
        elif state == "entering":
            badge_fill = _blend(TEAL, max(partial_alpha, 0.4))
            draw.ellipse([bx - BADGE_R, by - BADGE_R, bx + BADGE_R, by + BADGE_R], fill=badge_fill)
            draw.text((bx, by), str(i + 1), font=font_badge, fill=_hex(BG), anchor="mm")
        else:
            draw.ellipse([bx - BADGE_R, by - BADGE_R, bx + BADGE_R, by + BADGE_R], fill=_hex(TEAL))
            _draw_check(draw, bx, by, BADGE_R * 0.9, _hex(BG))

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
    font_badge = _try_font(30)
    font_tiny = _try_font(22)

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
                visible_count, partial_alpha, f,
                font_title, font_label, font_badge, font_tiny,
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
