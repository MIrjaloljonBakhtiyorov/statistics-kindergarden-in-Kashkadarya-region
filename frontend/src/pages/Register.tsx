import {
  BadgeCheck,
  FileText,
  MapPinned,
  Phone,
  ShieldCheck,
  UserRound,
  Users
} from "lucide-react";
import { useState } from "react";
import { districts, employmentOptions, universities } from "../data/siteData";
import type { ParticipationType, TeamFormat } from "../types";
import { getAge } from "../utils/date";

export function Register() {
  const [birthDate, setBirthDate] = useState("");
  const [participationType, setParticipationType] = useState<ParticipationType>("university");
  const [teamFormat, setTeamFormat] = useState<TeamFormat>("solo");

  return (
    <main className="auth-page">
      <section className="auth-page-shell register-shell">
        <aside className="auth-page-aside">
          <a className="brand auth-brand" href="/" aria-label="Qashqadaryo Startup Ligasi">
            <span className="brand-mark">Q</span>
            <span>Qashqadaryo<strong>Startup Ligasi</strong></span>
          </a>
          <div>
            <span className="auth-kicker">Ro'yxatdan o'tish</span>
            <h1>Ariza kabinetini yarating</h1>
            <p>Telefonni SMS-kod bilan tasdiqlang, profilni to'ldiring va ishtirok turini belgilang.</p>
          </div>
          <div className="auth-progress">
            <span className="active"><Phone size={17} />Telefon</span>
            <span className="active"><UserRound size={17} />Profil</span>
            <span><ShieldCheck size={17} />Tasdiq</span>
          </div>
        </aside>

        <section className="auth-page-content" aria-labelledby="register-title">
          <div className="auth-page-title">
            <BadgeCheck size={24} />
            <div>
              <h2 id="register-title">Foydalanuvchi ma'lumotlari</h2>
              <p>OneID keyinchalik ulanadi; hozir telefon raqami orqali ro'yxatdan o'tish tayyor.</p>
            </div>
          </div>

          <form className="auth-form">
            <div className="form-section">
              <div className="form-section-title"><Phone size={20} /><div><h3>Telefon orqali ro'yxatdan o'tish</h3><p>SMS-kodni kiriting, keyin login va parol yarating.</p></div></div>
              <div className="method-grid">
                <button className="method-card active" type="button"><Phone size={24} /><strong>Telefon raqami</strong><span>SMS-kod orqali tasdiqlash</span></button>
                <button className="method-card" type="button" disabled><BadgeCheck size={24} /><strong>OneID</strong><span>Keyingi bosqichda ulanadi</span></button>
              </div>
              <div className="field-grid two">
                <label>Telefon raqami<input type="tel" placeholder="+998 90 123 45 67" /></label>
                <label>SMS-kod<input inputMode="numeric" maxLength={6} placeholder="123456" /></label>
                <label>Login<input placeholder="foydalanuvchi_login" /></label>
                <label>Parol<input type="password" placeholder="Kamida 8 ta belgi" /></label>
              </div>
              <label className="check-field"><input type="checkbox" /><span>Platformadan foydalanish shartlariga roziman.</span></label>
            </div>

            <div className="form-section">
              <div className="form-section-title"><UserRound size={20} /><div><h3>Shaxsiy profil</h3><p>Shaxsiy ma'lumotlarni kiriting yoki OneID ulanganda avtomatik tekshiring.</p></div></div>
              <div className="field-grid three">
                <label>Familiyasi<input placeholder="Familiya" /></label>
                <label>Ismi<input placeholder="Ism" /></label>
                <label>Otasining ismi<input placeholder="Otasining ismi" /></label>
                <label>Tug'ilgan sanasi<input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} /></label>
                <label>Yoshi<input value={getAge(birthDate)} readOnly placeholder="Avtomatik" /></label>
                <label>Jinsi<select defaultValue=""><option value="" disabled>Tanlang</option><option>Erkak</option><option>Ayol</option></select></label>
                <label>JShShIR<input inputMode="numeric" placeholder="14 xonali raqam" /></label>
                <label>Pasport yoki ID-karta<input placeholder="AA1234567" /></label>
                <label>Telefon raqami<input type="tel" placeholder="+998 90 123 45 67" /></label>
                <label>Elektron pochta<input type="email" placeholder="email@example.com" /></label>
                <label>Telegram username<input placeholder="@username" /></label>
                <label>Profil rasmi<input type="file" accept="image/*" /></label>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title"><MapPinned size={20} /><div><h3>Yashash hududi va bandlik</h3><p>Yashash manzili va hozirgi bandlik holatini belgilang.</p></div></div>
              <div className="field-grid four">
                <label>Tuman yoki shahar<select defaultValue=""><option value="" disabled>Tanlang</option>{districts.map((district) => <option key={district}>{district}</option>)}</select></label>
                <label>Mahalla<input placeholder="Mahalla nomi" /></label>
                <label>Ko'cha<input placeholder="Ko'cha nomi" /></label>
                <label>Bandlik holati<select defaultValue=""><option value="" disabled>Tanlang</option>{employmentOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title"><Users size={20} /><div><h3>Ishtirok turi</h3><p>Maqom, qatnashadigan hudud va jamoa shaklini tanlang.</p></div></div>
              <div className="segmented-control" aria-label="Ishtirok turini tanlash">
                <button className={participationType === "university" ? "active" : ""} type="button" onClick={() => setParticipationType("university")}>OTMga mansub</button>
                <button className={participationType === "independent" ? "active" : ""} type="button" onClick={() => setParticipationType("independent")}>Mustaqil</button>
                <button className={participationType === "team" ? "active" : ""} type="button" onClick={() => setParticipationType("team")}>Jamoa a'zosi</button>
              </div>
              {participationType === "university" ? (
                <div className="field-grid two">
                  <label>OTM<select defaultValue=""><option value="" disabled>OTMni tanlang</option>{universities.map((university) => <option key={university}>{university}</option>)}</select></label>
                  <label>Fakultet<input placeholder="Fakultet" /></label>
                  <label>Ta'lim yo'nalishi<input placeholder="Yo'nalish" /></label>
                  <label>Bosqich yoki kurs<select defaultValue=""><option value="" disabled>Tanlang</option><option>1-kurs</option><option>2-kurs</option><option>3-kurs</option><option>4-kurs</option><option>Magistratura</option></select></label>
                  <label className="wide-field">Talabalik guvohnomasi yoki tasdiqlovchi hujjat<input type="file" /></label>
                </div>
              ) : (
                <div className="field-grid two">
                  <label>Qatnashadigan tuman yoki shahar<select defaultValue=""><option value="" disabled>Tanlang</option>{districts.map((district) => <option key={district}>{district}</option>)}</select></label>
                  <label>{participationType === "team" ? "Jamoa nomi" : "Faoliyat yo'nalishi"}<input placeholder={participationType === "team" ? "Jamoa nomi" : "Masalan: IT, agro, servis"} /></label>
                </div>
              )}
              <div className="segmented-control compact" aria-label="Qatnashish shakli">
                <button className={teamFormat === "solo" ? "active" : ""} type="button" onClick={() => setTeamFormat("solo")}>Yakka tartibda</button>
                <button className={teamFormat === "group" ? "active" : ""} type="button" onClick={() => setTeamFormat("group")}>Jamoa shaklida</button>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" type="button"><FileText size={18} />Arizani saqlash</button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}
