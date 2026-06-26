import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Users, CheckCircle, XCircle, Loader } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL ?? "/api";

interface InviteInfo {
  token: string; teamId: string; teamName: string;
  teamDirection: string; teamDescription: string;
  memberCount: number; maxMembers: number;
  role: string; roleLabel: string;
  invitedBy: string; expiresAt: string;
}

export function JoinTeamPage() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const token      = params.get("token") ?? "";
  const stored     = useMemo(
    () => JSON.parse(localStorage.getItem("profileUser") ?? "null") as { id?: string } | null, []
  );
  const uid = stored?.id ?? "";

  const [info,    setInfo]    = useState<InviteInfo | null>(null);
  const [status,  setStatus]  = useState<"loading" | "ready" | "joining" | "done" | "error">("loading");
  const [errMsg,  setErrMsg]  = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setErrMsg("Taklif tokeni topilmadi"); return; }
    fetch(`${API}/team-invite/${token}`)
      .then(r => r.json())
      .then(j => {
        if (j.error) throw new Error(j.error.message);
        setInfo(j.data); setStatus("ready");
      })
      .catch(e => { setStatus("error"); setErrMsg(e.message); });
  }, [token]);

  const handleAccept = async () => {
    if (!uid) { navigate("/profile/login"); return; }
    setStatus("joining");
    try {
      const r = await fetch(`${API}/team-invite/${token}/accept`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message);
      setStatus("done");
      setTimeout(() => navigate(`/profile/${uid}/teams`), 2000);
    } catch (e) { setStatus("error"); setErrMsg(e instanceof Error ? e.message : "Xatolik"); }
  };

  return (
    <div className="min-h-screen bg-[#03101f] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0a1b30] border border-[rgba(112,145,190,.18)] rounded-2xl p-8 text-center">
        {status === "loading" && (
          <>
            <Loader size={48} className="mx-auto mb-4 text-blue-400 animate-spin" />
            <p className="text-[#aab6c9]">Taklif yuklanmoqda...</p>
          </>
        )}

        {status === "ready" && info && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black mx-auto mb-5">
              {info.teamName[0].toUpperCase()}
            </div>
            <h1 className="text-2xl font-black text-white mb-2">{info.teamName}</h1>
            <p className="text-sm text-blue-400 mb-1">{info.teamDirection}</p>
            {info.teamDescription && <p className="text-xs text-[#718096] mb-4">{info.teamDescription}</p>}

            <div className="bg-[#07172b] border border-[rgba(112,145,190,.15)] rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#718096]">Sizning rolingiz</span>
                <span className="font-bold text-white">{info.roleLabel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#718096]">Taklif yuborgan</span>
                <span className="text-white">{info.invitedBy}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#718096]">A'zolar</span>
                <span className="text-white">{info.memberCount}/{info.maxMembers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#718096]">Muddat</span>
                <span className="text-white">{new Date(info.expiresAt).toLocaleDateString("uz-UZ")}</span>
              </div>
            </div>

            {!uid ? (
              <div>
                <p className="text-sm text-amber-400 mb-4">Jamoaga qo'shilish uchun tizimga kiring</p>
                <button onClick={() => navigate("/profile/login")}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold text-white transition-colors">
                  Tizimga kirish
                </button>
              </div>
            ) : (
              <button onClick={handleAccept}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2">
                <Users size={16} /> Jamoaga qo'shilish
              </button>
            )}
          </>
        )}

        {status === "joining" && (
          <>
            <Loader size={48} className="mx-auto mb-4 text-blue-400 animate-spin" />
            <p className="text-[#aab6c9]">Jamoaga qo'shilmoqdasiz...</p>
          </>
        )}

        {status === "done" && (
          <>
            <CheckCircle size={56} className="mx-auto mb-4 text-green-400" />
            <h2 className="text-xl font-bold text-white mb-2">Muvaffaqiyatli qo'shildingiz!</h2>
            <p className="text-sm text-[#aab6c9]">Jamoangizga yo'naltirilmoqdasiz...</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle size={56} className="mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-bold text-white mb-2">Xatolik</h2>
            <p className="text-sm text-red-400 mb-6">{errMsg}</p>
            <button onClick={() => navigate("/")}
              className="px-5 py-2.5 bg-[#07172b] border border-[rgba(112,145,190,.25)] rounded-xl text-sm text-[#aab6c9] hover:text-white transition-colors">
              Bosh sahifaga qaytish
            </button>
          </>
        )}
      </div>
    </div>
  );
}
