"use client";
import { useRef, useState, useEffect } from "react";

interface TransitionArrowProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  label: string;
  onClick: () => void;
}

export const TransitionArrow = ({ from, to, label, onClick }: TransitionArrowProps) => {
  // Node dimensions (240px width, ~120px height based on StateNode)
  const NODE_WIDTH = 240;
  const NODE_HEIGHT = 120;

  // Calculate center points of nodes
  const fromX = from.x + NODE_WIDTH / 2;
  const fromY = from.y + NODE_HEIGHT / 2;
  const toX = to.x + NODE_WIDTH / 2;
  const toY = to.y + NODE_HEIGHT / 2;

  // Calculate control points for curved line
  const dx = toX - fromX;
  const dy = toY - fromY;
  const controlX = fromX + dx / 2;
  const controlY = fromY + dy / 2 - Math.abs(dx) * 0.15;

  // Unique marker ID for this arrow
  const markerId = `arrowhead-${from.x}-${from.y}-${to.x}-${to.y}`;
  const arrowSize = 10;

  // Track calculated text width for responsive label box
  const textRef = useRef<SVGTextElement>(null);
  const [textWidth, setTextWidth] = useState(100); // Default fallback width

  useEffect(() => {
    if (textRef.current) {
      const bbox = textRef.current.getBBox();
      // Add padding of 16px (8px on each side) to the calculated text width
      setTextWidth(bbox.width + 16);
    }
  }, [label]);

  return (
    <g className="transition-opacity" style={{ pointerEvents: "auto" }}>
      {/* Arrow marker definition */}
      <defs>
        <marker
          id={markerId}
          markerWidth={arrowSize}
          markerHeight={arrowSize}
          refX={arrowSize - 1}
          refY={arrowSize / 2}
          orient="auto"
          markerUnits="strokeWidth">
          <polygon
            points={`0 0, ${arrowSize} ${arrowSize / 2}, 0 ${arrowSize}`}
            fill="var(--primary)"
          />
        </marker>
      </defs>

      {/* Invisible wider hit area for easier clicking */}
      <path
        d={`M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`}
        stroke="transparent"
        strokeWidth="20"
        fill="none"
        className="cursor-pointer"
        onClick={onClick}
      />

      {/* Curved path */}
      <path
        d={`M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`}
        stroke="var(--primary)"
        strokeWidth="2.5"
        fill="none"
        markerEnd={`url(#${markerId})`}
        className="pointer-events-none transition-colors"
        style={{ opacity: 0.9 }}
      />

      {/* Label background - clickable */}
      <g onClick={onClick} className="cursor-pointer transition-opacity hover:opacity-90">
        <rect
          x={controlX - textWidth / 2}
          y={controlY - 14}
          width={textWidth}
          height="28"
          fill="var(--card)"
          stroke="var(--primary)"
          strokeWidth="1.5"
          rx="6"
          className="shadow-sm"
        />

        {/* Label text */}
        <text
          ref={textRef}
          x={controlX}
          y={controlY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="pointer-events-none text-xs font-semibold select-none"
          fill="var(--primary)">
          {label}
        </text>
      </g>
    </g>
  );
};
