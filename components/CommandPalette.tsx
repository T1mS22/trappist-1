"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import {
  ArrowUp,
  AtSign,
  Building2,
  CodeXml,
  Copy,
  Download,
  Globe,
  Orbit,
  Pause,
  Play,
  Send,
  Timer,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { createPortal } from "react-dom";
import SocialIcon from "@/components/SocialIcon";
import { toggleMotion, useMotionEnabled } from "@/lib/motion";
import { site } from "@/lib/site";

type CommandAction =
  | { type: "scroll"; hash: string | null }
  | { type: "copy-email" }
  | { type: "mailto" }
  | { type: "external"; href: string }
  | { type: "toggle-motion" };

type Command = {
  id: string;
  label: string;
  keywords?: string;
  icon: ReactNode;
  hint?: string;
  action: CommandAction;
};

type CommandGroup = {
  id: string;
  heading: string;
  commands: Command[];
};

const TOAST_MS = 2000;
const EXTERNAL_HINT = "↗";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Platform and client-ness never change after load, so the store never notifies.
function subscribePlatform(): () => void {
  return () => {};
}

function isApplePlatform(): boolean {
  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  const platform = nav.userAgentData?.platform ?? nav.platform ?? "";
  return /mac|iphone|ipad|ipod/i.test(platform);
}

function getShortcutLabel(): string {
  return isApplePlatform() ? "⌘K" : "Ctrl K";
}

function getServerShortcutLabel(): string {
  return "⌘K";
}

function getIsClient(): boolean {
  return true;
}

function getServerIsClient(): boolean {
  return false;
}

function lucide(Icon: LucideIcon): ReactNode {
  return <Icon className="size-4" aria-hidden="true" />;
}

function scrollToSection(hash: string | null): void {
  const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  const behavior: ScrollBehavior = reduced ? "instant" : "smooth";
  if (hash === null) {
    window.scrollTo({ top: 0, behavior });
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    return;
  }
  document.querySelector(hash)?.scrollIntoView({ behavior, block: "start" });
  history.replaceState(null, "", hash);
}

function openExternal(href: string): void {
  window.open(href, "_blank", "noopener,noreferrer");
}

function matches(command: Command, query: string): boolean {
  if (!query) return true;
  const haystack = `${command.label} ${command.keywords ?? ""}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function buildGroups(motionEnabled: boolean): CommandGroup[] {
  return [
    {
      id: "navigate",
      heading: "Navigate",
      commands: [
        {
          id: "go-top",
          label: "Go to top",
          keywords: "home start hero",
          icon: lucide(ArrowUp),
          action: { type: "scroll", hash: null },
        },
        {
          id: "go-about",
          label: "Go to about",
          keywords: "me bio",
          icon: lucide(User),
          action: { type: "scroll", hash: "#about" },
        },
        {
          id: "go-side-project",
          label: "Go to Rallye Timer",
          keywords: "side project app rally",
          icon: lucide(Timer),
          action: { type: "scroll", hash: "#side-project" },
        },
        {
          id: "go-contact",
          label: "Go to contact",
          keywords: "reach email",
          icon: lucide(AtSign),
          action: { type: "scroll", hash: "#contact" },
        },
        {
          id: "go-trappist",
          label: "Go to TRAPPIST-1",
          keywords: "planets star orbit exoplanet",
          icon: lucide(Orbit),
          action: { type: "scroll", hash: "#trappist-1" },
        },
      ],
    },
    {
      id: "contact",
      heading: "Contact",
      commands: [
        {
          id: "copy-email",
          label: "Copy email address",
          keywords: "mail clipboard",
          icon: lucide(Copy),
          action: { type: "copy-email" },
        },
        {
          id: "send-email",
          label: "Send an email",
          keywords: "mail mailto write",
          icon: lucide(Send),
          action: { type: "mailto" },
        },
        ...site.socials
          .filter((social) => social.external)
          .map<Command>((social) => ({
            id: `open-${social.label.toLowerCase()}`,
            label: `Open ${social.label}`,
            keywords: "social profile link",
            icon: <SocialIcon social={social} className="size-4" />,
            hint: EXTERNAL_HINT,
            action: { type: "external", href: social.href },
          })),
      ],
    },
    {
      id: "site",
      heading: "Site",
      commands: [
        {
          id: "toggle-motion",
          label: motionEnabled
            ? "Pause orbit animation"
            : "Play orbit animation",
          keywords: "motion animation stop start reduce",
          icon: lucide(motionEnabled ? Pause : Play),
          action: { type: "toggle-motion" },
        },
        {
          id: "view-source",
          label: "View source on GitHub",
          keywords: "code repository repo",
          icon: lucide(CodeXml),
          hint: EXTERNAL_HINT,
          action: { type: "external", href: site.repoUrl },
        },
        {
          id: "open-tools",
          label: "Open tools",
          keywords:
            "tools password uuid json jwt base64 hash subnet iban timestamp converter",
          icon: lucide(Wrench),
          hint: EXTERNAL_HINT,
          action: { type: "external", href: site.toolsUrl },
        },
        {
          id: "open-rally-timer",
          label: "Open rallyetimer.de",
          keywords: "rallye timer side project app android",
          icon: lucide(Globe),
          hint: EXTERNAL_HINT,
          action: { type: "external", href: site.rallyTimerUrl },
        },
        {
          id: "get-rally-timer-play",
          label: "Get Rallye Timer on Google Play",
          keywords: "play store android app download",
          icon: lucide(Download),
          hint: EXTERNAL_HINT,
          action: { type: "external", href: site.rallyTimerPlayUrl },
        },
        {
          id: "open-devdeer",
          label: "Open DEVDEER",
          keywords: "company work devdeer",
          icon: lucide(Building2),
          hint: EXTERNAL_HINT,
          action: { type: "external", href: site.companyUrl },
        },
      ],
    },
  ];
}

export default function CommandPalette() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const motionEnabled = useMotionEnabled();
  const shortcutLabel = useSyncExternalStore(
    subscribePlatform,
    getShortcutLabel,
    getServerShortcutLabel,
  );
  const isClient = useSyncExternalStore(
    subscribePlatform,
    getIsClient,
    getServerIsClient,
  );
  const baseId = useId();
  const listId = `${baseId}-list`;

  function showToast(message: string): void {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }

  async function copyEmail(): Promise<void> {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("unavailable");
      await navigator.clipboard.writeText(site.email);
      showToast("Email copied");
    } catch {
      showToast("Couldn't copy email");
    }
  }

  const visibleGroups = buildGroups(motionEnabled)
    .map((group) => ({
      ...group,
      commands: group.commands.filter((command) => matches(command, query)),
    }))
    .filter((group) => group.commands.length > 0);
  const flat = visibleGroups.flatMap((group) => group.commands);
  const active = flat.length > 0 ? Math.min(activeIndex, flat.length - 1) : -1;
  const optionId = (command: Command) => `${baseId}-${command.id}`;
  const activeId = active >= 0 ? optionId(flat[active]) : undefined;

  // Stable handle for the global shortcut listener.
  const toggle = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (dialog.open) {
      dialog.close();
    } else {
      dialog.showModal();
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      if (event.key.toLowerCase() !== "k") return;
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey)
        return;
      event.preventDefault();
      toggle();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!activeId) return;
    document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  // The dialog restores focus to whatever had it before opening. If that was
  // nothing (e.g. Safari does not focus buttons on click), focus can end up on
  // the body or stay inside the closed dialog: fall back to the trigger.
  function ensureFocusOutside(): void {
    const focused = document.activeElement;
    if (
      !focused ||
      focused === document.body ||
      dialogRef.current?.contains(focused)
    ) {
      triggerRef.current?.focus({ preventScroll: true });
    }
  }

  function handleClose(): void {
    setQuery("");
    setActiveIndex(0);
    ensureFocusOutside();
  }

  function runCommand(command: Command): void {
    dialogRef.current?.close();
    // Settle focus before the action starts so it cannot interrupt scrolling.
    ensureFocusOutside();
    const { action } = command;
    switch (action.type) {
      case "scroll":
        scrollToSection(action.hash);
        break;
      case "copy-email":
        void copyEmail();
        break;
      case "mailto":
        window.location.assign(`mailto:${site.email}`);
        break;
      case "external":
        openExternal(action.href);
        break;
      case "toggle-motion":
        toggleMotion();
        break;
    }
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>): void {
    if (flat.length === 0) return;
    const last = flat.length - 1;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex(active >= last ? 0 : active + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex(active <= 0 ? last : active - 1);
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(last);
        break;
      case "Enter":
        event.preventDefault();
        if (active >= 0) runCommand(flat[active]);
        break;
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-label="Open command palette"
        aria-keyshortcuts="Meta+K Control+K"
        className="inline-flex h-8 cursor-pointer items-center rounded-md border border-line px-2 font-mono text-xs text-muted transition-colors hover:border-primary hover:text-base-content"
      >
        <kbd className="font-mono">{shortcutLabel}</kbd>
      </button>
      <dialog
        ref={dialogRef}
        aria-label="Command palette"
        onClose={handleClose}
        onClick={(event) => {
          // Clicks on the backdrop target the dialog element itself.
          if (event.target === event.currentTarget) {
            event.currentTarget.close();
          }
        }}
        className="mx-auto mt-[15vh] w-[min(32rem,calc(100vw-2rem))] max-w-none rounded-xl border border-line bg-base-200 p-0 text-base-content backdrop:bg-black/60"
      >
        <div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search…"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            aria-label="Search commands"
            autoComplete="off"
            spellCheck={false}
            className="h-12 w-full border-b border-line bg-transparent px-4 outline-none! placeholder:text-faint"
          />
          <div
            id={listId}
            role="listbox"
            aria-label="Commands"
            className="max-h-80 overflow-y-auto p-2"
          >
            {visibleGroups.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted">
                No results for “{query}”
              </div>
            ) : (
              visibleGroups.map((group) => {
                const headingId = `${baseId}-group-${group.id}`;
                return (
                  <div
                    key={group.id}
                    role="group"
                    aria-labelledby={headingId}
                    className="not-first:mt-2"
                  >
                    <div
                      id={headingId}
                      className="px-3 pt-1 pb-1 font-mono text-[11px] text-faint"
                    >
                      {group.heading}
                    </div>
                    {group.commands.map((command) => {
                      const index = flat.indexOf(command);
                      const isActive = index === active;
                      return (
                        <div
                          key={command.id}
                          id={optionId(command)}
                          role="option"
                          aria-selected={isActive}
                          onPointerMove={() => {
                            if (!isActive) setActiveIndex(index);
                          }}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => runCommand(command)}
                          className={`flex h-10 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm ${
                            isActive
                              ? "bg-base-300 text-base-content"
                              : "text-muted"
                          }`}
                        >
                          <span className="flex size-4 shrink-0 items-center justify-center">
                            {command.icon}
                          </span>
                          <span className="flex-1 truncate">
                            {command.label}
                          </span>
                          {command.hint && (
                            <span
                              aria-hidden="true"
                              className="font-mono text-[11px] text-faint"
                            >
                              {command.hint}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </dialog>
      {/* Portaled to <body>: the nav's backdrop-filter would otherwise become
          the containing block for this fixed element. Always mounted (after
          hydration) so screen readers announce changes. */}
      {isClient &&
        createPortal(
          <div
            role="status"
            className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2"
          >
            {toast && (
              <div className="rounded-full border border-line bg-base-300 px-4 py-2 text-sm">
                {toast}
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
