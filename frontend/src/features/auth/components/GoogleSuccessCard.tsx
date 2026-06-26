import { CheckCircle, User } from "lucide-react";
import type { GoogleUserInfo } from "../../../shared/types";

type Props = {
  user: GoogleUserInfo;
  onContinue: () => void;
};

export function GoogleSuccessCard({ user, onContinue }: Props) {
  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <div className="space-y-6 text-center">
      {/* Muvaffaqiyat belgisi */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15">
          <CheckCircle size={32} className="text-green-400" aria-hidden="true" />
        </div>
        <p className="text-base font-semibold text-green-400">
          Google akkauntingiz muvaffaqiyatli tasdiqlandi.
        </p>
      </div>

      {/* Foydalanuvchi ma'lumotlari */}
      <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-5">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={fullName}
            className="h-16 w-16 rounded-full border-2 border-white/20 object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20 border-2 border-blue-400/30">
            <User size={28} className="text-blue-300" aria-hidden="true" />
          </div>
        )}

        <div>
          <p className="text-lg font-bold text-white">{fullName || "Foydalanuvchi"}</p>
          <p className="mt-0.5 text-sm text-slate-400">{user.email}</p>
        </div>
      </div>

      {/* Davom etish tugmasi */}
      <button
        type="button"
        onClick={onContinue}
        className="
          inline-flex w-full items-center justify-center gap-2
          min-h-[52px] rounded-xl
          bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600
          border border-white/10
          text-base font-bold text-white
          shadow-[0_8px_32px_rgba(37,99,235,0.35)]
          hover:shadow-[0_12px_40px_rgba(37,99,235,0.5)]
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950
        "
      >
        Profilni to'ldirish
      </button>
    </div>
  );
}
