import React, { useRef, useEffect } from "react";

interface ParticleProps {
  density?: 'low' | 'medium' | 'high' | number;
  speed?: 'slow' | 'medium' | 'fast' | 'ultra-fast' | 'hyper' | 'insane' | number;
  size?: 'small' | 'medium' | 'large' | 'uniform-small' | 'uniform-medium' | 'uniform-large' | number;
  color?: string;
  glow?: boolean;
  fadeInDuration?: number;
  particleLifetime?: number;
  uniformSize?: boolean;
  direction?: 'up' | 'down' | 'left' | 'right' | 'random';
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
  update(): void;
  draw(): void;
}

const Particles: React.FC<ParticleProps> = ({
  density = 'low',
  speed = 'slow',
  size = 'small',
  color = 'rgba(255, 255, 255, 1)',
  glow = true,
  fadeInDuration = 8000,
  particleLifetime = 5000,
  uniformSize = false,
  direction = 'random',
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

  const getSpeedValue = (speed: 'slow' | 'medium' | 'fast' | 'ultra-fast' | 'hyper' | 'insane' | number): number => {
    if (typeof speed === 'number') return speed;
    switch (speed) {
      case 'slow': return 0.2;
      case 'medium': return 0.5;
      case 'fast': return 1.0;
      case 'ultra-fast': return 2.0;
      case 'hyper': return 3.5;
      case 'insane': return 5.0;
      default: return 0.2;
    }
  };

  const getSizeValue = (size: 'small' | 'medium' | 'large' | 'uniform-small' | 'uniform-medium' | 'uniform-large' | number): number => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'small': return 1.5;
      case 'medium': return 2.5;
      case 'large': return 4;
      case 'uniform-small': return 0.5;
      case 'uniform-medium': return 2.5;
      case 'uniform-large': return 4;
      default: return 1.5;
    }
  };

  const isUniformSize = (size: 'small' | 'medium' | 'large' | 'uniform-small' | 'uniform-medium' | 'uniform-large' | number): boolean => {
    if (typeof size === 'string') {
      return size.startsWith('uniform-') || uniformSize;
    }
    return uniformSize;
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
    const useUniformSize = isUniformSize(size);

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
        this.x = Math.random() * (canvas?.width || window.innerWidth);
        this.y = Math.random() * (canvas?.height || window.innerHeight);
        this.baseSize = useUniformSize ? sizeValue : Math.random() * sizeValue + 0.5;
        this.size = this.baseSize;
        
        // Set direction based on prop
        switch (direction) {
          case 'up':
            this.speedX = (Math.random() - 0.5) * speedValue * 0.3; // Small horizontal drift
            this.speedY = -Math.random() * speedValue - 0.1; // Upward movement
            break;
          case 'down':
            this.speedX = (Math.random() - 0.5) * speedValue * 0.3;
            this.speedY = Math.random() * speedValue + 0.1; // Downward movement
            break;
          case 'left':
            this.speedX = -Math.random() * speedValue - 0.1; // Leftward movement
            this.speedY = (Math.random() - 0.5) * speedValue * 0.3;
            break;
          case 'right':
            this.speedX = Math.random() * speedValue + 0.1; // Rightward movement
            this.speedY = (Math.random() - 0.5) * speedValue * 0.3;
            break;
          default: // 'random'
            this.speedX = (Math.random() - 0.5) * speedValue;
            this.speedY = (Math.random() - 0.5) * speedValue;
        }
        
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

        const canvasWidth = canvas?.width || window.innerWidth;
        const canvasHeight = canvas?.height || window.innerHeight;
        
        // Handle wrapping based on direction
        if (direction === 'up' && this.y < 0) {
          this.y = canvasHeight;
          this.x = Math.random() * canvasWidth;
        } else if (direction === 'down' && this.y > canvasHeight) {
          this.y = 0;
          this.x = Math.random() * canvasWidth;
        } else if (direction === 'left' && this.x < 0) {
          this.x = canvasWidth;
          this.y = Math.random() * canvasHeight;
        } else if (direction === 'right' && this.x > canvasWidth) {
          this.x = 0;
          this.y = Math.random() * canvasHeight;
        } else if (direction === 'random') {
          if (this.x < 0 || this.x > canvasWidth) this.x = Math.random() * canvasWidth;
          if (this.y < 0 || this.y > canvasHeight) this.y = Math.random() * canvasHeight;
        }
      }

      draw() {
        if (!ctx) return;
        
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
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      adjustParticleCount();
    };

    const adjustParticleCount = () => {
      if (!canvas) return;
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
      if (!ctx || !canvas) return;
      
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
  }, [density, speed, size, color, glow, fadeInDuration, particleLifetime, uniformSize, direction]);

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