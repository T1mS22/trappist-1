# Redesign spec (branch `redesign`)

One-page site, dark "space" theme, built around the TRAPPIST-1 system the repo is named after.
Stack: Next 16 App Router, React 19, Tailwind 4, daisyUI 5, TypeScript. Yarn 4.

## Theme tokens

Single dark theme (`color-scheme: dark`), replaces `mytheme` in `app/globals.css`.

| Token                          | Value                 | Use                            |
| ------------------------------ | --------------------- | ------------------------------ |
| base-100                       | `#0b0d12`             | page background                |
| base-200                       | `#13161e`             | cards, surfaces                |
| base-300                       | `#1c2029`             | hover surfaces                 |
| base-content                   | `#e8e6e1`             | body text                      |
| muted (custom `--color-muted`) | `#9a988f`             | supporting text                |
| faint (custom `--color-faint`) | `#6b6a64`             | captions, footer               |
| line (custom `--color-line`)   | `#232733`             | borders, dividers, orbit rings |
| primary                        | `#ff7a00`             | accent, CTA, labels            |
| primary-content                | `#1a0d00`             | text on primary                |
| accent                         | `#ff5714`             | the star                       |
| neutral / neutral-content      | `#232733` / `#e8e6e1` |                                |

- Fonts: Poppins (400, 600) for everything; JetBrains Mono (400) via `next/font` as `--font-mono` for labels, stats, kbd, footer.
- Type: h1 `clamp(2.5rem, 6vw, 4rem)` semibold, leading 1.1. h2 `2rem` semibold. Body 1rem / 1.7. Section label: mono 0.75rem, primary, letter-spacing 0.04em, lowercase, prefixed `// `.
- Layout: container `max-w-5xl mx-auto px-4 sm:px-6`. Sections `py-20 sm:py-28`, separated by a 1px `line` top border.
- Cards: base-200 bg, 1px `line` border, radius 12px, padding 1rem 1.25rem.
- Buttons: primary = primary bg + primary-content text, radius 8px, h-10 px-4. Icon buttons = 40px square, 1px `line` border, radius 8px, hover border + icon primary.
- Inline links (`components/InlineLink.tsx`): external text links, new tab (`noopener noreferrer`), `underline decoration-primary/50 underline-offset-4`, hover text + decoration primary.
- Text wrapping (`@layer base`): `p, li` use `text-wrap: pretty`; `h1-h3` use `text-wrap: balance`.
- Focus: `outline: 2px solid primary; outline-offset: 2px` on `:focus-visible` everywhere.
- Background: static starfield on `body`, layered `radial-gradient` 1px dots at 20-50% opacity, no animation.
- Motion: all animation respects `prefers-reduced-motion` and the site motion toggle (`lib/motion.ts`).

## Sections (top to bottom)

1. **Nav** (sticky, `bg-base-100/80 backdrop-blur`, bottom border `line`): left `tim schneider` (mono, lowercase, links to top). Right: anchor links `about`, `project` (→ `#side-project`), `contact`, `trappist-1` (muted, hover base-content; hidden below `sm`), then the command palette button (`⌘K` / `Ctrl K` kbd). The palette's "Navigate" group follows the same order: top, about, Rallye Timer, contact, TRAPPIST-1. The "Site" group also has `Open rallyetimer.de`, `Get Rallye Timer on Google Play` and `Open DEVDEER` (all external).
2. **Hero**: two columns on `lg` (text left, orbit right), stacked below.
   - Label `// kirchen (sieg), germany`
   - h1 `Hi, I'm Tim.` then on a new line in primary: `I keep cloud infrastructure secure.`
   - Tagline block (max-w-lg), two paragraphs: `Cloud infrastructure and security at DEVDEER.` (base-content, `DEVDEER` is an InlineLink to `site.companyUrl`), then muted (mt-1) `Trained software developer, originally from Magdeburg, now living in Kirchen (Sieg).` `site.tagline` stays the meta description.
   - Row: primary button `Get in touch` (mailto `tim@t-s.dev`), then 5 icon buttons (GitHub, LinkedIn, Telegram, Instagram, Mail) with aria-labels and daisyUI tooltips.
   - Right: decorative `OrbitCanvas` (aria-hidden), aspect ~5:4, height ~280px on mobile. Orbit column `mx-auto w-full max-w-xl lg:max-w-none` so it doesn't span full width when stacked. Caption below, right-aligned, mono faint 11px: a normal focusable link `why is this here? ↓` to `#trappist-1` (hover primary, underline with offset 2 on hover).
3. **About** (`id="about"`): label `// about`, h2 `A bit about me`.
   - Two columns on `md`: photo (`/tim-profile.jpg`, 3:4, max-w 280px, radius 16px, 1px `line` border) and text.
   - Text (first `DEVDEER` is an InlineLink to `site.companyUrl`; not in the role cards): `I'm Tim. I trained as a software developer and today take care of cloud infrastructure and security for our customers at DEVDEER. I'm originally from Magdeburg, where the company is based, and now live in Kirchen (Sieg). I like taking things apart to see how they break, which is how I ended up playing CTFs. Away from the keyboard, I'm usually behind a drum kit. And when the pager goes off, I trade cloud incidents for real ones as a volunteer firefighter.`
   - Below: 4 role cards stacked as rows, each with an icon (24px, primary), title, one muted line:
     - Cloud infrastructure and security (cloud icon): `Building and securing cloud environments for our customers at DEVDEER.`
     - Software developer (code icon): `Trained through an apprenticeship, still happy to write code.`
     - Security enthusiast (shield icon): `TryHackMe's Advent of Cyber every December since 2022, plus the odd CTF.` `TryHackMe` is an InlineLink to https://tryhackme.com/p/t1ms22 (via the role's optional `link`).
     - Volunteer firefighter (siren icon): `On call for real-world incidents too. Those don't come with a rollback.`
     - Drummer (drum icon): `Keeping time when I'm away from the keyboard.`
   - Below the role cards: mono muted label `certifications` (h3), then a grid of cert cards (1 col, 2 from `sm`, the first card spans both columns), data in `site.certifications`. Each card is one link (new tab) to the Microsoft Learn share URL, same card style as the roles, hover border primary: top row `BadgeCheck` icon + exam code (mono, primary) with an `ArrowUpRight` (faint, primary on hover) on the right; then the name (semibold); then `Microsoft · {year}` (mono 12px faint). Current: AZ-500 Azure Security Engineer Associate (2024), SC-900 Security, Compliance, and Identity Fundamentals (2023), AZ-900 Azure Fundamentals (2023). Keep the highest-level cert first.
4. **Side project** (`id="side-project"`): label `// side project`, h2 `Rallye Timer`. Two columns on `md` (text left, phone right, centered), stacked below with the phone under the text.
   - p: `An Android app I built for co-drivers at classic and regularity rallies. Up to 50 countdown timers, and a voice that counts down the final 10 seconds, so your eyes can stay on the road book.`
   - Feature list (lucide `Check` in primary, text-sm): `Up to 50 simultaneous or sequential timers` · `Voice countdown in German or English` · `Precise to 1/100 of a second`.
   - Meta line, mono 12px faint: `€4.99 one-time · Android · no ads · built with Flutter`. Each item is a `whitespace-nowrap` span, so lines only break between items.
   - Buttons (`flex flex-wrap gap-3`, full width and stacked below `sm`): primary `Visit rallyetimer.de ↗` (`site.rallyTimerUrl`, new tab), then secondary `Get it on Google Play ↗` (`site.rallyTimerPlayUrl`, new tab; 1px `line` border, hover border + text primary) with a 16px outlined play-triangle icon (not Google's logo).
   - Right: `RallyTimerPreview`, a live HTML replica of the app's timer screen in a phone frame, rendered in the app's orange accent (`#ff7a00`, the app's own brand is red). Light app UI, orange app bar, 8 rows (6 running, 2 inactive) in the DSEG7 Classic 7-segment font (`app/fonts/`, OFL-1.1, `--font-seg`). Timers count down in real time; the shortest one turns orange with a speaker icon in its final 10 s, holds `00:00:00` for ~1.2 s, then restarts. Animates only when motion is on, the phone is on screen and the page is visible; with motion off it shows a static final-seconds frame (timer 2 at `00:07:42`). `role="img"` with a descriptive label; caption `live preview · shown in the app's orange accent`.
5. **Contact** (`id="contact"`): content sits in a card (`rounded-2xl border border-line bg-base-200 p-6 sm:p-10`), two columns from `md` (`md:grid-cols-2 md:items-center gap-8`), stacked on mobile. Left: label `// contact`, h2 `Say hi`, muted p `Email is the fastest way to reach me. I'm also around here:`. Right: email row, then social pills.
   - Large email link (`tim@t-s.dev`, mono, 1.25-1.5rem, hover primary) + small `Copy` button (shows `Copied` for 2s).
   - Social links as labeled pills (icon + name), external ones open in a new tab.
6. **TRAPPIST-1** (`id="trappist-1"`, at the bottom as a gimmick): label `// why the orbits?`, h2 `Named after a star 40 light-years away`.
   - p: `I've always liked space, so I name my projects after exoplanet systems. Most of them stay private, which makes this site the one you get to see. It's named after TRAPPIST-1, an ultra-cool red dwarf with seven Earth-sized planets, three of them in the habitable zone. They all orbit closer to their star than Mercury does to the Sun.`
   - 4 stat tiles (grid 2 cols mobile, 4 `md`): value mono 1.5rem + muted label: `~40 ly` distance · `7` rocky planets · `3` in the habitable zone · `18.8 d` longest year.
   - `PlanetExplorer` (interactive orbit + planet list). List meta line is `whitespace-nowrap`; the `habitable zone` pill sits under the meta below `sm` and right-aligned from `sm`.
   - Source line, faint 12px: `Data: Agol et al. (2021) via the NASA Exoplanet Archive.` linking to https://exoplanetarchive.ipac.caltech.edu/overview/TRAPPIST-1
7. **Footer**: left `© {year} Tim Schneider`; right a `Back to top ↑` link (`href="#top"`, `text-muted transition-colors hover:text-primary`). Nothing else (no build sha or date).

## TRAPPIST-1 data (Agol et al. 2021)

| Planet | Period (d) | Radius (R⊕) | a (AU)  | Habitable zone |
| ------ | ---------- | ----------- | ------- | -------------- |
| b      | 1.510826   | 1.116       | 0.01154 | no             |
| c      | 2.421937   | 1.097       | 0.01580 | no             |
| d      | 4.049219   | 0.788       | 0.02227 | no             |
| e      | 6.101013   | 0.920       | 0.02925 | yes            |
| f      | 9.207540   | 1.045       | 0.03849 | yes            |
| g      | 12.352446  | 1.129       | 0.04683 | yes            |
| h      | 18.772866  | 0.755       | 0.06189 | no             |

Star: M8V ultra-cool red dwarf, ~2,566 K, 0.09 M☉, 0.12 R☉, ~40.7 ly, constellation Aquarius. Neighbouring periods form a resonance chain (≈ 8:5, 5:3, 3:2, 3:2, 4:3, 3:2).

## Module ownership

- `lib/site.ts`: name, email, tagline, repo/rallyTimer/rallyTimerPlay/company URLs, socials (label, href, viewBox, path, external), roles.
- `components/InlineLink.tsx`: external inline text link.
- `lib/trappist.ts`: planet + star data above.
- `lib/motion.ts`: motion preference store.
- `components/RallyTimerPreview.tsx`: Rallye Timer phone mock (side project section).
- `components/trappist/*`: `OrbitCanvas`, `PlanetExplorer`.
- `components/CommandPalette.tsx`: ⌘K palette.
