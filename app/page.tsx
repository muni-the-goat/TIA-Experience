import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import MotionLayer from "@/components/MotionLayer";
import Cursor from "@/components/Cursor";
import ScrollProgress from "@/components/ScrollProgress";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import Marquee from "@/components/Marquee";
import ArtifactGallery from "@/components/ArtifactGallery";
import TreasureHunt from "@/components/TreasureHunt";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <SmoothScroll>
      <Preloader />
      <Cursor />
      <ScrollProgress />
      <MotionLayer />
      <Navbar />
      <main>
        <Hero />
        <Intro />
        <Marquee text="Treasures of Cambodia · Experience the Event" />
        <ArtifactGallery />
        <Marquee text="Five Treasures Await · Begin the Hunt" variant="outline" />
        <TreasureHunt />
        <FinalCTA />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
