import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Projects from "../components/Projects";
import Experience from "../components/Experience";
import Podcast from "../components/Podcast";
import Skills from "../components/Skills";
import Contact from "../components/Contact";
import TerminalEasterEgg from "../components/TerminalEasterEgg";
import BootSequence from "../components/BootSequence";

export default function Home() {
  return (
    <>
      <BootSequence />
      <Navbar />
      <main>
        <Hero />
        <Projects />
        <Experience />
        <Podcast />
        <Skills />
        <Contact />
      </main>
      <TerminalEasterEgg />
    </>
  );
}
