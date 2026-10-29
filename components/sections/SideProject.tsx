import { Fragment } from "react";
import { Check } from "lucide-react";
import RallyTimerPreview from "@/components/RallyTimerPreview";
import SectionLabel from "@/components/SectionLabel";
import { site } from "@/lib/site";

const meta = ["€4.99 one-time", "Android", "no ads", "built with Flutter"];

const features = [
  "Up to 50 simultaneous or sequential timers",
  "Voice countdown in German or English",
  "Precise to 1/100 of a second",
];

export default function SideProject() {
  return (
    <section id="side-project" className="border-t border-line py-20 sm:py-28">
      <div className="mx-auto grid max-w-5xl items-center gap-12 px-4 sm:px-6 md:grid-cols-[1fr_auto]">
        <div>
          <SectionLabel>side project</SectionLabel>
          <h2 className="mt-3 text-[2rem] leading-tight font-semibold">
            Rallye Timer
          </h2>
          <p className="mt-6 max-w-xl">
            An Android app I built for co-drivers at classic and regularity
            rallies. Up to 50 countdown timers, and a voice that counts down the
            final 10 seconds, so your eyes can stay on the road book.
          </p>
          <ul className="mt-6 grid gap-2 text-sm">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {feature}
              </li>
            ))}
          </ul>
          <p className="mt-6 font-mono text-xs text-faint">
            {meta.map((item, index) => (
              <Fragment key={item}>
                {index > 0 && " · "}
                <span className="whitespace-nowrap">{item}</span>
              </Fragment>
            ))}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={site.rallyTimerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 font-semibold text-primary-content sm:w-auto"
            >
              Visit rallyetimer.de ↗
            </a>
            <a
              href={site.rallyTimerPlayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-line px-4 font-semibold transition-colors hover:border-primary hover:text-primary sm:w-auto"
            >
              <svg
                viewBox="0 0 16 16"
                className="size-4 shrink-0"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M4 2.8v10.4a1 1 0 0 0 1.5.86l8.67-5.2a1 1 0 0 0 0-1.72L5.5 1.94A1 1 0 0 0 4 2.8Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              Get it on Google Play ↗
            </a>
          </div>
        </div>
        <div className="flex justify-center">
          <RallyTimerPreview />
        </div>
      </div>
    </section>
  );
}
