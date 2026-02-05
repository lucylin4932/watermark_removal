
import React, { useRef, useEffect, useState } from 'react';

interface Props {
  imageUrl: string;
  onCancel: () => void;
  onSave: (maskDataUrl: string) => void;
}

const RefineCanvas: React.FC<Props> = ({ imageUrl, onCancel, onSave }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);

  useEffect(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    if (!ctx || !maskCtx) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const imgRatio = img.width / img.height;
      const containerRatio = containerWidth / containerHeight;

      let renderWidth, renderHeight;
      if (imgRatio > containerRatio) {
        renderWidth = containerWidth;
        renderHeight = containerWidth / imgRatio;
      } else {
        renderHeight = containerHeight;
        renderWidth = containerHeight * imgRatio;
      }

      canvas.width = renderWidth;
      canvas.height = renderHeight;
      maskCanvas.width = renderWidth;
      maskCanvas.height = renderHeight;

      ctx.drawImage(img, 0, 0, renderWidth, renderHeight);
      
      // Setup mask style
      maskCtx.strokeStyle = 'rgba(0, 122, 255, 0.5)';
      maskCtx.lineWidth = brushSize;
      maskCtx.lineCap = 'round';
      maskCtx.lineJoin = 'round';
    };
  }, [imageUrl]);

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const pos = getPointerPos(e);
    const maskCtx = maskCanvasRef.current?.getContext('2d');
    if (maskCtx) {
      maskCtx.beginPath();
      maskCtx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getPointerPos(e);
    const maskCtx = maskCanvasRef.current?.getContext('2d');
    const displayCtx = canvasRef.current?.getContext('2d');
    
    if (maskCtx && displayCtx) {
      maskCtx.lineTo(pos.x, pos.y);
      maskCtx.stroke();
      
      // Draw onto the display canvas as well for preview
      displayCtx.strokeStyle = 'rgba(0, 122, 255, 0.5)';
      displayCtx.lineWidth = brushSize;
      displayCtx.lineCap = 'round';
      displayCtx.lineJoin = 'round';
      displayCtx.lineTo(pos.x, pos.y);
      displayCtx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSave = () => {
    if (maskCanvasRef.current) {
      onSave(maskCanvasRef.current.toDataURL('image/png'));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center">
      <div className="w-full flex justify-between items-center px-6 py-4 bg-black/50 backdrop-blur-xl">
        <button onClick={onCancel} className="text-white font-semibold">Cancel</button>
        <h2 className="text-white font-bold text-sm tracking-tight">Manual Refinement</h2>
        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold">Apply</button>
      </div>

      <div className="flex-1 w-full flex items-center justify-center p-4" ref={containerRef}>
        <div className="relative canvas-container">
          <canvas 
            ref={canvasRef} 
            className="rounded-lg shadow-2xl cursor-crosshair bg-white"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <canvas ref={maskCanvasRef} className="hidden" />
        </div>
      </div>

      <div className="w-full px-8 py-8 bg-black/50 backdrop-blur-xl flex items-center justify-center gap-6">
        <div className="flex items-center gap-4 text-white">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Brush Size</span>
          <input 
            type="range" 
            min="10" 
            max="100" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-48 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <div 
              className="bg-blue-500 rounded-full" 
              style={{ width: `${brushSize/2}px`, height: `${brushSize/2}px` }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefineCanvas;
