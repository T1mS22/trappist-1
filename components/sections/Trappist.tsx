import SectionLabel from "@/components/SectionLabel";
import PlanetExplorer from "@/components/trappist/PlanetExplorer";

const stats = [
  { value: "~40 ly", label: "distance" },
  { value: "7", label: "rocky planets" },
  { value: "3", label: "in the habitable zone" },
  { value: "18.8 d", label: "longest year" },
];

const SOURCE_URL =
  "https://exoplanetarchive.ipac.caltech.edu/overview/TRAPPIST-1";

export default function Trappist() {
  return (
    <section id="trappist-1" className="border-t border-line py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionLabel>why the orbits?</SectionLabel>
        <h2 className="mt-3 text-[2rem] leading-tight font-semibold">
          Named after a star 40 light-years away
        </h2>
        <p className="mt-6 max-w-2xl">
          I&apos;ve always liked space, so I name my projects after exoplanet
          systems. Most of them stay private, which makes this site the one you
          get to see. It&apos;s named after TRAPPIST-1, an ultra-cool red dwarf
          with seven Earth-sized planets, three of them in the habitable zone.
          They all orbit closer to their star than Mercury does to the Sun.
        </p>
        <dl className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="flex flex-col rounded-xl border border-line bg-base-200 px-5 py-4"
            >
              <dt className="order-2 text-sm text-muted">{label}</dt>
              <dd className="order-1 font-mono text-2xl">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10">
          <PlanetExplorer />
        </div>
        <p className="mt-6 text-xs text-faint">
          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 transition-colors hover:text-primary"
          >
            Data: Agol et al. (2021) via the NASA Exoplanet Archive.
          </a>
        </p>
      </div>
    </section>
  );
}
