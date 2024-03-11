import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["200", "400", "600"],
  display: "swap",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${poppins.className}`}
    ></main>
  );
}
