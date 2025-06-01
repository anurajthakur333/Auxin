// src/components/ScrambleText.tsx

import {
  useEffect,
  useRef,
  useState,
  CSSProperties,
} from "react";

interface ScrambleTextProps {
  children: string;
  duration?: number;
  fps?: number;
  delay?: number;
  trigger?: "hover" | "load" | "click" | "visible";
  className?: string;
  style?: CSSProperties;
  letters?: string;
  scrambleColor?: string;
  glowEffect?: boolean;
  waveEffect?: boolean;
  onComplete?: () => void;
}

const DEFAULT_LETTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

const DEFAULT_GLOW_BLUR = 8;         // px
const DEFAULT_WAVE_AMPLITUDE = 3;     // px
const DEFAULT_WAVE_FREQ = 0.2;        // radians per frame

export default function ScrambleText({
  children,
  duration = 800,
  fps = 80,
  delay = 0,
  trigger = "hover",
  className = "",
  style = {},
  letters = DEFAULT_LETTERS,
  scrambleColor = style.color || "#ffffff",
  glowEffect = false,
  waveEffect = false,
  onComplete,
}: ScrambleTextProps) {
  // Replace all characters with spaces so nothing shows pre-scramble:
  const blank = children.replace(/./g, " ");
  const [displayText, setDisplayText] = useState(blank);
  const [isScrambling, setIsScrambling] = useState(false);

  const elementRef = useRef<HTMLSpanElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);
  const charSpansRef = useRef<HTMLSpanElement[]>([]);

  const frameInterval = 1000 / fps;
  const totalFrames = Math.ceil(duration / frameInterval);

  // Wrap each character (including spaces) in its own <span>, preserving whitespace
  useEffect(() => {
    if (!elementRef.current) return;
    charSpansRef.current = [];
    const container = elementRef.current;

    const wrapNode = (node: ChildNode) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          // Outer wrapper keeps whitespace: inline-block + white-space: pre
          const wrapper = document.createElement("span");
          wrapper.style.cssText = `
            position: relative;
            display: inline-block;
            white-space: pre;
            overflow: visible;
          `;
          wrapper.className = "char-wrapper";

          // Inner span holds the character itself, also preserving whitespace
          const span = document.createElement("span");
          span.className = "char";
          span.textContent = char;
          span.style.cssText = `
            position: relative;
            display: inline-block;
            white-space: pre;
            transition: all 0.2s ease;
            transform-origin: center;
            z-index: 1;
          `;

          if (glowEffect) {
            const glowSpan = document.createElement("span");
            glowSpan.className = "char-glow";
            glowSpan.textContent = char;
            glowSpan.style.cssText = `
              position: absolute;
              top: 0;
              left: 0;
              white-space: pre;
              opacity: 0;
              filter: blur(${DEFAULT_GLOW_BLUR}px);
              transition: all 0.2s ease;
              z-index: 0;
              pointer-events: none;
            `;
            wrapper.appendChild(glowSpan);
          }

          wrapper.appendChild(span);
          fragment.appendChild(wrapper);
          charSpansRef.current.push(span);
        }
        node.parentNode!.replaceChild(fragment, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(wrapNode);
      }
    };

    Array.from(container.childNodes).forEach(wrapNode);
  }, [children, glowEffect]);

  const startScramble = () => {
    if (isScrambling) return;
    setIsScrambling(true);

    let frameCount = 0;
    const originalChars = Array.from(children);
    const workArray = originalChars.map(() => "");

    const animate = () => {
      frameCount++;
      const progress = frameCount / totalFrames;

      charSpansRef.current.forEach((span, idx) => {
        const orig = originalChars[idx];

        if (orig === " ") {
          // Always keep space visible
          workArray[idx] = " ";
          span.textContent = " ";
          if (glowEffect) {
            const glowSpan = span.parentElement!.querySelector(
              ".char-glow"
            ) as HTMLElement | null;
            if (glowSpan) glowSpan.style.opacity = "0";
          }
          span.style.color = style.color || "inherit";
          span.style.transform = "";
          return;
        }

        // Reveal threshold now 0.6 so long text finishes faster
        const revealThreshold = ((idx + 1) / originalChars.length) * 0.6;
        if (progress >= revealThreshold) {
          workArray[idx] = orig;
          span.textContent = orig;
          span.style.color = style.color || "inherit";
          span.style.transform = "";
          if (glowEffect) {
            const glowSpan = span.parentElement!.querySelector(
              ".char-glow"
            ) as HTMLElement | null;
            if (glowSpan) glowSpan.style.opacity = "0";
          }
        } else {
          const randomChar = letters.charAt(
            Math.floor(Math.random() * letters.length)
          );
          workArray[idx] = randomChar;
          span.textContent = randomChar;
          span.style.color = scrambleColor;

          if (glowEffect) {
            const glowSpan = span.parentElement!.querySelector(
              ".char-glow"
            ) as HTMLElement | null;
            if (glowSpan) {
              glowSpan.style.opacity = `${Math.random() * 0.5 + 0.3}`; 
              glowSpan.style.color = scrambleColor;
              glowSpan.textContent = randomChar;
            }
          }

          if (waveEffect) {
            const yOffset = 
              Math.sin(frameCount * DEFAULT_WAVE_FREQ + idx * 0.3) *
              DEFAULT_WAVE_AMPLITUDE;
            const scale = 1 + Math.random() * 0.05;
            span.style.transform = `translateY(${yOffset}px) scale(${scale})`;
          } else {
            span.style.transform = "";
          }
        }
      });

      setDisplayText(workArray.join(""));

      if (frameCount < totalFrames) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        charSpansRef.current.forEach((span, idx) => {
          const orig = originalChars[idx];
          span.textContent = orig;
          span.style.color = style.color || "inherit";
          span.style.transform = "";
          if (glowEffect) {
            const glowSpan = span.parentElement!.querySelector(
              ".char-glow"
            ) as HTMLElement | null;
            if (glowSpan) glowSpan.style.opacity = "0";
          }
        });
        setDisplayText(children);
        setIsScrambling(false);
        if (onComplete) onComplete();
      }
    };

    frameRef.current = requestAnimationFrame(animate);
  };

  const triggerScramble = () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    if (delay > 0) {
      timeoutRef.current = window.setTimeout(startScramble, delay);
    } else {
      startScramble();
    }
  };

  // Handle load / visible triggers
  useEffect(() => {
    if (trigger === "load") {
      triggerScramble();
    } else if (trigger === "visible" && elementRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            triggerScramble();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(elementRef.current);
      return () => observer.disconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Hover scrambles if trigger="hover"
  const handleMouseEnter = () => {
    if (trigger === "hover") {
      triggerScramble();
    }
  };
  // Click always scrambles
  const handleClick = () => {
    triggerScramble();
  };

  const appliedColor = isScrambling
    ? scrambleColor
    : style.color || "inherit";

  return (
    <span
      ref={elementRef}
      className={className}
      style={{
        ...style,
        color: appliedColor,
        display: "inline-block",
        whiteSpace: "pre",
        cursor:
          trigger === "hover" || trigger === "click"
            ? "pointer"
            : "inherit",
      }}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      {displayText}
    </span>
  );
}
