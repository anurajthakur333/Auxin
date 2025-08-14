import { CSSProperties, useEffect, useMemo, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

type Trigger = "visible" | "load" | "hover" | "click";
type Speed = "slow" | "medium" | "fast";
type Order = "ltr" | "rtl" | "center" | "random";
interface TextRevealProps {
  children: string;
  className?: string;
  style?: CSSProperties;
  trigger?: Trigger;
  speed?: Speed;
  once?: boolean;
  letterDelay?: number; // ms between each letter animation (easy alternative to "stagger")
  order?: Order; // order of letter reveal
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
  order = "ltr",
}: TextRevealProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const controls = useAnimation();
  const inView = useInView(containerRef, { once, amount: 0.2 });

  // Get speed values
  const { duration, stagger } = SPEEDS[speed];
  const perLetterDelayMs = letterDelay ?? stagger;
  const perLetterDelayS = perLetterDelayMs / 1000;

  // Split text into letters while preserving spaces
  const letters = useMemo(() => Array.from(children), [children]);

  // Determine reveal order
  const revealOrder = useMemo(() => {
    const idx = letters.map((_, i) => i);
    switch (order) {
      case "rtl":
        return idx.reverse();
      case "center": {
        const out: number[] = [];
        const mid = Math.floor(idx.length / 2);
        let l = mid - 1;
        let r = mid;
        while (l >= 0 || r < idx.length) {
          if (r < idx.length) out.push(r++);
          if (l >= 0) out.push(l--);
        }
        return out;
      }
      case "random":
        return [...idx].sort(() => Math.random() - 0.5);
      case "ltr":
      default:
        return idx;
    }
  }, [letters, order]);

  // Handle triggers
  useEffect(() => {
    if (trigger === "visible" && inView) {
      controls.start("visible");
    } else if (trigger === "load") {
      controls.start("visible");
    }
  }, [trigger, inView, controls]);

  const handleHover = () => {
    if (trigger === "hover") controls.start("visible");
  };

  const handleClick = () => {
    if (trigger === "click") controls.start("visible");
  };

  return (
    <span
      ref={containerRef}
      className={className}
      style={{
        ...style,
        display: "inline-block",
        position: "relative",
      }}
      onMouseEnter={handleHover}
      onClick={handleClick}
    >
      <span
        style={{
          display: "block",
          overflow: "hidden",
          // Small horizontal padding to avoid clipping very wide glyphs
          paddingLeft: "0.1em",
          paddingRight: "0.1em",
          marginLeft: "-0.1em",
          marginRight: "-0.1em",
          whiteSpace: "pre",
        }}
      >
        {letters.map((ch, i) => {
          const revealIndex = revealOrder.indexOf(i);
          return (
            <motion.span
              key={i}
              initial={{ y: "100%" }}
              animate={controls}
              variants={{
                visible: {
                  y: 0,
                  transition: {
                    duration: duration / 1000,
                    delay: revealIndex * perLetterDelayS,
                    ease: [0.22, 1, 0.36, 1],
                  },
                },
                hidden: { y: "100%" },
              }}
              style={{ display: "inline-block" }}
            >
              {ch === " " ? "\u00A0" : ch}
            </motion.span>
          );
        })}
      </span>
    </span>
  );
}
