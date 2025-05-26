import React, { useRef, useState, useEffect, ElementType } from "react";

interface ScrambleTextProps {
  children: React.ReactNode;
  duration?: number; // total animation duration in ms
  frameInterval?: number; // ms between frames
  trigger?: "hover" | "load";
  className?: string;
  as?: ElementType;
  style?: React.CSSProperties;

  letters?: string;
  scrambleColorClass?: string;
  scrambleColor?: string;
  easing?: (t: number) => number;

  onAnimationEnd?: () => void;
}

const defaultLetters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()";

// SUPER smooth easeInOutSine for silky effect
const easeInOutSine = (t: number) =>
  -(Math.cos(Math.PI * t) - 1) / 2;

export default function ScrambleText({
  children,
  duration = 2000,       // longer duration for smoothness
  frameInterval = 16,    // ~60fps
  trigger = "hover",
  className = "",
  as: Tag = "span",
  style = {},

  letters = defaultLetters,
  scrambleColorClass = "green",
  scrambleColor = "#00ff99",
  easing = easeInOutSine,

  onAnimationEnd,
}: ScrambleTextProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const spansRef = useRef<HTMLElement[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isScrambled, setIsScrambled] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    spansRef.current = [];

    const wrapTextNodes = (node: ChildNode) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        const fragment = document.createDocumentFragment();

        for (let char of text) {
          const span = document.createElement("span");
          span.className = "char";
          span.textContent = char;
          fragment.appendChild(span);
          spansRef.current.push(span);
        }

        node.parentNode!.replaceChild(fragment, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(wrapTextNodes);
      }
    };

    Array.from(containerRef.current.childNodes).forEach(wrapTextNodes);
  }, [children]);

  const scramble = (toOriginal: boolean) => {
    if (!containerRef.current || isAnimating) return;
    setIsAnimating(true);

    const totalFrames = Math.floor(duration / frameInterval);
    let frame = 0;

    const originalChars = spansRef.current.map((span) => span.textContent || " ");

    const interval = window.setInterval(() => {
      const linearProgress = frame / totalFrames;
      const progress = easing(linearProgress);

      spansRef.current.forEach((span, i) => {
        if (i < progress * spansRef.current.length) {
          span.textContent = originalChars[i];
          if (!toOriginal) {
            span.classList.add(scrambleColorClass);
            if (!scrambleColorClass) {
              span.style.color = scrambleColor;
            }
          } else {
            span.classList.remove(scrambleColorClass);
            if (!scrambleColorClass) {
              span.style.color = "";
            }
          }
        } else {
          const randomChar = letters[Math.floor(Math.random() * letters.length)];
          span.textContent = randomChar;

          if (Math.random() > 0.5) {
            span.classList.add(scrambleColorClass);
            if (!scrambleColorClass) {
              span.style.color = scrambleColor;
            }
          } else {
            span.classList.remove(scrambleColorClass);
            if (!scrambleColorClass) {
              span.style.color = "";
            }
          }
        }
      });

      if (frame >= totalFrames) {
        clearInterval(interval);
        spansRef.current.forEach((span, i) => {
          span.textContent = originalChars[i];
          if (!toOriginal) {
            span.classList.add(scrambleColorClass);
            if (!scrambleColorClass) {
              span.style.color = scrambleColor;
            }
          } else {
            span.classList.remove(scrambleColorClass);
            if (!scrambleColorClass) {
              span.style.color = "";
            }
          }
        });
        setIsScrambled(!toOriginal);
        setIsAnimating(false);

        if (onAnimationEnd) onAnimationEnd();
      }

      frame++;
    }, frameInterval);
  };

  useEffect(() => {
    if (trigger === "load") {
      scramble(false);
    }
  }, [trigger]);

  const handleHover = {
    onMouseEnter: () => !isAnimating && !isScrambled && scramble(false),
    onMouseLeave: () => !isAnimating && isScrambled && scramble(true),
  };

  return (
    <Tag
      ref={containerRef as any}
      className={`scramble-text ${className}`}
      style={{
        ...style,
        userSelect: "none",
        cursor: trigger === "hover" ? "pointer" : "default",
      }}
      {...(trigger === "hover" ? handleHover : {})}
    >
      {children}
    </Tag>
  );
}
