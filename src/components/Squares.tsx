import React, { useRef, useEffect } from "react";

type CanvasStrokeStyle = string | CanvasGradient | CanvasPattern;

interface GridOffset {
  x: number;
  y: number;
}

interface SquaresProps {
  direction?: "diagonal" | "up" | "right" | "down" | "left";
  speed?: number;
  borderColor?: CanvasStrokeStyle;
  squareSize?: number;
  hoverFillColor?: CanvasStrokeStyle;
  hoverPattern?: "single" | "plus" | "diamond" | "square3x3" | "square5x5" | "line-horizontal" | "line-vertical" | "l-shape";
  /**
   * Optional: shift grid horizontally by a fractional number of cells.
   * Negative moves lines to the left; positive moves lines to the right.
   * Units are in cell widths (so 0.5 = half a cell).
   */
  centerShiftX?: number;
  /**
   * If true, ensures a vertical line is aligned to the exact canvas center
   * before applying `centerShiftX`.
   */
  alignVerticalToCenter?: boolean;
}

const Squares: React.FC<SquaresProps> = ({
  direction = "right",
  speed = 1,
  borderColor = "#333",
  squareSize = 25,
  hoverFillColor = "#222",
  hoverPattern = "single",
  centerShiftX = 0,
  alignVerticalToCenter = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const numSquaresX = useRef<number>(0);
  const numSquaresY = useRef<number>(0);
  const gridOffset = useRef<GridOffset>({ x: 0, y: 0 });
  const hoveredSquaresRef = useRef<GridOffset[]>([]);

  // Pattern calculation functions
  const getPatternSquares = (centerX: number, centerY: number, pattern: string): GridOffset[] => {
    const squares: GridOffset[] = [];
    
    switch (pattern) {
      case "single":
        squares.push({ x: centerX, y: centerY });
        break;
        
      case "plus":
        squares.push(
          { x: centerX, y: centerY },     // center
          { x: centerX - 1, y: centerY }, // left
          { x: centerX + 1, y: centerY }, // right
          { x: centerX, y: centerY - 1 }, // up
          { x: centerX, y: centerY + 1 }  // down
        );
        break;
        
      case "diamond":
        squares.push(
          { x: centerX, y: centerY },     // center
          { x: centerX - 1, y: centerY }, // left
          { x: centerX + 1, y: centerY }, // right
          { x: centerX, y: centerY - 1 }, // up
          { x: centerX, y: centerY + 1 }, // down
          { x: centerX - 1, y: centerY - 1 }, // top-left
          { x: centerX + 1, y: centerY - 1 }, // top-right
          { x: centerX - 1, y: centerY + 1 }, // bottom-left
          { x: centerX + 1, y: centerY + 1 }  // bottom-right
        );
        break;
        
      case "square3x3":
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            squares.push({ x: centerX + dx, y: centerY + dy });
          }
        }
        break;
        
      case "square5x5":
        for (let dx = -2; dx <= 2; dx++) {
          for (let dy = -2; dy <= 2; dy++) {
            squares.push({ x: centerX + dx, y: centerY + dy });
          }
        }
        break;
        
      case "line-horizontal":
        for (let dx = -2; dx <= 2; dx++) {
          squares.push({ x: centerX + dx, y: centerY });
        }
        break;
        
      case "line-vertical":
        for (let dy = -2; dy <= 2; dy++) {
          squares.push({ x: centerX, y: centerY + dy });
        }
        break;
        
      case "l-shape":
        squares.push(
          { x: centerX, y: centerY },     // center
          { x: centerX - 1, y: centerY }, // left
          { x: centerX - 2, y: centerY }, // left 2
          { x: centerX, y: centerY + 1 }, // down
          { x: centerX, y: centerY + 2 }  // down 2
        );
        break;
        
      default:
        squares.push({ x: centerX, y: centerY });
    }
    
    return squares;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      numSquaresX.current = Math.ceil(canvas.width / squareSize) + 2;
      numSquaresY.current = Math.ceil(canvas.height / squareSize) + 2;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const drawGrid = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

      // Compute horizontal alignment/shift
      let alignX = 0;
      if (alignVerticalToCenter) {
        const centerX = canvas.width / 2;
        const phaseX = (squareSize - (gridOffset.current.x % squareSize)) % squareSize;
        alignX = (centerX % squareSize - phaseX + squareSize) % squareSize;
      }
      const shiftX = ((centerShiftX * squareSize) % squareSize + squareSize) % squareSize;
      alignX = (alignX + shiftX) % squareSize;

      for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
        for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
          const squareX = x - (gridOffset.current.x % squareSize) + alignX;
          const squareY = y - (gridOffset.current.y % squareSize);

          const currentSquareX = Math.floor((x - startX) / squareSize);
          const currentSquareY = Math.floor((y - startY) / squareSize);
          
          const isHovered = hoveredSquaresRef.current.some(
            square => square.x === currentSquareX && square.y === currentSquareY
          );
          
          if (isHovered) {
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(squareX, squareY, squareSize, squareSize);
          }

          ctx.strokeStyle = borderColor;
          ctx.strokeRect(squareX, squareY, squareSize, squareSize);
        }
      }

      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2
      );
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(1, "#060010");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const updateAnimation = () => {
      const effectiveSpeed = Math.max(speed, 0.1);
      switch (direction) {
        case "right":
          gridOffset.current.x =
            (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
          break;
        case "left":
          gridOffset.current.x =
            (gridOffset.current.x + effectiveSpeed + squareSize) % squareSize;
          break;
        case "up":
          gridOffset.current.y =
            (gridOffset.current.y + effectiveSpeed + squareSize) % squareSize;
          break;
        case "down":
          gridOffset.current.y =
            (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
          break;
        case "diagonal":
          gridOffset.current.x =
            (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
          gridOffset.current.y =
            (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
          break;
        default:
          break;
      }

      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

      // Same alignment/shift for hover mapping
      let alignX = 0;
      if (alignVerticalToCenter) {
        const centerX = canvas.width / 2;
        const phaseX = (squareSize - (gridOffset.current.x % squareSize)) % squareSize;
        alignX = (centerX % squareSize - phaseX + squareSize) % squareSize;
      }
      const shiftX = ((centerShiftX * squareSize) % squareSize + squareSize) % squareSize;
      alignX = (alignX + shiftX) % squareSize;

      const hoveredSquareX = Math.floor(
        (mouseX + gridOffset.current.x - startX - alignX) / squareSize
      );
      const hoveredSquareY = Math.floor(
        (mouseY + gridOffset.current.y - startY) / squareSize
      );

      const currentHoveredSquare = hoveredSquaresRef.current.length > 0 ? hoveredSquaresRef.current[0] : null;
      
      if (
        !currentHoveredSquare ||
        currentHoveredSquare.x !== hoveredSquareX ||
        currentHoveredSquare.y !== hoveredSquareY
      ) {
        hoveredSquaresRef.current = getPatternSquares(hoveredSquareX, hoveredSquareY, hoverPattern);
      }
    };

    const handleMouseLeave = () => {
      hoveredSquaresRef.current = [];
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    requestRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [direction, speed, borderColor, hoverFillColor, squareSize, hoverPattern, centerShiftX, alignVerticalToCenter]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'auto'
      }}
    />
  );
};

export default Squares; 