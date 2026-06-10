import React, { useEffect, useRef } from 'react';

export default function AnimeBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Soft floating leaf/petal particle
    class FloatingPetal {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
      angle: number;
      speed: number;
      wobble: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height + height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = -(Math.random() * 0.5 + 0.2);
        this.radius = Math.random() * 3 + 1.5;

        const colors = [
          'rgba(112, 144, 133, 0.18)',  // Deep Sage Green
          'rgba(74, 122, 150, 0.15)',   // Muted Cyan Blue
          'rgba(100, 160, 130, 0.12)',  // Natural green
          'rgba(140, 190, 160, 0.10)',  // Soft mint
          'rgba(74, 122, 150, 0.12)',   // Accent blue
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.5 + 0.2;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 0.003 + Math.random() * 0.006;
        this.wobble = Math.random() * Math.PI * 2;
      }

      update(mouseX: number, mouseY: number) {
        // Gentle wobble drift
        this.wobble += this.speed;
        this.vx += Math.sin(this.wobble) * 0.005;
        this.vy -= 0.001;

        // Subtle repulsion from mouse (breathable feel)
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          this.vx -= (dx / dist) * force * 0.015;
          this.vy -= (dy / dist) * force * 0.015;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Friction
        this.vx *= 0.97;
        this.vy = Math.max(this.vy, -0.8);

        // Wrap
        if (this.y < -20) {
          this.y = height + 20;
          this.x = Math.random() * width;
          this.vy = -(Math.random() * 0.5 + 0.2);
        }
        if (this.x < -20) this.x = width + 20;
        if (this.x > width + 20) this.x = -20;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.globalAlpha = this.alpha;
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    // Gentle ripple class (water surface)
    class WaterRipple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      alpha: number;
      speed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height * 0.8 + height * 0.2;
        this.radius = 0;
        this.maxRadius = Math.random() * 60 + 30;
        this.alpha = 0.08;
        this.speed = Math.random() * 0.4 + 0.2;
      }

      update() {
        this.radius += this.speed;
        this.alpha = (1 - this.radius / this.maxRadius) * 0.08;
      }

      isExpired() {
        return this.radius >= this.maxRadius;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.globalAlpha = Math.max(0, this.alpha);
        c.strokeStyle = 'rgba(112, 144, 133, 0.35)';
        c.lineWidth = 1;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }
    }

    // Ambient soft orb (like sunlight through leaves)
    class SoftOrb {
      x: number;
      y: number;
      radius: number;
      alpha: number;
      alphaSpeed: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height * 0.6;
        this.radius = Math.random() * 80 + 40;
        this.alpha = Math.random() * 0.04 + 0.01;
        this.alphaSpeed = 0.0005 + Math.random() * 0.001;
        const orbs = [
          'rgba(112, 144, 133', // sage green
          'rgba(74, 122, 150',  // muted blue
          'rgba(150, 200, 170', // mint
        ];
        this.color = orbs[Math.floor(Math.random() * orbs.length)];
      }

      update() {
        this.alpha += this.alphaSpeed;
        if (this.alpha > 0.06 || this.alpha < 0.01) {
          this.alphaSpeed = -this.alphaSpeed;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        const grad = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, `${this.color}, ${this.alpha})`);
        grad.addColorStop(1, `${this.color}, 0)`);
        c.save();
        c.fillStyle = grad;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    // Initialization
    const petals: FloatingPetal[] = Array.from({ length: 55 }, () => new FloatingPetal());
    const orbs: SoftOrb[] = Array.from({ length: 5 }, () => new SoftOrb());
    let ripples: WaterRipple[] = [];
    let rippleTimer = 0;

    // Mouse Tracking
    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Loop
    const render = () => {
      // Clear with soft mint white background
      ctx.clearRect(0, 0, width, height);

      // Very subtle gradient background tint (complements the CSS bg color)
      const bgGrad = ctx.createLinearGradient(0, 0, width * 0.3, height);
      bgGrad.addColorStop(0, 'rgba(200, 225, 215, 0.06)');
      bgGrad.addColorStop(0.5, 'rgba(247, 249, 246, 0)');
      bgGrad.addColorStop(1, 'rgba(190, 215, 225, 0.04)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient orbs
      orbs.forEach(orb => {
        orb.update();
        orb.draw(ctx);
      });

      // Ripples
      rippleTimer++;
      if (rippleTimer > 180) {
        ripples.push(new WaterRipple());
        rippleTimer = 0;
      }
      ripples = ripples.filter(r => !r.isExpired());
      ripples.forEach(r => {
        r.update();
        r.draw(ctx);
      });

      // Petals
      petals.forEach(petal => {
        petal.update(mouse.x, mouse.y);
        petal.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
    />
  );
}
