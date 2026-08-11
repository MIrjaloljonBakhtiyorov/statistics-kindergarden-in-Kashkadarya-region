import React, { useEffect, useState } from 'react';
import { Calendar, UserCheck, AlertCircle, CheckCircle2, XCircle, Save, TrendingUp, Sparkles } from 'lucide-react';
import { apiClient } from '@/shared/api';
import { useNotification } from '../../../context/NotificationContext';


export const AttendanceSection = ({ data, childId, onUpdate }: any) => {
  const { showNotification } = useNotification();
  const [tomorrowAttending, setTomorrowAttending] = useState<boolean | null>(null);
  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [autoPresentSynced, setAutoPresentSynced] = useState(false);

  const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const todayKey = formatDateKey(today);
  const tomorrowKey = formatDateKey(tomorrow);
  const isTomorrowWeekend = [0, 6].includes(tomorrow.getDay());
  const monthNames = [
    'yanvar',
    'fevral',
    'mart',
    'aprel',
    'may',
    'iyun',
    'iyul',
    'avgust',
    'sentabr',
    'oktabr',
    'noyabr',
    'dekabr'
  ];
  const currentMonthLabel = `${today.getFullYear()} yilning ${monthNames[today.getMonth()]} oyi`;
  const attendanceByDate = new Map((data?.attendance || []).map((item: any) => [item.date, item]));
  const tomorrowRecord: any = attendanceByDate.get(tomorrowKey);

  useEffect(() => {
    if (isTomorrowWeekend) {
      setTomorrowAttending(null);
      setReason('');
      return;
    }

    if (tomorrowRecord?.status === 'ABSENT') {
      setTomorrowAttending(false);
      setReason(tomorrowRecord?.reason || '');
      return;
    }

    setTomorrowAttending(null);
    setReason('');
  }, [isTomorrowWeekend, tomorrowKey, tomorrowRecord?.status, tomorrowRecord?.reason]);

  const isWeekendDateKey = (dateKey?: string) => {
    if (!dateKey) return false;
    const date = new Date(`${dateKey}T00:00:00`);
    return [0, 6].includes(date.getDay());
  };

  const isHolidayDateKey = (dateKey?: string) => {
    if (!dateKey) return false;
    const [, month, day] = dateKey.split('-');
    const fixedHolidayKeys = new Set([
      '01-01',
      '03-08',
      '03-21',
      '05-09',
      '09-01',
      '10-01',
      '12-08',
    ]);
    return fixedHolidayKeys.has(`${month}-${day}`);
  };

  const isNonAttendanceDateKey = (dateKey?: string) => isWeekendDateKey(dateKey) || isHolidayDateKey(dateKey);
  const todayRecord: any = attendanceByDate.get(todayKey);

  useEffect(() => {
    if (autoPresentSynced || !childId || isNonAttendanceDateKey(todayKey) || todayRecord?.status) return;

    setAutoPresentSynced(true);
    apiClient.post('/attendance', {
      date: todayKey,
      attendance_data: {
        [childId]: {
          status: 'PRESENT',
          reason: '',
        },
      },
      reason: '',
    })
      .then(() => onUpdate?.())
      .catch((err) => {
        console.error(err);
        setAutoPresentSynced(false);
      });
  }, [autoPresentSynced, childId, onUpdate, todayKey, todayRecord?.status]);

  const calendarDays = Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setDate(today.getDate() + index);
    const dateKey = formatDateKey(date);
    const record: any = attendanceByDate.get(dateKey);
    const isWeekend = [0, 6].includes(date.getDay());
    const isHoliday = isHolidayDateKey(dateKey);
    const status =
      isWeekend || isHoliday
        ? 'holiday'
        : dateKey === tomorrowKey && tomorrowAttending !== null
        ? (tomorrowAttending ? 'present' : 'absent')
        : record?.status === 'PRESENT'
          ? 'present'
          : record?.status === 'ABSENT'
            ? 'absent'
            : dateKey <= todayKey
              ? 'present'
            : 'unmarked';

    return {
      date,
      dateKey,
      status,
      isWeekend,
      isHoliday,
      day: date.getDate(),
      weekday: date.toLocaleDateString('uz-UZ', { weekday: 'short' }),
      label: dateKey === todayKey ? 'Bugun' : dateKey === tomorrowKey ? 'Ertaga' : ''
    };
  });

  const calendarTone: Record<string, string> = {
    present: 'border-green-700 bg-gradient-to-br from-green-500 via-emerald-600 to-green-900 text-white shadow-green-300',
    absent: 'border-red-700 bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white shadow-red-300',
    holiday: 'border-yellow-400 bg-gradient-to-br from-yellow-300 via-amber-300 to-orange-300 text-amber-950 shadow-yellow-200',
    unmarked: 'border-slate-300 bg-gradient-to-br from-slate-100 to-slate-300 text-slate-700 shadow-slate-200'
  };

  const calendarDot: Record<string, string> = {
    present: 'bg-white ring-2 ring-white/40',
    absent: 'bg-white ring-2 ring-red-200',
    holiday: 'bg-orange-500 ring-2 ring-white/80',
    unmarked: 'bg-slate-500 ring-2 ring-white/80'
  };

  const getCalendarStatusLabel = (day: { label: string; status: string }) => {
    if (day.status === 'holiday') return 'Dam olish';
    if (day.status === 'unmarked') return 'Belgilanmagan';
    if (day.label) return day.label;
    return day.status === 'present' ? 'Boradi' : 'Bormaydi';
  };

  const stats = [
    {
      label: 'Kelgan kunlar',
      val: data?.attendance?.filter((a:any) => !isWeekendDateKey(a.date) && a.status === 'PRESENT').length || 0,
      icon: UserCheck,
      desc: 'Jami davomat',
      tone: {
        accent: 'from-rose-400 to-pink-500',
        icon: 'bg-rose-50 text-rose-500 border-rose-100',
        text: 'text-rose-500',
        soft: 'bg-rose-50 border-rose-100 text-rose-600'
      }
    },
    {
      label: 'Kelmagan kunlar',
      val: data?.attendance?.filter((a:any) => !isWeekendDateKey(a.date) && a.status === 'ABSENT').length || 0,
      icon: XCircle,
      desc: 'Sababli/Sababsiz',
      tone: {
        accent: 'from-fuchsia-400 to-rose-500',
        icon: 'bg-pink-50 text-pink-500 border-pink-100',
        text: 'text-pink-500',
        soft: 'bg-pink-50 border-pink-100 text-pink-600'
      }
    }
  ];

  const handleSave = async () => {
    if (isTomorrowWeekend) {
      showNotification("Shanba va yakshanba dam olish kuni, davomat belgilanmaydi.", "info");
      return;
    }

    if (tomorrowAttending === null) {
      showNotification("Avval ertangi kun uchun boradi yoki yo'q holatini belgilang.", "info");
      return;
    }

    setIsSaving(true);
    try {
      const dateStr = tomorrowKey;

      await apiClient.post(`/attendance`, {
        date: dateStr,
        attendance_data: {
          [childId]: {
            status: tomorrowAttending === true ? 'PRESENT' : 'ABSENT',
            reason: tomorrowAttending === true ? '' : reason
          }
        },
        reason: tomorrowAttending === true ? '' : reason
      });

      showNotification("Ertangi kun uchun reja saqlandi!", "success");
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      showNotification("Saqlashda xatolik yuz berdi", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="kg-parent-section kg-attendance-typography space-y-4 sm:space-y-5 md:space-y-6">
      {/* Planning Section */}
      <div className="relative overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-sm">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-rose-500 via-pink-400 to-fuchsia-400"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white via-rose-50/70 to-pink-50/80"></div>
        <div className="absolute right-8 top-6 hidden h-28 w-28 rounded-[2rem] border border-white/70 bg-white/50 shadow-sm md:block"></div>
        <div className="absolute bottom-6 right-20 hidden h-16 w-16 rounded-[1.5rem] border border-rose-100 bg-rose-100/40 md:block"></div>
        <div className="relative p-5 md:p-7">
           
           <div className="flex flex-col lg:flex-row justify-between items-center gap-6 md:gap-10">
              <div className="space-y-3 text-center lg:text-left flex-1">
                 <div className="flex items-center justify-center lg:justify-start">
                    <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-white/80 px-3 py-1.5 text-[11px] font-extrabold text-rose-600 shadow-sm">
                      <Sparkles size={13} /> Ertangi reja
                    </span>
                 </div>
                 <h4 className="text-2xl md:text-[34px] font-extrabold tracking-tight leading-tight text-brand-depth">
                   {isTomorrowWeekend ? 'Ertaga dam olish kuni' : "Ertaga farzandingiz bog'chaga boradimi?"}
                 </h4>
                 <p className="text-[13px] md:text-[15px] font-medium leading-relaxed text-brand-muted max-w-md">
                   {isTomorrowWeekend
                     ? 'Shanba va yakshanba kunlari davomat belgilanmaydi.'
                     : "00:00 gacha bormaydi deb belgilanmasa, kun boshlanganda avtomatik boradi holati tanlanadi."}
                 </p>
              </div>
              
              <div className="w-full lg:w-[360px] space-y-4">
                {isTomorrowWeekend ? (
                  <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-white to-amber-50 p-5 text-amber-700 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100 text-amber-600">
                        <Calendar size={22} />
                      </div>
                      <div>
                        <p className="text-[12px] font-extrabold uppercase">Dam olish kuni</p>
                        <p className="mt-1 text-[13px] font-bold text-amber-800/80">Keladi yoki kelmaydi belgilanmaydi.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex bg-white/80 p-1.5 rounded-2xl border border-rose-100 shadow-sm backdrop-blur-xl">
                       <button 
                         onClick={() => setTomorrowAttending(true)}
                         className={`flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-extrabold text-[12px] transition-all duration-300 ${tomorrowAttending ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200/70' : 'text-brand-muted hover:bg-rose-50 hover:text-rose-600'}`}
                       >
                          <CheckCircle2 size={16} /> Boradi
                       </button>
                       <button 
                         onClick={() => setTomorrowAttending(false)}
                         className={`flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-extrabold text-[12px] transition-all duration-300 ${tomorrowAttending === false ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-200/70' : 'text-brand-muted hover:bg-rose-50 hover:text-rose-600'}`}
                       >
                          <XCircle size={16} /> Yo'q
                       </button>
                    </div>

                    {tomorrowAttending === true && !tomorrowRecord?.status && (
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-[11px] font-extrabold text-emerald-700">
                        Boradi holati qo'lda tanlandi.
                      </div>
                    )}

                    {tomorrowAttending === false && (
                      <div className="space-y-2">
                         <div className="flex items-center gap-2 px-1 text-[11px] font-bold text-rose-600">
                           <AlertCircle size={14} /> Kelmaslik sababini yozing
                         </div>
                         <textarea 
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Sababini kiriting..."
                            className="w-full bg-white/90 border border-rose-100 focus:border-rose-300 rounded-2xl p-4 text-brand-depth font-semibold outline-none transition-all placeholder:text-brand-muted/60 text-sm shadow-sm"
                            rows={2}
                         />
                      </div>
                    )}

                    <button 
                       onClick={handleSave}
                       disabled={isSaving}
                       className="w-full flex items-center justify-center gap-3 rounded-2xl bg-brand-depth px-5 py-4 text-[12px] font-extrabold text-white transition-all shadow-xl shadow-slate-200 hover:bg-rose-600 active:scale-95 disabled:opacity-50"
                     >
                        {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={16} />}
                        Rejani tasdiqlash
                     </button>
                  </>
                )}
              </div>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 md:p-6 rounded-3xl border border-rose-100 shadow-sm group hover:shadow-lg hover:shadow-rose-100/70 transition-all relative overflow-hidden">
             <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${stat.tone.accent}`}></div>
             <div className="absolute -right-10 -bottom-14 h-36 w-36 rounded-[2rem] bg-rose-50 rotate-12"></div>
             <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-105 ${stat.tone.icon}`}>
                   <stat.icon size={24} />
                </div>
                <div className="text-right">
                   <p className="text-[12px] font-extrabold text-brand-depth mb-0.5">{stat.label}</p>
                   <p className="text-[11px] font-medium text-brand-muted">{stat.desc}</p>
                </div>
             </div>

             <div className="relative flex items-end justify-between">
                <p className="text-4xl md:text-[54px] font-extrabold text-brand-depth tracking-tight leading-none">
                   {stat.val}<span className={`text-base md:text-lg ml-1.5 font-extrabold ${stat.tone.text}`}>kun</span>
                </p>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${stat.tone.soft}`}>
                   <TrendingUp size={12} />
                   <span className="text-[10px] font-extrabold">Normal</span>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* 30 Day Calendar */}
      <div className="rounded-3xl border border-rose-100 bg-white p-5 md:p-6 shadow-sm overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-pink-500 via-rose-400 to-amber-300"></div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center shrink-0">
              <Calendar size={22} />
            </div>
            <div>
              <h5 className="text-xl md:text-2xl font-extrabold text-brand-depth leading-tight">30 kunlik davomat kalendari</h5>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-rose-100 bg-white px-3 py-1 text-[12px] font-extrabold text-rose-600 shadow-sm">{currentMonthLabel}</span>
                <p className="text-[13px] font-medium text-brand-muted">Belgilanmagan kunlar kulrang, bormaydigan kunlar qizil, dam olish va bayram kunlari sariq, boradigan kunlar yashil ko'rsatiladi.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: 'Boradi', className: 'bg-emerald-500' },
              { label: "Bormaydi", className: 'bg-rose-500' },
              { label: 'Dam olish', className: 'bg-amber-400' },
              { label: 'Belgilanmagan', className: 'bg-slate-400' }
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 rounded-full border border-rose-100 bg-white px-3 py-1.5 shadow-sm">
                <span className={`h-2.5 w-2.5 rounded-full ${item.className}`}></span>
                <span className="text-[11px] font-extrabold text-brand-depth">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2.5 min-[380px]:grid-cols-5 sm:grid-cols-6 lg:grid-cols-10">
          {calendarDays.map((day) => (
            <div
              key={day.dateKey}
              className={`min-h-[82px] rounded-2xl border p-2.5 text-center shadow-sm transition-all hover:border-rose-200 hover:shadow-md ${calendarTone[day.status]}`}
            >
              <div className="flex items-center justify-between">
                <span className={`h-2.5 w-2.5 rounded-full ${calendarDot[day.status]}`}></span>
                <span className="text-[10px] font-extrabold capitalize opacity-75">{day.weekday}</span>
              </div>
              <p className="mt-2 text-2xl font-extrabold leading-none text-white drop-shadow-sm">{day.day}</p>
              <p className="mt-1 h-4 truncate text-[9px] font-extrabold opacity-90">{getCalendarStatusLabel(day)}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};



