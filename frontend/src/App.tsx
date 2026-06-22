import { Navbar } from "./components/layout/Navbar";
import { HeroSection } from "./components/layout/HeroSection";
import { CategoriesSection } from "./components/layout/CategoriesSection";
import { AboutSection } from "./components/layout/AboutSection";
import { PrizesSection } from "./components/layout/PrizesSection";
import { StartupStepsSection } from "./components/layout/StartupStepsSection";
import { AttentionSection } from "./components/layout/AttentionSection";
import { DatesSection } from "./components/layout/DatesSection";
import { CTASection } from "./components/layout/CTASection";
import { Footer } from "./components/layout/Footer";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a1128] to-[#050a1a] text-white">
      <Navbar />
      
      <main>
        <HeroSection />
        <CategoriesSection />
        <AboutSection />
        <PrizesSection />
        <StartupStepsSection />
        <AttentionSection />
        <DatesSection />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
