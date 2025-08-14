import { useEffect, useMemo, useRef, useState, CSSProperties } from "react";

type TriggerMode = "visible" | "load";

interface LiftUpTextProps {
  children: string;
  className?: string;
  style?: CSSProperties;
  trigger?: TriggerMode; // default: visible (starts when in view)
  once?: boolean; // default: true
  initialDelayMs?: number; // default: 300 (to match footer)
  stepDelayMs?: number; // default: 100 per letter (to match footer)
  distancePx?: number; // default: 500 translateY (to match footer)
  durationMs?: number; // default: 1000
  easing?: string; // default footer easing
}

export default function LiftUpText({
  children,
  className = "",
  style = {},
  trigger = "visible",
  once = true,
  initialDelayMs = 300,
  stepDelayMs = 100,
  distancePx = 500,
  durationMs = 1000,
  easing = "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
}: LiftUpTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [animated, setAnimated] = useState<boolean[]>([]);
  const [started, setStarted] = useState(false);

  const letters = useMemo(() => Array.from(children), [children]);

  // Kick off animation sequence
  const startAnimation = () => {
    if (started) return;
    setStarted(true);
    // Initialize
    setAnimated(new Array(letters.length).fill(false));
    // Stagger reveal like footer
    setTimeout(() => {
      letters.forEach((_, index) => {
        setTimeout(() => {
          setAnimated(prev => {
            const next = prev.length ? [...prev] : new Array(letters.length).fill(false);
            next[index] = true;
            return next;
          });
        }, index * stepDelayMs);
      });
    }, initialDelayMs);
  };

  useEffect(() => {
    if (trigger === "load") {
      startAnimation();
      return;
    }

    const node = containerRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimation();
          if (once) io.disconnect();
        }
      },
      { threshold: 0.3, rootMargin: "0px 0px -100px 0px" }
    );
    io.observe(node);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, once, letters.length]);

  // Reset if text changes
  useEffect(() => {
    setAnimated(new Array(letters.length).fill(false));
    setStarted(false);
  }, [letters.length]);

  return (
    <span
      ref={containerRef}
      className={className}
      style={{
        ...style,
        display: "inline-block",
        whiteSpace: "pre",
      }}
    >
      {letters.map((letter, index) => (
        <span
          key={index}
          style={{
            display: "inline-block",
            transform: animated[index] ? "translateY(0)" : `translateY(${distancePx}px)`,
            transition: `transform ${durationMs}ms ${easing}`,
            willChange: "transform",
          }}
        >
          {letter === " " ? "\u00A0" : letter}
        </span>
      ))}
    </span>
  );
}


