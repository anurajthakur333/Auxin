import React, { useRef, useState, useEffect, ElementType } from "react";

interface ScrambleTextProps {
  children: React.ReactNode;
  duration?: number;
  frameInterval?: number;
  trigger?: "hover" | "load" | "click" | "visible";
  className?: string;
  as?: ElementType;
  style?: React.CSSProperties;
  letters?: string;
  scrambleColorClass?: string;
  scrambleColor?: string;
  easing?: (t: number) => number;
  onAnimationEnd?: () => void;
  
  // Enhanced features
  glowEffect?: boolean;
  waveEffect?: boolean;
  staggerDelay?: number;
  scrambleIntensity?: number;
  morphEffect?: boolean;
}

const defaultLetters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*(){}[]<>?";
const matrixLetters = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789";
const glitchLetters = "░▒▓█▄▀▐▌│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌";

// Enhanced easing functions
const easingFunctions = {
  easeInOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeInOutQuart: (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
  easeInOutElastic: (t: number) => {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0 ? 0 : t === 1 ? 1 : t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },
  easeInOutBounce: (t: number) => {
    const easeOutBounce = (x: number) => {
      const n1 = 7.5625;
      const d1 = 2.75;
      if (x < 1 / d1) return n1 * x * x;
      else if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
      else if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
      else return n1 * (x -= 2.625 / d1) * x + 0.984375;
    };
    return t < 0.5 ? (1 - easeOutBounce(1 - 2 * t)) / 2 : (1 + easeOutBounce(2 * t - 1)) / 2;
  }
};

function ScrambleText({
  children,
  duration = 2000,
  frameInterval = 16,
  trigger = "hover",
  className = "",
  as: Tag = "span",
  style = {},
  letters = defaultLetters,
  scrambleColorClass = "",
  scrambleColor = "#00ff99",
  easing = easingFunctions.easeInOutSine,
  onAnimationEnd,
  
  // Enhanced features
  glowEffect = true,
  waveEffect = false,
  staggerDelay = 50,
  scrambleIntensity = 1,
  morphEffect = false,
}: ScrambleTextProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const spansRef = useRef<HTMLElement[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isScrambled, setIsScrambled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const animationIdRef = useRef<number | null>(null);

  // Setup intersection observer for visibility trigger
  useEffect(() => {
    if (trigger === "visible" && containerRef.current) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            scramble(false);
          }
        },
        { threshold: 0.3 }
      );
      observerRef.current.observe(containerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [trigger, isVisible]);

  // Wrap text nodes in spans with enhanced structure
  useEffect(() => {
    if (!containerRef.current) return;

    spansRef.current = [];

    const wrapTextNodes = (node: ChildNode) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const wrapper = document.createElement("span");
          wrapper.className = "char-wrapper";
          wrapper.style.cssText = `
            position: relative;
            display: inline-block;
            overflow: visible;
          `;

          const span = document.createElement("span");
          span.className = "char";
          
          // Handle spaces properly to prevent collapse
          if (char === ' ') {
            span.innerHTML = '&nbsp;';
          } else {
            span.textContent = char;
          }
          
          span.style.cssText = `
            position: relative;
            display: inline-block;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform-origin: center;
            z-index: 1;
            white-space: pre;
          `;

          // Add glow layer if enabled
          if (glowEffect) {
            const glowSpan = document.createElement("span");
            glowSpan.className = "char-glow";
            
            // Handle spaces in glow span too
            if (char === ' ') {
              glowSpan.innerHTML = '&nbsp;';
            } else {
              glowSpan.textContent = char;
            }
            
            glowSpan.style.cssText = `
              position: absolute;
              top: 0;
              left: 0;
              opacity: 0;
              filter: blur(8px);
              transition: all 0.3s ease;
              z-index: 0;
              pointer-events: none;
              white-space: pre;
            `;
            wrapper.appendChild(glowSpan);
          }

          wrapper.appendChild(span);
          fragment.appendChild(wrapper);
          spansRef.current.push(span);
        }

        node.parentNode!.replaceChild(fragment, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(wrapTextNodes);
      }
    };

    Array.from(containerRef.current.childNodes).forEach(wrapTextNodes);
  }, [children, glowEffect]);

  // Enhanced scramble function with multiple effects
  const scramble = (toOriginal: boolean) => {
    if (!containerRef.current || isAnimating) return;
    setIsAnimating(true);

    const totalFrames = Math.floor(duration / frameInterval);
    const originalChars = spansRef.current.map((span) => {
      // Store original content properly including spaces
      return span.innerHTML === '&nbsp;' ? ' ' : (span.textContent || " ");
    });
    let frame = 0;

    const animate = () => {
      const linearProgress = frame / totalFrames;
      const progress = easing(linearProgress);

      spansRef.current.forEach((span, i) => {
        const charProgress = Math.max(0, Math.min(1, (progress * spansRef.current.length - i + staggerDelay / 100) / (staggerDelay / 100)));
        const isRevealed = charProgress >= 1;
        const wrapper = span.parentElement;
        const glowSpan = wrapper?.querySelector('.char-glow') as HTMLElement;

        if (isRevealed) {
          // Character is fully revealed
          if (originalChars[i] === ' ') {
            span.innerHTML = '&nbsp;';
          } else {
            span.textContent = originalChars[i];
          }
          
          if (toOriginal) {
            // Returning to original state
            span.style.color = "";
            span.style.transform = "";
            span.style.filter = "";
            if (glowSpan) {
              glowSpan.style.opacity = "0";
              glowSpan.style.color = "";
            }
            if (scrambleColorClass) {
              span.classList.remove(scrambleColorClass);
            }
          } else {
            // Scrambled state styling
            if (scrambleColorClass) {
              span.classList.add(scrambleColorClass);
            } else {
              span.style.color = scrambleColor;
            }
            
            if (glowEffect && glowSpan) {
              glowSpan.style.opacity = "0.6";
              glowSpan.style.color = scrambleColor;
              if (originalChars[i] === ' ') {
                glowSpan.innerHTML = '&nbsp;';
              } else {
                glowSpan.textContent = originalChars[i];
              }
            }
          }
        } else {
          // Character is still scrambling
          const scrambleChance = Math.pow(scrambleIntensity, 2);
          
          // Don't scramble spaces - keep them as spaces
          if (originalChars[i] === ' ') {
            span.innerHTML = '&nbsp;';
            if (glowEffect && glowSpan) {
              glowSpan.innerHTML = '&nbsp;';
            }
          } else if (Math.random() < scrambleChance) {
            // Choose random character set based on effect type
            let currentLetters = letters;
            if (morphEffect && Math.random() > 0.7) {
              currentLetters = matrixLetters;
            } else if (Math.random() > 0.8) {
              currentLetters = glitchLetters;
            }
            
            const randomChar = currentLetters[Math.floor(Math.random() * currentLetters.length)];
            span.textContent = randomChar;
            
            // Apply scramble styling
            if (scrambleColorClass) {
              span.classList.add(scrambleColorClass);
            } else {
              span.style.color = scrambleColor;
            }

            // Wave effect
            if (waveEffect) {
              const waveOffset = Math.sin((frame * 0.2) + (i * 0.3)) * 3;
              span.style.transform = `translateY(${waveOffset}px) scale(${1 + Math.random() * 0.1})`;
            }

            // Intensity-based effects
            if (scrambleIntensity > 0.5) {
              span.style.filter = `blur(${Math.random() * 1}px) brightness(${1 + Math.random() * 0.3})`;
            }

            // Glow effect for scrambled characters
            if (glowEffect && glowSpan) {
              glowSpan.style.opacity = `${Math.random() * 0.8}`;
              glowSpan.style.color = scrambleColor;
              glowSpan.textContent = randomChar;
            }
          }
        }
      });

      if (frame >= totalFrames) {
        // Animation complete
        spansRef.current.forEach((span, i) => {
          if (originalChars[i] === ' ') {
            span.innerHTML = '&nbsp;';
          } else {
            span.textContent = originalChars[i];
          }
          
          const wrapper = span.parentElement;
          const glowSpan = wrapper?.querySelector('.char-glow') as HTMLElement;
          
          if (toOriginal) {
            span.style.color = "";
            span.style.transform = "";
            span.style.filter = "";
            if (glowSpan) {
              glowSpan.style.opacity = "0";
            }
            if (scrambleColorClass) {
              span.classList.remove(scrambleColorClass);
            }
          } else {
            if (scrambleColorClass) {
              span.classList.add(scrambleColorClass);
            } else {
              span.style.color = scrambleColor;
            }
            if (glowEffect && glowSpan) {
              glowSpan.style.opacity = "0.6";
              glowSpan.style.color = scrambleColor;
              if (originalChars[i] === ' ') {
                glowSpan.innerHTML = '&nbsp;';
              } else {
                glowSpan.textContent = originalChars[i];
              }
            }
          }
        });
        
        setIsScrambled(!toOriginal);
        setIsAnimating(false);
        if (onAnimationEnd) onAnimationEnd();
      } else {
        frame++;
        animationIdRef.current = requestAnimationFrame(animate);
      }
    };

    animate();
  };

  // Trigger animations based on trigger type
  useEffect(() => {
    if (trigger === "load") {
      const timer = setTimeout(() => scramble(false), 100);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  // Event handlers
  const handleHover = {
    onMouseEnter: () => {
      if (!isAnimating && !isScrambled && trigger === "hover") {
        scramble(false);
      }
    },
    onMouseLeave: () => {
      if (!isAnimating && isScrambled && trigger === "hover") {
        scramble(true);
      }
    },
  };

  const handleClick = () => {
    if (trigger === "click" && !isAnimating) {
      scramble(!isScrambled);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <Tag
      ref={containerRef as any}
      className={`scramble-text ${className}`}
      style={{
        ...style,
        userSelect: "none",
        cursor: trigger === "hover" || trigger === "click" ? "pointer" : "default",
        position: "relative",
      }}
      {...(trigger === "hover" ? handleHover : {})}
      {...(trigger === "click" ? { onClick: handleClick } : {})}
    >
      {children}
    </Tag>
  );
}

export { easingFunctions, defaultLetters, matrixLetters, glitchLetters };
export default ScrambleText;