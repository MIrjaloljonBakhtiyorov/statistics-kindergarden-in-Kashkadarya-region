import {
  Award,
  BadgeCheck,
  BarChart3,
  Calendar,
  Check,
  Eye,
  FileText,
  Grid3X3,
  Landmark,
  LockKeyhole,
  LucideIcon,
  LogOut,
  Mail,
  Microscope,
  Settings,
  ShieldCheck,
  Trophy,
  UserRound,
  Users,
  WalletCards
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import {
  adminApplications,
  adminAudit,
  adminJudges,
  adminModules,
  adminStages,
  adminStats,
  adminUsers
} from "../data/adminData";
import { districts } from "../data/siteData";

const ADMIN_LOGIN = "admin";
const ADMIN_PASSWORD = "Admin@2026";

export function Admin() {
  const [activeModule, setActiveModule] = useState("Dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem("admin-auth") === "true");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (login.trim() === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
      localStorage.setItem("admin-auth", "true");
      setIsAuthenticated(true);
      setLoginError("");
      setPassword("");
      return;
    }

    setLoginError("Login yoki parol noto'g'ri kiritildi.");
  };

  const handleLogout = () => {
    localStorage.removeItem("admin-auth");
    setIsAuthenticated(false);
    setLogin("");
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <main className="admin-auth-shell container" id="admin">
        <section className="admin-auth-panel">
          <div className="admin-auth-copy">
            <span className="admin-kicker">Administrator kirishi</span>
            <h1>Admin panelga kirish</h1>
            <p>Tanlov ma'lumotlari, arizalar, hakamlar va natijalarni boshqarish uchun login va parol kiriting.</p>
            <div className="admin-auth-hint">
              <ShieldCheck size={18} />
              <span>Demo login: <strong>admin</strong> / parol: <strong>Admin@2026</strong></span>
            </div>
          </div>

          <form className="admin-auth-form" onSubmit={handleLogin}>
            <div className="form-section-title">
              <LockKeyhole size={20} />
              <div>
                <h3>Shaxsiy kirish</h3>
                <p>Login va maxfiy parol orqali sessiyani boshlang.</p>
              </div>
            </div>
            <label>
              Login
              <input value={login} onChange={(event) => setLogin(event.target.value)} placeholder="admin" autoComplete="username" />
            </label>
            <label>
              Parol
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Admin@2026" autoComplete="current-password" />
            </label>
            {loginError && <p className="admin-auth-error">{loginError}</p>}
            <button className="btn btn-primary" type="submit"><ShieldCheck size={18} />Kirish</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell container" id="admin">
      <aside className="admin-sidebar" aria-label="Administrator modullari">
        <div className="admin-profile">
          <div className="admin-avatar">A</div>
          <div><strong>Bosh administrator</strong><span>Qashqadaryo Startup Ligasi</span></div>
        </div>
        <nav className="admin-menu">
          {adminModules.map((module, index) => (
            <button className={activeModule === module ? "active" : ""} type="button" key={module} onClick={() => setActiveModule(module)}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {module}
            </button>
          ))}
        </nav>
      </aside>

      <section className="admin-workspace">
        <div className="admin-hero">
          <div>
            <span className="admin-kicker">Administrator bosh sahifasi</span>
            <h1>Tanlov jarayonini to'liq boshqarish paneli</h1>
            <p>Foydalanuvchilar, rollar, arizalar, bosqichlar, hakamlar, baholash, natijalar, apellyatsiyalar, sertifikatlar va hisobotlar bitta oynada.</p>
          </div>
          <div className="admin-login-card">
            <ShieldCheck size={24} />
            <strong>Sessiya faol</strong>
            <span>Login: admin</span>
            <button className="btn btn-primary" type="button" onClick={handleLogout}><LogOut size={18} />Chiqish</button>
          </div>
        </div>

        <AdminModuleContent activeModule={activeModule} />
      </section>
    </main>
  );
}

function AdminModuleContent({ activeModule }: { activeModule: string }) {
  if (activeModule === "Dashboard") {
    return (
      <>
        <AdminToolbar />
        <section className="admin-stat-grid">
          {adminStats.map((stat) => (
            <article className="admin-stat-card" data-tone={stat.tone} key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <em>{stat.trend}</em>
            </article>
          ))}
        </section>
        <section className="admin-grid two-columns">
          <AdminChartCard />
          <JudgeProgressCard />
        </section>
      </>
    );
  }

  if (activeModule === "Foydalanuvchilar") {
    return <><AdminToolbar /><UsersModule /></>;
  }

  if (activeModule === "Rollar") {
    return (
      <section className="admin-grid three-columns">
        <AdminFeatureCard
          icon={ShieldCheck}
          title="Rollar va vakolatlar"
          items={["Ishtirokchi, jamoa rahbari, hakam, ekspert, admin", "Bir foydalanuvchiga bir nechta rol", "Ko'rish, qo'shish, tahrirlash, tasdiqlash", "Rol berish va olib tashlash auditga yoziladi"]}
        />
        <AdminPermissionMatrix />
      </section>
    );
  }

  if (activeModule === "Mas'ullar") {
    return (
      <section className="admin-grid two-columns">
        <AdminFeatureCard
          icon={UserRound}
          title="Mas'ul xodim qo'shish"
          items={["F.I.Sh., tashkilot, lavozim, telefon, email", "Hudud yoki OTMga biriktirish", "Vakolat muddati va vaqtinchalik parol", "Faollashtirish, to'xtatish yoki bekor qilish"]}
        />
        <AdminFormPreview title="Mas'ul xodim kartasi" fields={["F.I.Sh.", "Tashkilot", "Lavozim", "Telefon", "Email", "Biriktiriladigan hudud/OTM", "Platformadagi roli", "Vakolat muddati"]} />
      </section>
    );
  }

  if (activeModule === "Hakamlar") {
    return (
      <section className="admin-grid two-columns">
        <JudgeProgressCard />
        <AdminFeatureCard
          icon={BadgeCheck}
          title="Hakamlarni boshqarish"
          items={["Yo'nalish va mutaxassislik bo'yicha biriktirish", "Bir loyihani bir nechta hakamga berish", "Baholash muddatlari va eslatmalar", "Administrator hakam o'rniga ball qo'ymaydi"]}
        />
      </section>
    );
  }

  if (activeModule === "Arizalar") {
    return <><AdminToolbar /><ApplicationsModule /></>;
  }

  if (activeModule === "Bosqichlar") return <StagesModule />;
  if (activeModule === "Baholash") {
    return (
      <section className="admin-grid two-columns">
        <JudgeProgressCard />
        <AdminFeatureCard
          icon={Microscope}
          title="Baholash nazorati"
          items={["Hakamga nechta loyiha biriktirilgani", "Baholanmagan loyihalar", "20+ ball tafovutli baholar", "Manfaatlar to'qnashuvi va izoh talab qilinishi"]}
        />
      </section>
    );
  }
  if (activeModule === "Reyting" || activeModule === "Natijalar") return <RankingModule title={activeModule} />;
  if (activeModule === "Audit jurnali") return <AuditModule />;

  const simpleModules: Record<string, { icon: LucideIcon; title: string; items: string[]; fields: string[] }> = {
    "Tanlovlar": {
      icon: Trophy,
      title: "Tanlovlarni yaratish va e'lon qilish",
      items: ["Yangi tanlov yaratish", "Maqsad, tavsif, yo'nalish, talablar", "Muddatlar, final va taqdirlash sanasi", "Holat: qabul ochiq, yopilgan, final, yakunlangan"],
      fields: ["Tanlov nomi", "To'liq tavsif", "Yosh chegarasi", "Jamoa soni", "Ariza muddati", "Mukofotlar", "Nizom"]
    },
    "Yo'nalishlar": {
      icon: Grid3X3,
      title: "Tanlov yo'nalishlarini boshqarish",
      items: ["Yo'nalish nomi va tavsifi", "Tartib raqami", "Faol yoki nofaol holat", "Arizalar statistikasini yo'nalish kesimida ko'rish"],
      fields: ["Yo'nalish nomi", "Tavsif", "Tartib raqami", "Holat"]
    },
    "OTM va hududlar": {
      icon: Landmark,
      title: "OTM, tuman va shaharlarni boshqarish",
      items: ["OTM nomi, qisqartma, manzil, telefon, logo", "Tuman/shahar saralashini faollashtirish", "Viloyat bosqichi kvotalari", "Tashkiliy qo'mita belgilagan limitlar"],
      fields: ["OTM nomi", "Qisqartma", "Manzil", "Telefon", "Logo", "Kvota", "Holat"]
    },
    "Ariza shakli": {
      icon: FileText,
      title: "Elektron ariza shaklini sozlash",
      items: ["Matn, son, sana, ro'yxat", "Fayl yuklash, video havola, demo havola", "Tasdiqlash belgisi", "Maksimal belgilar soni"],
      fields: ["Maydon nomi", "Maydon turi", "Majburiylik", "Limit", "Ko'rsatma matni"]
    },
    "Apellyatsiyalar": {
      icon: Mail,
      title: "Apellyatsiyalarni boshqarish",
      items: ["Qabul qilingan va ko'rib chiqilmoqda", "Qo'shimcha ma'lumot talab qilish", "Komissiyaga biriktirish", "Qarorni foydalanuvchiga yuborish"],
      fields: ["Ariza raqami", "Murojaat matni", "Biriktirilgan hujjat", "Mas'ul komissiya", "Muddat", "Holat"]
    },
    "Sertifikatlar": {
      icon: Award,
      title: "Sertifikatlarni boshqarish",
      items: ["Shablon yuklash yoki sozlash", "Finalchilar uchun avtomatik shakllantirish", "Xato sertifikatni bekor qilish", "Berilgan sertifikatlar reyestri"],
      fields: ["F.I.Sh./jamoa", "Loyiha", "Bosqich", "Natija", "Sertifikat raqami", "Sana", "Imzo"]
    },
    "Mukofot va bank": {
      icon: WalletCards,
      title: "Mukofot va bank ma'lumotlari",
      items: ["Bank rekvizitlarini kiritishni faollashtirish", "To'lov reyestri", "Moliya bo'limiga eksport", "Vakolatli foydalanuvchilar ko'rishi"],
      fields: ["G'olib", "Bank", "Hisob raqam", "MFO", "STIR/JShShIR", "To'lov holati"]
    },
    "Monitoring": {
      icon: Eye,
      title: "Yo'l xaritasi va monitoring",
      items: ["G'oliblar uchun 6 oylik yo'l xaritasi", "Topshirish muddati", "Har oy/har chorak monitoring", "Monitoring hisobotlari"],
      fields: ["Loyiha", "Yo'l xaritasi", "Muddat", "Davriylik", "Mas'ul", "Holat"]
    },
    "Kontent": {
      icon: FileText,
      title: "Yangiliklar va axborot materiallari",
      items: ["Tanlov e'lonlari", "Muddatlar, yo'nalishlar, mezonlar", "Saralash tadbirlari", "Final natijalari va startap dasturlari"],
      fields: ["Sarlavha", "Kategoriya", "Matn", "Rasm", "E'lon sanasi", "Holat"]
    },
    "Hisobotlar": {
      icon: BarChart3,
      title: "Hisobotlarni shakllantirish",
      items: ["Foydalanuvchilar va arizalar", "OTM, tuman, shahar kesimlari", "Hakamlar va baholash natijalari", "Finalchilar, g'oliblar, sertifikatlar, monitoring"],
      fields: ["Hisobot turi", "Davr", "Kesim", "Format", "Eksport"]
    }
  };

  const module = simpleModules[activeModule];

  if (!module) return <AdminMiniModule title={activeModule} text="Bu modul uchun boshqaruv oynasi tayyorlanmoqda." />;

  return (
    <section className="admin-grid two-columns">
      <AdminFeatureCard icon={module.icon} title={module.title} items={module.items} />
      <AdminFormPreview title={`${activeModule} formasi`} fields={module.fields} />
    </section>
  );
}

function AdminToolbar() {
  return (
    <div className="admin-toolbar">
      <label>Qidiruv<input placeholder="F.I.Sh., telefon, JShShIR, ariza raqami..." /></label>
      <label>Kesim<select defaultValue="all"><option value="all">Barcha kesimlar</option><option>OTMlar kesimida</option><option>Tumanlar kesimida</option><option>Shaharlar kesimida</option><option>Loyiha yo'nalishlari kesimida</option></select></label>
      <label>Sana<input type="date" /></label>
      <button className="btn btn-outline" type="button"><FileText size={18} />Eksport</button>
    </div>
  );
}

function AdminChartCard() {
  return (
    <article className="admin-card">
      <div className="admin-card-head"><div><span>Diagramma</span><h2>Arizalar hudud va yo'nalishlar kesimida</h2></div><BarChart3 size={22} /></div>
      <div className="admin-chart">
        {["Qarshi", "Shahrisabz", "Kasbi", "Kitob", "G'uzor", "Yakkabog'"].map((region, index) => (
          <div className="admin-bar-row" key={region}><span>{region}</span><i style={{ width: `${88 - index * 9}%` }} /><strong>{148 - index * 17}</strong></div>
        ))}
      </div>
    </article>
  );
}

function JudgeProgressCard() {
  return (
    <article className="admin-card">
      <div className="admin-card-head"><div><span>Nazorat</span><h2>Baholash jarayoni holati</h2></div><Microscope size={22} /></div>
      <div className="judge-progress-list">
        {adminJudges.map((judge) => (
          <div className="judge-progress" key={judge.name}><div><strong>{judge.name}</strong><span>{judge.field} · {judge.status}</span></div><b>{judge.done}/{judge.assigned}</b></div>
        ))}
      </div>
    </article>
  );
}

function UsersModule() {
  return (
    <section className="admin-card">
      <div className="admin-card-head"><div><span>Foydalanuvchilarni boshqarish</span><h2>Qidirish, saralash, bloklash, rol va parol yordami</h2></div><Users size={22} /></div>
      <div className="admin-filter-row">
        <select defaultValue=""><option value="" disabled>Rol bo'yicha</option><option>Ishtirokchi</option><option>Hakam</option><option>Administrator</option></select>
        <select defaultValue=""><option value="" disabled>Akkaunt holati</option><option>Faol</option><option>To'liq bloklangan</option><option>Tasdiqlanmagan</option></select>
        <select defaultValue=""><option value="" disabled>Hudud yoki OTM</option>{districts.map((district) => <option key={district}>{district}</option>)}</select>
      </div>
      <AdminTable
        columns={["F.I.Sh.", "Telefon", "Rol", "Mansublik", "Holat", "Amal"]}
        rows={adminUsers.map((user) => [user.name, user.phone, user.role, user.source, <b className="status-pill">{user.status}</b>, <span className="admin-actions"><button type="button">Ko'rish</button><button type="button">Bloklash</button></span>])}
      />
    </section>
  );
}

function ApplicationsModule() {
  return (
    <section className="admin-card">
      <div className="admin-card-head"><div><span>Arizalarni boshqarish</span><h2>Texnik tekshiruv, qaytarish, rad etish va audit</h2></div><FileText size={22} /></div>
      <div className="technical-checks">
        {["Majburiy maydonlar to'ldirilgan", "Fayllar ochiladi", "Havolalar ishlaydi", "Jamoa tarkibi talabga mos", "Yosh talabi bajarilgan", "OTM yoki hudud to'g'ri", "Takroriy ariza aniqlanmagan"].map((check) => <span key={check}><Check size={16} />{check}</span>)}
      </div>
      <div className="admin-table application-table">
        <div className="admin-table-row head"><span>Ariza raqami</span><span>Loyiha</span><span>Ishtirokchi</span><span>Yo'nalish</span><span>Hudud</span><span>Holat</span><span>Ball</span></div>
        {adminApplications.map((item) => (
          <div className="admin-table-row" key={item.number}><span>{item.number}</span><span>{item.project}</span><span>{item.participant}</span><span>{item.direction}</span><span>{item.region}</span><span><b className="status-pill">{item.status}</b></span><span>{item.score}</span></div>
        ))}
      </div>
    </section>
  );
}

function StagesModule() {
  return (
    <section className="admin-card">
      <div className="admin-card-head"><div><span>Tanlov bosqichlari</span><h2>Ochish, yopish, uzaytirish va mas'ullar</h2></div><Calendar size={22} /></div>
      <div className="stage-list">
        {adminStages.map((stage) => <div className="stage-item" key={stage.title}><strong>{stage.title}</strong><span>{stage.date} · {stage.owner}</span><b>{stage.status}</b></div>)}
      </div>
    </section>
  );
}

function RankingModule({ title }: { title: string }) {
  return (
    <section className="admin-card">
      <div className="admin-card-head"><div><span>{title}</span><h2>O'rtacha ball, kvota, finalchilar va g'oliblar</h2></div><Trophy size={22} /></div>
      <div className="ranking-list">
        {["1-o'rin: Edu Mentor AI", "2-o'rin: Aqlli sug'orish sensori", "3-o'rin: Mahalla xizmatlari bot", "Zaxira: Green Logistics"].map((rank) => <span key={rank}>{rank}</span>)}
      </div>
      <div className="admin-note">Hakamlar ballari administrator tomonidan o'zgartirilmaydi.</div>
    </section>
  );
}

function AuditModule() {
  return (
    <section className="admin-card">
      <div className="admin-card-head"><div><span>Audit jurnali</span><h2>Platformadagi muhim administrator amallari</h2></div><Eye size={22} /></div>
      <div className="audit-list">
        {adminAudit.map((event, index) => <div className="audit-item" key={event}><span>{index + 1}</span><p>{event}</p><time>Bugun 14:{20 + index * 4}</time></div>)}
      </div>
    </section>
  );
}

function AdminPermissionMatrix() {
  return (
    <article className="admin-card compact-card">
      <div className="feature-icon"><Settings size={22} /></div>
      <h2>Vakolatlar matritsasi</h2>
      <div className="permission-grid">{["Ko'rish", "Qo'shish", "Tahrirlash", "Tasdiqlash", "Eksport"].map((permission) => <span key={permission}><Check size={15} />{permission}</span>)}</div>
    </article>
  );
}

function AdminFormPreview({ title, fields }: { title: string; fields: string[] }) {
  return (
    <article className="admin-card">
      <div className="admin-card-head"><div><span>Maydonlar</span><h2>{title}</h2></div><FileText size={22} /></div>
      <div className="admin-form-preview">{fields.map((field) => <label key={field}>{field}<input placeholder={field} /></label>)}</div>
      <div className="form-actions"><button className="btn btn-outline" type="button">Bekor qilish</button><button className="btn btn-primary" type="button">Saqlash</button></div>
    </article>
  );
}

function AdminFeatureCard({ icon: Icon, title, items }: { icon: LucideIcon; title: string; items: string[] }) {
  return (
    <article className="admin-card compact-card">
      <div className="feature-icon"><Icon size={22} /></div>
      <h2>{title}</h2>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </article>
  );
}

function AdminMiniModule({ title, text }: { title: string; text: string }) {
  return <article className="admin-mini-module"><strong>{title}</strong><p>{text}</p></article>;
}

function AdminTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className="admin-table">
      <div className="admin-table-row head">{columns.map((column) => <span key={column}>{column}</span>)}</div>
      {rows.map((row, rowIndex) => (
        <div className="admin-table-row" key={rowIndex}>{row.map((cell, cellIndex) => <span key={cellIndex}>{cell}</span>)}</div>
      ))}
    </div>
  );
}
