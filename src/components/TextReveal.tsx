import { CSSProperties, useEffect, useMemo, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

type Trigger = "visible" | "load" | "hover" | "click";
type Speed = "slow" | "medium" | "fast";
type Direction = "ltr" | "rtl" | "center" | "random";

interface TextRevealProps {
  children: string;
  className?: string;
  style?: CSSProperties;
  trigger?: Trigger;
  speed?: Speed;
  direction?: Direction;
  once?: boolean;
  stagger?: number; // ms between letters
}

const SPEEDS: Record<Speed, { duration: number; stagger: number }> = {
  slow: { duration: 800, stagger: 60 },
  medium: { duration: 500, stagger: 40 },
  fast: { duration: 300, stagger: 25 },
};

export default function TextReveal({
  children,
  className = "",
  style = {},
  trigger = "visible",
  speed = "medium",
  direction = "ltr",
  once = true,
  stagger,
}: TextRevealProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const controls = useAnimation();
  const inView = useInView(containerRef, { once, amount: 0.2 });

  // Get speed values
  const { duration, stagger: defaultStagger } = SPEEDS[speed];
  const letterStagger = stagger ?? defaultStagger;

  // Split text into letters
  const letters = useMemo(() => Array.from(children), [children]);

  // Calculate reveal order
  const revealOrder = useMemo(() => {
    const indices = letters.map((_, i) => i);
    
    switch (direction) {
      case "rtl":
        return indices.reverse();
      case "center":
        const result: number[] = [];
        const mid = Math.floor(indices.length / 2);
        let left = mid - 1;
        let right = mid;
        
        while (left >= 0 || right < indices.length) {
          if (right < indices.length) result.push(right++);
          if (left >= 0) result.push(left--);
        }
        return result;
      case "random":
        return [...indices].sort(() => Math.random() - 0.5);
      default: // ltr
        return indices;
    }
  }, [letters, direction]);

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
    <motion.span
      ref={containerRef}
      className={className}
      style={{
        ...style,
        display: "inline-flex",
        overflow: "hidden",
        position: "relative",
        // Add padding to prevent clipping of wide characters
        paddingLeft: "0.05em",
        paddingRight: "0.05em",
        marginLeft: "-0.05em",
        marginRight: "-0.05em",
        // Add vertical padding for descenders/ascenders
        paddingTop: "0.1em",
        paddingBottom: "0.1em",
        marginTop: "-0.1em",
        marginBottom: "-0.1em",
      }}
      onMouseEnter={handleHover}
      onClick={handleClick}
    >
      {letters.map((letter, index) => {
        const revealIndex = revealOrder.indexOf(index);
        const delay = (revealIndex * letterStagger) / 1000;

        return (
          <motion.span
            key={index}
            initial="hidden"
            animate={controls}
            variants={{
              hidden: {
                y: "100%",
                opacity: 1,
              },
              visible: {
                y: 0,
                opacity: 1,
                transition: {
                  duration: duration / 1000,
                  delay,
                  ease: [0.22, 1, 0.36, 1], // Smooth easing
                },
              },
            }}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              position: "relative",
            }}
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        );
      })}
    </motion.span>
  );
}
