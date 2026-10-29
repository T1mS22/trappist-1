"use client";

import { useEffect, useRef } from "react";
import { useMotionEnabled } from "@/lib/motion";
import { planets, type PlanetId } from "@/lib/trappist";

type OrbitCanvasProps = {
  mode: "decorative" | "interactive";
  highlighted?: PlanetId | null;
  onPlanetClick?: (id: PlanetId) => void;
  className?: string;
};

// Canvas cannot use Tailwind classes, so the theme colors live here.
const COLOR_LINE = "#232733";
const COLOR_TEXT = "#e8e6e1";
const COLOR_PLANET_DIM = "#7d7b74";
const COLOR_PRIMARY = "#ff7a00";
const COLOR_STAR = "#ff5714";
const COLOR_STAR_GLOW = "rgba(255,87,20,0.35)";
const COLOR_STAR_GLOW_END = "rgba(255,87,20,0)";
const COLOR_HABITABLE_BAND = "rgba(255,122,0,0.07)";
const FALLBACK_MONO = "ui-monospace, monospace";

// Orbits are seen tilted: ellipses with half the vertical radius.
const Y_SCALE = 0.5;
const TAU = Math.PI * 2;
// Planet b completes one orbit in this many seconds; the others follow the
// real period ratios.
const INNERMOST_ORBIT_SECONDS = 6;
const INITIAL_PHASES = [0.3, 2.1, 4.0, 5.2, 1.1, 3.3, 0.7];
const MAX_FRAME_DELTA_MS = 100;
const LABEL_GAP = 6;
const LABEL_EDGE_PADDING = 4;

const PLANET_COUNT = planets.length;
const INNER_AU = planets[0].semiMajorAxisAu;
const OUTER_AU = planets[PLANET_COUNT - 1].semiMajorAxisAu;
const INNER_PERIOD = planets[0].periodDays;

/** Orbit radius as a fraction of R. */
const ORBIT_FRACTIONS = planets.map(
  (planet) =>
    0.24 + (0.76 * (planet.semiMajorAxisAu - INNER_AU)) / (OUTER_AU - INNER_AU),
);
/** Angular speed in rad/s. */
const ANGULAR_SPEEDS = planets.map(
  (planet) =>
    (TAU / INNERMOST_ORBIT_SECONDS) * (INNER_PERIOD / planet.periodDays),
);
const FIRST_HABITABLE = planets.findIndex((planet) => planet.habitable);
const LAST_HABITABLE = planets.findLastIndex((planet) => planet.habitable);

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export default function OrbitCanvas({
  mode,
  highlighted = null,
  onPlanetClick,
  className,
}: OrbitCanvasProps) {
  const motionEnabled = useMotionEnabled();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const anglesRef = useRef<Float64Array | null>(null);
  const propsRef = useRef({ highlighted, onPlanetClick, motionEnabled });
  const updateRef = useRef<(() => void) | null>(null);

  // Mirror changing props into a ref so the drawing loop never restarts.
  // Declared before the setup effect so the ref is current on mount.
  useEffect(() => {
    propsRef.current = { highlighted, onPlanetClick, motionEnabled };
    updateRef.current?.();
  }, [highlighted, onPlanetClick, motionEnabled]);

  useEffect(() => {
    const containerEl = containerRef.current;
    const canvasEl = canvasRef.current;
    const context = canvasEl?.getContext("2d");
    if (!containerEl || !canvasEl || !context) {
      return;
    }
    // Explicitly typed so the narrowing holds inside the hoisted helpers.
    const container: HTMLDivElement = containerEl;
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = context;

    const interactive = mode === "interactive";
    // Kept across re-runs of this effect so the system never jumps.
    const angles = (anglesRef.current ??= Float64Array.from(INITIAL_PHASES));

    // Geometry, recomputed on resize only.
    let width = 0;
    let height = 0;
    let dpr = 1;
    let cx = 0;
    let cy = 0;
    let starRadius = 0;
    let glowRadius = 0;
    let glow: CanvasGradient | null = null;
    let habitableBand: Path2D | null = null;
    const ringPaths: Path2D[] = [];
    const orbitRadii = new Float64Array(PLANET_COUNT);
    const planetRadii = new Float64Array(PLANET_COUNT);
    // Positions of the last drawn frame, used for hit-testing.
    const posX = new Float64Array(PLANET_COUNT);
    const posY = new Float64Array(PLANET_COUNT);

    let font = `11px ${FALLBACK_MONO}`;
    const labelWidths = new Float64Array(PLANET_COUNT);

    let rafId = 0;
    let lastTime = -1;
    let onScreen = false;
    let pageVisible = document.visibilityState === "visible";
    let disposed = false;

    function readFont() {
      // Read from the canvas so the value is inherited from wherever the
      // next/font variable is applied (normally the document root).
      const mono = getComputedStyle(canvas)
        .getPropertyValue("--font-mono")
        .trim();
      font = `11px ${mono || FALLBACK_MONO}`;
    }

    function measureLabels() {
      ctx.font = font;
      for (let i = 0; i < PLANET_COUNT; i++) {
        labelWidths[i] = ctx.measureText(planets[i].name).width;
      }
    }

    function ellipsePath(path: Path2D, radius: number) {
      path.moveTo(cx + radius, cy);
      path.ellipse(cx, cy, radius, radius * Y_SCALE, 0, 0, TAU);
    }

    function layout() {
      width = container.clientWidth;
      height = container.clientHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));

      cx = width / 2;
      cy = height / 2;
      const R = Math.min(width / 2, height / (2 * Y_SCALE)) * 0.92;
      const sizeScale = clamp(R / 200, 0.7, 1.3);

      ringPaths.length = 0;
      for (let i = 0; i < PLANET_COUNT; i++) {
        orbitRadii[i] = R * ORBIT_FRACTIONS[i];
        planetRadii[i] = (1.6 + planets[i].radiusEarth * 2.2) * sizeScale;
        const ring = new Path2D();
        ellipsePath(ring, orbitRadii[i]);
        ringPaths.push(ring);
      }

      // Habitable band: the ring area from the first to the last habitable
      // orbit, padded on both sides by half the smaller neighbouring gap
      // (d-e or g-h), so the band never reaches a non-habitable orbit.
      habitableBand = null;
      if (FIRST_HABITABLE >= 0 && R > 0) {
        const first = orbitRadii[FIRST_HABITABLE];
        const last = orbitRadii[LAST_HABITABLE];
        const innerGap =
          FIRST_HABITABLE > 0 ? first - orbitRadii[FIRST_HABITABLE - 1] : R;
        const outerGap =
          LAST_HABITABLE < PLANET_COUNT - 1
            ? orbitRadii[LAST_HABITABLE + 1] - last
            : R;
        const pad = Math.min(innerGap, outerGap) / 2;
        habitableBand = new Path2D();
        ellipsePath(habitableBand, last + pad);
        ellipsePath(habitableBand, first - pad);
      }

      starRadius = R * 0.05;
      glowRadius = starRadius * 3.5;
      glow = null;
      if (glowRadius > 0) {
        glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
        glow.addColorStop(0, COLOR_STAR_GLOW);
        glow.addColorStop(1, COLOR_STAR_GLOW_END);
      }

      measureLabels();
    }

    function drawPlanet(i: number, highlightIndex: number) {
      ctx.fillStyle =
        i === highlightIndex
          ? COLOR_PRIMARY
          : planets[i].habitable
            ? COLOR_TEXT
            : COLOR_PLANET_DIM;
      ctx.beginPath();
      ctx.arc(posX[i], posY[i], planetRadii[i], 0, TAU);
      ctx.fill();
    }

    function draw() {
      if (width <= 0 || height <= 0) {
        return;
      }
      if ((window.devicePixelRatio || 1) !== dpr) {
        layout();
      }
      const c = ctx;
      const { highlighted: highlightId } = propsRef.current;
      const highlightIndex =
        interactive && highlightId
          ? planets.findIndex((planet) => planet.id === highlightId)
          : -1;

      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, width, height);

      if (habitableBand) {
        c.fillStyle = COLOR_HABITABLE_BAND;
        c.fill(habitableBand, "evenodd");
      }

      c.lineWidth = 1;
      c.strokeStyle = COLOR_LINE;
      for (let i = 0; i < PLANET_COUNT; i++) {
        if (i !== highlightIndex) {
          c.stroke(ringPaths[i]);
        }
      }
      if (highlightIndex >= 0) {
        c.lineWidth = 1.5;
        c.strokeStyle = COLOR_PRIMARY;
        c.stroke(ringPaths[highlightIndex]);
      }

      for (let i = 0; i < PLANET_COUNT; i++) {
        posX[i] = cx + orbitRadii[i] * Math.cos(angles[i]);
        posY[i] = cy + orbitRadii[i] * Y_SCALE * Math.sin(angles[i]);
      }

      // Planets behind the star (upper half) first.
      for (let i = 0; i < PLANET_COUNT; i++) {
        if (Math.sin(angles[i]) < 0) {
          drawPlanet(i, highlightIndex);
        }
      }

      if (glow) {
        c.fillStyle = glow;
        c.beginPath();
        c.arc(cx, cy, glowRadius, 0, TAU);
        c.fill();
      }
      c.fillStyle = COLOR_STAR;
      c.beginPath();
      c.arc(cx, cy, starRadius, 0, TAU);
      c.fill();

      for (let i = 0; i < PLANET_COUNT; i++) {
        if (Math.sin(angles[i]) >= 0) {
          drawPlanet(i, highlightIndex);
        }
      }

      if (highlightIndex >= 0) {
        const textWidth = labelWidths[highlightIndex];
        const offset = planetRadii[highlightIndex] + LABEL_GAP;
        let x = posX[highlightIndex] + offset;
        if (x + textWidth > width - LABEL_EDGE_PADDING) {
          x = posX[highlightIndex] - offset - textWidth;
        }
        x = clamp(
          x,
          LABEL_EDGE_PADDING,
          Math.max(LABEL_EDGE_PADDING, width - LABEL_EDGE_PADDING - textWidth),
        );
        const y = clamp(posY[highlightIndex], 8, Math.max(8, height - 8));
        c.font = font;
        c.textBaseline = "middle";
        c.textAlign = "left";
        c.fillStyle = COLOR_TEXT;
        c.fillText(planets[highlightIndex].name, x, y);
      }
    }

    function shouldAnimate() {
      return (
        propsRef.current.motionEnabled &&
        onScreen &&
        pageVisible &&
        width > 0 &&
        height > 0
      );
    }

    function tick(time: number) {
      rafId = 0;
      if (!shouldAnimate()) {
        lastTime = -1;
        return;
      }
      if (lastTime >= 0) {
        const dt = Math.min(time - lastTime, MAX_FRAME_DELTA_MS) / 1000;
        for (let i = 0; i < PLANET_COUNT; i++) {
          angles[i] = (angles[i] + ANGULAR_SPEEDS[i] * dt) % TAU;
        }
      }
      lastTime = time;
      draw();
      rafId = requestAnimationFrame(tick);
    }

    // Start or stop the loop to match the current conditions; draw a static
    // frame whenever the loop is not running.
    function update() {
      if (disposed) {
        return;
      }
      if (shouldAnimate()) {
        if (!rafId) {
          lastTime = -1;
          rafId = requestAnimationFrame(tick);
        }
        return;
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      lastTime = -1;
      draw();
    }

    readFont();
    layout();
    draw();
    updateRef.current = update;

    const resizeObserver = new ResizeObserver(() => {
      // Resizing clears the canvas: repaint now rather than on the next tick.
      layout();
      draw();
      if (shouldAnimate()) {
        update();
      }
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      onScreen = entry.isIntersecting;
      update();
    });
    intersectionObserver.observe(container);

    function handleVisibility() {
      pageVisible = document.visibilityState === "visible";
      update();
    }
    document.addEventListener("visibilitychange", handleVisibility);

    document.fonts?.ready.then(() => {
      if (disposed) {
        return;
      }
      readFont();
      measureLabels();
      update();
    });

    function hitTest(x: number, y: number): number {
      let best = -1;
      let bestDistance = Infinity;
      for (let i = 0; i < PLANET_COUNT; i++) {
        const distance = Math.hypot(x - posX[i], y - posY[i]);
        const hitRadius = Math.max(12, planetRadii[i] + 6);
        if (distance <= hitRadius && distance < bestDistance) {
          best = i;
          bestDistance = distance;
        }
      }
      return best;
    }

    function handlePointerMove(event: PointerEvent) {
      const hit = hitTest(event.offsetX, event.offsetY);
      canvas.style.cursor = hit >= 0 ? "pointer" : "";
    }

    function handlePointerLeave() {
      canvas.style.cursor = "";
    }

    function handleClick(event: MouseEvent) {
      const hit = hitTest(event.offsetX, event.offsetY);
      if (hit >= 0) {
        propsRef.current.onPlanetClick?.(planets[hit].id);
      }
    }

    if (interactive) {
      canvas.addEventListener("pointermove", handlePointerMove);
      canvas.addEventListener("pointerleave", handlePointerLeave);
      canvas.addEventListener("click", handleClick);
    }

    return () => {
      disposed = true;
      updateRef.current = null;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("click", handleClick);
      canvas.style.cursor = "";
    };
  }, [mode]);

  return (
    <div
      ref={containerRef}
      className={className ? `relative ${className}` : "relative"}
    >
      {/* Absolutely positioned so the canvas bitmap size never feeds back
          into the container's layout size. */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={
          mode === "decorative"
            ? "pointer-events-none absolute inset-0 block h-full w-full"
            : "absolute inset-0 block h-full w-full"
        }
      />
    </div>
  );
}
