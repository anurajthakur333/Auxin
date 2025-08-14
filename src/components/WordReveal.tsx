import { CSSProperties, useEffect, useMemo, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

type Trigger = "visible" | "load" | "hover" | "click";
type Speed = "slow" | "medium" | "fast";
type Order = "ltr" | "rtl" | "center" | "random";

interface WordRevealProps {
  children: string;
  className?: string;
  style?: CSSProperties;
  trigger?: Trigger;
  speed?: Speed;
  once?: boolean;
  // Simple wording instead of "stagger"
  letterDelay?: number; // ms between letters inside a word
  wordDelay?: number;   // ms between words
  order?: Order;        // letter order inside a word
  wordGap?: string;     // space between word containers (e.g., '0.2em')
  wordLetterSpacing?: string; // tracking per word (e.g., '-20px')
  inheritHeadingLetterSpacing?: boolean; // if false, resets to normal inside
  bleedEm?: number; // vertical safe padding in em
}

const SPEEDS: Record<Speed, { duration: number; letterDelay: number; wordDelay: number }> = {
  slow: { duration: 0.9, letterDelay: 0.07, wordDelay: 0.15 },
  medium: { duration: 0.6, letterDelay: 0.05, wordDelay: 0.12 },
  fast: { duration: 0.4, letterDelay: 0.035, wordDelay: 0.08 },
};

export default function WordReveal({
  children,
  className = "",
  style = {},
  trigger = "visible",
  speed = "medium",
  once = true,
  letterDelay,
  wordDelay,
  order = "ltr",
  wordGap = "0.25em",
  wordLetterSpacing,
  inheritHeadingLetterSpacing = false,
  bleedEm = 0.12,
}: WordRevealProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const controls = useAnimation();
  const inView = useInView(containerRef, { once, amount: 0.2 });

  const preset = SPEEDS[speed];
  const duration = preset.duration; // seconds
  const perLetter = (letterDelay ?? preset.letterDelay) / 1000; // seconds
  const perWord = (wordDelay ?? preset.wordDelay) / 1000; // seconds

  // Split into words preserving spaces
  const tokens = useMemo(() => {
    // Split but keep spaces as separate tokens
    const parts: string[] = [];
    const re = /(\s+)/g;
    children.split(re).forEach((p) => {
      if (p.length > 0) parts.push(p);
    });
    return parts;
  }, [children]);

  // Start when visible/load/hover/click
  useEffect(() => {
    if (trigger === "visible" && inView) controls.start("show");
    if (trigger === "load") controls.start("show");
  }, [trigger, inView, controls]);

  const onEnter = () => trigger === "hover" && controls.start("show");
  const onClick = () => trigger === "click" && controls.start("show");

  // Compute letter order mapping for a given word length
  const orderMap = (len: number): number[] => {
    const idx = Array.from({ length: len }, (_, i) => i);
    switch (order) {
      case "rtl":
        return idx.reverse();
      case "center": {
        const out: number[] = [];
        const mid = Math.floor(len / 2);
        let l = mid - 1;
        let r = mid;
        while (l >= 0 || r < len) {
          if (r < len) out.push(r++);
          if (l >= 0) out.push(l--);
        }
        return out;
      }
      case "random":
        return idx.sort(() => Math.random() - 0.5);
      default:
        return idx;
    }
  };

  return (
    <span
      ref={containerRef}
      className={className}
      style={{
        ...style,
        display: "inline",
      }}
      onMouseEnter={onEnter}
      onClick={onClick}
    >
      {tokens.map((token, w) => {
        const isSpace = /^\s+$/.test(token);
        if (isSpace) {
          return (
            <span key={`space-${w}`} style={{ display: "inline" }}>
              {"\u00A0"}
            </span>
          );
        }

        const letters = Array.from(token);
        const sequence = orderMap(letters.length);
        return (
          <span
            key={`word-${w}`}
            style={{
              display: "inline-block",
              overflow: "hidden",
              marginRight: wordGap,
              // Reset heading letter-spacing unless explicitly inheriting
              letterSpacing: inheritHeadingLetterSpacing ? undefined : (wordLetterSpacing ?? "normal"),
            }}
          >
            {/* Safe vertical padding to avoid glyph clipping */}
            <span
              style={{
                display: "inline-block",
                overflow: "hidden",
                height: "1em",
                lineHeight: "1em",
                paddingTop: `${bleedEm}em`,
                paddingBottom: `${bleedEm}em`,
                marginTop: `-${bleedEm}em`,
                marginBottom: `-${bleedEm}em`,
              }}
            >
              {letters.map((ch, i) => (
                <motion.span
                  key={`l-${w}-${i}`}
                  initial={{ y: "100%" }}
                  animate={controls}
                  variants={{
                    show: {
                      y: 0,
                      transition: {
                        duration,
                        delay: w * perWord + sequence.indexOf(i) * perLetter,
                        ease: [0.22, 1, 0.36, 1],
                      },
                    },
                  }}
                  style={{ display: "inline-block" }}
                >
                  {ch}
                </motion.span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}


