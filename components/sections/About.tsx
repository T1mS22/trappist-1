import Image from "next/image";
import {
  Cloud,
  CodeXml,
  Drum,
  ShieldCheck,
  Siren,
  type LucideIcon,
} from "lucide-react";
import InlineLink from "@/components/InlineLink";
import SectionLabel from "@/components/SectionLabel";
import { site, type RoleIcon } from "@/lib/site";

const roleIcons: Record<RoleIcon, LucideIcon> = {
  cloud: Cloud,
  code: CodeXml,
  shield: ShieldCheck,
  siren: Siren,
  drum: Drum,
};

export default function About() {
  return (
    <section id="about" className="border-t border-line py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionLabel>about</SectionLabel>
        <h2 className="mt-3 text-[2rem] leading-tight font-semibold">
          A bit about me
        </h2>
        <div className="mt-10 grid items-start gap-10 md:grid-cols-[260px_1fr]">
          <Image
            src="/tim-profile.jpg"
            alt="Picture of Tim"
            width={900}
            height={1200}
            sizes="260px"
            className="aspect-[3/4] h-auto w-full max-w-[260px] rounded-2xl border border-line object-cover"
          />
          <div>
            <p className="max-w-2xl text-lg">
              I&apos;m Tim. I trained as a software developer and today take
              care of cloud infrastructure and security for our customers at{" "}
              <InlineLink href={site.companyUrl}>DEVDEER</InlineLink>. I&apos;m
              originally from Magdeburg, where the company is based, and now
              live in Kirchen (Sieg). I like taking things apart to see how they
              break, which is how I ended up playing CTFs. Away from the
              keyboard, I&apos;m usually behind a drum kit. And when the pager
              goes off, I trade cloud incidents for real ones as a volunteer
              firefighter.
            </p>
            <ul className="mt-8 grid gap-3">
              {site.roles.map((role) => {
                const Icon = roleIcons[role.icon];
                return (
                  <li
                    key={role.title}
                    className="flex items-start gap-4 rounded-xl border border-line bg-base-200 px-5 py-4"
                  >
                    <Icon
                      className="mt-0.5 size-6 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="font-semibold">{role.title}</h3>
                      <p className="text-sm text-muted">{role.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
