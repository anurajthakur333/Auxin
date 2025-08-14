import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

type Trigger = "visible" | "load" | "hover" | "click";
type Speed = "slow" | "medium" | "fast";
interface TextRevealProps {
  children: string;
  className?: string;
  style?: CSSProperties;
  trigger?: Trigger;
  speed?: Speed;
  once?: boolean;
  letterDelay?: number; // ms per letter delay, left-to-right
  // 1-based per-letter offset map: key is letter index starting from 1,
  // value is extra horizontal spacing in px applied from that letter onward
  offsetMap?: Record<number, number>;
}

const SPEEDS: Record<Speed, { duration: number; stagger: number }> = {
  slow: { duration: 1000, stagger: 100 },
  medium: { duration: 500, stagger: 40 },
  fast: { duration: 300, stagger: 25 },
};

export default function TextReveal({
  children,
  className = "",
  style = {},
  trigger = "visible",
  speed = "medium",
  once = true,
  letterDelay,
  offsetMap = {},
}: TextRevealProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const controls = useAnimation();
  const inView = useInView(containerRef, { once, amount: 0.2 });
  const originalRef = useRef<HTMLSpanElement>(null);
  const [rects, setRects] = useState<Array<{ left: number; top: number; width: number; height: number; ch: string }>>([]);
  const [rowHeight, setRowHeight] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Get speed values and per-letter delay
  const { duration, stagger } = SPEEDS[speed];
  const perLetterDelayS = (letterDelay ?? stagger) / 1000;

  // Split text into letters while preserving spaces
  const letters = useMemo(() => Array.from(children), [children]);
  const hasOffsets = useMemo(() => Object.keys(offsetMap || {}).length > 0, [offsetMap]);

  // Precompute cumulative offsets (1-based indexing as requested)
  const cumulativeOffsetAt = (zeroBasedIndex: number): number => {
    // sum offsets for indices 1..(zeroBasedIndex+1)
    let sum = 0;
    for (let k = 1; k <= zeroBasedIndex + 1; k++) {
      const v = offsetMap[k];
      if (typeof v === 'number' && !Number.isNaN(v)) sum += v;
    }
    return sum;
  };

  // Handle triggers
  useEffect(() => {
    const start = async () => {
      setIsAnimating(true);
      await controls.start("visible");
      setIsAnimating(false);
    };
    if (trigger === "visible" && inView) {
      start();
    } else if (trigger === "load") {
      start();
    }
  }, [trigger, inView, controls]);

  const handleHover = () => {
    if (trigger === "hover") controls.start("visible");
  };

  const handleClick = () => {
    if (trigger === "click") controls.start("visible");
  };

  // Measure glyph boxes from the original continuous text (preserves kerning/spacing)
  useEffect(() => {
    const computeRects = () => {
      if (!containerRef.current || !originalRef.current) return;
      const textNode = originalRef.current.firstChild as Text | null;
      if (!textNode) return;
      const containerBox = containerRef.current.getBoundingClientRect();
      const next: Array<{ left: number; top: number; width: number; height: number; ch: string }> = [];
      for (let i = 0; i < letters.length; i++) {
        const range = document.createRange();
        range.setStart(textNode, i);
        range.setEnd(textNode, i + 1);
        const r = range.getBoundingClientRect();
        next.push({
          left: r.left - containerBox.left,
          top: r.top - containerBox.top,
          width: r.width,
          height: r.height,
          ch: letters[i] === " " ? "\u00A0" : letters[i],
        });
        range.detach();
      }
      setRects(next);
      const rh = originalRef.current.getBoundingClientRect().height;
      setRowHeight(rh);
    };
    computeRects();
    const ro = new ResizeObserver(() => computeRects());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", computeRects);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", computeRects);
    };
  }, [letters]);

  return (
    <span
      ref={containerRef}
      className={className}
      style={{
        ...style,
        display: "inline-block",
        position: "relative",
        overflow: "hidden", // clip slide-up to baseline area
      }}
      onMouseEnter={handleHover}
      onClick={handleClick}
    >
      {/* Real text keeps the exact spacing/kerning; hidden during animation */}
      <span ref={originalRef} style={{ whiteSpace: "pre", visibility: (isAnimating || hasOffsets) ? "hidden" : "visible" }}>
        {children}
      </span>
      {/* Overlay animated letters absolutely positioned at measured glyph boxes (only during animation) */}
      {(isAnimating || hasOffsets) && (
        <span style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {rects.map((r, i) => (
            <motion.span
              key={i}
              initial={{ y: rowHeight || r.height }}
              animate={controls}
              variants={{
                visible: {
                  y: 0,
                  transition: {
                    duration: duration / 1000,
                    delay: i * perLetterDelayS,
                    ease: [0.22, 1, 0.36, 1],
                  },
                },
                hidden: { y: rowHeight || r.height },
              }}
              style={{
                position: "absolute",
              left: r.left + cumulativeOffsetAt(i),
                top: r.top,
                width: r.width,
                height: r.height,
                display: "inline-block",
                whiteSpace: "pre",
              }}
            >
              {r.ch}
            </motion.span>
          ))}
        </span>
      )}
    </span>
  );
}
