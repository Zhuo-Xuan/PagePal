import { useState, useRef, useEffect } from "react";
import { GripVertical, X, Type, Pencil, Eraser } from "lucide-react";

export default function NotesWidget({ book, value, onChange, onClose }) {
  const [pos, setPos] = useState(null); // null = default CSS-anchored position
  const [mode, setMode] = useState(value?.mode || "type");
  const dragHandleRef = useRef(null);
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  function startDrag(e) {
    const widget = dragHandleRef.current.parentElement;
    const rect = widget.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startTop = rect.top;
    const startLeft = rect.left;

    function onMove(ev) {
      setPos({ top: startTop + (ev.clientY - startY), left: startLeft + (ev.clientX - startX) });
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function switchMode(next) {
    setMode(next);
    onChange({ ...value, mode: next });
  }

  function handleTextChange(e) {
    onChange({ ...value, mode: "type", text: e.target.value });
  }

  // Restore a saved drawing when switching into draw mode
  useEffect(() => {
    if (mode === "draw" && value?.drawing && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value.drawing;
    }
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  function getCanvasPos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  function startDrawing(e) {
    drawingRef.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  function draw(e) {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getCanvasPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#2A2118";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  }
  function stopDrawing() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    onChange({ ...value, mode: "draw", drawing: canvasRef.current.toDataURL() });
  }
  function clearCanvas() {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    onChange({ ...value, mode: "draw", drawing: null });
  }

  return (
    <div
      className="notes-widget"
      style={pos ? { top: pos.top, left: pos.left, right: "auto", bottom: "auto" } : undefined}
    >
      <div className="notes-header" ref={dragHandleRef} onPointerDown={startDrag}>
        <GripVertical size={14} />
        <span>Notes — {book.title}</span>
        <div className="notes-mode-toggle">
          <button className={mode === "type" ? "active" : ""} onClick={() => switchMode("type")} title="Type">
            <Type size={13} />
          </button>
          <button className={mode === "draw" ? "active" : ""} onClick={() => switchMode("draw")} title="Draw">
            <Pencil size={13} />
          </button>
        </div>
        <button className="notes-close" onClick={onClose}><X size={14} /></button>
      </div>

      {mode === "type" ? (
        <textarea
          className="notes-textarea"
          value={value?.text || ""}
          onChange={handleTextChange}
          placeholder="Jot down a thought..."
        />
      ) : (
        <div className="notes-canvas-wrap">
          <canvas
            ref={canvasRef}
            className="notes-canvas"
            width={300}
            height={200}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
          />
          <button className="notes-clear" onClick={clearCanvas}>
            <Eraser size={12} /> Clear
          </button>
        </div>
      )}
    </div>
  );
}