import { useRef, useState } from "react";
import "../styles/ScrambleText.css";

// All characters for scrambling
const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()";

// Define props with optional duration/frameInterval
interface ScrambleTextProps {
  text: string;
  duration?: number;       // Total duration of animation in milliseconds
  frameInterval?: number;  // Time per frame in ms
}

export default function ScrambleText({
  text,
  duration = 1000,
  frameInterval = 10,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState<string>(text);
  const originalText = useRef<string>(text);
  const intervalRef = useRef<number | null>(null);
  const [isGreen, setIsGreen] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const scramble = (toOriginal: boolean) => {
    if (isAnimating) return;

    setIsAnimating(true);
    let frame = 0;
    const totalFrames = Math.floor(duration / frameInterval);

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      const progress = frame / totalFrames;
      let output = "";

      for (let i = 0; i < originalText.current.length; i++) {
        if (i < progress * originalText.current.length) {
          // Show actual character
          output += `<span class="char ${toOriginal ? "" : "green"}">${originalText.current[i]}</span>`;
        } else {
          // Show random scrambled character
          const randomChar = letters[Math.floor(Math.random() * letters.length)];
          const colorClass = Math.random() > 0.5 ? "green" : "";
          output += `<span class="char ${colorClass}">${randomChar}</span>`;
        }
      }

      setDisplayText(output);

      if (frame >= totalFrames) {
        clearInterval(intervalRef.current!);

        if (toOriginal) {
          setDisplayText(originalText.current);
          setIsGreen(false);
        } else {
          const finalGreenText = originalText.current
            .split("")
            .map((char) => `<span class="char green">${char}</span>`)
            .join("");
          setDisplayText(finalGreenText);
          setIsGreen(true);
        }

        setIsAnimating(false);
      }

      frame++;
    }, frameInterval);
  };

  return (
    <h1
      className="scramble-text"
      onMouseEnter={() => !isAnimating && !isGreen && scramble(false)}
      onMouseLeave={() => !isAnimating && isGreen && scramble(true)}
      dangerouslySetInnerHTML={{ __html: displayText }}
    />
  );
}
