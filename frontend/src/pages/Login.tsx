import { LockKeyhole, Phone, ShieldCheck, UserRound } from "lucide-react";

export function Login() {
  return (
    <main className="auth-page">
      <section className="auth-page-shell">
        <aside className="auth-page-aside">
          <a className="brand auth-brand" href="/" aria-label="Qashqadaryo Startup Ligasi">
            <span className="brand-mark">Q</span>
            <span>Qashqadaryo<strong>Startup Ligasi</strong></span>
          </a>
          <div>
            <span className="auth-kicker">Autentifikatsiya</span>
            <h1>Platformaga kirish</h1>
            <p>Telefon raqamingiz va maxfiy parolingiz orqali shaxsiy kabinetga kiring.</p>
          </div>
          <div className="auth-progress">
            <span className="active"><Phone size={17} />Telefon</span>
            <span><LockKeyhole size={17} />Parol</span>
            <span><ShieldCheck size={17} />Tasdiq</span>
          </div>
        </aside>

        <section className="auth-page-content" aria-labelledby="login-title">
          <div className="auth-page-title">
            <UserRound size={24} />
            <div>
              <h2 id="login-title">Kirish ma'lumotlari</h2>
              <p>OneID integratsiyasi keyingi bosqichda ulanadi.</p>
            </div>
          </div>

          <form className="auth-form">
            <div className="form-section">
              <div className="field-grid two">
                <label>Telefon raqami<input type="tel" placeholder="+998 90 123 45 67" /></label>
                <label>Parol<input type="password" placeholder="Maxfiy parol" /></label>
              </div>
              <div className="auth-choice">
                <button className="btn btn-primary" type="button"><LockKeyhole size={18} />Kirish</button>
                <button className="btn btn-outline" type="button" disabled><ShieldCheck size={18} />OneID orqali kirish</button>
              </div>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}
