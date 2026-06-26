import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { GoogleAuthError, GoogleAuthState, GoogleUserInfo } from "../../../shared/types";
import { AuthErrorMessage } from "./AuthErrorMessage";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { GoogleSuccessCard } from "./GoogleSuccessCard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

/** Google callback URL parametrlarini xato kodiga o'girish */
function mapGoogleError(code: string): GoogleAuthError {
  const map: Record<string, GoogleAuthError> = {
    cancelled: "cancelled",
    token_exchange_failed: "token_exchange_failed",
    invalid_token: "invalid_token",
    invalid_state: "invalid_state",
    expired_state: "expired_state",
    invalid_request: "invalid_request",
    no_id_token: "no_id_token",
    no_payload: "no_payload",
    email_not_verified: "email_not_verified",
    account_blocked: "account_blocked",
    email_exists: "email_exists"
  };
  return map[code] ?? "unknown";
}

type Props = {
  authState: GoogleAuthState;
  errorCode: GoogleAuthError | null;
  googleUser: GoogleUserInfo | null;
  onGoogleClick: () => void;
};

export function GoogleRegisterCard({ authState, errorCode, googleUser, onGoogleClick }: Props) {
  const navigate = useNavigate();
  const isLoading = authState === "loading" || authState === "authenticating";

  const handleContinueToProfile = () => {
    if (!googleUser) return;
    // localStorage ga saqlash (mavjud profileUser formatiga mos)
    localStorage.setItem(
      "profileUser",
      JSON.stringify({
        id: googleUser.userId,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        email: googleUser.email,
        avatarUrl: googleUser.avatarUrl,
        role: "participant"
      })
    );
    navigate(`/profile/${googleUser.userId}/personal`);
  };

  return (
    <div
      className="
        w-full max-w-[440px] mx-auto
        rounded-2xl border border-white/10
        bg-slate-900/80 backdrop-blur-md
        shadow-[0_32px_80px_rgba(0,0,0,0.5)]
        p-7 sm:p-9
      "
    >
      {authState === "success" && googleUser ? (
        <GoogleSuccessCard user={googleUser} onContinue={handleContinueToProfile} />
      ) : (
        <>
          {/* Header */}
          <div className="mb-8 text-center">
            {/* Logo */}
            <div className="mb-5 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-[0_8px_24px_rgba(37,99,235,0.4)]">
                <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8" aria-hidden="true">
                  <path d="M6 16L14 24L26 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <h1 className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-1">
              Qashqadaryo Startap Ligasi
            </h1>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Ro'yxatdan o'tish
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Startap ligasida ishtirok etish uchun Google akkauntingiz orqali
              ro'yxatdan o'ting.
            </p>
          </div>

          {/* Divider */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex-1 border-t border-white/10" />
            <span className="text-xs text-slate-500">davom eting</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          {/* Google tugmasi */}
          <GoogleSignInButton onClick={onGoogleClick} isLoading={isLoading} />

          {/* Xato xabari */}
          {errorCode && (
            <div className="mt-4">
              <AuthErrorMessage errorCode={errorCode} />
            </div>
          )}

          {/* Foydalanish shartlari */}
          <p className="mt-6 text-center text-xs leading-5 text-slate-500">
            Davom etish orqali siz{" "}
            <a
              href="/terms"
              className="font-semibold text-slate-300 underline-offset-2 hover:underline focus:outline-none focus:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Foydalanish shartlari
            </a>{" "}
            va{" "}
            <a
              href="/privacy"
              className="font-semibold text-slate-300 underline-offset-2 hover:underline focus:outline-none focus:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Maxfiylik siyosatiga
            </a>{" "}
            rozilik bildirasiz.
          </p>

          {/* Login havolasi */}
          <div className="mt-5 text-center">
            <span className="text-sm text-slate-500">Akkauntingiz bormi? </span>
            <a
              href="/login"
              className="text-sm font-bold text-sky-400 transition hover:text-sky-300 focus:outline-none focus:underline"
            >
              Kirish
            </a>
          </div>
        </>
      )}
    </div>
  );
}

/** URL search params dan Google auth natijasini o'qish */
export function useGoogleCallbackParams(): {
  state: GoogleAuthState;
  error: GoogleAuthError | null;
  user: GoogleUserInfo | null;
} {
  const [searchParams] = useSearchParams();

  const googleSuccess = searchParams.get("google_success");
  const googleError = searchParams.get("google_error");

  if (googleError) {
    return {
      state: googleError === "account_blocked" ? "blocked" : googleError === "email_exists" ? "existing_account" : "error",
      error: mapGoogleError(googleError),
      user: null
    };
  }

  if (googleSuccess === "1") {
    const user: GoogleUserInfo = {
      userId: searchParams.get("user_id") ?? "",
      firstName: searchParams.get("first_name") ?? "",
      lastName: searchParams.get("last_name") ?? "",
      email: searchParams.get("email") ?? "",
      avatarUrl: searchParams.get("avatar_url") ?? "",
      profileStatus: (searchParams.get("profile_status") as GoogleUserInfo["profileStatus"]) ?? "incomplete",
      isNew: searchParams.get("is_new") === "1"
    };
    return { state: "success", error: null, user };
  }

  return { state: "idle", error: null, user: null };
}
