import React, { useState, useEffect, useRef } from "react";

interface ScrambleTextProps {
  children: string;
  duration?: number;
  speed?: number;
  trigger?: "hover" | "load" | "click" | "visible";
  className?: string;
  style?: React.CSSProperties;
  letters?: string;
  scrambleColor?: string;
}

const CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

export default function ScrambleText({
  children,
  duration = 1000,
  speed = 50,
  trigger = "hover",
  className = "",
  style = {},
  letters = CHARS,
  scrambleColor,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(children);
  const [isScrambling, setIsScrambling] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const elementRef = useRef<HTMLSpanElement>(null);
  const isVisibleRef = useRef(false);

  const scramble = () => {
    if (isScrambling) return;
    setIsScrambling(true);
    
    let iteration = 0;
    const maxIterations = Math.ceil(children.length * (duration / speed) / children.length);
    
    intervalRef.current = window.setInterval(() => {
      setDisplayText(
        children
          .split("")
          .map((char, index) => {
            // Keep spaces and special characters intact
            if (char === " " || char === "\n") return char;
            
            // Gradually reveal original characters
            if (index < iteration / (maxIterations / children.length)) {
              return char;
            }
            
            // Return random character for scrambled positions
            return letters[Math.floor(Math.random() * letters.length)];
          })
          .join("")
      );
      
      iteration++;
      
      if (iteration >= maxIterations) {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        setDisplayText(children);
        setIsScrambling(false);
      }
    }, speed);
  };

  // Handle intersection observer for visible trigger
  useEffect(() => {
    if (trigger === "visible" && elementRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isVisibleRef.current) {
            isVisibleRef.current = true;
            scramble();
          }
        },
        { threshold: 0.1 }
      );
      
      observer.observe(elementRef.current);
      
      return () => observer.disconnect();
    }
  }, [trigger]);

  // Handle load trigger
  useEffect(() => {
    if (trigger === "load") {
      const timer = setTimeout(scramble, 100);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (trigger === "hover") scramble();
  };

  const handleClick = () => {
    if (trigger === "click") scramble();
  };

  return (
    <span
      ref={elementRef}
      className={className}
      style={{
        ...style,
        color: isScrambling && scrambleColor ? scrambleColor : style.color,
        transition: "color 0.3s ease",
        cursor: trigger === "hover" || trigger === "click" ? "pointer" : "inherit",
      }}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      {displayText}
    </span>
  );
}