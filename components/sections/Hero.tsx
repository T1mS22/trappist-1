import InlineLink from "@/components/InlineLink";
import SectionLabel from "@/components/SectionLabel";
import SocialIcon, { externalLinkProps } from "@/components/SocialIcon";
import OrbitCanvas from "@/components/trappist/OrbitCanvas";
import { site } from "@/lib/site";

export default function Hero() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-5xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionLabel>kirchen (sieg), germany</SectionLabel>
          <h1 className="mt-4 text-[clamp(2.5rem,6vw,4rem)] leading-[1.1] font-semibold text-balance">
            Hi, I&apos;m Tim.
            <span className="block text-primary">
              I keep cloud infrastructure secure.
            </span>
          </h1>
          <div className="mt-6 max-w-lg">
            <p>
              Cloud infrastructure and security at{" "}
              <InlineLink href={site.companyUrl}>DEVDEER</InlineLink>.
            </p>
            <p className="mt-1 text-muted">
              Trained software developer, originally from Magdeburg, now living
              in Kirchen (Sieg).
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${site.email}`}
              className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 font-semibold text-primary-content sm:w-auto"
            >
              Get in touch
            </a>
            {site.socials.map((social) => (
              <div
                key={social.label}
                className="tooltip tooltip-bottom"
                data-tip={social.label}
              >
                <a
                  href={social.href}
                  aria-label={social.label}
                  {...externalLinkProps(social.external)}
                  className="inline-flex size-10 items-center justify-center rounded-lg border border-line transition-colors hover:border-primary hover:text-primary"
                >
                  <SocialIcon social={social} className="size-5" />
                </a>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto w-full max-w-xl lg:max-w-none">
          <OrbitCanvas mode="decorative" className="aspect-[16/10] w-full" />
          <p className="mt-2 text-right font-mono text-xs text-muted">
            <a
              href="#trappist-1"
              className="underline-offset-2 transition-colors hover:text-primary hover:underline"
            >
              why is this here? ↓
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
