import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe2, 
  CalendarDays, 
  ArrowRight,
  Instagram, 
  Linkedin, 
  Youtube, 
  Facebook, 
  Twitter,
  Send
} from "lucide-react";
import { Button, Card } from "../ui/exports";

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer className="relative pt-20 pb-8 bg-gradient-to-t from-slate-950 to-transparent border-t border-white/10">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-blue-900/10 via-transparent to-transparent" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 relative z-10">
        <div className="grid lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-lg blur opacity-75"></div>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-2xl font-bold text-white">
                  Q
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white leading-none">
                  Qashqadaryo<span className="text-blue-400">Startup</span>
                </div>
                <div className="text-sm font-medium text-slate-400">Ligasi</div>
              </div>
            </div>
            
            <p className="text-slate-400 leading-relaxed mb-8 max-w-md">
              Innovatsiya, hamkorlik va imkoniyatlar maydoni. Qashqadaryo viloyatining rasmiy hududiy startap tanlovi.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-3">
              {[
                { icon: Instagram, color: "bg-pink-500/10 text-pink-400" },
                { icon: Linkedin, color: "bg-blue-500/10 text-blue-400" },
                { icon: Youtube, color: "bg-red-500/10 text-red-400" },
                { icon: Facebook, color: "bg-blue-600/10 text-blue-400" },
                { icon: Twitter, color: "bg-sky-500/10 text-sky-400" },
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href="#" 
                  className={`p-3 rounded-xl ${social.color} hover:opacity-80 transition-opacity`}
                  aria-label={social.icon.name}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Tezkor havolalar</h3>
            <ul className="space-y-3">
              {[
                "Bosh sahifa",
                "Tanlov haqida", 
                "Yo'nalishlar",
                "Mukofotlar",
                "Yangiliklar",
                "FAQ"
              ].map((item, idx) => (
                <li key={idx}>
                  <a 
                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-slate-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Organizers */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Tashkilotchilar</h3>
            <ul className="space-y-3">
              {[
                "Qashqadaryo viloyati hokimligi",
                "Oliy ta'lim, fan va innovatsiyalar boshqarmasi",
                "IT Park Uzbekistan",
                "Qarshi davlat universiteti",
                "Qarshi muhandislik-iqtisodiyot instituti"
              ].map((org, idx) => (
                <li key={idx}>
                  <span className="text-slate-400 text-sm">{org}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Bog'lanish</h3>
            <ul className="space-y-4">
              {[
                { icon: MapPin, text: "Qashqadaryo viloyati, Qarshi shahri" },
                { icon: Phone, text: "+998 78 000 00 00" },
                { icon: Mail, text: "info@tanlov.qashqadaryo.uz" },
                { icon: Globe2, text: "tanlov.qashqadaryo.uz" },
                { icon: CalendarDays, text: "Dushanba-Juma, 09:00-18:00" },
              ].map((contact, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <contact.icon size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-400">{contact.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-white/10">
          <div className="grid lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold text-white mb-2">Yangiliklardan xabardor bo'ling</h3>
              <p className="text-slate-400">
                Tanlov yangiliklari, yangi mavsum e'lonlari va startap dasturlari haqida birinchi bo'lib bilib oling.
              </p>
            </div>
            
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="E-pochta manzilingiz"
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              />
              <Button className="whitespace-nowrap">
                <Send size={18} />
                Obuna bo'lish
              </Button>
            </div>
          </div>
        </Card>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-500">
              © 2026 Qashqadaryo Startup Ligasi. Barcha huquqlar himoyalangan.
            </div>
            
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                Maxfiylik siyosati
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                Foydalanish shartlari
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                Jamoa
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Accent */}
      <div className="mt-12 relative">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      </div>
    </footer>
  );
}
