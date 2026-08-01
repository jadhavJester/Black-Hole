import React, { useState, useRef, useEffect } from 'react';
import { GripHorizontal, Minus, Square, Maximize2 } from 'lucide-react';

interface DraggablePanelProps {
  title: React.ReactNode;
  initialX?: number;
  initialY?: number;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  className?: string;
  children: React.ReactNode;
}

export const DraggablePanel: React.FC<DraggablePanelProps> = ({
  title,
  initialX = 16,
  initialY = 16,
  initialWidth = 380,
  initialHeight,
  minWidth = 280,
  minHeight = 120,
  className = "",
  children,
}) => {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: initialX, y: initialY });
  const [size, setSize] = useState<{ width: number; height?: number }>({
    width: initialWidth,
    height: initialHeight,
  });
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const isDraggingRef = useRef<boolean>(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const isResizingRef = useRef<boolean>(false);
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: initialWidth,
    height: initialHeight || 300,
  });

  // Handle Drag Start on Header
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return; // Ignore buttons
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle Resize Start on Handle
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isResizingRef.current = true;
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height || 300,
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDraggingRef.current) {
      const newX = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffsetRef.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffsetRef.current.y));
      setPos({ x: newX, y: newY });
    } else if (isResizingRef.current) {
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;
      const newW = Math.max(minWidth, resizeStartRef.current.width + deltaX);
      const newH = Math.max(minHeight, resizeStartRef.current.height + deltaY);
      setSize({ width: newW, height: newH });
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    isResizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${size.width}px`,
        height: size.height && !isMinimized ? `${size.height}px` : 'auto',
      }}
      className={`glass-panel rounded-2xl z-20 pointer-events-auto flex flex-col shadow-2xl transition-shadow duration-200 select-none ${className}`}
    >
      {/* Draggable Header Bar */}
      <div
        onMouseDown={handleHeaderMouseDown}
        className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/80 border-b border-slate-800 rounded-t-2xl cursor-grab active:cursor-grabbing hover:bg-slate-900/90 transition-colors"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <GripHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="truncate font-semibold text-xs text-slate-200">{title}</div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isMinimized ? "Expand Console" : "Minimize Console"}
          >
            {isMinimized ? <Square className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Console Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 relative flex flex-col gap-3">
          {children}
        </div>
      )}

      {/* Resize Handle Handle (Bottom-Right Corner) */}
      {!isMinimized && (
        <div
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 group z-30"
          title="Drag to resize console"
        >
          <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-slate-500 group-hover:border-sky-400 transition-colors rounded-br-sm" />
        </div>
      )}
    </div>
  );
};
