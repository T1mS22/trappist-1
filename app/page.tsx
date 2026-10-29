import Image from "next/image";
import SocialLinks from "@/components/SocialLinks";

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <main className="flex min-h-screen flex-col bg-neutral gap-8 items-center justify-center">
      <div className="hero bg-base-300">
        <div className="hero-content flex-col lg:flex-row">
          <Image
            width={300}
            height={400}
            src="/tim-profile.jpg"
            className="max-w-sm rounded-2xl shadow-2xl"
            alt="Picture of Tim"
            sizes="300px"
            priority
          />
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-bold">Tim Schneider</h1>
            <p className=" py-3 lg:py-6">
              Software developer based in Magdeburg, Germany
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-3xl">Find me here</h2>
      <SocialLinks />
      <p className="bottom-4 pb-4 text-sm">
        ©{year} Made by Tim Schneider with &#9829;
      </p>
    </main>
  );
}
