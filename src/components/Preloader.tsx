import { useEffect, useState } from 'react';
import '../styles/Preloader.css';

interface PreloaderProps {
  onComplete?: () => void;
  duration?: number; // Total animation duration in ms
  delay?: number; // Delay before starting animation
}

export default function Preloader({ 
  onComplete, 
  duration = 2000,
  delay = 500 
}: PreloaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    // Start animation after delay
    const startTimer = setTimeout(() => {
      setAnimationStarted(true);
    }, delay);

    // Hide preloader and call onComplete after animation finishes
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, delay + duration);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(hideTimer);
    };
  }, [delay, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="preloader-container">
      <div 
        className={`preloader-content ${animationStarted ? 'animate' : ''}`}
        style={{
          transition: `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
        }}
      >
        <svg 
          width="248" 
          height="124" 
          viewBox="0 0 248 124" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="preloader-svg"
        >
          <path d="M196.851 59.7679L171.72 34.1533H71.198L46.0674 59.7679H62.8211L75.3864 46.9606H167.532L180.097 59.7679H196.851Z" fill="#41FF1B"/>
          <path d="M180.104 17.0776H62.8282L23.0381 59.7686H39.7918L69.1108 29.8849H173.822L203.141 59.7686H221.989L180.104 17.0776Z" fill="#41FF1B"/>
          <path d="M60.7322 12.8073H182.197L228.269 59.7673H247.117L188.479 0H54.4496L0 59.7673H16.7537L60.7322 12.8073Z" fill="#41FF1B"/>
          <path d="M23.0381 64.0366L62.8282 106.728H180.104L221.989 64.0366H203.141L173.822 93.9203H69.1108L39.7918 64.0366H23.0381Z" fill="#41FF1B"/>
          <path d="M182.197 110.997H60.7322L16.7537 64.0366H0L54.4496 123.804H188.479L247.117 64.0366H228.269L182.197 110.997Z" fill="#41FF1B"/>
          <path d="M71.198 89.6512H171.72L196.851 64.0366H180.097L167.532 76.8439H75.3864L62.8211 64.0366H46.0674L71.198 89.6512Z" fill="#41FF1B"/>
          <path d="M77.4818 51.23L67.0107 61.9027L77.4818 72.5754H165.439L175.91 61.9027L165.439 51.23H77.4818Z" fill="#41FF1B"/>
        </svg>
      </div>
    </div>
  );
} 