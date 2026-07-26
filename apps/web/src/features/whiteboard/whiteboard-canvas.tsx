"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Download,
  Eraser,
  Pencil,
  Redo2,
  RotateCcw,
  Save,
  Trash2,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COLORS = ["#0F172A", "#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#EF4444", "#FFFFFF"];
const SIZES = [2, 4, 8, 14] as const;

type Tool = "pen" | "eraser";

type Props = {
  storageKey: string;
};

function getPoint(
  canvas: HTMLCanvasElement,
  e: ReactPointerEvent<HTMLCanvasElement> | PointerEvent
) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

export function WhiteboardCanvas({ storageKey }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const undoStack = useRef<ImageData[]>([]);
  const redoStack = useRef<ImageData[]>([]);

  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(COLORS[1]);
  const [size, setSize] = useState<(typeof SIZES)[number]>(4);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [dirty, setDirty] = useState(false);

  const syncHistoryFlags = useCallback(() => {
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(redoStack.current.length > 0);
  }, []);

  const snapshot = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (undoStack.current.length > 40) undoStack.current.shift();
    redoStack.current = [];
    syncHistoryFlags();
    setDirty(true);
  }, [syncHistoryFlags]);

  const paintBackground = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save();
    ctx.fillStyle = "#F8FAFC";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 1;
    const step = 32;
    for (let x = 0; x <= w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const snapshotUrl =
      canvas.width && canvas.height ? canvas.toDataURL("image/png") : null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssWidth = container.clientWidth;
    const cssHeight = Math.max(420, Math.min(640, window.innerHeight - 280));

    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);

    paintBackground(ctx, canvas.width, canvas.height);
    if (snapshotUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = snapshotUrl;
    }
  }, [paintBackground]);

  const loadSaved = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setDirty(false);
      };
      img.src = raw;
    } catch {
      /* ignore corrupt storage */
    }
  }, [storageKey]);

  useEffect(() => {
    resizeCanvas();
    loadSaved();
    const onResize = () => resizeCanvas();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [resizeCanvas, loadSaved]);

  const drawLine = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const dpr = canvas.width / canvas.getBoundingClientRect().width;
    ctx.lineWidth = size * dpr * (tool === "eraser" ? 1.6 : 1);
    ctx.globalCompositeOperation = "source-over";
    // Eraser paints the board fill so strokes are covered without punching the bitmap.
    ctx.strokeStyle = tool === "eraser" ? "#F8FAFC" : color;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    snapshot();
    drawing.current = true;
    last.current = getPoint(canvas, e);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const point = getPoint(canvas, e);
    drawLine(last.current, point);
    last.current = point;
  };

  const endStroke = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas?.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    drawing.current = false;
    last.current = null;
  };

  const undo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || undoStack.current.length === 0) return;
    redoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    const prev = undoStack.current.pop()!;
    ctx.putImageData(prev, 0, 0);
    syncHistoryFlags();
    setDirty(true);
  };

  const redo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || redoStack.current.length === 0) return;
    undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    const next = redoStack.current.pop()!;
    ctx.putImageData(next, 0, 0);
    syncHistoryFlags();
    setDirty(true);
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    snapshot();
    paintBackground(ctx, canvas.width, canvas.height);
    setDirty(true);
  };

  const saveBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL("image/png");
      localStorage.setItem(storageKey, dataUrl);
      setDirty(false);
      toast.success("Whiteboard saved");
    } catch {
      toast.error("Could not save whiteboard");
    }
  };

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `taskflow-whiteboard-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("PNG downloaded");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_4px_24px_rgba(15,23,42,0.04)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={tool === "pen" ? "default" : "outline"}
            onClick={() => setTool("pen")}
            aria-pressed={tool === "pen"}
          >
            <Pencil className="h-4 w-4" />
            Pen
          </Button>
          <Button
            type="button"
            size="sm"
            variant={tool === "eraser" ? "default" : "outline"}
            onClick={() => setTool("eraser")}
            aria-pressed={tool === "eraser"}
          >
            <Eraser className="h-4 w-4" />
            Eraser
          </Button>
          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />
          <div className="flex items-center gap-1.5" role="group" aria-label="Stroke color">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                aria-label={`Color ${c}`}
                onClick={() => {
                  setColor(c);
                  setTool("pen");
                }}
                className={cn(
                  "h-7 w-7 rounded-full border border-slate-200 shadow-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                  color === c && tool === "pen" && "ring-2 ring-indigo-500 ring-offset-2"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5" role="group" aria-label="Stroke size">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                aria-label={`Size ${s}`}
                onClick={() => setSize(s)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl border transition-colors",
                  size === s
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                )}
              >
                <span
                  className="rounded-full bg-current"
                  style={{ width: s + 2, height: s + 2 }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={undo} disabled={!canUndo}>
            <Undo2 className="h-4 w-4" />
            Undo
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={redo} disabled={!canRedo}>
            <Redo2 className="h-4 w-4" />
            Redo
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={clearBoard}>
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={downloadPng}>
            <Download className="h-4 w-4" />
            PNG
          </Button>
          <Button type="button" size="sm" onClick={saveBoard}>
            <Save className="h-4 w-4" />
            {dirty ? "Save*" : "Saved"}
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_32px_rgba(15,23,42,0.06)]"
      >
        <canvas
          ref={canvasRef}
          className="block w-full touch-none cursor-crosshair"
          role="img"
          aria-label="Planning whiteboard canvas. Draw with pointer or touch."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endStroke}
          onPointerLeave={endStroke}
          onPointerCancel={endStroke}
        />
      </div>

      <p className="flex items-center gap-2 text-xs text-slate-500">
        <RotateCcw className="h-3.5 w-3.5" />
        Draw wireframes, arrows, or sticky-note ideas — then turn them into TaskFlow tasks.
        Sketches auto-load from this browser; use Save to persist.
      </p>
    </div>
  );
}
