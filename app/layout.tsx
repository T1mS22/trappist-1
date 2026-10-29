import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["200", "400", "600"],
  display: "swap",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const title = "Tim Schneider";
const description = "Software developer based in Magdeburg, Germany.";

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
    <html lang="en" data-theme="mytheme">
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
