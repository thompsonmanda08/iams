"use client";
import { useRef, useState, useEffect } from "react";

interface TransitionArrowProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  label: string;
  onClick: () => void;
  curveOffset?: number; // Offset for multiple transitions between same states
}

export const TransitionArrow = ({ from, to, label, onClick, curveOffset = 0 }: TransitionArrowProps) => {
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
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Base control point
  const controlX = fromX + dx / 2;
  const controlY = fromY + dy / 2 - Math.abs(dx) * 0.15;

  // Apply offset for multiple transitions between same states
  // Use perpendicular offset with mirroring for alternating curves
  let finalControlX = controlX;
  let finalControlY = controlY;
  let labelOffsetX = 0;
  let labelOffsetY = 0;

  // Check if this is a self-loop or very close nodes
  const isSelfLoop = Math.abs(dx) < 1 && Math.abs(dy) < 1;

  if (isSelfLoop) {
    // For self-loops, create larger arc above the node
    const arcRadius = 80 + Math.abs(curveOffset) * 30;
    finalControlX = fromX + arcRadius;
    finalControlY = fromY - arcRadius;

    // Offset self-loops vertically to avoid overlap
    finalControlY -= curveOffset * 60;

    // Label offset for self-loops
    labelOffsetY = curveOffset * 40;
  } else if (distance > 0) {
    // For regular transitions, use perpendicular offset with mirroring
    const perpX = dy / distance;
    const perpY = -dx / distance;

    // For even curveOffsets (0, 2, 4...), curve one way
    // For odd curveOffsets (1, 3, 5...), curve the opposite way
    // This creates a nice mirror effect
    const isMirroredCurve = Math.abs(curveOffset) % 2 !== 0;
    const mirrorFactor = isMirroredCurve ? -1 : 1;

    // Increase curve depth for better separation
    const offsetDistance = Math.ceil(Math.abs(curveOffset) / 2) * 100 * mirrorFactor;

    finalControlX = controlX + perpX * offsetDistance;
    finalControlY = controlY + perpY * offsetDistance;

    // Additional label offset perpendicular to the curve direction
    labelOffsetX = perpX * (Math.ceil(Math.abs(curveOffset) / 2) * 60 * mirrorFactor);
    labelOffsetY = perpY * (Math.ceil(Math.abs(curveOffset) / 2) * 60 * mirrorFactor);
  }

  // Unique marker ID for this arrow - include curve offset to differentiate between multiple transitions
  const markerId = `arrowhead-${from.x}-${from.y}-${to.x}-${to.y}-${curveOffset}`;
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
        d={`M ${fromX} ${fromY} Q ${finalControlX} ${finalControlY} ${toX} ${toY}`}
        stroke="transparent"
        strokeWidth="20"
        fill="none"
        className="cursor-pointer"
        onClick={onClick}
      />

      {/* Curved path */}
      <path
        d={`M ${fromX} ${fromY} Q ${finalControlX} ${finalControlY} ${toX} ${toY}`}
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
          x={finalControlX + labelOffsetX - textWidth / 2}
          y={finalControlY + labelOffsetY - 14}
          width={textWidth}
          height="28"
          fill="var(--card)"
          stroke="var(--primary)"
          strokeWidth="1.5"
          rx="6"
          className="shadow-sm"
          style={{
            filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))"
          }}
        />

        {/* Label text */}
        <text
          ref={textRef}
          x={finalControlX + labelOffsetX}
          y={finalControlY + labelOffsetY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="pointer-events-none font-semibold select-none"
          style={{
            fontSize: "12px",
            fill: "var(--primary)",
            fontWeight: 600
          }}>
          {label}
        </text>
      </g>
    </g>
  );
};
