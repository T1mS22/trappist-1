import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { JetBrains_Mono, Poppins } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "600"],
  display: "swap",
  subsets: ["latin"],
});

// Exposed as a CSS variable; Tailwind's `font-mono` (--font-mono in
// app/globals.css) resolves to it.
const jetbrainsMono = JetBrains_Mono({
  weight: ["400"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const title = site.name;
const description = site.tagline;

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    url: "/",
    images: [
      {
        url: "/tim-profile.jpg",
        width: 900,
        height: 1200,
        alt: "Picture of Tim",
      },
    ],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/tim-profile.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="trappist" className={jetbrainsMono.variable}>
      <body className={poppins.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
