import { BackgroundFX } from "@/components/BackgroundFX";
import { Navbar } from "@/components/Navbar";
import { ScrollProgress } from "@/components/ScrollProgress";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { Skills } from "@/components/Skills";
import { Projects } from "@/components/Projects";
import { Journey } from "@/components/Journey";
import { ClientAccess } from "@/components/ClientAccess";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { WhatsappFloat } from "@/components/WhatsappFloat";

export default function Home() {
  return (
    <>
      <BackgroundFX />
      <ScrollProgress />
      <Navbar />
      <main id="conteudo" className="relative z-10">
        <Hero />
        <About />
        <Services />
        <Skills />
        <Projects />
        <Journey />
        <ClientAccess />
        <Contact />
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
