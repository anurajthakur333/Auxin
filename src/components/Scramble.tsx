import {
  useEffect,
  useRef,
  useState,
  CSSProperties,
} from "react";

// Props interface - defines what options you can pass to the component
interface ScrambleTextProps {
  children: string;                    // The text to scramble
  duration?: number;                   // How long the scramble lasts (ms)
  fps?: number;                       // Animation frame rate
  delay?: number;                     // Wait time before starting (ms)
  trigger?: "hover" | "load" | "click" | "visible"; // When to start scrambling
  className?: string;                 // CSS class name
  style?: CSSProperties;             // Inline styles
  letters?: string;                  // Characters to use for scrambling
  scrambleColor?: string;            // Color of scrambled characters
  onComplete?: () => void;           // Function to call when done
  speed?: "ultra-slow" | "slow" | "medium" | "fast" | "ultra-fast" | number;
  revealSpeed?: number;              // How fast characters reveal (0-1)
  scrambleIntensity?: number;        // How often characters change (1-10)
  direction?: "left-to-right" | "right-to-left" | "center-out" | "random"; // Reveal direction
  matchWidth?: boolean;              // Match scrambled character widths to prevent shaking
  randomReveal?: boolean;            // Reveal characters in random order (deprecated - use direction="random")
}

// Default characters used for scrambling effect
const DEFAULT_LETTERS =
  "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

// Character width categories for width-matching scramble
const WIDTH_CATEGORIES = {
  narrow: "il1!|.,;:'\"`",           // Very narrow characters
  normal: "abcdefghjknopqrstuvxyz023456789", // Normal width characters  
  wide: "mwMWQ@#%&",                 // Wide characters
  space: " "                         // Spaces stay as spaces
};

// Pre-made speed settings for easy use
const SPEED_PRESETS = {
  "ultra-slow": { duration: 4000, fps: 60 },
  "slow": { duration: 2500, fps: 45 },
  "medium": { duration: 1500, fps: 60 },
  "fast": { duration: 800, fps: 80 },
  "ultra-fast": { duration: 400, fps: 80 },
};

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
  onComplete,
  speed,
  revealSpeed = 0.6,
  scrambleIntensity = 5,
  direction = "left-to-right",
  matchWidth = false,
  randomReveal = false,
}: ScrambleTextProps) {
  // Convert speed presets to actual duration and fps values
  let finalDuration = duration;
  let finalFps = fps;
  
  if (speed !== undefined) {
    if (typeof speed === "string" && speed in SPEED_PRESETS) {
      // Use preset values
      const preset = SPEED_PRESETS[speed];
      finalDuration = preset.duration;
      finalFps = preset.fps;
    } else if (typeof speed === "number") {
      // Use custom speed multiplier (higher = faster)
      finalDuration = duration / speed;
      finalFps = Math.min(fps * speed, 120); // Cap at 120fps
    }
  }

  // Create blank text (all spaces) for initial state
  const blank = children.replace(/./g, " ");
  
  // State variables
  const [displayText, setDisplayText] = useState(trigger === 'hover' ? children : blank);
  const [isScrambling, setIsScrambling] = useState(false);

  // Refs to store references and prevent memory leaks
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);
  const charSpansRef = useRef<HTMLSpanElement[]>([]);

  // Calculate animation timing
  const frameInterval = 1000 / finalFps;
  const totalFrames = Math.ceil(finalDuration / frameInterval);

  // Store reveal order for different directions
  const revealOrderRef = useRef<number[]>([]);

  // Get width category of a character
  const getCharWidthCategory = (char: string): keyof typeof WIDTH_CATEGORIES => {
    if (char === " ") return "space";
    if (WIDTH_CATEGORIES.narrow.includes(char.toLowerCase())) return "narrow";
    if (WIDTH_CATEGORIES.wide.includes(char.toLowerCase())) return "wide";
    return "normal";
  };

  // Get random character with similar width to match original character
  const getWidthMatchedChar = (originalChar: string): string => {
    if (originalChar === " ") return " ";
    
    const category = getCharWidthCategory(originalChar);
    const categoryChars = WIDTH_CATEGORIES[category];
    
    if (categoryChars.length === 0) {
      // Fallback to normal category if category is empty
      const fallbackChars = WIDTH_CATEGORIES.normal;
      return fallbackChars.charAt(Math.floor(Math.random() * fallbackChars.length));
    }
    
    return categoryChars.charAt(Math.floor(Math.random() * categoryChars.length));
  };

  // Calculate reveal order based on direction
  const calculateRevealOrder = (direction: string, length: number): number[] => {
    const positions = Array.from({ length }, (_, i) => i);
    
    switch (direction) {
      case "right-to-left":
        return positions.reverse(); // [4, 3, 2, 1, 0]
        
      case "center-out":
        const result: number[] = [];
        const center = Math.floor(length / 2);
        let left = center;
        let right = center + (length % 2 === 0 ? -1 : 0);
        
        // Add center character(s) first
        if (length % 2 === 1) result.push(center);
        
        // Add characters expanding outward
        while (left >= 0 || right < length) {
          if (left >= 0 && left !== center) result.push(left);
          if (right < length && right !== center) result.push(right);
          left--;
          right++;
        }
        return result;
        
      case "random":
        // Fisher-Yates shuffle
        const shuffled = [...positions];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
        
      case "left-to-right":
      default:
        return positions; // [0, 1, 2, 3, 4]
    }
  };

  // Set up reveal order when component mounts or props change
  useEffect(() => {
    // Support legacy randomReveal prop
    const effectiveDirection = randomReveal ? "random" : direction;
    revealOrderRef.current = calculateRevealOrder(effectiveDirection, children.length);
  }, [children, direction, randomReveal]);

  // Wrap each character in its own <span> element for individual control
  useEffect(() => {
    if (!elementRef.current) return;
    charSpansRef.current = [];
    const container = elementRef.current;

    // Function to wrap text nodes with spans
    const wrapNode = (node: ChildNode) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        const fragment = document.createDocumentFragment();

        // Create a span for each character
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          
          // Outer wrapper keeps spacing correct
          const wrapper = document.createElement("span");
          wrapper.style.cssText = `
            position: relative;
            display: inline-block;
            white-space: pre;
            overflow: visible;
          `;
          wrapper.className = "char-wrapper";

          // Inner span holds the actual character
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



          wrapper.appendChild(span);
          fragment.appendChild(wrapper);
          charSpansRef.current.push(span);
        }
        node.parentNode!.replaceChild(fragment, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Recursively wrap child nodes
        Array.from(node.childNodes).forEach(wrapNode);
      }
    };

    Array.from(container.childNodes).forEach(wrapNode);
  }, [children]);

  // Stop current animation and reset
  const stopScramble = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsScrambling(false);
    hasStartedRef.current = false;
    queuedRef.current = false;
  };

  // Main scramble animation function
  const startScramble = () => {
    // Stop any existing animation first
    stopScramble();
    setIsScrambling(true);

    let frameCount = 0;
    const originalChars = Array.from(children);
    const workArray: string[] = originalChars.map(() => trigger === "hover" ? "" : " "); // Different initial state based on trigger

    // Animation loop - runs every frame
    const animate = () => {
      frameCount++;
      const progress = frameCount / totalFrames; // 0 to 1

      // Update each character
      charSpansRef.current.forEach((span, idx) => {
        const orig = originalChars[idx];

        // Always keep spaces as spaces
        if (orig === " ") {
          workArray[idx] = " ";
          span.textContent = " ";
          span.style.color = style.color || "inherit";
          span.style.transform = "";
          return;
        }

        if (trigger === "hover") {
          // Original hover behavior - all letters scramble at once, then reveal
          const orderPos = revealOrderRef.current.indexOf(idx);
          const revealThreshold = ((orderPos + 1) / originalChars.length) * revealSpeed;
          
          // Check if it's time to reveal this character
          if (progress >= revealThreshold) {
            // Reveal the original character
            workArray[idx] = orig;
            span.textContent = orig;
            span.style.color = style.color || "inherit";
            span.style.transform = "";
          } else {
            // Keep scrambling this character
            const shouldScramble = frameCount % Math.max(1, 11 - scrambleIntensity) === 0;
            if (shouldScramble || workArray[idx] === "") {
              // Pick a character - either width-matched or random
              const randomChar = matchWidth 
                ? getWidthMatchedChar(orig)
                : letters.charAt(Math.floor(Math.random() * letters.length));
              workArray[idx] = randomChar;
              span.textContent = randomChar;
            }
            span.style.color = scrambleColor;
            span.style.transform = "";
          }
        } else {
          // Letter-by-letter behavior for other triggers
          const orderPos = revealOrderRef.current.indexOf(idx);
          const startThreshold = (orderPos / originalChars.length) * revealSpeed;
          const endThreshold = ((orderPos + 0.3) / originalChars.length) * revealSpeed + 0.2; // Give each char more scramble time
          
          // Check if this character should be visible yet
          if (progress < startThreshold) {
            // Character hasn't started appearing yet - keep it blank
            workArray[idx] = " ";
            span.textContent = " ";
            span.style.color = style.color || "inherit";
            span.style.transform = "";
          } else if (progress >= endThreshold) {
            // Character is fully revealed
            workArray[idx] = orig;
            span.textContent = orig;
            span.style.color = style.color || "inherit";
            span.style.transform = "";
          } else {
            // Character is in the scrambling phase
            const shouldScramble = frameCount % Math.max(1, 11 - scrambleIntensity) === 0;
            if (shouldScramble || workArray[idx] === " ") {
              // Pick a character - either width-matched or random
              const randomChar = matchWidth 
                ? getWidthMatchedChar(orig)
                : letters.charAt(Math.floor(Math.random() * letters.length));
              workArray[idx] = randomChar;
              span.textContent = randomChar;
            }
            span.style.color = scrambleColor;
            span.style.transform = "";
          }
        }
      });

      // Update the display text
      setDisplayText(workArray.join(""));

      // Continue animation or finish
      if (frameCount < totalFrames) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - clean up and show final text
        charSpansRef.current.forEach((span, idx) => {
          const orig = originalChars[idx];
          span.textContent = orig;
          span.style.color = style.color || "inherit";
          span.style.transform = "";
        });
        setDisplayText(children);
        setIsScrambling(false);

        // Allow subsequent scrambles for hover/click triggers
        if (trigger === "hover" || trigger === "click") {
          hasStartedRef.current = false;
        }

        // Call completion callback if provided
        if (onComplete) onComplete();
      }
    };

    // Start the animation
    frameRef.current = requestAnimationFrame(animate);
  };

  // Trigger scramble with delay if needed
  const triggerScramble = () => {
    if (hasStartedRef.current) return; // Prevent multiple triggers
    hasStartedRef.current = true;
    if (delay > 0) {
      timeoutRef.current = window.setTimeout(startScramble, delay);
    } else {
      startScramble();
    }
  };

  // Handle automatic triggers (load and visible)
  useEffect(() => {
    if (trigger === "load") {
      // Start scrambling immediately when component loads
      triggerScramble();
    } else if (trigger === "visible" && elementRef.current) {
      // Start scrambling when element becomes visible
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            triggerScramble();
          }
        },
        { threshold: 0.1 } // Trigger when 10% visible
      );
      observer.observe(elementRef.current);
      return () => observer.disconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  // Clean up timers and animations when component unmounts
  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Handle mouse hover events
  const handleMouseEnter = () => {
    if (trigger === "hover") {
      triggerScramble();
    }
  };

  // Queue for handling hover out while scrambling
  const queuedRef = useRef(false);

  const handleMouseLeave = () => {
    if (trigger !== "hover") return;

    // Always start scrambling immediately, regardless of current state
    // This will interrupt any ongoing animation for instant response
    triggerScramble();
  };

  // Handle click events
  const handleClick = () => {
    triggerScramble();
  };

  // Determine text color based on scrambling state
  const appliedColor = isScrambling
    ? scrambleColor
    : style.color || "inherit";

  // Render the component
  return (
    <span
      ref={elementRef}
      className={className}
      style={{
        // fontFamily: "monospace",
        ...style,
        color: appliedColor,
        display: "inline-block",
        whiteSpace: "pre", // Preserve spaces and line breaks
        cursor:
          trigger === "hover" || trigger === "click"
            ? "pointer"
            : "inherit",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {displayText}
    </span>
  );
}
