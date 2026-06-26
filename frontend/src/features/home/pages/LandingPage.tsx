import { useState } from "react";
import { LoginModal } from "../../auth/components/LoginModal";
import { RegisterModal } from "../../auth/components/RegisterModal";
import { AboutSection } from "../components/AboutSection";
import { AttentionSection } from "../components/AttentionSection";
import { CategoriesSection } from "../components/CategoriesSection";
import { CTASection } from "../components/CTASection";
import { DatesSection } from "../components/DatesSection";
import { Footer } from "../components/Footer";
import { HeroSection } from "../components/HeroSection";
import { Navbar } from "../components/Navbar";
import { PrizesSection } from "../components/PrizesSection";
import { StartupStepsSection } from "../components/StartupStepsSection";

export function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);
  const openRegister = () => setIsRegisterOpen(true);
  const closeRegister = () => setIsRegisterOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a1128] to-[#050a1a] dark:from-slate-950 dark:via-[#0a1128] dark:to-[#050a1a] bg-white dark:bg-slate-950 text-gray-900 dark:text-white">
      <Navbar onLoginClick={openLogin} onRegisterClick={openRegister} />

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

      {isLoginOpen && (
        <LoginModal
          onClose={closeLogin}
          onRegisterClick={() => {
            closeLogin();
            openRegister();
          }}
        />
      )}
      {isRegisterOpen && <RegisterModal onClose={closeRegister} />}
    </div>
  );
}
