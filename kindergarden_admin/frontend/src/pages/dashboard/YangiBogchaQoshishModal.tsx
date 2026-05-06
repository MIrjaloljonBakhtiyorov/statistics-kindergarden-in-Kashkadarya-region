import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Building2, UserRound, Baby, UsersRound, UtensilsCrossed, Warehouse, 
  MapPin, Settings, CheckCircle2, Save, AlertCircle, ChevronRight, X,
  ShieldCheck, HeartPulse, Map as MapIcon, FileText, Activity, Zap, TrendingUp, Wallet
} from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { kindergartenApi } from '../../api/apiClient';

// --- VALIDATION SCHEMA ---
const formSchema = z.object({
    // Step 1: Asosiy
    name: z.string().min(3, "Bog‘cha nomi majburiy"),
    type: z.enum(['Public', 'Private', 'Home']),
    district: z.string().min(1, "Tumanni tanlang"),
    address: z.string().min(5, "Manzil majburiy"),
    // Step 2: Mas'ul
    directorName: z.string().min(3, "F.I.O majburiy"),
    phone: z.string().regex(/^\+998\d{9}$/, "Format: +998XXXXXXXXX"),
    email: z.string().email("Email noto‘g‘ri"),
    position: z.string().min(2, "Lavozim majburiy"),
    username: z.string().min(3, "Username majburiy"),
    // Step 3: Sig'im
    capacity: z.coerce.number().min(1, "Sig'im 0 dan katta bo'lishi kerak"),
    currentChildren: z.coerce.number().min(0),
    groups: z.coerce.number().min(1, "Kamida 1 ta guruh"),
    age13: z.boolean().default(false),
    age37: z.boolean().default(false),
    // Step 4: Xodimlar
    educators: z.coerce.number().min(0),
    cooks: z.coerce.number().min(0),
    techStaff: z.coerce.number().min(0),
    hasNurse: z.boolean().default(false),
    // Step 5: Taomnoma
    mealType: z.enum(['3 mahal', '4 mahal']),
    sanitation: z.enum(['Yaxshi', 'O‘rtacha', 'Past']),
    water: z.enum(['Mavjud', 'Mavjud emas']),
    kitchenEq: z.enum(['To‘liq', 'Qisman', 'Yo‘q']),
    hasKitchen: z.boolean().default(true),
    hasAllergyMenu: z.boolean().default(false),
    hasDietMenu: z.boolean().default(false),
    // Step 6: Ombor & Moliya
    hasWarehouse: z.boolean().default(false),
    warehouseManager: z.string().optional(),
    avgConsumption: z.coerce.number().optional(),
    financeType: z.enum(['Davlat', 'Xususiy', 'Aralash']),
    budget: z.coerce.number().min(0),
    // Step 7: Geo
    lat: z.coerce.number(),
    lng: z.coerce.number(),
    // Step 8: Sozlamalar
    status: z.enum(['Aktiv', 'Noaktiv']).default('Aktiv'),
    aiMonitoring: z.boolean().default(true),
    threshold: z.coerce.number().min(0).max(100).default(75),
}).refine(data => data.currentChildren <= data.capacity, {
    message: "Bolalar soni sig'imdan oshmasligi kerak",
    path: ["currentChildren"]
}).refine(data => data.age13 || data.age37, {
    message: "Kamida bitta yosh toifasini tanlang",
    path: ["age13"]
});

const STEPS = [
  { id: 1, title: "Asosiy", icon: Building2 },
  { id: 2, title: "Rahbar", icon: UserRound },
  { id: 3, title: "Bolalar", icon: Baby },
  { id: 4, title: "Xodimlar", icon: UsersRound },
  { id: 5, title: "Sanitariya", icon: UtensilsCrossed },
  { id: 6, title: "Moliya", icon: Warehouse },
  { id: 7, title: "Hujjatlar", icon: FileText },
  { id: 8, title: "Preview", icon: Settings },
];

const DISTRICTS = [
    "Qarshi shahri", "Qarshi tumani", "Shahrisabz shahri", "Shahrisabz tumani",
    "Kitob tumani", "Koson tumani", "Muborak tumani", "G‘uzor tumani",
    "Nishon tumani", "Dehqonobod tumani", "Qamashi tumani", "Chiroqchi tumani", 
    "Kasbi tumani", "Mirishkor tumani"
];

// --- REUSABLE COMPONENTS ---
const FormField = ({ name, label, placeholder, type = "text", options = null, isTextArea = false, disabled = false }: any) => {
  const { register, formState: { errors, touchedFields } } = useFormContext();
  const error = errors[name];
  const isValid = touchedFields[name] && !error;

  return (
    <div className="space-y-1.5 group">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
        {label} {isValid && <CheckCircle2 size={12} className="text-emerald-500" />}
      </label>
      <div className="relative">
        {options ? (
          <select {...register(name)} disabled={disabled} className={clsx("w-full p-4 rounded-2xl border-2 transition-all outline-none font-bold text-sm appearance-none", disabled ? "bg-slate-50 text-slate-400" : error ? "border-rose-500 bg-rose-50" : isValid ? "border-emerald-500 bg-emerald-50" : "border-slate-100 focus:border-indigo-500")}>
            <option value="">Tanlang...</option>
            {options.map((opt: any) => <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>)}
          </select>
        ) : isTextArea ? (
            <textarea {...register(name)} placeholder={placeholder} className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold text-sm min-h-[100px]" />
        ) : (
          <input {...register(name)} type={type} disabled={disabled} placeholder={placeholder} className={clsx("w-full p-4 rounded-2xl border-2 transition-all outline-none font-bold text-sm", disabled ? "bg-slate-50 text-slate-400" : error ? "border-rose-500 bg-rose-50" : isValid ? "border-emerald-500 bg-emerald-50" : "border-slate-100 focus:border-indigo-500")} />
        )}
        {error && <AlertCircle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500" />}
      </div>
      {error && <p className="text-[10px] font-bold text-rose-500 ml-1">{error.message as string}</p>}
    </div>
  );
};

const SummaryCard = ({ icon: Icon, title, data }: any) => (
    <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Icon size={20}/></div>
            <h4 className="font-black text-slate-900 text-[11px] uppercase tracking-widest">{title}</h4>
        </div>
        <div className="space-y-2">
            {Object.entries(data).map(([key, val]: any) => (
                <div key={key} className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 font-bold uppercase">{key}:</span>
                    <span className="text-xs font-black text-slate-800">{val || '—'}</span>
                </div>
            ))}
        </div>
    </div>
);

// --- MAIN MODAL ---
export const YangiBogchaQoshishModal = ({ onClose, onSave, initialData = null }: any) => {
  const [step, setStep] = useState(1);
  const isEdit = !!initialData;
  const autoPassword = useMemo(() => initialData?.password || Math.random().toString(36).slice(-10).toUpperCase(), [initialData]);
  
  const methods = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: initialData || { 
        type: 'Public', mealType: '3 mahal', sanitation: 'Yaxshi', water: 'Mavjud', 
        kitchenEq: 'To‘liq', financeType: 'Davlat', threshold: 75, status: 'Aktiv',
        age13: true, age37: true, aiMonitoring: true, budget: 0, lat: 38.8611, lng: 65.7847
    }
  });

  const { watch, handleSubmit, trigger } = methods;
  const allValues = watch();

  const completionPercentage = useMemo(() => {
    const required = ['name', 'district', 'address', 'directorName', 'phone', 'username', 'capacity', 'currentChildren', 'budget'];
    const filled = required.filter(f => !!allValues[f as keyof typeof allValues]).length;
    return Math.round((filled / required.length) * 100);
  }, [allValues]);

  const handleNext = async () => {
    const stepFields: any = {
        1: ['name', 'type', 'district', 'address'],
        2: ['directorName', 'phone', 'email', 'position', 'username'],
        3: ['capacity', 'currentChildren', 'groups', 'age13', 'age37'],
        4: ['educators', 'cooks', 'techStaff'],
        5: ['mealType', 'sanitation', 'water', 'kitchenEq'],
        6: ['financeType', 'budget'],
        7: ['lat', 'lng']
    };
    const isValid = await trigger(stepFields[step] || []);
    if (isValid) setStep(prev => Math.min(prev + 1, 8));
  };

  const onSubmit = async (data: any) => {
    try {
        if (isEdit) {
            await kindergartenApi.update(initialData.id, {
                ...data,
                password: autoPassword
            });
            toast.success("Bog'cha ma'lumotlari muvaffaqiyatli yangilandi!");
        } else {
            await kindergartenApi.create({ 
                ...data, 
                password: autoPassword,
                system_id: `MTT-${Date.now().toString().slice(-6)}`,
                rating: 100
            });
            toast.success("Yangi bog'cha muvaffaqiyatli qo'shildi!");
        }
        onSave();
        onClose();
    } catch (e) { 
        console.error("Error saving kindergarten:", e);
        toast.error("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring."); 
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/20 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-[32px] sm:rounded-[48px] shadow-2xl w-full max-w-6xl h-[95vh] sm:h-[92vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-50/50 px-6 sm:px-12 py-6 sm:py-8 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-1">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{isEdit ? 'Bog‘cha tahrirlash' : 'Bog‘cha qo‘shish'}</h2>
                        <span className="px-2.5 py-1 bg-indigo-600 text-white text-[8px] sm:text-[9px] font-black uppercase rounded-full tracking-widest">{isEdit ? 'Update' : 'Master'}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest">Qashqadaryo viloyati monitoringi</p>
                </div>
                <div className="flex items-center gap-3 sm:text-right">
                    <div className="text-2xl sm:text-3xl font-black text-indigo-600 tracking-tighter">{completionPercentage}%</div>
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest sm:w-20">To‘ldirish darajasi</p>
                </div>
            </div>

            {/* Stepper */}
            <div className="relative flex justify-between overflow-x-auto no-scrollbar pb-2 px-1">
                <div className="absolute top-5 sm:top-1/2 left-0 w-full h-0.5 bg-slate-200 sm:-translate-y-1/2 z-0" />
                <motion.div animate={{ width: `${(step - 1) * (100 / 7)}%` }} className="absolute top-5 sm:top-1/2 left-0 h-1 bg-indigo-600 sm:-translate-y-1/2 z-10 rounded-full" />
                
                {STEPS.map((s) => (
                    <div key={s.id} className="relative z-20 flex flex-col items-center gap-2 sm:gap-3 shrink-0 px-2 sm:px-0">
                        <motion.div 
                          animate={{ scale: step === s.id ? 1.1 : 1, backgroundColor: step >= s.id ? '#4f46e5' : '#ffffff', color: step >= s.id ? '#ffffff' : '#94a3b8' }} 
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg border-4 border-white transition-all shrink-0"
                        >
                            {step > s.id ? <CheckCircle2 size={16} /> : <s.icon size={16} className="sm:w-5 sm:h-5" />}
                        </motion.div>
                        <span className={clsx("text-[7px] sm:text-[9px] font-black uppercase tracking-widest", step === s.id ? "text-indigo-600" : "text-slate-400")}>{s.title}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-12 bg-[#FDFDFF]">
            <FormProvider {...methods}>
                <AnimatePresence mode="wait">
                    <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 sm:gap-y-8">
                        {step === 1 && (<>
                            <FormField name="name" label="Bog‘cha nomi *" placeholder="Masalan: 12-sonli MTT" />
                            <FormField name="id_auto" label="Bog‘cha ID" placeholder="Avtomatik" disabled />
                            <FormField name="type" label="Turi *" options={[{label: 'Davlat', value: 'Public'}, {label: 'Xususiy', value: 'Private'}, {label: 'Oilaviy', value: 'Home'}]} />
                            <FormField name="region" label="Viloyat" placeholder="Qashqadaryo" disabled />
                            <FormField name="district" label="Tuman *" options={DISTRICTS} />
                            <div className="md:col-span-2"><FormField name="address" label="Manzil *" isTextArea /></div>
                        </>)}

                        {step === 2 && (<>
                            <FormField name="directorName" label="Direktor F.I.O *" />
                            <FormField name="phone" label="Telefon *" placeholder="+998901234567" />
                            <FormField name="email" label="Email *" placeholder="director@mail.uz" />
                            <FormField name="position" label="Lavozim *" options={['Direktor', 'Admin', 'Mudira']} />
                            <div className="md:col-span-2 p-5 sm:p-8 bg-indigo-50/50 rounded-2xl sm:rounded-[32px] border-2 border-dashed border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="w-full sm:w-1/2"><FormField name="username" label="Username *" /></div>
                                <div className="text-center sm:text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parol (Auto)</p>
                                    <p className="text-lg sm:text-xl font-mono font-black text-indigo-600 tracking-tighter mt-1">{autoPassword}</p>
                                </div>
                            </div>
                        </>)}

                        {step === 3 && (<>
                            <FormField name="capacity" label="Maksimal sig‘im *" type="number" />
                            <FormField name="currentChildren" label="Bolalar soni *" type="number" />
                            <FormField name="groups" label="Guruhlar soni *" type="number" />
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yosh toifalari *</label>
                                <div className="flex gap-2 sm:gap-4">
                                    <label className="flex-1 p-3 sm:p-4 bg-white border-2 border-slate-100 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 cursor-pointer"><input type="checkbox" {...methods.register('age13')} /> <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">1–3 yosh</span></label>
                                    <label className="flex-1 p-3 sm:p-4 bg-white border-2 border-slate-100 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 cursor-pointer"><input type="checkbox" {...methods.register('age37')} /> <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">3–7 yosh</span></label>
                                </div>
                            </div>
                        </>)}

                        {step === 4 && (<>
                            <FormField name="educators" label="Tarbiyachilar *" type="number" />
                            <FormField name="cooks" label="Oshpazlar *" type="number" />
                            <FormField name="techStaff" label="Texnik xodimlar *" type="number" />
                            <div className="flex items-center h-full pt-2">
                                <label className="w-full p-4 sm:p-5 bg-white border-2 border-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-3"><HeartPulse className="text-rose-500 sm:w-5 sm:h-5" size={18} /> <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Hamshira</span></div>
                                    <input type="checkbox" {...methods.register('hasNurse')} className="w-4 h-4 sm:w-5 sm:h-5 accent-indigo-600" />
                                </label>
                            </div>
                        </>)}

                        {step === 5 && (<>
                            <FormField name="mealType" label="Ovqatlanish *" options={['3 mahal', '4 mahal']} />
                            <FormField name="sanitation" label="Sanitariya *" options={['Yaxshi', 'O‘rtacha', 'Past']} />
                            <FormField name="water" label="Suv *" options={['Mavjud', 'Mavjud emas']} />
                            <FormField name="kitchenEq" label="Jihozlar *" options={['To‘liq', 'Qisman', 'Yo‘q']} />
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <label className="p-3 sm:p-4 bg-white border border-slate-100 rounded-xl sm:rounded-2xl flex items-center gap-3"><input type="checkbox" {...methods.register('hasAllergyMenu')} /> <span className="text-[10px] sm:text-xs font-bold">Allergiya menyusi</span></label>
                                <label className="p-3 sm:p-4 bg-white border border-slate-100 rounded-xl sm:rounded-2xl flex items-center gap-3"><input type="checkbox" {...methods.register('hasDietMenu')} /> <span className="text-[10px] sm:text-xs font-bold">Dieta menyusi</span></label>
                            </div>
                        </>)}

                        {step === 6 && (<>
                            <div className="md:col-span-2"><label className="w-full p-4 sm:p-5 bg-indigo-50 border border-indigo-100 rounded-xl sm:rounded-2xl flex items-center justify-between cursor-pointer"><div className="flex items-center gap-3"><Warehouse className="text-indigo-600 sm:w-5 sm:h-5" size={18} /> <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Omborxona</span></div><input type="checkbox" {...methods.register('hasWarehouse')} /></label></div>
                            {allValues.hasWarehouse && <FormField name="warehouseManager" label="Ombor mas’uli" />}
                            <FormField name="financeType" label="Moliyalashtirish *" options={['Davlat', 'Xususiy', 'Aralash']} />
                            <FormField name="budget" label="Byudjet *" type="number" />
                        </>)}

                        {step === 7 && (<>
                            <div className="md:col-span-2 p-5 sm:p-8 bg-blue-50 border border-blue-100 rounded-2xl sm:rounded-[32px] flex items-center gap-4 sm:gap-6 mb-2">
                                <div className="p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl shadow-sm text-blue-600 shrink-0"><MapIcon size={24} className="sm:w-8 sm:h-8" /></div>
                                <div><h4 className="font-black text-blue-900 text-xs sm:text-sm">Geo-location</h4><p className="text-[10px] sm:text-xs text-blue-800/60 font-medium">Xarita tahlili uchun koordinatalar.</p></div>
                            </div>
                            <FormField name="lat" label="Latitude *" type="number" step="0.0001" />
                            <FormField name="lng" label="Longitude *" type="number" step="0.0001" />
                        </>)}

                        {step === 8 && (
                            <div className="md:col-span-2 space-y-6 sm:space-y-8 pb-6 sm:pb-10">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                    <SummaryCard icon={Building2} title="Asosiy" data={{'Nomi': allValues.name, 'Turi': allValues.type}} />
                                    <SummaryCard icon={UserRound} title="Rahbar" data={{'F.I.O': allValues.directorName, 'Login': allValues.username}} />
                                    <SummaryCard icon={Baby} title="Sig'im" data={{'Soni': allValues.capacity, 'Bolalar': allValues.currentChildren}} />
                                    <SummaryCard icon={Activity} title="Sanitariya" data={{'Holat': allValues.sanitation, 'Suv': allValues.water}} />
                                    <SummaryCard icon={Wallet} title="Moliya" data={{'Turi': allValues.financeType, 'Byudjet': allValues.budget.toLocaleString()}} />
                                    <SummaryCard icon={Zap} title="Tizim" data={{'AI': allValues.aiMonitoring ? 'ON' : 'OFF', 'Alert': `${allValues.threshold}%`}} />
                                </div>
                                <div className="p-5 sm:p-8 bg-slate-900 rounded-2xl sm:rounded-[40px] text-white flex flex-col lg:flex-row items-center justify-between gap-4">
                                    <div><h3 className="text-xl sm:text-2xl font-black tracking-tight">Tayyor!</h3><p className="text-white/50 text-xs sm:text-sm">Ma'lumotlarni tasdiqlang.</p></div>
                                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                        <FormField name="status" label="Status" options={['Aktiv', 'Noaktiv']} />
                                        <FormField name="threshold" label="Alert %" type="number" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </FormProvider>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-12 py-6 sm:py-8 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <button onClick={onClose} className="text-[10px] sm:text-xs font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Bekor qilish</button>
            <div className="flex items-center gap-3 sm:gap-4">
                {step > 1 && <button onClick={() => setStep(prev => prev - 1)} className="px-4 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 font-black text-[10px] sm:text-xs text-slate-600 hover:bg-white transition-all uppercase whitespace-nowrap">Orqaga</button>}
                {step < 8 ? (
                    <button onClick={handleNext} className="px-6 sm:px-12 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-900 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 sm:gap-3 shadow-xl whitespace-nowrap">Keyingisi <ChevronRight size={16} /></button>
                ) : (
                    <button onClick={handleSubmit(onSubmit)} className="px-6 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-emerald-600 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 sm:gap-3 shadow-xl whitespace-nowrap"><Save size={16} /> Saqlash</button>
                )}
            </div>
        </div>
      </motion.div>
    </div>
  );
};
