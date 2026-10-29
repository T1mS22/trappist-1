import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import Hero from "@/components/sections/Hero";
import Nav from "@/components/sections/Nav";
import SideProject from "@/components/sections/SideProject";
import Trappist from "@/components/sections/Trappist";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <SideProject />
        <Contact />
        <Trappist />
      </main>
      <Footer />
    </>
  );
}
