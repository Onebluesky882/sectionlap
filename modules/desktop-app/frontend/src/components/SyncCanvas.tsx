import { useEffect, useRef, useState } from "react";
import type * as Y from "yjs";
import type { Stroke } from "../types";

const COLORS = ["#1f2733", "#e53935", "#1e88e5", "#43a047", "#fbc02d"];

interface SyncCanvasProps {
  strokes: Y.Array<Stroke> | undefined;
  width: number;
  height: number;
  backgroundImageUrl?: string;
}

// Shared drawing surface for the whiteboard and document-highlight features.
// Renders `strokes` from a Yjs array and appends new strokes drawn locally —
// see modules/sync-service/README.md for the shared Stroke shape.
export function SyncCanvas({ strokes, width, height, backgroundImageUrl }: SyncCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef<{ points: { x: number; y: number }[] } | null>(null);
  const [color, setColor] = useState(COLORS[0]);
  const [lineWidth, setLineWidth] = useState(3);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    if (bgImageRef.current) {
      ctx.drawImage(bgImageRef.current, 0, 0, width, height);
    }

    const allStrokes = strokes ? strokes.toArray() : [];
    const drawing = drawingRef.current;
    const pending = drawing ? [{ color, width: lineWidth, points: drawing.points }] : [];

    for (const stroke of [...allStrokes, ...pending]) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (const point of stroke.points.slice(1)) {
        ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
    }
  };

  useEffect(() => {
    if (!backgroundImageUrl) {
      bgImageRef.current = null;
      draw();
      return;
    }
    const img = new Image();
    img.onload = () => {
      bgImageRef.current = img;
      draw();
    };
    img.src = backgroundImageUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundImageUrl]);

  useEffect(() => {
    if (!strokes) return;
    draw();
    strokes.observe(draw);
    return () => strokes.unobserve(draw);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes]);

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * width,
      y: ((event.clientY - rect.top) / rect.height) * height,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = { points: [pointFromEvent(event)] };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    drawingRef.current.points.push(pointFromEvent(event));
    draw();
  };

  const handlePointerUp = () => {
    const drawing = drawingRef.current;
    drawingRef.current = null;
    if (!drawing || drawing.points.length < 2 || !strokes) {
      draw();
      return;
    }
    const stroke: Stroke = { color, width: lineWidth, points: drawing.points };
    strokes.push([stroke]);
  };

  const handleClear = () => {
    if (!strokes) return;
    strokes.delete(0, strokes.length);
  };

  return (
    <div className="sync-canvas">
      <div className="sync-canvas-toolbar">
        {COLORS.map((c) => (
          <button
            key={c}
            className={c === color ? "sync-color-swatch active" : "sync-color-swatch"}
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
            aria-label={`Color ${c}`}
          />
        ))}
        <label className="sync-width-label">
          Width
          <input
            type="range"
            min={1}
            max={12}
            value={lineWidth}
            onChange={(event) => setLineWidth(Number(event.target.value))}
          />
        </label>
        <button className="btn" onClick={handleClear}>
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="sync-canvas-surface"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
}
