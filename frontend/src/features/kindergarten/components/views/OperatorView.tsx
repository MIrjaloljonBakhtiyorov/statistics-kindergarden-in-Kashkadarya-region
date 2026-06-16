import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Users, 
  UserCircle, 
  Smartphone, 
  Package, 
  LogOut, 
  ClipboardCheck, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Edit2, 
  Trash2, 
  Clock, 
  History,
  FileDown,
  KeyRound,
  Save,
  Eye,
  EyeOff,
  Utensils
} from 'lucide-react';
import { motion } from 'motion/react';
import * as XLSX from 'xlsx';
import { ChildFormModal } from '../../features/children/components/ChildFormModal';
import { ChildrenTable } from '../../features/children/components/ChildrenTable';
import { StaffTable } from '../../features/staff/components/StaffTable';
import { StaffFormModal } from '../../features/staff/components/StaffFormModal';
import { GroupsList } from '../../features/groups/components/GroupsList';
import { ParentsTable } from '../../features/parents/components/ParentsTable';
import { useChildren } from '../../features/children/hooks/useChildren';
import { useGroups } from '../../features/groups/hooks/useGroups';
import { useStaff } from '../../features/staff/hooks/useStaff';
import { OperationsLog } from '../../features/operations/components/OperationsLog';
import { useNotification } from '../../context/NotificationContext';
import { apiClient } from '@/shared/api';
import { FoodImagePreview } from '@/shared/components/FoodImagePreview';

interface OperatorViewProps {
  groups: any[];
}

interface RoleAccount {
  id: string | null;
  role: string;
  label: string;
  full_name: string;
  login: string;
  password?: string;
  hasPassword: boolean;
}

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: 'Nonushta',
  LUNCH: 'Tushlik',
  TEA: 'Poldnik',
  DINNER: 'Kechki ovqat',
};

const OperatorView: React.FC<OperatorViewProps> = ({ groups: initialGroups }) => {
  const [viewMode, setViewMode] = useState<'DASHBOARD' | 'ADD_CHILD' | 'ADD_STAFF' | 'MANAGE_CHILDREN' | 'MANAGE_STAFF' | 'MANAGE_GROUPS' | 'MANAGE_PARENTS' | 'MANAGE_ROLE_ACCOUNTS'>('DASHBOARD');
  const [editingChild, setEditingChild] = useState<any>(null);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [roleAccounts, setRoleAccounts] = useState<RoleAccount[]>([]);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [savingRole, setSavingRole] = useState<string | null>(null);
  const [todayMenu, setTodayMenu] = useState<any[]>([]);
  const { children, createChild } = useChildren();
  const { groups } = useGroups();
  const { staff } = useStaff();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchTodayMenu = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await apiClient.get(`/menu/${today}`);
        setTodayMenu(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        setTodayMenu([]);
      }
    };

    fetchTodayMenu();
  }, []);

  const fetchRoleAccounts = async () => {
    try {
      const res = await apiClient.get('/role-accounts');
      setRoleAccounts(res.data.map((account: RoleAccount) => ({ ...account, password: '' })));
    } catch (error) {
      showNotification('Rollar login/parollarini yuklashda xatolik', 'error');
    }
  };

  const openRoleAccounts = () => {
    setViewMode('MANAGE_ROLE_ACCOUNTS');
    fetchRoleAccounts();
  };

  const updateRoleAccount = (role: string, field: keyof RoleAccount, value: string) => {
    setRoleAccounts((accounts) => accounts.map((account) => (
      account.role === role ? { ...account, [field]: value } : account
    )));
  };

  const saveRoleAccount = async (account: RoleAccount) => {
    if (!account.login.trim()) {
      showNotification('Login kiritilishi shart', 'error');
      return;
    }
    if (!account.hasPassword && !account.password?.trim()) {
      showNotification('Yangi rol uchun parol kiritilishi shart', 'error');
      return;
    }

    setSavingRole(account.role);
    try {
      await apiClient.put(`/role-accounts/${account.role}`, {
        full_name: account.full_name,
        login: account.login,
        password: account.password,
      });
      showNotification(`${account.label} login/paroli saqlandi`, 'success');
      await fetchRoleAccounts();
    } catch (error: any) {
      showNotification(error?.response?.data?.error || 'Saqlashda xatolik yuz berdi', 'error');
    } finally {
      setSavingRole(null);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          showNotification('Excel fayl bo\'sh!', 'error');
          return;
        }

        showNotification(`${data.length} ta qator topildi. Import boshlandi...`, 'info');

        let successCount = 0;
        let failCount = 0;

        for (const row of data as any[]) {
          try {
            // Ustun nomlarini qidirish (aqlli qidiruv)
            const getVal = (keys: string[]) => {
              const foundKey = Object.keys(row).find(k => keys.includes(k.trim()));
              return foundKey ? String(row[foundKey]).trim() : '';
            };

            const childData = {
              first_name: getVal(['Ismi', 'Ism', 'Name', 'First Name']),
              last_name: getVal(['Otasining ismi', 'Sharifi', 'Surname', 'Last Name', 'Patronymic']),
              birth_date: getVal(['Tug\'ilgan sana', 'Tugilgan sana', 'Birth Date', 'DOB']),
              age_category: getVal(['Yosh kategoriyasi', 'Yoshi', 'Age']),
              gender: getVal(['Jinsi', 'Jins', 'Gender']).toLowerCase().includes('qiz') ? 'F' : 'M',
              address: getVal(['Manzili', 'Manzil', 'Address']),
              birth_certificate_number: getVal(['Guvohnoma в„–', 'Guvohnoma', 'Certificate', 'Birth Certificate']),
              passport_info: getVal(['Passport', 'Pasport']),
              father_full_name: getVal(['Otasining F.I.Sh', 'Otasi', 'Father']),
              father_phone: getVal(['Otasining telefoni', 'Ota tel', 'Father Phone']),
              mother_full_name: getVal(['Onasining F.I.Sh', 'Onasi', 'Mother']),
              mother_phone: getVal(['Onasining telefoni', 'Ona tel', 'Mother Phone']),
              group_id: groups.find(g => g.name === getVal(['Guruhi', 'Guruh', 'Group']))?.id || '',
              status: 'PENDING'
            };

            // Tekshirish: Agar guruh topilmasa, birinchi mavjud guruhga biriktirish yoki xato berish
            if (!childData.group_id && groups.length > 0) {
               childData.group_id = groups[0].id;
            }

            await createChild(childData as any);
            successCount++;
          } catch (err) {
            failCount++;
            console.error('Row import failed:', row, err);
          }
        }
        
        if (failCount > 0) {
          showNotification(`${successCount} ta muvaffaqiyatli, ${failCount} ta xato.`, 'info');
        } else {
          showNotification(`Barcha ${successCount} ta bola import qilindi!`, 'success');
        }
        e.target.value = ''; 
      } catch (error) {
        showNotification('Excel faylni o\'qishda xatolik', 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleEditChild = (child: any) => {
    setEditingChild(child);
    setViewMode('ADD_CHILD');
  };

  const handleEditStaff = (staffMember: any) => {
    setEditingStaff(staffMember);
    setViewMode('ADD_STAFF');
  };

  const closeChildModal = () => {
    setEditingChild(null);
    setViewMode('MANAGE_CHILDREN');
  };

  const closeStaffModal = () => {
    setEditingStaff(null);
    setViewMode('MANAGE_STAFF');
  };

  const renderModalContent = () => {
    if (viewMode === 'ADD_CHILD') {
      return <ChildFormModal child={editingChild} onClose={closeChildModal} />;
    }

    if (viewMode === 'ADD_STAFF') {
      return <StaffFormModal staffMember={editingStaff} onClose={closeStaffModal} />;
    }

    if (viewMode === 'MANAGE_CHILDREN') {
      return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
           <div className="border-b border-brand-border flex items-center justify-between pb-6 mb-8">
              <h3 className="text-2xl font-black text-brand-depth">Bolalar ro'yxati</h3>
              <div className="flex gap-3">
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  onChange={handleImportExcel} 
                  className="hidden" 
                  id="excel-import" 
                />
                <label 
                  htmlFor="excel-import" 
                  className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  <FileDown size={16} /> Excel Import
                </label>
              </div>
           </div>
           <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
              <ChildrenTable onEdit={handleEditChild} />
           </div>
        </div>
      );
    }

    if (viewMode === 'MANAGE_GROUPS') {
      return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
           <div className="border-b border-brand-border flex items-center justify-between pb-6 mb-8">
              <h3 className="text-2xl font-black text-brand-depth">Guruhlar boshqaruvi</h3>
           </div>
           <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
              <GroupsList />
           </div>
        </div>
      );
    }

    if (viewMode === 'MANAGE_STAFF') {
      return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
           <div className="border-b border-brand-border flex items-center justify-between pb-6 mb-8">
              <h3 className="text-2xl font-black text-brand-depth">Xodimlar ruyxati</h3>
           </div>
           <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
              <StaffTable onEdit={handleEditStaff} />
           </div>
        </div>
      );
    }

    if (viewMode === 'MANAGE_PARENTS') {
      return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
           <div className="border-b border-brand-border flex items-center justify-between pb-6 mb-8">
              <h3 className="text-2xl font-black text-brand-depth">
                Ota-onalar parollari va ID
              </h3>
           </div>
           <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
              <ParentsTable />
           </div>
        </div>
      );
    }

    if (viewMode === 'MANAGE_ROLE_ACCOUNTS') {
      return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="border-b border-brand-border flex items-center justify-between pb-6 mb-8">
            <div>
              <h3 className="text-2xl font-black text-brand-depth">Rollar login va parollari</h3>
              <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mt-2">
                Bog'cha xodimlari tizimga o'z roli bilan kirishi uchun
              </p>
            </div>
            <button
              onClick={fetchRoleAccounts}
              className="bg-white text-brand-depth border border-brand-border px-4 py-2 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Yangilash
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1.1fr_1fr_1fr_1fr_auto] gap-3 px-5 py-4 bg-slate-50 border-b border-brand-border text-[10px] font-black text-brand-muted uppercase tracking-widest">
              <span>Rol</span>
              <span>F.I.O / nom</span>
              <span>Login</span>
              <span>Yangi parol</span>
              <span>Saqlash</span>
            </div>

            <div className="divide-y divide-brand-border">
              {roleAccounts.map((account) => (
                <div key={account.role} className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr_1fr_1fr_auto] gap-3 p-4 items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-brand-primary flex items-center justify-center">
                      <KeyRound size={18} />
                    </div>
                    <div>
                      <p className="font-black text-brand-depth">{account.label}</p>
                      <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                        {account.hasPassword ? 'Faol account' : 'Hali yaratilmagan'}
                      </p>
                    </div>
                  </div>

                  <input
                    value={account.full_name}
                    onChange={(e) => updateRoleAccount(account.role, 'full_name', e.target.value)}
                    className="w-full bg-slate-50 border border-brand-border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-brand-primary"
                    placeholder="F.I.O"
                  />

                  <input
                    value={account.login}
                    onChange={(e) => updateRoleAccount(account.role, 'login', e.target.value)}
                    className="w-full bg-slate-50 border border-brand-border rounded-xl px-4 py-3 text-sm font-mono font-bold outline-none focus:border-brand-primary"
                    placeholder="login"
                  />

                  <div className="relative">
                    <input
                      type={visiblePasswords[account.role] ? 'text' : 'password'}
                      value={account.password || ''}
                      onChange={(e) => updateRoleAccount(account.role, 'password', e.target.value)}
                      className="w-full bg-slate-50 border border-brand-border rounded-xl pl-4 pr-11 py-3 text-sm font-bold outline-none focus:border-brand-primary"
                      placeholder={account.hasPassword ? 'Ozgartirish uchun kiriting' : 'Parol'}
                    />
                    <button
                      type="button"
                      onClick={() => setVisiblePasswords((state) => ({ ...state, [account.role]: !state[account.role] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-depth"
                    >
                      {visiblePasswords[account.role] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <button
                    onClick={() => saveRoleAccount(account)}
                    disabled={savingRole === account.role}
                    className="h-11 px-4 rounded-xl bg-brand-primary text-white font-black text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-60"
                  >
                    <Save size={16} />
                    {savingRole === account.role ? '...' : 'Saqlash'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <button onClick={() => setViewMode('ADD_CHILD')} className="flex-1 sm:flex-none bg-brand-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform"><Plus size={16}/> Yangi bola</button>
        <button onClick={() => setViewMode('ADD_STAFF')} className="flex-1 sm:flex-none bg-white text-brand-depth border border-brand-border px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"><Plus size={16}/> Yangi xodim</button>
        <button onClick={() => setViewMode('MANAGE_CHILDREN')} className="flex-1 sm:flex-none bg-white text-brand-depth border border-brand-border px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"><Users size={16}/> Bolalar</button>
        <button onClick={() => setViewMode('MANAGE_STAFF')} className="flex-1 sm:flex-none bg-white text-brand-depth border border-brand-border px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"><UserCircle size={16}/> Xodimlar</button>
        <button onClick={() => setViewMode('MANAGE_GROUPS')} className="flex-1 sm:flex-none bg-white text-brand-depth border border-brand-border px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"><Package size={16}/> Guruhlar</button>
        <button onClick={() => setViewMode('MANAGE_PARENTS')} className="flex-1 sm:flex-none bg-white text-brand-depth border border-brand-border px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"><ShieldCheck size={16}/> Ota-onalar</button>
        <button onClick={openRoleAccounts} className="flex-1 sm:flex-none bg-white text-brand-depth border border-brand-border px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"><KeyRound size={16}/> Rollar paroli</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-brand-border shadow-sm">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="p-2 bg-blue-50 text-brand-primary rounded-lg"><Users size={18} /></div>
          </div>
          <p className="text-brand-muted text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1">Jami bolalar</p>
          <h3 className="text-xl sm:text-2xl font-bold text-brand-depth">{children.length} ta</h3>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-brand-border shadow-sm border-l-4 border-l-brand-emerald text-brand-depth">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="p-2 bg-emerald-50 text-brand-emerald rounded-lg"><Package size={18} /></div>
          </div>
          <p className="text-brand-muted text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1">Jami guruhlar</p>
          <h3 className="text-xl sm:text-2xl font-bold text-brand-depth">{groups.length} ta</h3>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-brand-border shadow-sm border-l-4 border-l-rose-500">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="p-2 bg-rose-50 text-rose-500 rounded-lg"><AlertCircle size={18} /></div>
          </div>
          <p className="text-brand-muted text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1">Xatoliklar</p>
          <h3 className="text-xl sm:text-2xl font-bold text-brand-depth">0 ta</h3>
        </div>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-xl border border-brand-border shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-black text-brand-depth flex items-center gap-2">
              <Utensils size={19} className="text-brand-primary" />
              Bugungi taomnoma
            </h3>
            <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mt-1">
              Admin paneldan yuborilgan 4 mahal menyu
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-brand-primary border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
            {todayMenu.length} ta
          </span>
        </div>

        {todayMenu.length === 0 ? (
          <div className="py-8 text-center text-brand-muted text-[10px] font-bold uppercase tracking-widest border-2 border-dashed border-emerald-100 bg-emerald-50/30 rounded-xl">
            Bugun uchun taomnoma hali kiritilmagan
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {todayMenu.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 overflow-hidden">
                {item.image_url && (
                  <FoodImagePreview
                    src={item.image_url}
                    alt={item.meal_name || 'Taom rasmi'}
                    label={item.meal_name}
                    className="mb-3 h-28 w-full rounded-lg border border-white"
                    imageClassName="object-cover"
                    previewImageClassName="object-cover"
                  />
                )}
                <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest">
                  {MEAL_LABELS[item.meal_type] || item.meal_type}
                </p>
                <h4 className="text-sm font-black text-brand-depth mt-2 line-clamp-2">{item.meal_name}</h4>
                <p className="text-[10px] font-bold text-brand-muted mt-3">{Number(item.calories || 0)} kkal</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <OperationsLog />

      {viewMode !== 'DASHBOARD' && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-2 sm:p-4 lg:p-12 animate-in fade-in duration-300 bg-black/20 backdrop-blur-sm">
           <div className="bg-slate-50 w-full max-w-6xl h-full sm:h-auto sm:max-h-[90vh] rounded-xl sm:rounded-[10px] shadow-2xl relative overflow-hidden flex flex-col border border-white/20">

              <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-10">
                <button 
                  onClick={() => setViewMode('DASHBOARD')}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-white shadow-lg border border-brand-border rounded-full flex items-center justify-center text-brand-depth hover:bg-rose-50 hover:text-rose-500 hover:scale-110 transition-all active:scale-95 group"
                >
                  <span className="font-black text-lg sm:text-xl leading-none group-hover:rotate-90 transition-transform">&times;</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 md:p-12">
                 {renderModalContent()}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default OperatorView;

