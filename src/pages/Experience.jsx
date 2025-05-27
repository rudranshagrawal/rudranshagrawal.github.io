import Navbar from '../components/Navbar';
import ResumeExperience from '../components/ResumeExperience';
import Footer from '../components/Footer';

export default function Experience() {
  return (
    <>
      <Navbar />
      <div className="pt-20">
        <ResumeExperience />
        <Footer />
      </div>
    </>
  );
}
