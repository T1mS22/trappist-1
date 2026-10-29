"use client";

import { useState } from "react";
import { toggleMotion, useMotionEnabled } from "@/lib/motion";
import { planets, type Planet, type PlanetId } from "@/lib/trappist";
import OrbitCanvas from "./OrbitCanvas";

const innermost = planets[0];
const outermost = planets[planets.length - 1];
// How many orbits b completes during one orbit of h (18.77 / 1.51 ≈ 12.4).
const orbitRatio = Math.round(outermost.periodDays / innermost.periodDays);

function getPlanet(id: PlanetId): Planet {
  return planets.find((planet) => planet.id === id) ?? planets[0];
}

function formatMeta(planet: Planet): string {
  return `${planet.periodDays.toFixed(2)} d · ${planet.radiusEarth.toFixed(2)} R⊕ · ${planet.semiMajorAxisAu.toFixed(3)} AU`;
}

function formatDetail(planet: Planet): string {
  const parts = [
    planet.name,
    `one year lasts ${planet.periodDays.toFixed(1)} days`,
    `${planet.radiusEarth.toFixed(2)}× Earth's radius`,
  ];
  if (planet.habitable) {
    parts.push("in the habitable zone");
  }
  return parts.join(" · ");
}

function PauseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
    >
      <rect x="4" y="3" width="3" height="10" rx="1" />
      <rect x="9" y="3" width="3" height="10" rx="1" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
    >
      <path d="M5 3.5v9a.75.75 0 0 0 1.14.64l7.2-4.5a.75.75 0 0 0 0-1.28l-7.2-4.5A.75.75 0 0 0 5 3.5Z" />
    </svg>
  );
}

export default function PlanetExplorer() {
  const [selected, setSelected] = useState<PlanetId>("e");
  const [hovered, setHovered] = useState<PlanetId | null>(null);
  const motionEnabled = useMotionEnabled();
  const highlighted = hovered ?? selected;
  const selectedPlanet = getPlanet(selected);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:items-center">
      <div>
        <OrbitCanvas
          mode="interactive"
          highlighted={highlighted}
          onPlanetClick={setSelected}
          className="aspect-[16/10] w-full"
        />
        <div className="mt-4 flex items-start justify-between gap-4">
          <p aria-live="polite" className="text-sm text-muted">
            {formatDetail(selectedPlanet)}
          </p>
          <button
            type="button"
            onClick={toggleMotion}
            aria-label={
              motionEnabled ? "Pause orbit animation" : "Play orbit animation"
            }
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:border-primary hover:text-primary"
          >
            {motionEnabled ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>
        <p className="mt-2 font-mono text-[11px] text-faint">
          speeds are real ratios: b circles about {orbitRatio}× while h circles
          once
        </p>
      </div>

      <ul className="flex flex-col gap-1" aria-label="TRAPPIST-1 planets">
        {planets.map((planet) => {
          const isSelected = planet.id === selected;
          return (
            <li key={planet.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelected(planet.id)}
                onMouseEnter={() => setHovered(planet.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(planet.id)}
                onBlur={() => setHovered(null)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors hover:bg-base-300 ${
                  isSelected
                    ? "border-primary/40 bg-base-300"
                    : "border-transparent"
                }`}
              >
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs ${
                    planet.habitable
                      ? "border-primary/60 text-primary"
                      : "border-line"
                  }`}
                >
                  {planet.id}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-base-content">{planet.name}</span>
                  <span className="font-mono text-xs whitespace-nowrap text-muted">
                    {formatMeta(planet)}
                  </span>
                  {planet.habitable && (
                    <span className="mt-1 self-start rounded-full bg-primary/10 px-2 font-mono text-[11px] text-primary sm:hidden">
                      habitable zone
                    </span>
                  )}
                </span>
                {planet.habitable && (
                  <span className="hidden shrink-0 rounded-full bg-primary/10 px-2 font-mono text-[11px] text-primary sm:inline-flex">
                    habitable zone
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
