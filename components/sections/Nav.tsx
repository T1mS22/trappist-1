import CommandPalette from "@/components/CommandPalette";
import { site } from "@/lib/site";

const links = [
  { href: "#about", label: "about" },
  { href: "#side-project", label: "project" },
  { href: "#contact", label: "contact" },
  { href: "#trappist-1", label: "trappist-1" },
  { href: site.toolsUrl, label: "tools" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-base-100/80 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6"
      >
        <a href="#top" className="font-mono text-sm lowercase">
          tim schneider
        </a>
        <div className="flex items-center gap-6">
          <ul className="hidden items-center gap-6 text-sm sm:flex">
            {links.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className="text-muted transition-colors hover:text-base-content"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <CommandPalette />
        </div>
      </nav>
    </header>
  );
}
