import { CSSProperties, useEffect, useRef } from "react";
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
}: TextRevealProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const controls = useAnimation();
  const inView = useInView(containerRef, { once, amount: 0.2 });

  // Get speed values
  const { duration } = SPEEDS[speed];

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
        <motion.span
          initial="hidden"
          animate={controls}
          style={{
            display: "block",
            whiteSpace: "pre",
          }}
          variants={{
            hidden: { y: "100%" },
            visible: { 
              y: 0,
              transition: {
                duration: duration / 1000,
                ease: [0.22, 1, 0.36, 1],
              }
            },
          }}
        >
          {children}
        </motion.span>
      </span>
    </span>
  );
}
