import React, { useRef, useEffect } from "react";

interface ParticleProps {
  density?: 'low' | 'medium' | 'high' | number;
  speed?: 'slow' | 'medium' | 'fast' | number;
  size?: 'small' | 'medium' | 'large' | number;
  color?: string;
  glow?: boolean;
  fadeInDuration?: number;
  particleLifetime?: number;
}

interface Particle {
  x: number;
  y: number;
  baseSize: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  lifetime: number;
  birthTime: number;
}

const Particles: React.FC<ParticleProps> = ({
  density = 'low',
  speed = 'slow',
  size = 'small',
  color = 'rgba(255, 255, 255, 1)',
  glow = true,
  fadeInDuration = 8000,
  particleLifetime = 3000,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const entranceStartTimeRef = useRef<number>(Date.now());

  // Convert presets to numbers
  const getDensityValue = (density: 'low' | 'medium' | 'high' | number): number => {
    if (typeof density === 'number') return density;
    switch (density) {
      case 'low': return 0.000015;
      case 'medium': return 0.00003;
      case 'high': return 0.00005;
      default: return 0.000015;
    }
  };

  const getSpeedValue = (speed: 'slow' | 'medium' | 'fast' | number): number => {
    if (typeof speed === 'number') return speed;
    switch (speed) {
      case 'slow': return 0.2;
      case 'medium': return 0.5;
      case 'fast': return 1.0;
      default: return 0.2;
    }
  };

  const getSizeValue = (size: 'small' | 'medium' | 'large' | number): number => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'small': return 1.5;
      case 'medium': return 2.5;
      case 'large': return 4;
      default: return 1.5;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles = particlesRef.current;
    const entranceStartTime = entranceStartTimeRef.current;
    const densityValue = getDensityValue(density);
    const speedValue = getSpeedValue(speed);
    const sizeValue = getSizeValue(size);

    class ParticleClass implements Particle {
      x: number;
      y: number;
      baseSize: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      lifetime: number;
      birthTime: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseSize = Math.random() * sizeValue + 0.5;
        this.size = this.baseSize;
        this.speedX = (Math.random() - 0.5) * speedValue;
        this.speedY = (Math.random() - 0.5) * speedValue;
        this.opacity = 0;
        this.lifetime = Math.random() * 2000 + particleLifetime;
        this.birthTime = Date.now();
      }

      update() {
        const elapsedTime = Date.now() - entranceStartTime;

        if (elapsedTime <= fadeInDuration) {
          const progress = elapsedTime / fadeInDuration;
          this.opacity = progress;
        } else {
          this.opacity = 1 - (Date.now() - this.birthTime) / this.lifetime;

          if (Date.now() - this.birthTime > this.lifetime) {
            const index = particles.indexOf(this);
            if (index > -1) particles.splice(index, 1);
          }
        }

        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.x = Math.random() * canvas.width;
        if (this.y < 0 || this.y > canvas.height) this.y = Math.random() * canvas.height;
      }

      draw() {
        if (glow) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 15;
        } else {
          ctx.shadowBlur = 0;
        }

        const [r, g, b] = color.match(/\d+/g)?.map(Number) || [255, 255, 255];
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      adjustParticleCount();
    };

    const adjustParticleCount = () => {
      const area = canvas.width * canvas.height;
      const targetCount = Math.floor(area * densityValue);
      const difference = targetCount - particles.length;

      if (difference > 0) {
        for (let i = 0; i < difference; i++) {
          particles.push(new ParticleClass());
        }
      } else if (difference < 0) {
        particles.splice(difference);
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      adjustParticleCount();
      requestRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [density, speed, size, color, glow, fadeInDuration, particleLifetime]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

export default Particles; 