import { useEffect, useRef, useMemo } from "react";
import "./LiquidGlass.css";

interface LiquidGlassProps {
  width?: number;
  height?: number;
  radius?: number;
  border?: number;
  lightness?: number;
  alpha?: number;
  blur?: number;
  scale?: number;
  frost?: number;
  saturation?: number;
  chromatic?: { r: number; g: number; b: number };
  blend?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const LiquidGlass: React.FC<LiquidGlassProps> = ({
  width = 336,
  height = 50,
  radius = 0,
  border = 0.0,
  lightness = 50,
  alpha = 0.93,
  blur = 11,
  scale = -180,
  frost = 0.05,
  saturation = 1,
  chromatic = { r: 0, g: 10, b: 20 },
  blend = "difference",
  className = "",
  style = {},
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const filterId = useMemo(() => `liquid-glass-filter-${Math.random().toString(36).substr(2, 9)}`, []);

  // Generate the displacement map SVG
  const displacementMapSvg = useMemo(() => {
    const borderSize = Math.min(width, height) * (border * 0.5);
    return `
      <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="red-${filterId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="blue-${filterId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${width}" height="${height}" fill="black"/>
        <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="url(#red-${filterId})"/>
        <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="url(#blue-${filterId})" style="mix-blend-mode: ${blend}"/>
        <rect x="${borderSize}" y="${borderSize}" width="${width - borderSize * 2}" height="${height - borderSize * 2}" rx="${radius}" fill="hsl(0 0% ${lightness}% / ${alpha})" style="filter:blur(${blur}px)"/>
      </svg>
    `;
  }, [width, height, radius, border, lightness, alpha, blur, blend, filterId]);

  // Encode the SVG for use in feImage
  const encodedSvg = useMemo(() => {
    return `data:image/svg+xml,${encodeURIComponent(displacementMapSvg)}`;
  }, [displacementMapSvg]);

  // Update CSS variables
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.setProperty("--lg-width", `${width}px`);
      containerRef.current.style.setProperty("--lg-height", `${height}px`);
      containerRef.current.style.setProperty("--lg-radius", `${radius}px`);
      containerRef.current.style.setProperty("--lg-frost", `${frost}`);
      containerRef.current.style.setProperty("--lg-saturation", `${saturation}`);
    }
  }, [width, height, radius, frost, saturation]);

  return (
    <div
      ref={containerRef}
      className={`liquid-glass ${className}`}
      style={style}
    >
      {/* SVG Filter Definition */}
      <svg className="liquid-glass-filter" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            {/* The displacement map image */}
            <feImage
              x="0"
              y="0"
              width="100%"
              height="100%"
              href={encodedSvg}
              result="map"
            />
            
            {/* RED channel - strongest displacement */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              xChannelSelector="R"
              yChannelSelector="G"
              scale={scale + chromatic.r}
              result="dispRed"
            />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="red"
            />
            
            {/* GREEN channel - reference */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              xChannelSelector="R"
              yChannelSelector="G"
              scale={scale + chromatic.g}
              result="dispGreen"
            />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="green"
            />
            
            {/* BLUE channel - medium displacement */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              xChannelSelector="R"
              yChannelSelector="G"
              scale={scale + chromatic.b}
              result="dispBlue"
            />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="blue"
            />
            
            {/* Blend channels back together */}
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            
            {/* Output blur */}
            <feGaussianBlur in="output" stdDeviation="0.7" />
          </filter>
        </defs>
      </svg>
      
      {/* Glass effect container */}
      <div 
        className="liquid-glass-effect"
        style={{
          backdropFilter: `url(#${filterId}) brightness(1.1) saturate(${saturation})`,
          WebkitBackdropFilter: `url(#${filterId}) brightness(1.1) saturate(${saturation})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default LiquidGlass;

