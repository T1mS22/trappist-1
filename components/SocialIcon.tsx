import type { Social } from "@/lib/site";

type SocialIconProps = {
  social: Pick<Social, "viewBox" | "path">;
  className?: string;
};

/** Decorative SVG for a social entry; the surrounding link carries the label. */
export default function SocialIcon({ social, className }: SocialIconProps) {
  return (
    <svg
      viewBox={social.viewBox}
      className={`fill-current ${className ?? ""}`}
      aria-hidden="true"
      focusable="false"
    >
      <path d={social.path} />
    </svg>
  );
}

/** Props that make an external social link open safely in a new tab. */
export function externalLinkProps(external: boolean) {
  return external
    ? ({ target: "_blank", rel: "noopener noreferrer" } as const)
    : {};
}
