import {
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Eye,
  Facebook,
  Grid3X3,
  Instagram,
  Linkedin,
  Lightbulb,
  Medal,
  Plane,
  Rocket,
  ShieldCheck,
  Star,
  Trophy,
  Youtube,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  Users,
  TrendingUp
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { directions, infoCards, startupTypes, steps } from "../data/siteData";

type HomeProps = {
  onRegister: () => void;
};

export function Home({ onRegister }: HomeProps) {
  const [directionSlide, setDirectionSlide] = useState(0);
  const [typeSlide, setTypeSlide] = useState(0);
  const [isDirectionPaused, setIsDirectionPaused] = useState(false);
  const [isTypePaused, setIsTypePaused] = useState(false);
  const directionPages = Math.ceil(directions.length / 4);
  const typePages = Math.ceil(startupTypes.length / 4);

  const showPreviousDirections = useCallback(() => {
    setDirectionSlide((current) => (current === 0 ? directionPages - 1 : current - 1));
  }, [directionPages]);

  const showNextDirections = useCallback(() => {
    setDirectionSlide((current) => (current === directionPages - 1 ? 0 : current + 1));
  }, [directionPages]);

  const showPreviousTypes = useCallback(() => {
    setTypeSlide((current) => (current === 0 ? typePages - 1 : current - 1));
  }, [typePages]);

  const showNextTypes = useCallback(() => {
    setTypeSlide((current) => (current === typePages - 1 ? 0 : current + 1));
  }, [typePages]);

  useEffect(() => {
    if (isDirectionPaused) return undefined;
    const intervalId = window.setInterval(showNextDirections, 3500);
    return () => window.clearInterval(intervalId);
  }, [isDirectionPaused, showNextDirections]);

  useEffect(() => {
    if (isTypePaused) return undefined;
    const intervalId = window.setInterval(showNextTypes, 4200);
    return () => window.clearInterval(intervalId);
  }, [isTypePaused, showNextTypes]);

  return (
    <>
      <main id="top">
        {/* ─── HERO ─── */}
        <section className="hero container">
          <div className="hero-copy">
            <div className="eyebrow">
              <ShieldCheck size={16} />
              Hukumat ko'magidagi hududiy startap tanlovi
            </div>

            <h1>
              G'oyangizni
              <span className="hero-gradient-word">startapga</span>
              aylantiring
            </h1>

            <p className="hero-subtitle">
              Qashqadaryo Startup Ligasi — yoshlar, talabalar, tadbirkorlar va innovatorlar uchun
              Qashqadaryo viloyatining rasmiy startap tanlovi. G'oyangizni taqdim eting, mutaxassislar
              bilan ishlang va mukofotni qo'lga kiriting.
            </p>

            <div className="info-stack" id="about">
              {infoCards.map((card) => (
                <article className="info-card" data-tone={card.tone} key={card.title}>
                  <div className="info-icon"><card.icon size={20} /></div>
                  <div>
                    <h2>{card.title}</h2>
                    <p>{card.description}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="hero-actions">
              <button className="btn btn-primary btn-large" type="button" onClick={onRegister}>
                <Plane size={18} />
                Ariza topshirish
                <ArrowRight size={16} />
              </button>
              <a className="btn btn-outline btn-large" href="#directions">
                <Eye size={18} />
                Yo'nalishlarni ko'rish
              </a>
            </div>

            <div className="stats-row">
              <span><Grid3X3 size={15} />10 yo'nalish</span>
              <span><Star size={15} />100 ballik baholash</span>
              <span><Award size={15} />Sertifikat</span>
              <span><Users size={15} />Ochiq ishtirok</span>
            </div>
          </div>

          <HeroVisual />
        </section>

        {/* ─── JARAYON ─── */}
        <section className="section container">
          <div className="section-head">
            <span><Sparkles size={14} />Jarayon</span>
            <h2>Startap qanday yaratiladi?</h2>
            <p className="section-desc">
              G'oyadan tortib investitsiyagacha — har bir bosqich aniq va izchil tuzilgan.
            </p>
          </div>
          <div className="steps-row">
            {steps.map((step, index) => (
              <article className="step-card" key={step.title}>
                <span className="step-number">{index + 1}</span>
                <div className="step-icon"><step.icon size={22} /></div>
                <h3>{step.title}</h3>
                {step.description && <p className="step-desc">{step.description}</p>}
              </article>
            ))}
          </div>
        </section>

        {/* ─── MUKOFOTLAR ─── */}
        <section className="section prizes-section container" id="prizes">
          <div className="section-head">
            <span><Trophy size={14} />Rag'bat</span>
            <h2>Mukofotlar va imkoniyatlar</h2>
            <p className="section-desc">
              G'oliblar nafaqat pul mukofotiga, balki mentorlik, akseleratsiya va investitsiya
              imkoniyatlariga ham ega bo'ladi.
            </p>
          </div>
          <div className="prize-grid">
            <article className="prize-card first">
              <div className="prize-icon-wrap gold-glow">
                <Trophy size={38} />
              </div>
              <div className="prize-body">
                <p className="prize-place">1-o'rin</p>
                <strong className="prize-amount">50 mln so'm</strong>
                <span className="prize-extra">+ Akseleratsiya dasturi</span>
              </div>
              <ChevronRight size={20} className="prize-arrow" />
            </article>

            <article className="prize-card silver">
              <div className="prize-icon-wrap">
                <Medal size={32} />
              </div>
              <div className="prize-body">
                <p className="prize-place">2-o'rin</p>
                <strong className="prize-amount">30 mln so'm</strong>
                <span className="prize-extra">+ Mentorlik dasturi</span>
              </div>
            </article>

            <article className="prize-card bronze">
              <div className="prize-icon-wrap">
                <Medal size={32} />
              </div>
              <div className="prize-body">
                <p className="prize-place">3-o'rin</p>
                <strong className="prize-amount">20 mln so'm</strong>
                <span className="prize-extra">+ Hamkorlik imkoniyati</span>
              </div>
            </article>

            <article className="prize-card special">
              <div className="prize-icon-wrap">
                <Star size={32} />
              </div>
              <div className="prize-body">
                <p className="prize-place">Maxsus nominatsiyalar</p>
                <strong className="prize-amount">10 mln so'm</strong>
                <span className="prize-extra">+ Sertifikat va tan olinish</span>
              </div>
            </article>
          </div>

          <div className="prize-note-bar">
            <Award size={16} />
            <span>Barcha finalchilar elektron sertifikat va hujjat bilan taqdirlanadi</span>
          </div>
        </section>

        {/* ─── YO'NALISHLAR ─── */}
        <section className="section container" id="directions">
          <CarouselHeading
            eyebrow="Yo'nalishlar"
            title="Qaysi yo'nalishdagi startaplar qatnashadi?"
            subtitle="IT dan agroga, ta'limdan sog'liqgacha — barcha innovatsion sohalarda qatnashish mumkin."
            onPrevious={showPreviousDirections}
            onNext={showNextDirections}
          />
          <div
            className="direction-carousel auto-carousel"
            aria-live="polite"
            aria-roledescription="carousel"
            onBlur={() => setIsDirectionPaused(false)}
            onFocus={() => setIsDirectionPaused(true)}
            onMouseEnter={() => setIsDirectionPaused(true)}
            onMouseLeave={() => setIsDirectionPaused(false)}
          >
            <div className="direction-track" style={{ transform: `translateX(-${directionSlide * 100}%)` }}>
              {Array.from({ length: directionPages }).map((_, pageIndex) => (
                <div className="direction-page" key={pageIndex}>
                  {directions.slice(pageIndex * 4, pageIndex * 4 + 4).map((direction) => (
                    <article className="direction-card" key={direction.title}>
                      <div className="direction-icon" style={{ color: direction.color }}>
                        <direction.icon size={24} />
                      </div>
                      <h3>{direction.title}</h3>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <Dots count={directionPages} active={directionSlide} onSelect={setDirectionSlide} label="Carousel sahifalari" />
        </section>

        {/* ─── STARTAP TURLARI ─── */}
        <section className="section container" id="types">
          <CarouselHeading
            eyebrow="Tasnif"
            title="Startap turlari"
            subtitle="Texnologik, ijtimoiy, agro va boshqa turdagi startaplar — hammasi uchun joy bor."
            onPrevious={showPreviousTypes}
            onNext={showNextTypes}
          />
          <div
            className="type-carousel auto-carousel"
            aria-live="polite"
            aria-roledescription="carousel"
            onBlur={() => setIsTypePaused(false)}
            onFocus={() => setIsTypePaused(true)}
            onMouseEnter={() => setIsTypePaused(true)}
            onMouseLeave={() => setIsTypePaused(false)}
          >
            <div className="type-track" style={{ transform: `translateX(-${typeSlide * 100}%)` }}>
              {Array.from({ length: typePages }).map((_, pageIndex) => (
                <div className="type-page" key={pageIndex}>
                  {startupTypes.slice(pageIndex * 4, pageIndex * 4 + 4).map((item) => (
                    <article className="type-card" key={item.title}>
                      <div className="type-icon"><item.icon size={22} /></div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <Dots count={typePages} active={typeSlide} onSelect={setTypeSlide} label="Startap turlari sahifalari" />
        </section>

        {/* ─── CTA BANNER ─── */}
        <section className="section container">
          <div className="cta-banner">
            <div className="cta-glow" />
            <div className="cta-content">
              <span className="cta-eyebrow"><Clock size={14} />Arizalar 1-iyuldan qabul qilinadi</span>
              <h2>Imkoniyatni boy bermang</h2>
              <p>
                Qashqadaryo Startup Ligasiga ariza topshiring, g'oyangizni ekspertlar oldida taqdim eting
                va hududning eng yaxshi startaplari qatoriga kiring.
              </p>
              <div className="cta-actions">
                <button className="btn btn-primary btn-large" type="button" onClick={onRegister}>
                  <Plane size={18} />
                  Hoziroq ro'yxatdan o'tish
                </button>
                <div className="cta-meta">
                  <MapPin size={14} />
                  <span>Qashqadaryo viloyati, barcha tuman va shaharlar</span>
                </div>
              </div>
            </div>
            <div className="cta-stats">
              <div className="cta-stat">
                <strong>50M+</strong>
                <span>so'm asosiy mukofot</span>
              </div>
              <div className="cta-stat">
                <strong>10</strong>
                <span>yo'nalish</span>
              </div>
              <div className="cta-stat">
                <strong>100</strong>
                <span>ballik baholash</span>
              </div>
              <div className="cta-stat">
                <strong>
                  <TrendingUp size={22} />
                </strong>
                <span>Akseleratsiya imkoniyati</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function HeroVisual() {
  return (
    <div className="hero-visual" aria-label="Innovatsion startap dashboard illustratsiyasi">
      <div className="world-map" />
      <div className="connection-lines" />
      <div className="rocket-shape"><Rocket size={38} /></div>
      <div className="glow-bulb"><Lightbulb size={32} /></div>
      <div className="pie-3d"><span /></div>
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <div className="laptop">
        <div className="laptop-screen">
          <div className="screen-top">
            <p>Innovatsiya</p>
            <strong>Kelajakni yarating</strong>
          </div>
          <div className="dashboard-grid">
            <div className="chart-card wide">
              <div className="line-chart"><i /><b /></div>
            </div>
            <div className="chart-card donut" />
            <div className="chart-card bars"><span /><span /><span /><span /></div>
            <div className="chart-card metrics"><strong>84%</strong><small>O'sish</small></div>
          </div>
        </div>
        <div className="laptop-base" />
      </div>
      <div className="float-card score-card">
        <small>G'oya qiymati</small>
        <strong>92 / 100</strong>
        <span className="progress"><i /></span>
      </div>
      <div className="float-card mini-bars"><span /><span /><span /><span /></div>
      <div className="float-card team-card">
        <small>Jamoa</small>
        <div className="avatars"><i /><i /><i /><b>+12</b></div>
      </div>
      <div className="float-card mvp-card">
        <Check size={16} />
        <div><small>MVP</small><strong>Tayyor</strong></div>
      </div>
      <div className="float-card market-card">
        <small>Bozor sinovi</small>
        <strong>78%</strong>
        <span className="progress violet"><i /></span>
      </div>
    </div>
  );
}

function CarouselHeading({
  eyebrow,
  title,
  subtitle,
  onPrevious,
  onNext
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="carousel-heading">
      <div className="section-head wide-title">
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        {subtitle && <p className="section-desc">{subtitle}</p>}
      </div>
      <div className="carousel-controls">
        <button type="button" onClick={onPrevious} aria-label="Oldingi"><ChevronLeft size={20} /></button>
        <button type="button" onClick={onNext} aria-label="Keyingi"><ChevronRight size={20} /></button>
      </div>
    </div>
  );
}

function Dots({
  count,
  active,
  label,
  onSelect
}: {
  count: number;
  active: number;
  label: string;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="carousel-dots" aria-label={label}>
      {Array.from({ length: count }).map((_, index) => (
        <button
          className={index === active ? "active" : ""}
          key={index}
          type="button"
          onClick={() => onSelect(index)}
          aria-label={`${index + 1}-sahifaga o'tish`}
        />
      ))}
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-inner container">
        <a className="brand footer-brand" href="#top" aria-label="Qashqadaryo Startup Ligasi">
          <span className="brand-mark">Q</span>
          <span>Qashqadaryo<strong>Startup Ligasi</strong></span>
        </a>
        <div className="footer-center">
          <span><CircleDollarSign size={16} />tanlov.qashqadaryo.uz</span>
          <i />
          <p>Innovatsiya, hamkorlik va imkoniyatlar maydoni</p>
        </div>
        <div className="socials" aria-label="Ijtimoiy tarmoqlar">
          <a href="#contact" aria-label="Telegram"><Plane size={16} /></a>
          <a href="#contact" aria-label="Instagram"><Instagram size={16} /></a>
          <a href="#contact" aria-label="LinkedIn"><Linkedin size={16} /></a>
          <a href="#contact" aria-label="YouTube"><Youtube size={16} /></a>
          <a href="#contact" aria-label="Facebook"><Facebook size={16} /></a>
        </div>
      </div>
      <div className="footer-landmarks" aria-hidden="true"><span /><span /><span /><span /><span /></div>
    </footer>
  );
}
