"use client";

import { useEffect, useRef, useCallback } from "react";

interface ComputationalFieldProps {
  /**
   * Visual preset:
   * - "fabric"  : deforming particle grid (landing page)
   * - "field"   : flowing dot field (sidebar / background)
   * - "minimal" : faint dot grid only (content areas)
   */
  preset?: "fabric" | "field" | "minimal";
  /** Opacity of the canvas overlay (default: 0.5) */
  opacity?: number;
  /** CSS class applied to the wrapping div */
  className?: string;
  /** Particle color in [r, g, b] (default: warm near-black matching --ink) */
  color?: [number, number, number];
}

/**
 * ComputationalField
 *
 * Renders a continuously animated particle field that gives Workloom
 * the feeling of a system in motion — a subtle computational undercurrent
 * beneath the enterprise UI.
 *
 * Draws inspiration from:
 * - space_time_fabric.jsx — deforming wave field with gravity wells
 * - the_sun.jsx           — layered, zone-based particle distribution
 *
 * Performance: requestAnimationFrame with a reduced particle count for
 * 60fps on typical hardware. Canvas is hidden entirely when the user
 * has prefers-reduced-motion enabled.
 */
export default function ComputationalField({
  preset = "fabric",
  opacity = 0.45,
  className = "",
  color = [20, 19, 22], // --ink
}: ComputationalFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // Stable tick function built from config
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const t = performance.now() * 0.001; // seconds

    ctx.clearRect(0, 0, W, H);

    const [r, g, b] = color;

    if (preset === "fabric") {
      // ── Space-time fabric: deforming wave grid ──────────────
      // Sparse grid of particles on a wave surface with two gravity wells
      const cols = 40;
      const rows = 28;
      const cellW = W / cols;
      const cellH = H / rows;

      const freq = 2.2;
      const amp = 0.018; // fraction of cell size
      const speed = 0.35;

      // Two moving gravity wells (from space_time_fabric)
      const w1x = 0.5 + Math.sin(t * 0.3) * 0.28;
      const w1y = 0.5 + Math.cos(t * 0.22) * 0.28;
      const w2x = 0.5 + Math.sin(t * 0.5 + 2.0) * 0.22;
      const w2y = 0.5 + Math.cos(t * 0.4 + 1.0) * 0.22;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const u = col / cols;
          const v = row / rows;

          // Wave field
          const wave =
            Math.sin(u * freq * Math.PI * 2 + t * speed) * 0.5 +
            Math.sin(v * freq * Math.PI * 2 - t * speed * 0.8) * 0.5;

          // Gravity well curvature
          const dx1 = u - w1x;
          const dy1 = v - w1y;
          const d1 = Math.sqrt(dx1 * dx1 + dy1 * dy1 + 0.001);
          const dx2 = u - w2x;
          const dy2 = v - w2y;
          const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2 + 0.001);
          const curvature = (0.04 / d1 + 0.03 / d2) * 0.5;

          // Shear displacement
          const ang = (wave + curvature) * 0.6;
          const cosA = Math.cos(ang);
          const sinA = Math.sin(ang);

          const baseX = (col + 0.5) * cellW;
          const baseY = (row + 0.5) * cellH;

          const dispX = wave * cellW * amp * 3;
          const dispY = wave * cellH * amp * 3;

          const px = baseX + dispX * cosA - dispY * sinA;
          const py = baseY + dispX * sinA + dispY * cosA;

          // Dot size and opacity driven by energy
          const energy = Math.abs(wave * 0.5 + curvature * 10);
          const dotAlpha = 0.06 + energy * 0.18;
          const dotSize = 0.8 + energy * 1.4;

          ctx.beginPath();
          ctx.arc(px, py, Math.min(dotSize, 2.2), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(dotAlpha, 0.28)})`;
          ctx.fill();
        }
      }

      // ── Draw well centers as faint lavender pulses ──────────
      const wellPositions = [
        [w1x * W, w1y * H],
        [w2x * W, w2y * H],
      ];
      for (const [wx, wy] of wellPositions) {
        const pulseR = 6 + Math.sin(t * 1.5) * 3;
        const grad = ctx.createRadialGradient(wx, wy, 0, wx, wy, pulseR);
        grad.addColorStop(0, `rgba(179,174,246,0.12)`);
        grad.addColorStop(1, `rgba(179,174,246,0)`);
        ctx.beginPath();
        ctx.arc(wx, wy, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    } else if (preset === "field") {
      // ── Flowing field: particles drifting in a vector field ──
      // Pre-computed static seed array stored on canvas element
      type FieldParticle = { x: number; y: number; phase: number; speed: number; size: number };
      const canvasEl = canvas as HTMLCanvasElement & { _particles?: FieldParticle[] };
      if (!canvasEl._particles || canvasEl._particles.length === 0) {
        canvasEl._particles = Array.from({ length: 80 }, (_, i) => ({
          x: Math.random(),
          y: Math.random(),
          phase: Math.random() * Math.PI * 2,
          speed: 0.008 + Math.random() * 0.012,
          size: 0.8 + Math.random() * 1.2,
        }));
      }

      for (const p of canvasEl._particles) {
        // Gentle sinusoidal drift
        p.x += Math.sin(t * p.speed * 6 + p.phase) * 0.0006;
        p.y += Math.cos(t * p.speed * 4 + p.phase * 1.3) * 0.0004 + p.speed * 0.004;

        // Wrap
        if (p.y > 1) p.y = 0;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;

        const alpha = 0.06 + Math.sin(t * p.speed * 5 + p.phase) * 0.04;
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.max(0.02, alpha)})`;
        ctx.fill();
      }
    } else {
      // ── Minimal: static dot grid with gentle opacity pulse ───
      const spacing = 22;
      const offX = (W % spacing) / 2;
      const offY = (H % spacing) / 2;

      for (let x = offX; x < W; x += spacing) {
        for (let y = offY; y < H; y += spacing) {
          const dist = Math.sqrt((x / W - 0.5) ** 2 + (y / H - 0.5) ** 2);
          const alpha = 0.05 + Math.sin(t * 0.4 + dist * 4) * 0.015;
          ctx.beginPath();
          ctx.arc(x, y, 0.9, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${Math.max(0.025, alpha)})`;
          ctx.fill();
        }
      }
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [preset, color]);

  useEffect(() => {
    // Respect reduced motion preference
    if (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Size canvas to its CSS container
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      canvas.width = width;
      canvas.height = height;
    });
    ro.observe(canvas.parentElement!);

    // Initial size
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return (
    <div
      className={`computational-field ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", opacity, display: "block" }}
      />
    </div>
  );
}
