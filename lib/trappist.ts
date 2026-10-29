// TRAPPIST-1 system data, Agol et al. (2021) via the NASA Exoplanet Archive.

export type PlanetId = "b" | "c" | "d" | "e" | "f" | "g" | "h";

export type Planet = {
  id: PlanetId;
  name: string;
  /** Orbital period in days. */
  periodDays: number;
  /** Radius in Earth radii. */
  radiusEarth: number;
  /** Semi-major axis in astronomical units. */
  semiMajorAxisAu: number;
  /** Orbits within the star's habitable zone. */
  habitable: boolean;
};

export type Star = {
  name: string;
  spectralType: string;
  description: string;
  /** Effective temperature in kelvin (approximate). */
  temperatureK: number;
  /** Mass in solar masses. */
  massSun: number;
  /** Radius in solar radii. */
  radiusSun: number;
  /** Distance from Earth in light-years (approximate). */
  distanceLy: number;
  constellation: string;
};

export const planets: readonly Planet[] = [
  {
    id: "b",
    name: "TRAPPIST-1b",
    periodDays: 1.510826,
    radiusEarth: 1.116,
    semiMajorAxisAu: 0.01154,
    habitable: false,
  },
  {
    id: "c",
    name: "TRAPPIST-1c",
    periodDays: 2.421937,
    radiusEarth: 1.097,
    semiMajorAxisAu: 0.0158,
    habitable: false,
  },
  {
    id: "d",
    name: "TRAPPIST-1d",
    periodDays: 4.049219,
    radiusEarth: 0.788,
    semiMajorAxisAu: 0.02227,
    habitable: false,
  },
  {
    id: "e",
    name: "TRAPPIST-1e",
    periodDays: 6.101013,
    radiusEarth: 0.92,
    semiMajorAxisAu: 0.02925,
    habitable: true,
  },
  {
    id: "f",
    name: "TRAPPIST-1f",
    periodDays: 9.20754,
    radiusEarth: 1.045,
    semiMajorAxisAu: 0.03849,
    habitable: true,
  },
  {
    id: "g",
    name: "TRAPPIST-1g",
    periodDays: 12.352446,
    radiusEarth: 1.129,
    semiMajorAxisAu: 0.04683,
    habitable: true,
  },
  {
    id: "h",
    name: "TRAPPIST-1h",
    periodDays: 18.772866,
    radiusEarth: 0.755,
    semiMajorAxisAu: 0.06189,
    habitable: false,
  },
];

export const star: Star = {
  name: "TRAPPIST-1",
  spectralType: "M8V",
  description: "ultra-cool red dwarf",
  temperatureK: 2566,
  massSun: 0.09,
  radiusSun: 0.12,
  distanceLy: 40.7,
  constellation: "Aquarius",
};
