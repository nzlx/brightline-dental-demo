import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileActionBar from "@/components/MobileActionBar";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Special from "@/components/sections/Special";
import Team from "@/components/sections/Team";
import Booking from "@/components/sections/Booking";
import Insurance from "@/components/sections/Insurance";
import Reviews from "@/components/sections/Reviews";
import BeforeAfter from "@/components/sections/BeforeAfter";
import Faq from "@/components/sections/Faq";
import Visit from "@/components/sections/Visit";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Services />
        <Special />
        <Team />
        <Booking />
        <Insurance />
        <Reviews />
        <BeforeAfter />
        <Faq />
        <Visit />
      </main>
      <Footer />
      <MobileActionBar />
    </>
  );
}
