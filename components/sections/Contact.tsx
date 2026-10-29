import CopyEmailButton from "@/components/CopyEmailButton";
import SectionLabel from "@/components/SectionLabel";
import SocialIcon, { externalLinkProps } from "@/components/SocialIcon";
import { site } from "@/lib/site";

// The email itself is the headline link, so the pills list the others.
const pills = site.socials.filter((social) => social.external);

export default function Contact() {
  return (
    <section id="contact" className="border-t border-line py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid gap-8 rounded-2xl border border-line bg-base-200 p-6 sm:p-10 md:grid-cols-2 md:items-center">
          <div>
            <SectionLabel>contact</SectionLabel>
            <h2 className="mt-3 text-[2rem] leading-tight font-semibold">
              Say hi
            </h2>
            <p className="mt-6 max-w-2xl text-muted">
              Email is the fastest way to reach me. I&apos;m also around here:
            </p>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={`mailto:${site.email}`}
                className="font-mono text-xl break-all transition-colors hover:text-primary sm:text-2xl"
              >
                {site.email}
              </a>
              <CopyEmailButton email={site.email} />
            </div>
            <ul className="mt-8 grid w-fit grid-cols-2 gap-3">
              {pills.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    {...externalLinkProps(social.external)}
                    className="flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm transition-colors hover:border-primary hover:text-primary"
                  >
                    <SocialIcon social={social} className="size-4" />
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
