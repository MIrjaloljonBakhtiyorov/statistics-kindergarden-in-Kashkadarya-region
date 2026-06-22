import { Menu, Plane, User, X } from "lucide-react";
import { useEffect, useState } from "react";

type HeaderProps = {
  currentRoute: "home" | "admin" | "login" | "register";
};

const navItems = [
  { href: "/#top", label: "Bosh sahifa" },
  { href: "/#about", label: "Tanlov haqida" },
  { href: "/#directions", label: "Yo'nalishlar" },
  { href: "/#prizes", label: "Mukofotlar" },
  { href: "/#news", label: "Yangiliklar" },
  { href: "/#contact", label: "Bog'lanish" }
];

export function Header({ currentRoute }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.body.classList.add("menu-open");
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="navbar">
      <a className="brand" href="/#top" aria-label="Qashqadaryo Startup Ligasi">
        <span className="brand-mark">Q</span>
        <span>
          Qashqadaryo
          <strong>Startup Ligasi</strong>
        </span>
      </a>

      <nav className="nav-links" aria-label="Asosiy menyu">
        {navItems.map((item, index) => (
          <a
            className={currentRoute === "home" && index === 0 ? "active" : ""}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </a>
        ))}
        <a className={currentRoute === "admin" ? "active" : ""} href="/admin">Admin panel</a>
      </nav>

      <div className="nav-actions">
        <a className="btn btn-outline" href="/login">
          <User size={18} />
          Kirish
        </a>
        <a className="btn btn-primary" href="/register">
          <Plane size={18} />
          Ro'yxatdan o'tish
        </a>
        <button
          className="mobile-menu-button"
          type="button"
          aria-expanded={isMenuOpen}
          aria-label="Menyuni ochish"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu size={22} />
        </button>
      </div>

      <div className={`mobile-drawer ${isMenuOpen ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Mobil menyu">
        <div className="mobile-drawer-head">
          <span>Qashqadaryo Startup Ligasi</span>
          <button type="button" aria-label="Menyuni yopish" onClick={closeMenu}><X size={22} /></button>
        </div>
        <nav aria-label="Mobil asosiy menyu">
          {navItems.map((item) => (
            <a href={item.href} key={item.href} onClick={closeMenu}>{item.label}</a>
          ))}
          <a href="/admin" onClick={closeMenu}>Admin panel</a>
        </nav>
        <div className="mobile-drawer-actions">
          <a className="btn btn-outline" href="/login"><User size={18} />Kirish</a>
          <a className="btn btn-primary" href="/register"><Plane size={18} />Ro'yxatdan o'tish</a>
        </div>
      </div>
      {isMenuOpen && <button className="mobile-backdrop" aria-label="Menyuni yopish" type="button" onClick={closeMenu} />}
    </header>
  );
}
