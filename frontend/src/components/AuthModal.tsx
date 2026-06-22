import {
  BadgeCheck,
  ChevronLeft,
  FileText,
  LockKeyhole,
  MapPinned,
  Phone,
  UserRound,
  Users,
  X
} from "lucide-react";
import { useState } from "react";
import { districts, employmentOptions, universities } from "../data/siteData";
import type { AuthMode, ParticipationType, RegisterStep, TeamFormat } from "../types";
import { getAge } from "../utils/date";

type AuthModalProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
};

export function AuthModal({ mode, onModeChange, onClose }: AuthModalProps) {
  const [registerStep, setRegisterStep] = useState<RegisterStep>("phone");
  const [birthDate, setBirthDate] = useState("");
  const [participationType, setParticipationType] = useState<ParticipationType>("university");
  const [teamFormat, setTeamFormat] = useState<TeamFormat>("solo");

  if (!mode) {
    return null;
  }

  const openRegister = () => {
    onModeChange("register");
    setRegisterStep("phone");
  };

  return (
    <div className="auth-overlay" role="dialog" aria-modal="true" aria-label="Autentifikatsiya oynasi">
      <div className="auth-panel">
        <div className="auth-aside">
          <div className="brand auth-brand">
            <span className="brand-mark">Q</span>
            <span>Qashqadaryo<strong>Startup Ligasi</strong></span>
          </div>
          <h2>{mode === "login" ? "Platformaga kirish" : "Ro'yxatdan o'tish"}</h2>
          <p>Telefon raqamini tasdiqlang, profil ma'lumotlarini to'ldiring va tanlovdagi ishtirok turini belgilang.</p>
          <div className="auth-progress">
            <span className={mode === "login" || registerStep === "phone" ? "active" : ""}><Phone size={17} />Telefon</span>
            <span className={mode === "register" && registerStep === "profile" ? "active" : ""}><UserRound size={17} />Profil</span>
            <span><BadgeCheck size={17} />Tasdiq</span>
          </div>
        </div>

        <div className="auth-content">
          <button className="auth-close" type="button" onClick={onClose} aria-label="Yopish"><X size={22} /></button>
          <div className="auth-tabs">
            <button className={mode === "login" ? "active" : ""} type="button" onClick={() => onModeChange("login")}>Kirish</button>
            <button className={mode === "register" ? "active" : ""} type="button" onClick={openRegister}>Ro'yxatdan o'tish</button>
          </div>

          {mode === "login" ? (
            <form className="auth-form">
              <div className="form-section">
                <div className="form-section-title"><LockKeyhole size={20} /><div><h3>Kirish ma'lumotlari</h3><p>Telefon raqam yoki OneID orqali tizimga kiring.</p></div></div>
                <div className="field-grid two">
                  <label>Telefon raqami<input type="tel" placeholder="+998 90 123 45 67" /></label>
                  <label>Parol<input type="password" placeholder="Maxfiy parol" /></label>
                </div>
                <div className="auth-choice">
                  <button className="btn btn-primary" type="button"><LockKeyhole size={18} />Kirish</button>
                  <button className="btn btn-outline" type="button" disabled><BadgeCheck size={18} />OneID orqali kirish</button>
                </div>
              </div>
            </form>
          ) : (
            <form className="auth-form">
              {registerStep === "phone" ? (
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
                  <div className="auth-choice"><button className="btn btn-primary" type="button" onClick={() => setRegisterStep("profile")}><BadgeCheck size={18} />Profilga o'tish</button></div>
                </div>
              ) : (
                <>
                  <div className="form-section">
                    <div className="form-section-title"><UserRound size={20} /><div><h3>Shaxsiy profil</h3><p>OneID orqali keladigan ma'lumotlarni tekshirish yoki qo'lda kiritish mumkin.</p></div></div>
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
                    <div className="form-section-title"><MapPinned size={20} /><div><h3>Yashash hududi va bandlik</h3><p>Yashash manzili va hozirgi bandlik holatini kiriting.</p></div></div>
                    <div className="field-grid four">
                      <label>Tuman yoki shahar<select defaultValue=""><option value="" disabled>Tanlang</option>{districts.map((district) => <option key={district}>{district}</option>)}</select></label>
                      <label>Mahalla<input placeholder="Mahalla nomi" /></label>
                      <label>Ko'cha<input placeholder="Ko'cha nomi" /></label>
                      <label>Bandlik holati<select defaultValue=""><option value="" disabled>Tanlang</option>{employmentOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
                    </div>
                  </div>
                  <div className="form-section">
                    <div className="form-section-title"><Users size={20} /><div><h3>Ishtirok turi</h3><p>Tanlovdagi maqom, qatnashadigan hudud va jamoa shaklini belgilang.</p></div></div>
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
                    <button className="btn btn-outline" type="button" onClick={() => setRegisterStep("phone")}><ChevronLeft size={18} />Orqaga</button>
                    <button className="btn btn-primary" type="button"><FileText size={18} />Arizani saqlash</button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
