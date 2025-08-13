import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

type Trigger = "visible" | "load" | "hover" | "click";
type Speed = "slow" | "medium" | "fast" | number;
type Order = "ltr" | "rtl" | "center";

interface CleanSlideUpTextProps {
  children: string;
  className?: string;
  style?: CSSProperties;
  trigger?: Trigger;
  speed?: Speed; // preset or multiplier
  stagger?: number; // ms between letters
  distancePx?: number; // extra px beyond 100% (safety)
  order?: Order;
  once?: boolean;
  preset?: "display"; // heading preset
}

const SPEEDS: Record<Exclude<Speed, number>, { duration: number; stagger: number }> = {
  slow: { duration: 700, stagger: 70 },
  medium: { duration: 500, stagger: 55 },
  fast: { duration: 350, stagger: 45 },
};

export default function CleanSlideUpText({
  children,
  className = "",
  style = {},
  trigger = "visible",
  speed = "fast",
  stagger,
  distancePx,
  order = "ltr",
  once = true,
  preset,
}: CleanSlideUpTextProps) {
  // Resolve speed
  let durationMs = 500;
  let staggerMs = stagger ?? 50;
  if (typeof speed === "string") {
    const p = SPEEDS[speed];
    durationMs = p.duration;
    staggerMs = stagger ?? p.stagger;
  } else if (typeof speed === "number" && speed > 0) {
    durationMs = Math.max(120, 500 / speed);
    staggerMs = Math.max(8, (stagger ?? 50) / speed);
  }

  // Resolve preset defaults
  const effectivePadEm = preset === "display" ? 0.28 : 0.2;
  const extraPx = distancePx ?? (preset === "display" ? 80 : 40);

  const containerRef = useRef<HTMLSpanElement | null>(null);
  const controls = useAnimation();
  const inView = useInView(containerRef, { amount: 0.2, once });
  // const [revealed, setRevealed] = useState<boolean[]>([]);
  const [hasAnimated, setHasAnimated] = useState(false);
  // const [tracking, setTracking] = useState<string | null>(null);

  const letters = useMemo(() => Array.from(children), [children]);

  const orderIndexes = useMemo(() => {
    const pos = letters.map((_, i) => i);
    if (order === "rtl") return pos.reverse();
    if (order === "center") {
      const out: number[] = [];
      const n = pos.length;
      const c = Math.floor(n / 2);
      if (n % 2 === 1) out.push(c);
      let l = c - 1;
      let r = c + (n % 2 === 0 ? 0 : 1);
      while (l >= 0 || r < n) {
        if (l >= 0) out.push(l--);
        if (r < n) out.push(r++);
      }
      return out;
    }
    return pos;
  }, [letters, order]);

  useEffect(() => {
    setHasAnimated(false);
  }, [letters.length]);

  // Track parent letter-spacing so wrapping doesn't collapse tracking
  // useEffect(() => {
  //   if (!containerRef.current) return;
  //   const cs = window.getComputedStyle(containerRef.current);
  //   const ls = cs.letterSpacing;
  //   if (ls && ls !== "normal" && ls !== "0px") setTracking(ls);
  //   else setTracking(null);
  // }, [children]);

  const run = () => {
    if (once && hasAnimated) return;
    setHasAnimated(true);
    controls.start("show");
  };

  // Unified triggers via Framer Motion controls
  useEffect(() => {
    if (trigger === "load") {
      const t = window.setTimeout(() => run(), 0);
      return () => window.clearTimeout(t);
    }
    if (trigger === "visible") {
      if (inView) run();
      else if (!once) controls.set("hidden");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, inView, once]);

  const onEnter = () => { if (trigger === "hover") run(); };
  const onClick = () => { if (trigger === "click") run(); };

  // Reset animation when text changes
  useEffect(() => {
    controls.set("hidden");
    setHasAnimated(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  const durationS = durationMs / 1000;
  const staggerS = staggerMs / 1000;

  return (
    <motion.span
      ref={containerRef}
      className={className}
      style={{ ...style, display: "inline-block", whiteSpace: "pre" }}
      onMouseEnter={onEnter}
      onClick={onClick}
    >
      <div
        style={{
          overflow: "hidden",
          paddingTop: `${effectivePadEm}em`,
          paddingBottom: `${effectivePadEm}em`,
          paddingLeft: "0.1em",
          paddingRight: "0.1em",
          marginTop: `-${effectivePadEm}em`,
          marginBottom: `-${effectivePadEm}em`,
          marginLeft: "-0.1em",
          marginRight: "-0.1em",
        }}
      >
        {letters.map((ch, i) => {
          const isSpace = ch === " ";
          // Use 100% + extra pixels for clean slide
          const offscreenY = `calc(100% + ${extraPx}px)`;
          const delayIndex = orderIndexes.indexOf(i);
          return (
            <motion.span
              key={i}
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { y: offscreenY },
                show: {
                  y: 0,
                  transition: {
                    duration: durationS,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: delayIndex * staggerS,
                  },
                },
              }}
              style={{
                display: "inline-block",
                whiteSpace: "pre",
                willChange: "transform",
              }}
            >
              {isSpace ? "\u00A0" : ch}
            </motion.span>
          );
        })}
      </div>
    </motion.span>
  );
}


