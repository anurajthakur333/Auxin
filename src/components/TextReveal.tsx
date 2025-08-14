import { CSSProperties, useEffect, useMemo, useRef } from "react";
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
}: TextRevealProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const controls = useAnimation();
  const inView = useInView(containerRef, { once, amount: 0.2 });

  // Get speed values and per-letter delay
  const { duration, stagger } = SPEEDS[speed];
  const perLetterDelayS = (letterDelay ?? stagger) / 1000;

  // Split text into letters while preserving spaces
  const letters = useMemo(() => Array.from(children), [children]);

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
          // Add small padding to prevent character clipping
          paddingLeft: "0.1em",
          paddingRight: "0.1em",
          marginLeft: "-0.1em",
          marginRight: "-0.1em",
        }}
      >
        {letters.map((ch, i) => (
          <motion.span
            key={i}
            initial={{ y: "100%" }}
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
              hidden: { y: "100%" },
            }}
            style={{ display: "inline-block", whiteSpace: "pre" }}
          >
            {ch === " " ? "\u00A0" : ch}
          </motion.span>
        ))}
      </span>
    </span>
  );
}
