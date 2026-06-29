import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import MotionLayer from "@/components/MotionLayer";
import ScrollProgress from "@/components/ScrollProgress";
import Navbar from "@/components/Navbar";
import ExperienceHero from "@/components/ExperienceHero";
import ArtifactGallery from "@/components/ArtifactGallery";
import TreasureHunt from "@/components/TreasureHunt";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <SmoothScroll>
      <Preloader />
      <ScrollProgress />
      <MotionLayer />
      <Navbar />
      <main>
        <ExperienceHero />
        <ArtifactGallery />
        <TreasureHunt />
        <FinalCTA />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
