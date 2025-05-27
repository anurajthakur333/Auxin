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
          span.textContent = char;
          span.style.cssText = `
            position: relative;
            display: inline-block;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform-origin: center;
            z-index: 1;
          `;

          // Add glow layer if enabled
          if (glowEffect) {
            const glowSpan = document.createElement("span");
            glowSpan.className = "char-glow";
            glowSpan.textContent = char;
            glowSpan.style.cssText = `
              position: absolute;
              top: 0;
              left: 0;
              opacity: 0;
              filter: blur(8px);
              transition: all 0.3s ease;
              z-index: 0;
              pointer-events: none;
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
    const originalChars = spansRef.current.map((span) => span.textContent || " ");
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
          span.textContent = originalChars[i];
          
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
              glowSpan.textContent = originalChars[i];
            }
          }
        } else {
          // Character is still scrambling
          const scrambleChance = Math.pow(scrambleIntensity, 2);
          
          if (Math.random() < scrambleChance) {
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
          span.textContent = originalChars[i];
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
              glowSpan.textContent = originalChars[i];
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

// Demo component to showcase the enhanced effects
function ScrambleTextDemo() {
  const [currentEffect, setCurrentEffect] = useState(0);
  
  const effects = [
    {
      name: "Matrix Style",
      props: {
        letters: matrixLetters,
        scrambleColor: "#00ff99",
        glowEffect: true,
        morphEffect: true,
        duration: 3000,
        easing: easingFunctions.easeInOutSine,
      }
    },
    {
      name: "Glitch Effect",
      props: {
        letters: glitchLetters,
        scrambleColor: "#ff0099",
        glowEffect: true,
        waveEffect: true,
        scrambleIntensity: 1.5,
        duration: 2000,
        easing: easingFunctions.easeInOutElastic,
      }
    },
    {
      name: "Cyber Wave",
      props: {
        letters: "0123456789ABCDEF",
        scrambleColor: "#00ffff",
        glowEffect: true,
        waveEffect: true,
        staggerDelay: 30,
        duration: 2500,
        easing: easingFunctions.easeInOutCubic,
      }
    },
    {
      name: "Smooth Bounce",
      props: {
        letters: defaultLetters,
        scrambleColor: "#ff6600",
        glowEffect: true,
        duration: 3000,
        easing: easingFunctions.easeInOutBounce,
      }
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-8">Enhanced ScrambleText Effects</h1>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {effects.map((effect, index) => (
              <button
                key={index}
                onClick={() => setCurrentEffect(index)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  currentEffect === index 
                    ? 'bg-green-500 text-black' 
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {effect.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-12">
          {/* Main Demo */}
          <div className="text-center">
            <ScrambleText
              key={currentEffect}
              as="h1"
              className="text-white font-light"
              style={{
                fontSize: "clamp(2rem, 8vw, 5rem)",
                letterSpacing: "-2px",
                lineHeight: "1.1",
                fontWeight: 300,
              }}
              trigger="load"
              {...effects[currentEffect].props}
            >
              Adapting your business<br />
              with AI <span style={{color: effects[currentEffect].props.scrambleColor}}>power</span> - Like<br />
              never before
            </ScrambleText>
          </div>

          {/* Interactive Examples */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl mb-4">Hover Effect</h3>
              <ScrambleText
                trigger="hover"
                scrambleColor="#00ff99"
                glowEffect={true}
                className="text-2xl"
              >
                Hover over me!
              </ScrambleText>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl mb-4">Click Effect</h3>
              <ScrambleText
                trigger="click"
                scrambleColor="#ff00ff"
                glowEffect={true}
                waveEffect={true}
                className="text-2xl cursor-pointer"
              >
                Click me!
              </ScrambleText>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl mb-4">Scroll Into View</h3>
              <ScrambleText
                trigger="visible"
                scrambleColor="#ffff00"
                glowEffect={true}
                className="text-2xl"
                duration={2000}
              >
                Scroll to see me animate!
              </ScrambleText>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl mb-4">Intense Glitch</h3>
              <ScrambleText
                trigger="load"
                scrambleColor="#ff0066"
                glowEffect={true}
                scrambleIntensity={2}
                morphEffect={true}
                letters={glitchLetters}
                className="text-2xl"
                duration={4000}
              >
                GLITCH EFFECT
              </ScrambleText>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ScrambleText, easingFunctions, defaultLetters, matrixLetters, glitchLetters };
export default ScrambleTextDemo;