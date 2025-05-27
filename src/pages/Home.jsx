import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProjectTerminal from '../components/ProjectTerminal';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="pt-20">
        <Hero />
        <ProjectTerminal />
        <Footer />
      </div>
    </>
  );
}
