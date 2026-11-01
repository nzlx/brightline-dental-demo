import Header from "@/components/Header";
import MobileActionBar from "@/components/MobileActionBar";
import Hero from "@/components/sections/Hero";
import Booking from "@/components/sections/Booking";
import { site } from "@/content";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Booking />
      </main>
      {/* Stage 2 placeholder footer: the full footer comes with the remaining sections. */}
      <footer id="site-footer" className="border-t border-line px-4 py-10 text-center text-sm text-muted">
        <a href={site.credit.href} className="link">
          {site.credit.label}
        </a>
      </footer>
      <MobileActionBar />
    </>
  );
}
