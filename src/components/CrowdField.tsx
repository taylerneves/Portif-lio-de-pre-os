import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export interface CrowdFieldHandle {
  setAttention: (_percent: number, _targetClientX: number, _color: string) => void;
}

interface CrowdFieldProps {
  count?: number;
  className?: string;
}

type Glow = {
  x: number;
  y: number;
  baseVx: number;
  vy: number;
  pushX: number;
  pushY: number;
  radius: number;
  alpha: number;
  hue: number;
  hueSpeed: number;
  life: number;
};

const TAU = Math.PI * 2;
const random = (min: number, max: number) => min + Math.random() * (max - min);

const CrowdField = forwardRef<CrowdFieldHandle, CrowdFieldProps>(
  ({ count = 72, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const attentionRef = useRef({ color: "#72f6df" });

    useImperativeHandle(ref, () => ({
      // Mantém a API antiga para não quebrar o App; o campo agora reage
      // diretamente ao cursor/toque, sem colorir os cards no hover.
      setAttention: (_percent, _targetClientX, color) => {
        attentionRef.current.color = color || "#72f6df";
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let width = 0;
      let height = 0;
      let dpr = 1;
      let raf = 0;
      let last = performance.now();
      const pointer = { x: 0, y: 0, active: false };
      const glows: Glow[] = [];

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        glows.length = 0;
        const total = Math.min(Math.max(count, 24), 110);
        for (let i = 0; i < total; i += 1) {
          glows.push({
            x: random(-width, width),
            y: random(20, height - 20),
            baseVx: -random(0.08, 0.2),
            vy: random(-0.012, 0.012),
            pushX: 0,
            pushY: 0,
            radius: random(2.2, 5.5),
            alpha: random(0.38, 0.9),
            hue: random(0, 360),
            hueSpeed: random(0.08, 0.16),
            life: 1,
          });
        }
      };

      const movePointer = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
        pointer.active = true;
      };

      const leavePointer = () => {
        pointer.active = false;
      };

      const drawGlow = (glow: Glow) => {
        const color = `hsla(${glow.hue}, 95%, 72%,`;
        const gradient = ctx.createRadialGradient(
          glow.x,
          glow.y,
          0,
          glow.x,
          glow.y,
          glow.radius * 5,
        );
        gradient.addColorStop(0, `${color}${glow.alpha})`);
        gradient.addColorStop(0.22, `${color}${glow.alpha * 0.55})`);
        gradient.addColorStop(1, `${color}0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(glow.x, glow.y, glow.radius * 5, 0, TAU);
        ctx.fill();

        ctx.fillStyle = `hsla(${glow.hue}, 100%, 88%, ${glow.alpha})`;
        ctx.beginPath();
        ctx.arc(glow.x, glow.y, glow.radius, 0, TAU);
        ctx.fill();
      };

      const tick = (now: number) => {
        const dt = Math.min((now - last) / 16.67, 2);
        last = now;
        ctx.clearRect(0, 0, width, height);

        for (const glow of glows) {
          {
            // Movimento base estável; a interação só acrescenta um desvio
            // temporário, portanto nenhuma bolinha pode ficar parada.
            glow.hue = (glow.hue + glow.hueSpeed * dt) % 360;
            glow.x += (glow.baseVx + glow.pushX) * dt;
            glow.y += (glow.vy + glow.pushY) * dt;
            if (glow.x < -30) {
              // Cada brilho reaparece pela lateral direita, devagar e sem salto
              // visível no meio da tela.
              glow.x = width + random(20, 80);
              glow.y = random(20, height - 20);
              glow.baseVx = -random(0.08, 0.2);
              glow.hue = random(0, 360);
              glow.hueSpeed = random(0.08, 0.16);
              glow.pushX = 0;
              glow.pushY = 0;
            }
            if (glow.y < -20) glow.y = height + 20;
            if (glow.y > height + 20) glow.y = -20;

            if (pointer.active) {
              const dx = glow.x - pointer.x;
              const dy = glow.y - pointer.y;
              const distance = Math.hypot(dx, dy);
              const reach = 115;
              if (distance > 0 && distance < reach) {
                const force = ((reach - distance) / reach) * 0.85 * dt;
                glow.pushX += (dx / distance) * force;
                glow.pushY += (dy / distance) * force;
              }
            }
            glow.pushX *= 0.9;
            glow.pushY *= 0.9;
            drawGlow(glow);
          }
        }


        raf = requestAnimationFrame(tick);
      };

      resize();
      window.addEventListener("resize", resize);
      canvas.addEventListener("pointermove", movePointer);
      canvas.addEventListener("pointerleave", leavePointer);
      raf = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        canvas.removeEventListener("pointermove", movePointer);
        canvas.removeEventListener("pointerleave", leavePointer);
      };
    }, [count]);

    return <canvas ref={canvasRef} className={className} aria-label="Campo interativo de brilhos" />;
  },
);

CrowdField.displayName = "GlowField";

export { CrowdField };
