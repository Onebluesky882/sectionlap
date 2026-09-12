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
import base64
import io
import os
import math
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

# ── Design tokens (match SectionLap Tailwind theme — light card style) ───────
BG = "#F7FAFA"
TEAL = "#6AA098"
TEAL_DIM = "#7C9E97"
BORDER = "#DDE8E6"
INK = "#1A2332"             # text/title ink — was called WHITE back when BG was dark
MUTED = "#64748B"
MILESTONE_BG = "#E7F1EF"
STEP_BG = "#FFFFFF"

# ── Canvas dimensions (2x for supersampling) ─────────────────────────────────
W2, H2 = 1800, 640          # draw size
W, H   = 900,  320          # final output size
FPS    = 9                  # a bit slower than 12 — more time to read each step
FRAMES_PER_STEP = 10        # frames to animate one step appearing
HOLD_FRAMES     = 42        # hold after all steps shown (final state lingers)

# ── Card geometry (at 2x scale) ───────────────────────────────────────────────
CARD_W, CARD_H = 210, 130     # spacing grid — thumbnails sit centered in each cell
THUMB_LINEAR   = 108          # illustration size in the linear grid (smaller than
                               # cycle's THUMB — more steps per row to fit)
THUMB_LINEAR_R = 22
CARD_R   = 20                # glow-mask corner radius (generic, blurred either way)
BADGE_R  = 27
ARROW_W  = 60
GAP_X    = CARD_W + ARROW_W
ROW_GAP  = 110                # vertical room between rows for the loop-back curve
TITLE_H  = 90
PAD_X, PAD_Y = 70, 40

# ── Cycle mode geometry (isCycle plans — steps arranged in a ring with an
# illustration per step, e.g. a life cycle). A ring needs roughly square
# space, unlike the wide 900x320 linear canvas, so cycle mode renders at its
# own square size — the frontend fits either with object-contain.
CYCLE_W2, CYCLE_H2 = 1000, 1000
CYCLE_W, CYCLE_H = 500, 500
THUMB       = 148            # illustration thumbnail side length
THUMB_R     = 28             # thumbnail corner radius
CYCLE_BADGE_R = 22
CYCLE_TITLE_TOP = 130         # vertical space reserved for title/step-count text
CYCLE_CENTER = (CYCLE_W2 / 2, CYCLE_TITLE_TOP + (CYCLE_H2 - CYCLE_TITLE_TOP - 40) / 2)

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


# ── Cycle mode: ring layout with an illustration per step ────────────────────

def _decode_image(b64: str | None, size: int) -> Image.Image | None:
    """Decode a base64 illustration (from Workers AI) into a square
    thumbnail at the given size. Returns None on missing/invalid input so the
    caller can fall back to a plain badge — one bad image shouldn't sink the
    whole render."""
    if not b64:
        return None
    try:
        raw = base64.b64decode(b64)
        img = Image.open(io.BytesIO(raw)).convert("RGB")
        return ImageOps.fit(img, (size, size), Image.LANCZOS)
    except Exception:
        return None


def _rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size, size], radius=radius, fill=255)
    return mask


def _draw_step_node(
    img: Image.Image,
    draw: ImageDraw.ImageDraw,
    cx: float,
    cy: float,
    step_index: int,
    step: dict,
    image: Image.Image | None,
    mask: Image.Image,
    state: str,
    alpha: float,
    glow: bool,
    pulse: float,
    font_label,
    font_badge,
    thumb: int,
    thumb_r: int,
    badge_r: int,
) -> None:
    """One illustrated step: a thumbnail (AI-generated image, or a plain
    tinted card if generation failed/was skipped for that step) with a
    number/checkmark badge and a label below. Shared by both the linear grid
    and the ring layout — only positions/connectors differ between the two.
    """
    is_milestone = bool(step.get("milestone"))
    x0, y0, x1, y1 = cx - thumb / 2, cy - thumb / 2, cx + thumb / 2, cy + thumb / 2

    if state == "pending":
        draw.rounded_rectangle(
            [x0, y0, x1, y1], radius=thumb_r,
            outline=_blend(TEAL if is_milestone else TEAL_DIM, 0.4), width=3,
        )
        draw.text((cx, cy), str(step_index + 1), font=font_badge, fill=_blend(INK, 0.3), anchor="mm")
    else:
        if glow:
            glow_alpha = 0.25 + 0.4 * alpha if state == "entering" else 0.3 + 0.2 * pulse
            _draw_glow(img, cx, cy, thumb, thumb, glow_alpha)

        if image is not None:
            step_mask = mask if alpha >= 0.999 else mask.point(lambda p, a=alpha: int(p * a))
            img.paste(image, (int(x0), int(y0)), step_mask)
        else:
            fill = _blend(MILESTONE_BG if is_milestone else STEP_BG, alpha)
            draw.rounded_rectangle([x0, y0, x1, y1], radius=thumb_r, fill=fill)

        border_col = _blend(TEAL, max(alpha, 0.5))
        draw.rounded_rectangle([x0, y0, x1, y1], radius=thumb_r, outline=border_col, width=5)

        bx_, by_ = x1 - badge_r * 0.65, y0 + badge_r * 0.65
        if state == "done":
            draw.ellipse([bx_ - badge_r, by_ - badge_r, bx_ + badge_r, by_ + badge_r], fill=_hex(TEAL))
            _draw_check(draw, bx_, by_, badge_r * 0.85, _hex(BG))
        else:  # entering
            badge_fill = _blend(TEAL, max(alpha, 0.4))
            draw.ellipse([bx_ - badge_r, by_ - badge_r, bx_ + badge_r, by_ + badge_r], fill=badge_fill)
            draw.text((bx_, by_), str(step_index + 1), font=font_badge, fill=_hex(BG), anchor="mm")

    label = step.get("label", "")
    lines = _wrap_label(draw, label, font_label, max_width=thumb + 50, max_lines=2)
    line_h = 34
    label_y = y1 + 14
    for j, line in enumerate(lines):
        draw.text((cx, label_y + j * line_h), line, font=font_label, fill=_hex(INK), anchor="ma")


def _cycle_positions(n: int) -> tuple[list[tuple[float, float]], float]:
    """Evenly spaced points around a ring, starting at 12 o'clock, clockwise.
    Radius grows with step count so thumbnails don't overlap, capped to what
    the canvas can actually hold."""
    cx0, cy0 = CYCLE_CENTER
    usable_half_height = (CYCLE_H2 - CYCLE_TITLE_TOP - 40) / 2
    max_r = min(usable_half_height - THUMB / 2 - 90, CYCLE_W2 / 2 - THUMB / 2 - 60)
    radius = min(max(160.0, 34.0 * n), max_r)
    positions = []
    for i in range(n):
        angle = -math.pi / 2 + i * (2 * math.pi / n)
        positions.append((cx0 + radius * math.cos(angle), cy0 + radius * math.sin(angle)))
    return positions, radius


def _draw_cycle_frame(
    steps: list[dict],
    images: list[Image.Image | None],
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
    img = Image.new("RGB", (CYCLE_W2, CYCLE_H2), _hex(BG))
    draw = ImageDraw.Draw(img)

    cx0, cy0 = CYCLE_CENTER
    positions, radius = _cycle_positions(n)
    states = [_step_state(i, visible_count, n) for i in range(n)]
    mask = _rounded_mask(THUMB, THUMB_R)
    pulse = 0.5 + 0.5 * math.sin(frame_idx * 0.3)

    draw.text((PAD_X, 30), title, font=font_title, fill=_hex(INK))
    shown = n if visible_count >= n else visible_count + (1 if partial_alpha > 0.5 else 0)
    draw.text((PAD_X, 32 + 56), f"STEP {shown} / {n}", font=font_tiny, fill=_blend(MUTED, 0.9, bg=BG))

    # Connectors trace the ring itself — the arc from step i to i+1 (and, to
    # close the loop, from the last step back to the first) bows outward along
    # the circle rather than cutting a straight chord across it.
    for i in range(n):
        j = (i + 1) % n
        color, width = _connector_style(states[i], states[j], partial_alpha)
        (ax, ay), (bx, by) = positions[i], positions[j]
        mx, my = (ax + bx) / 2, (ay + by) / 2
        vx, vy = mx - cx0, my - cy0
        vlen = math.hypot(vx, vy) or 1
        ctrl = (mx + vx / vlen * radius * 0.26, my + vy / vlen * radius * 0.26)
        dx, dy = bx - ax, by - ay
        dist = math.hypot(dx, dy) or 1
        inset = THUMB / 2 + 10
        p0 = (ax + dx / dist * inset, ay + dy / dist * inset)
        p1 = (bx - dx / dist * inset, by - dy / dist * inset)
        _draw_bezier(draw, p0, p1, ctrl, color, width)

    for i, step in enumerate(steps):
        cx, cy = positions[i]
        state = states[i]
        alpha = partial_alpha if state == "entering" else 1.0
        is_last_glow = state == "done" and i == n - 1 and visible_count >= n
        _draw_step_node(
            img, draw, cx, cy, i, step, images[i], mask,
            state, alpha, glow=(state == "entering" or is_last_glow), pulse=pulse,
            font_label=font_label, font_badge=font_badge,
            thumb=THUMB, thumb_r=THUMB_R, badge_r=CYCLE_BADGE_R,
        )

    return img.resize((CYCLE_W, CYCLE_H), Image.LANCZOS)


def _draw_frame(
    steps: list[dict],
    images: list[Image.Image | None],
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
    draw = ImageDraw.Draw(img)

    pulse = 0.5 + 0.5 * math.sin(frame_idx * 0.3)

    positions = _step_positions(n)
    states = [_step_state(i, visible_count, n) for i in range(n)]
    mask = _rounded_mask(THUMB_LINEAR, THUMB_LINEAR_R)

    draw.text((PAD_X, 30), title, font=font_title, fill=_hex(INK))
    shown = n if visible_count >= n else visible_count + (1 if partial_alpha > 0.5 else 0)
    draw.text((PAD_X, 32 + 56), f"STEP {shown} / {n}", font=font_tiny, fill=_blend(MUTED, 0.9, bg=BG))

    # Connectors (drawn under nodes so borders cleanly cap the line ends).
    half = THUMB_LINEAR / 2
    for i in range(n - 1):
        color, width = _connector_style(states[i], states[i + 1], partial_alpha)
        (ax, ay), (bx, by) = positions[i], positions[i + 1]
        same_row = (i + 1) // COLS_PER_ROW == i // COLS_PER_ROW
        if same_row:
            p0 = (ax + half, ay)
            p1 = (bx - half, by)
            ctrl = ((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2)
        else:
            p0 = (ax + half, ay + half * 0.4)
            p1 = (bx - half, by - half * 0.4)
            loop_x = max(p0[0], p1[0]) + GAP_X * 0.55
            ctrl = (loop_x, (p0[1] + p1[1]) / 2)
        _draw_bezier(draw, p0, p1, ctrl, color, width)

    for i, step in enumerate(steps):
        cx, cy = positions[i]
        state = states[i]
        alpha = partial_alpha if state == "entering" else 1.0
        is_last_glow = state == "done" and i == n - 1 and visible_count >= n
        _draw_step_node(
            img, draw, cx, cy, i, step, images[i], mask,
            state, alpha, glow=(state == "entering" or is_last_glow), pulse=pulse,
            font_label=font_label, font_badge=font_badge,
            thumb=THUMB_LINEAR, thumb_r=THUMB_LINEAR_R, badge_r=BADGE_R,
        )

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
    is_cycle = bool(plan.get("isCycle"))

    if not steps:
        raise ValueError("plan must have at least one step")

    font_title = _try_font(52)
    font_label = _try_font(28)
    font_badge = _try_font(30)
    font_tiny = _try_font(22)

    thumb_size = THUMB if is_cycle else THUMB_LINEAR
    images = [_decode_image(s.get("image"), thumb_size) for s in steps]

    total_frames = len(steps) * FRAMES_PER_STEP + HOLD_FRAMES

    with tempfile.TemporaryDirectory() as tmp:
        frame_paths = []
        for f in range(total_frames):
            # Determine visible_count and partial_alpha from frame index
            step_phase = f / FRAMES_PER_STEP
            visible_count = min(int(step_phase), len(steps))
            partial_alpha = math.sin((step_phase - int(step_phase)) * math.pi / 2) if visible_count < len(steps) else 1.0

            if is_cycle:
                img = _draw_cycle_frame(
                    steps, images, title,
                    visible_count, partial_alpha, f,
                    font_title, font_label, font_badge, font_tiny,
                )
            else:
                img = _draw_frame(
                    steps, images, title,
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

        # Frames are already saved at their final size — this scale is a
        # no-op in the common case, just guarding against odd dimensions.
        out_w, out_h = (CYCLE_W, CYCLE_H) if is_cycle else (W, H)

        # MP4
        await _run_ffmpeg([
            "ffmpeg", "-y",
            "-framerate", str(FPS),
            "-i", os.path.join(tmp, "frame_%04d.png"),
            "-vf", f"scale={out_w}:{out_h}",
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
            "-vf", f"scale={out_w}:{out_h}:flags=lanczos,palettegen=stats_mode=diff",
            palette_path,
        ])
        await _run_ffmpeg([
            "ffmpeg", "-y",
            "-framerate", str(FPS),
            "-i", os.path.join(tmp, "frame_%04d.png"),
            "-i", palette_path,
            "-lavfi", f"scale={out_w}:{out_h}:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5",
            gif_path,
        ])

    return {"gif": gif_path, "mp4": mp4_path}
