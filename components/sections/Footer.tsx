import { site } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-8 text-sm text-faint sm:px-6">
        <p>
          © {year} {site.name}
        </p>
        <a
          href="#top"
          className="text-muted transition-colors hover:text-primary"
        >
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
