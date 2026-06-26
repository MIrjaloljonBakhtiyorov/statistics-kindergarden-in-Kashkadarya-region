import { LoginModal } from "../components/LoginModal";

export function Login() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#020617_0%,#07122f_48%,#0b1024_100%)]">
      <LoginModal onClose={() => { window.location.href = "/"; }} />
    </main>
  );
}
