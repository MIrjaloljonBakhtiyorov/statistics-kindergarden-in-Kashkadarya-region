import { AlertCircle } from "lucide-react";
import type { GoogleAuthError } from "../../../shared/types";

type Props = {
  errorCode: GoogleAuthError | null;
};

const ERROR_MESSAGES: Record<GoogleAuthError, string> = {
  cancelled:
    "Google orqali kirish bekor qilindi. Qayta urinib ko'rishingiz mumkin.",
  token_exchange_failed:
    "Google akkaunti orqali kirishda muammo yuz berdi. Qayta urinib ko'ring.",
  invalid_token:
    "Google orqali tasdiqlash amalga oshmadi. Qayta kirib ko'ring.",
  invalid_state:
    "Xavfsizlik tekshiruvi muvaffaqiyatsiz yakunlandi. Sahifani yangilab, qayta urinib ko'ring.",
  expired_state:
    "Sessiya muddati tugadi. Sahifani yangilab, qayta urinib ko'ring.",
  invalid_request:
    "Noto'g'ri so'rov yuborildi. Qayta urinib ko'ring.",
  no_id_token:
    "Google orqali tasdiqlash amalga oshmadi. Qayta kirib ko'ring.",
  no_payload:
    "Google orqali tasdiqlash amalga oshmadi. Qayta kirib ko'ring.",
  email_not_verified:
    "Google akkauntingizdagi elektron pochta manzili tasdiqlanmagan.",
  account_blocked:
    "Ushbu akkaunt vaqtincha bloklangan. Platforma administratori bilan bog'laning.",
  email_exists:
    "Ushbu elektron pochta manzili bilan akkaunt mavjud. Akkauntga kiring yoki akkauntlarni birlashtiring.",
  network:
    "Internet bilan bog'lanishda muammo yuz berdi. Ulanishni tekshirib, qayta urinib ko'ring.",
  unknown:
    "Kutilmagan xatolik yuz berdi. Qayta urinib ko'ring."
};

export function AuthErrorMessage({ errorCode }: Props) {
  if (!errorCode) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
    >
      <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" aria-hidden="true" />
      <p className="text-sm text-red-300 leading-relaxed">
        {ERROR_MESSAGES[errorCode]}
      </p>
    </div>
  );
}
