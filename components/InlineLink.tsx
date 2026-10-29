import type { ReactNode } from "react";

type InlineLinkProps = {
  href: string;
  children: ReactNode;
};

/** External inline text link that opens safely in a new tab. */
export default function InlineLink({ href, children }: InlineLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
    >
      {children}
    </a>
  );
}
