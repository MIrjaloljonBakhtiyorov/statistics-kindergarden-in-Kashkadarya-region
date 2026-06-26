import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { GoogleAuthError, GoogleAuthState, GoogleUserInfo } from "../../../shared/types";
import { GoogleRegisterCard, useGoogleCallbackParams } from "../components/GoogleRegisterCard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export function Register() {
  const [, ] = useSearchParams();

  const callbackResult = useGoogleCallbackParams();

  const [authState, setAuthState] = useState<GoogleAuthState>(callbackResult.state);
  const [errorCode, setErrorCode] = useState<GoogleAuthError | null>(callbackResult.error);
  const [googleUser, setGoogleUser] = useState<GoogleUserInfo | null>(callbackResult.user);

  const hasHandledCallback = useRef(false);

  // Google callback URL'dan state olgandan so'ng URL ni tozalash
  useEffect(() => {
    if (hasHandledCallback.current) return;
    if (callbackResult.state !== "idle") {
      hasHandledCallback.current = true;

      if (callbackResult.user) {
        setGoogleUser(callbackResult.user);
      }

      // URL ni tozalash (user ma'lumotlari URLda ko'rinmasin)
      window.history.replaceState(null, "", "/register");
    }
  }, []);

  const handleGoogleClick = () => {
    // Offline tekshiruv
    if (!navigator.onLine) {
      setAuthState("error");
      setErrorCode("network");
      return;
    }

    setAuthState("loading");
    setErrorCode(null);

    // Backend redirect — Google OAuth sahifasiga yo'naltiradi
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <main
      className="
        min-h-screen
        bg-[linear-gradient(135deg,#020617_0%,#07122f_48%,#0b1024_100%)]
        flex items-center justify-center
        px-4 py-10
      "
    >
      {/* Fon effekti */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-indigo-700/8 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full">
        <GoogleRegisterCard
          authState={authState}
          errorCode={errorCode}
          googleUser={googleUser}
          onGoogleClick={handleGoogleClick}
        />
      </div>
    </main>
  );
}
