import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Users, Plus, LogOut, UserPlus, CheckCircle, X,
  Copy, Link2, Trash2, RefreshCw, Crown, ChevronDown
} from "lucide-react";
import { ProfileShell } from "../components/layout/ProfileShell";
import { ProfileModal } from "../components/ui/ProfileModal";
import { ProfileConfirmDialog } from "../components/ui/ProfileConfirmDialog";
import { ProfileFormField } from "../components/ui/ProfileFormField";
import { showToast, ToastContainer } from "../components/ui/ProfileToast";

const API = import.meta.env.VITE_API_BASE_URL ?? "/api";
const MAX = 5;

type Role = "project_leader" | "developer" | "designer" | "marketer" | "domain_expert";
const ROLES: { value: Role; label: string }[] = [
  { value: "project_leader", label: "Loyiha rahbari" },
  { value: "developer",      label: "Dasturchi" },
  { value: "designer",       label: "Dizayner" },
  { value: "marketer",       label: "Marketolog" },
  { value: "domain_expert",  label: "Soha mutaxassisi" },
];

interface Member {
  id: string; userId: string; firstName: string; lastName: string;
  email: string; avatarUrl?: string; role: Role; roleLabel: string;
  status: string; joinedAt: string;
}
interface Invite {
  id: string; role: Role; roleLabel: string;
  token: string; inviteUrl: string; expiresAt: string;
}
interface Team {
  id: string; name: string; description: string; direction: string;
  ownerId: string; inviteCode: string; status: string;
  myRole: Role; isOwner: boolean; members: Member[];
}

const DIRECTIONS = [
  "IT va sun'iy intellekt", "Agrotexnologiyalar", "Ta'lim texnologiyalari",
  "Tibbiyot texnologiyalari", "Moliyaviy texnologiyalar",
  "Yashil texnologiyalar", "Boshqa",
];

export function TeamsPage() {
  const { userId } = useParams();
  const stored = useMemo(
    () => JSON.parse(localStorage.getItem("profileUser") ?? "null") as { id?: string } | null, []
  );
  const uid = userId ?? stored?.id ?? "";

  const [team,    setTeam]    = useState<Team | null>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [leaveOpen,  setLeaveOpen]  = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);
  const [inviteRole, setInviteRole] = useState<Role>("developer");
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", description: "", direction: "" });
  const [creating, setCreating] = useState(false);

  const loadTeam = async () => {
    if (!uid) return;
    try {
      const r = await fetch(`${API}/users/${uid}/team`);
      const j = await r.json();
      setTeam(j.data ?? null);
      if (j.data?.isOwner) loadInvites(j.data.id);
    } catch { setTeam(null); }
    finally { setLoading(false); }
  };

  const loadInvites = async (teamId: string) => {
    try {
      const r = await fetch(`${API}/teams/${teamId}/invites?userId=${uid}`);
      const j = await r.json();
      setInvites(j.data ?? []);
    } catch { /* silent */ }
  };

  useEffect(() => { loadTeam(); }, [uid]);

  const handleCreate = async () => {
    if (!newForm.name.trim())      return showToast("Jamoa nomi kerak", "error");
    if (!newForm.direction.trim()) return showToast("Yo'nalish kerak", "error");
    setCreating(true);
    try {
      const r = await fetch(`${API}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newForm, ownerId: uid }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message);
      setTeam(j.data);
      setCreateOpen(false);
      setNewForm({ name: "", description: "", direction: "" });
      showToast("Jamoa yaratildi! 🎉", "success");
    } catch (e) { showToast(e instanceof Error ? e.message : "Xatolik", "error"); }
    finally { setCreating(false); }
  };

  const handleLeave = async () => {
    if (!team) return;
    try {
      const r = await fetch(`${API}/teams/${team.id}/leave`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid }),
      });
      if (!r.ok) throw new Error((await r.json()).error?.message);
      setTeam(null); setInvites([]);
      showToast("Jamoadan chiqdingiz", "info");
    } catch (e) { showToast(e instanceof Error ? e.message : "Xatolik", "error"); }
    finally { setLeaveOpen(false); }
  };

  const handleDelete = async () => {
    if (!team) return;
    try {
      const r = await fetch(`${API}/teams/${team.id}`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid }),
      });
      if (!r.ok) throw new Error((await r.json()).error?.message);
      setTeam(null); setInvites([]);
      showToast("Jamoa o'chirildi", "info");
    } catch (e) { showToast(e instanceof Error ? e.message : "Xatolik", "error"); }
    finally { setDeleteOpen(false); }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!team) return;
    try {
      const r = await fetch(`${API}/teams/${team.id}/members/${memberId}`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid }),
      });
      if (!r.ok) throw new Error((await r.json()).error?.message);
      setTeam(prev => prev ? { ...prev, members: prev.members.filter(m => m.userId !== memberId) } : prev);
      showToast("A'zo chiqarildi", "info");
    } catch (e) { showToast(e instanceof Error ? e.message : "Xatolik", "error"); }
    finally { setRemoveMemberId(null); }
  };

  const handleCreateInvite = async () => {
    if (!team) return;
    setCreatingInvite(true);
    try {
      const r = await fetch(`${API}/teams/${team.id}/invites`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitedBy: uid, role: inviteRole }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message);
      setInvites(prev => [j.data, ...prev.filter(i => i.role !== inviteRole)]);
      showToast("Taklif havolasi yaratildi!", "success");
    } catch (e) { showToast(e instanceof Error ? e.message : "Xatolik", "error"); }
    finally { setCreatingInvite(false); }
  };

  const copyLink = (url: string) => {
    const full = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(full).then(() => showToast("Havola nusxalandi!", "success"));
  };

  const handleDeleteInvite = async (inviteId: string) => {
    if (!team) return;
    try {
      await fetch(`${API}/teams/${team.id}/invites/${inviteId}`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid }),
      });
      setInvites(prev => prev.filter(i => i.id !== inviteId));
      showToast("Taklif bekor qilindi", "info");
    } catch { showToast("Xatolik", "error"); }
  };

  if (loading) return (
    <ProfileShell>
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-blue-500" />
      </div>
    </ProfileShell>
  );

  return (
    <ProfileShell>
      <ToastContainer />

      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Jamoam</h1>
          <p className="text-sm text-[#aab6c9]">
            {team ? `${team.members.length}/${MAX} a'zo · ${team.direction}` : "Hali jamoangiz yo'q"}
          </p>
        </div>
        {!team && (
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold text-white transition-colors">
            <Plus size={15} /> Jamoa yaratish
          </button>
        )}
      </div>

      {!team ? (
        /* ── Empty state ── */
        <div className="py-16 text-center bg-[#0a1b30] border border-[rgba(112,145,190,.18)] rounded-2xl">
          <Users size={48} className="mx-auto mb-4 text-[#718096] opacity-40" />
          <h3 className="text-lg font-bold text-white mb-2">Hali jamoangiz yo'q</h3>
          <p className="text-sm text-[#718096] mb-6 max-w-sm mx-auto">
            Jamoa yarating yoki taklif havolasi orqali mavjud jamoaga qo'shiling.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold text-white transition-colors">
              <Plus size={16} /> Jamoa yaratish
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── Team card ── */}
          <div className="bg-[#0a1b30] border border-[rgba(112,145,190,.18)] rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
                  {team.name[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{team.name}</h2>
                  <p className="text-sm text-blue-400">{team.direction}</p>
                  {team.description && <p className="text-xs text-[#718096] mt-1">{team.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {team.isOwner ? (
                  <button onClick={() => setDeleteOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-500/20 transition-colors">
                    <Trash2 size={13} /> O'chirish
                  </button>
                ) : (
                  <button onClick={() => setLeaveOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-500/20 transition-colors">
                    <LogOut size={13} /> Tark etish
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#aab6c9]">Jamoa to'ldirilganligi</span>
                <span className="text-xs font-bold text-white">{team.members.length}/{MAX}</span>
              </div>
              <div className="h-2 bg-[#07172b] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                  style={{ width: `${(team.members.length / MAX) * 100}%` }} />
              </div>
            </div>

            {/* Members */}
            <h3 className="text-sm font-bold text-white mb-3">A'zolar</h3>
            <div className="space-y-2">
              {ROLES.map(({ value, label }) => {
                const member = team.members.find(m => m.role === value);
                return (
                  <div key={value} className={`flex items-center justify-between p-3 rounded-xl border ${
                    member ? "bg-[#07172b] border-[rgba(112,145,190,.15)]" : "bg-[#040e1c] border-dashed border-[rgba(112,145,190,.1)]"
                  }`}>
                    <div className="flex items-center gap-3">
                      {member ? (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {member.firstName[0]}{member.lastName[0]}
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#07172b] border-2 border-dashed border-[rgba(112,145,190,.2)] flex items-center justify-center flex-shrink-0">
                          <Users size={14} className="text-[#718096]" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-white">
                            {member ? `${member.firstName} ${member.lastName}` : <span className="text-[#718096]">Bo'sh o'rin</span>}
                          </p>
                          {member?.userId === team.ownerId && <Crown size={12} className="text-amber-400" />}
                        </div>
                        <p className="text-xs text-[#718096]">{label}</p>
                      </div>
                    </div>
                    {team.isOwner && member && member.userId !== uid && (
                      <button onClick={() => setRemoveMemberId(member.userId)}
                        className="p-1.5 hover:bg-red-500/10 text-[#718096] hover:text-red-400 rounded-lg transition-colors">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Invite section (only owner) ── */}
          {team.isOwner && team.members.length < MAX && (
            <div className="bg-[#0a1b30] border border-[rgba(112,145,190,.18)] rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <UserPlus size={18} className="text-blue-400" /> Taklif havolasi yaratish
              </h3>
              <p className="text-xs text-[#718096] mb-4">
                Har bir rol uchun alohida taklif havolasi yarating. Havola 7 kun amal qiladi.
              </p>
              <div className="flex items-center gap-3 mb-4">
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as Role)}
                  className="flex-1 px-4 py-2.5 bg-[#07172b] border border-[rgba(112,145,190,.25)] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  {ROLES.filter(r => r.value !== "project_leader" && !team.members.find(m => m.role === r.value)).map(r => (
                    <option key={r.value} value={r.value} className="bg-[#0a1b30]">{r.label}</option>
                  ))}
                </select>
                <button onClick={handleCreateInvite} disabled={creatingInvite}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl text-sm font-bold text-white transition-colors whitespace-nowrap">
                  {creatingInvite ? <RefreshCw size={15} className="animate-spin" /> : <Link2 size={15} />}
                  Havola yaratish
                </button>
              </div>

              {invites.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#aab6c9] mb-2">Faol takliflar:</p>
                  {invites.map(inv => (
                    <div key={inv.id} className="flex items-center gap-3 p-3 bg-[#07172b] border border-[rgba(112,145,190,.12)] rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white">{inv.roleLabel}</p>
                        <p className="text-[11px] text-[#718096] truncate font-mono mt-0.5">
                          {window.location.origin}{inv.inviteUrl}
                        </p>
                        <p className="text-[11px] text-[#718096] mt-0.5">
                          Tugaydi: {new Date(inv.expiresAt).toLocaleDateString("uz-UZ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => copyLink(inv.inviteUrl)}
                          className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors" title="Nusxalash">
                          <Copy size={14} />
                        </button>
                        <button onClick={() => handleDeleteInvite(inv.id)}
                          className="p-2 hover:bg-red-500/10 text-[#718096] hover:text-red-400 rounded-lg transition-colors" title="Bekor qilish">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Create team modal ── */}
      <ProfileModal isOpen={createOpen} onClose={() => setCreateOpen(false)}
        title="Yangi jamoa yaratish" subtitle="Jamoangiz haqida ma'lumot kiriting"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setCreateOpen(false)}
              className="px-4 py-2 bg-[#07172b] border border-[rgba(112,145,190,.25)] rounded-xl text-sm text-[#aab6c9] hover:text-white">
              Bekor qilish
            </button>
            <button onClick={handleCreate} disabled={creating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl text-sm font-bold text-white">
              {creating ? "Yaratilmoqda..." : "Jamoa yaratish"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <ProfileFormField as="input" label="Jamoa nomi" required value={newForm.name}
            onChange={e => setNewForm(p => ({ ...p, name: e.target.value }))} placeholder="Masalan: TechStart" />
          <ProfileFormField as="select" label="Yo'nalish" required value={newForm.direction}
            onChange={e => setNewForm(p => ({ ...p, direction: e.target.value }))}
            options={[{ value: "", label: "Tanlang" }, ...DIRECTIONS.map(d => ({ value: d, label: d }))]} />
          <ProfileFormField as="textarea" label="Tavsif (ixtiyoriy)" value={newForm.description}
            onChange={e => setNewForm(p => ({ ...p, description: e.target.value }))}
            placeholder="Loyiha haqida qisqacha..." />
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300">
            <p className="font-semibold mb-1">📌 Eslatma</p>
            <p>Siz loyiha rahbari sifatida qo'shilasiz. Qolgan 4 ta a'zo uchun taklif havolasi yaratishingiz mumkin.</p>
          </div>
        </div>
      </ProfileModal>

      {/* ── Confirm dialogs ── */}
      <ProfileConfirmDialog isOpen={leaveOpen} onClose={() => setLeaveOpen(false)} onConfirm={handleLeave}
        title="Jamoadan chiqish" message={`"${team?.name}" jamoasini tark etmoqchimisiz?`}
        confirmText="Ha, chiqish" variant="danger" />

      <ProfileConfirmDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Jamoani o'chirish" message={`"${team?.name}" jamoasini butunlay o'chirib tashlaysizmi? Barcha a'zolar ham chiqariladi.`}
        confirmText="Ha, o'chirish" variant="danger" />

      <ProfileConfirmDialog isOpen={!!removeMemberId} onClose={() => setRemoveMemberId(null)}
        onConfirm={() => removeMemberId && handleRemoveMember(removeMemberId)}
        title="A'zoni chiqarish" message="Bu a'zoni jamoadan chiqarasizmi?"
        confirmText="Ha, chiqarish" variant="danger" />
    </ProfileShell>
  );
}
