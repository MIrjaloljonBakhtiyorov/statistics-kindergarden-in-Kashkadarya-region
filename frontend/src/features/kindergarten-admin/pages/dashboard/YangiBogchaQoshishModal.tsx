import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Building2, UserRound, Baby, UsersRound, UtensilsCrossed, Warehouse, 
  Settings, CheckCircle2, Save, AlertCircle, ChevronRight,
  FileText, Activity, Wallet
} from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { apiClient, kindergartenApi } from '@/shared/api';

// --- VALIDATION SCHEMA ---
const requiredEnum = <T extends [string, ...string[]]>(values: T, message: string) =>
  z.preprocess(
    (value) => value === '' ? undefined : value,
    z.enum(values, { error: message })
  );

const requiredNumber = (message: string) =>
  z.preprocess(
    (value) => value === '' || value == null ? undefined : value,
    z.coerce.number({ error: message })
  );

const formSchema = z.object({
    // Step 1: Asosiy
    name: z.string().min(3, "Bog'cha nomi majburiy"),
    type: requiredEnum(['Public', 'Private', 'Home'], "Bog'cha turini tanlang"),
    workHours: z.coerce.number().refine((value) => [4, 9, 9.5, 10.5, 12, 24].includes(value), "Ish vaqti turini tanlang"),
    district: z.string().min(1, "Tumanni tanlang"),
    licenseFile: z.string().optional(),
    brokerageDocumentFile: z.string().optional(),
    commissionOrder: z.string().optional(),
    commissionApprovedDate: z.string().optional(),
    commissionValidUntil: z.string().optional(),
    address: z.string().min(5, "Manzil majburiy"),
    // Step 2: Mas'ul
    directorName: z.string().min(3, "F.I.O majburiy"),
    directorBirthYear: z.coerce.number().min(1940, "Tug'ilgan yil noto'g'ri").max(new Date().getFullYear() - 18, "Rahbar yoshi 18 dan katta bo'lishi kerak"),
    directorPhoto: z.string().optional(),
    phone: z.string().regex(/^\+998\d{9}$/, "Format: +998XXXXXXXXX"),
    email: z.string().email("Email noto'g'ri"),
    position: z.string().min(2, "Lavozim majburiy"),
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
    nurseCount: z.coerce.number().min(0),
    hasNurse: z.boolean().default(false),
    // Step 5: Taomnoma
    mealType: requiredEnum(['3 mahal', '4 mahal'], "Ovqatlanish turini tanlang"),
    sanitation: requiredEnum(['Yaxshi', "O'rtacha", 'Past'], "Sanitariya holatini tanlang"),
    water: requiredEnum(['Mavjud', 'Mavjud emas'], "Suv holatini tanlang"),
    kitchenEq: requiredEnum(["To'liq", 'Qisman', "Yo'q"], "Jihozlar holatini tanlang"),
    hasKitchen: z.boolean().default(true),
    hasAllergyMenu: z.boolean().default(false),
    hasDietMenu: z.boolean().default(false),
    // Step 6: Ombor & Moliya
    hasWarehouse: z.boolean().default(false),
    warehouseManager: z.string().optional(),
    avgConsumption: z.coerce.number().optional(),
    financeType: requiredEnum(['Davlat', 'Xususiy', 'Aralash'], "Moliyalashtirish turini tanlang"),
    budget: requiredNumber("Byudjetni kiriting").refine((value) => value >= 0, "Byudjet 0 dan kam bo'lmasligi kerak"),
}).refine(data => data.currentChildren <= data.capacity, {
    message: "Bolalar soni sig'imdan oshmasligi kerak",
    path: ["currentChildren"]
}).refine(data => data.age13 || data.age37, {
    message: "Kamida bitta yosh toifasini tanlang",
    path: ["age13"]
}).refine(data => !data.commissionApprovedDate || !data.commissionValidUntil || data.commissionValidUntil >= data.commissionApprovedDate, {
    message: "Amal qilish muddati tasdiqlangan sanadan oldin bo'lmasligi kerak",
    path: ["commissionValidUntil"]
});

const STEPS = [
  { id: 1, title: "Asosiy", icon: Building2 },
  { id: 2, title: "Rahbar", icon: UserRound },
  { id: 3, title: "Bolalar", icon: Baby },
  { id: 4, title: "Xodimlar", icon: UsersRound },
  { id: 5, title: "Sanitariya", icon: UtensilsCrossed },
  { id: 6, title: "Moliya", icon: Warehouse },
  { id: 7, title: "Hujjatlar", icon: FileText },
  { id: 8, title: "Ko'rib chiqish", icon: Settings },
];

const DISTRICTS = [
    "Qarshi shahri", "Qarshi tumani", "Shahrisabz shahri", "Shahrisabz tumani",
    "Kitob tumani", "Koson tumani", "Muborak tumani", "G'uzor tumani",
    "Nishon tumani", "Dehqonobod tumani", "Qamashi tumani", "Chiroqchi tumani", 
    "Kasbi tumani", "Mirishkor tumani", "Yakkabog' tumani", "Ko'kdala tumani"
];

const WORK_HOUR_OPTIONS = [
  { label: '4 soatlik', value: 4 },
  { label: '9-10.5 soatlik', value: 9.5 },
  { label: '12 soatlik', value: 12 },
  { label: '24 soatlik', value: 24 },
];

const CREATE_DEFAULT_VALUES = {
  name: '',
  type: '',
  workHours: '',
  district: '',
  licenseFile: '',
  brokerageDocumentFile: '',
  commissionOrder: '',
  commissionApprovedDate: '',
  commissionValidUntil: '',
  address: '',
  directorName: '',
  directorBirthYear: '',
  directorPhoto: '',
  phone: '',
  email: '',
  position: '',
  capacity: '',
  currentChildren: '',
  groups: '',
  age13: false,
  age37: false,
  educators: '',
  cooks: '',
  techStaff: '',
  nurseCount: '',
  hasNurse: false,
  mealType: '',
  sanitation: '',
  water: '',
  kitchenEq: '',
  hasKitchen: true,
  hasAllergyMenu: false,
  hasDietMenu: false,
  hasWarehouse: false,
  warehouseManager: '',
  avgConsumption: '',
  financeType: '',
  budget: '',
};

const makeLoginPreview = (name: string) => {
  const slug = String(name || '')
    .toLowerCase()
    .replace(/[СћУЇ]/g, 'o')
    .replace(/[Т“]/g, 'g')
    .replace(/[Т›]/g, 'q')
    .replace(/[Ті]/g, 'h')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
  return slug ? `mtt_${slug}` : "Bog'cha nomidan avtomatik";
};

const toAbsoluteAssetUrl = (url: string) => {
  if (!url || url.startsWith('http') || url.startsWith('data:')) return url;
  const apiRoot = String(apiClient.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return `${apiRoot}${url.startsWith('/') ? '' : '/'}${url}`;
};

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
                    <span className="text-xs font-black text-slate-800">{val || '-'}</span>
                </div>
            ))}
        </div>
    </div>
);

// --- MAIN MODAL ---
export const YangiBogchaQoshishModal = ({ onClose, onSave, initialData = null }: any) => {
  const [step, setStep] = useState(1);
  const isEdit = !!initialData;
  const methods = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: initialData ? {
        ...initialData,
        nurseCount: Number(initialData.nurseCount || 0),
        workHours: [9, 10.5].includes(Number(initialData.workHours)) ? 9.5 : Number(initialData.workHours || 9.5),
        brokerageDocumentFile: initialData.brokerageDocumentFile || '',
        commissionOrder: initialData.commissionOrder || '',
        commissionApprovedDate: initialData.commissionApprovedDate || '',
        commissionValidUntil: initialData.commissionValidUntil || '',
    } : CREATE_DEFAULT_VALUES
  });

  const { watch, handleSubmit, trigger, setError, reset } = methods;

  useEffect(() => {
    if (!isEdit) {
      reset(CREATE_DEFAULT_VALUES);
    }
  }, [isEdit, reset]);

  const allValues = watch();
  const credentialPreview = useMemo(() => ({
    systemId: initialData?.system_id || "Saqlanganda yaratiladi",
    username: initialData?.username || makeLoginPreview(allValues.name),
    password: initialData?.password || "ID asosida avtomatik",
  }), [allValues.name, initialData]);

  const completionPercentage = useMemo(() => {
    const hasText = (field: string) => String(allValues?.[field] ?? '').trim().length > 0;
    const hasNumber = (field: string, positiveOnly = false) => {
      const value = allValues?.[field];
      if (value === '' || value == null) return false;
      const numberValue = Number(value);
      return Number.isFinite(numberValue) && (positiveOnly ? numberValue > 0 : numberValue >= 0);
    };
    const hasSelected = (field: string) => hasText(field);

    const progressItems = [
      { weight: 5, done: hasText('name') },
      { weight: 4, done: hasSelected('type') },
      { weight: 4, done: hasNumber('workHours', true) },
      { weight: 4, done: hasSelected('district') },
      { weight: 5, done: hasText('address') },
      { weight: 5, done: hasText('directorName') },
      { weight: 4, done: hasNumber('directorBirthYear', true) },
      { weight: 5, done: hasText('phone') },
      { weight: 4, done: hasText('email') },
      { weight: 4, done: hasSelected('position') },
      { weight: 5, done: hasNumber('capacity', true) },
      { weight: 5, done: hasNumber('currentChildren') },
      { weight: 4, done: hasNumber('groups', true) },
      { weight: 4, done: Boolean(allValues?.age13 || allValues?.age37) },
      { weight: 4, done: hasNumber('educators') },
      { weight: 4, done: hasNumber('cooks') },
      { weight: 4, done: hasNumber('techStaff') },
      { weight: 4, done: hasNumber('nurseCount') },
      { weight: 4, done: hasSelected('mealType') },
      { weight: 4, done: hasSelected('sanitation') },
      { weight: 4, done: hasSelected('water') },
      { weight: 4, done: hasSelected('kitchenEq') },
      { weight: 3, done: hasSelected('financeType') },
      { weight: 3, done: hasNumber('budget') },
    ];

    const totalWeight = progressItems.reduce((sum, item) => sum + item.weight, 0);
    const completedWeight = progressItems.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
    return Math.min(100, Math.round((completedWeight / totalWeight) * 100));
  }, [allValues]);

  const handleNext = async () => {
    const stepFields: any = {
        1: ['name', 'type', 'workHours', 'district', 'address'],
        2: ['directorName', 'directorBirthYear', 'phone', 'email', 'position'],
        3: ['capacity', 'currentChildren', 'groups', 'age13', 'age37'],
        4: ['educators', 'cooks', 'techStaff', 'nurseCount'],
        5: ['mealType', 'sanitation', 'water', 'kitchenEq'],
        6: ['financeType', 'budget'],
        7: ['brokerageDocumentFile', 'commissionOrder', 'commissionApprovedDate', 'commissionValidUntil']
    };
    const isValid = await trigger(stepFields[step] || []);
    if (isValid) setStep(prev => Math.min(prev + 1, 8));
  };

  const onSubmit = async (data: any) => {
    try {
        const nurseCount = Number(data.nurseCount || 0);
        const payload = {
            ...data,
            nurseCount,
            hasNurse: Boolean(data.hasNurse || nurseCount > 0),
            hasDietMenu: false,
            lat: initialData?.lat ?? null,
            lng: initialData?.lng ?? null,
            status: initialData?.status || 'Active',
            aiMonitoring: initialData?.aiMonitoring ?? true,
            threshold: initialData?.threshold ?? 75,
        };
        if (isEdit) {
            await kindergartenApi.update(initialData.id, {
                ...payload,
                system_id: initialData.system_id,
                username: initialData.username,
                password: initialData.password
            });
            toast.success("Bog'cha ma'lumotlari muvaffaqiyatli yangilandi!");
        } else {
            await kindergartenApi.create({ 
                ...payload, 
                rating: 100
            });
            toast.success("Yangi bog'cha muvaffaqiyatli qo'shildi!");
        }
        onSave();
        onClose();
    } catch (e: any) { 
        console.error("Error saving kindergarten:", e);
        const message = e?.response?.data?.error || e?.response?.data?.message || "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.";
        if (e?.response?.status === 409) {
            setStep(2);
            setError('name', { type: 'server', message });
        }
        toast.error(message); 
    }
  };

  const getStepByField = (field: string) => {
    const fieldSteps: Record<string, number> = {
      name: 1, type: 1, workHours: 1, district: 1, address: 1,
      directorName: 2, phone: 2, email: 2, position: 2,
      directorBirthYear: 2, directorPhoto: 2,
      capacity: 3, currentChildren: 3, groups: 3, age13: 3, age37: 3,
      educators: 4, cooks: 4, techStaff: 4, nurseCount: 4,
      mealType: 5, sanitation: 5, water: 5, kitchenEq: 5,
      financeType: 6, budget: 6,
      brokerageDocumentFile: 7, commissionOrder: 7, commissionApprovedDate: 7, commissionValidUntil: 7,
    };
    return fieldSteps[field] || 1;
  };

  const onInvalid = (errors: any) => {
    const firstField = Object.keys(errors)[0];
    if (firstField) {
      setStep(getStepByField(firstField));
      toast.error(errors[firstField]?.message || "Ma'lumotlarni tekshirib qayta urinib ko'ring.");
      return;
    }
    toast.error("Ma'lumotlarni tekshirib qayta urinib ko'ring.");
  };

  const handleBrokerageDocumentUpload = async (file?: File) => {
    if (!file) return;
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Brokerlash hujjati PDF yoki rasm formatida bo'lishi kerak");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Brokerlash hujjati hajmi 8 MB dan oshmasin');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      methods.setValue('brokerageDocumentFile', toAbsoluteAssetUrl(response.data?.url || ''), { shouldDirty: true, shouldValidate: true });
      toast.success('Brokerlash hujjati yuklandi');
    } catch {
      toast.error('Brokerlash hujjatini yuklashda xatolik yuz berdi');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-transparent">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-[1px] shadow-2xl w-full max-w-6xl h-[95vh] sm:h-[92vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-50/50 px-6 sm:px-12 py-6 sm:py-8 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-1">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{isEdit ? "Bog'cha tahrirlash" : "Bog'cha qo'shish"}</h2>
                        <span className="px-2.5 py-1 bg-indigo-600 text-white text-[8px] sm:text-[9px] font-black uppercase rounded-full tracking-widest">{isEdit ? 'Tahrirlash' : 'Yaratish'}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest">Qashqadaryo viloyati monitoringi</p>
                </div>
                <div className="flex items-center gap-3 sm:text-right">
                    <div className="text-2xl sm:text-3xl font-black text-indigo-600 tracking-tighter">{completionPercentage}%</div>
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest sm:w-20">To'ldirish darajasi</p>
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
                            <FormField name="name" label="Bog'cha nomi *" placeholder="Masalan: 12-sonli MTT" />
                            <FormField name="id_auto" label="Bog'cha ID" placeholder={credentialPreview.systemId} disabled />
                            <FormField name="type" label="Turi *" options={[{label: 'Davlat', value: 'Public'}, {label: 'Xususiy', value: 'Private'}, {label: 'Oilaviy', value: 'Home'}]} />
                            <FormField name="workHours" label="Ish vaqti turi *" options={WORK_HOUR_OPTIONS} />
                            <FormField name="region" label="Viloyat" placeholder="Qashqadaryo" disabled />
                            <FormField name="district" label="Tuman *" options={DISTRICTS} />
                            <div className="md:col-span-2"><FormField name="address" label="Manzil *" isTextArea /></div>
                        </>)}

                        {step === 2 && (<>
                            <FormField name="directorName" label="Direktor F.I.O *" />
                            <FormField name="directorBirthYear" label="Tug'ilgan yili *" type="number" placeholder="Masalan: 1985" />
                            <FormField name="phone" label="Telefon *" placeholder="+998901234567" />
                            <FormField name="email" label="Email *" placeholder="director@mail.uz" />
                            <FormField name="position" label="Lavozim *" options={['Direktor', 'Admin', 'Mudira']} />
                        </>)}

                        {step === 3 && (<>
                            <FormField name="capacity" label="Maksimal sig'im *" type="number" />
                            <FormField name="currentChildren" label="Bolalar soni *" type="number" />
                            <FormField name="groups" label="Guruhlar soni *" type="number" />
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yosh toifalari *</label>
                                <div className="flex gap-2 sm:gap-4">
                                    <label className="flex-1 p-3 sm:p-4 bg-white border-2 border-slate-100 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 cursor-pointer"><input type="checkbox" {...methods.register('age13')} /> <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">1-3 yosh</span></label>
                                    <label className="flex-1 p-3 sm:p-4 bg-white border-2 border-slate-100 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 cursor-pointer"><input type="checkbox" {...methods.register('age37')} /> <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">3-7 yosh</span></label>
                                </div>
                            </div>
                        </>)}

                        {step === 4 && (<>
                            <FormField name="educators" label="Tarbiyachilar *" type="number" />
                            <FormField name="cooks" label="Oshpazlar *" type="number" />
                            <FormField name="techStaff" label="Texnik xodimlar *" type="number" />
                            <FormField name="nurseCount" label="Hamshiralar soni *" type="number" />
                        </>)}

                        {step === 5 && (<>
                            <FormField name="mealType" label="Ovqatlanish *" options={['3 mahal', '4 mahal']} />
                            <FormField name="sanitation" label="Sanitariya *" options={['Yaxshi', "O'rtacha", 'Past']} />
                            <FormField name="water" label="Suv *" options={['Mavjud', 'Mavjud emas']} />
                            <FormField name="kitchenEq" label="Jihozlar *" options={["To'liq", 'Qisman', "Yo'q"]} />
                            <div className="md:col-span-2">
                                <label className="p-3 sm:p-4 bg-white border border-slate-100 rounded-xl sm:rounded-2xl flex items-center gap-3"><input type="checkbox" {...methods.register('hasAllergyMenu')} /> <span className="text-[10px] sm:text-xs font-bold">Allergiya menyusi</span></label>
                            </div>
                        </>)}

                        {step === 6 && (<>
                            <div className="md:col-span-2"><label className="w-full p-4 sm:p-5 bg-indigo-50 border border-indigo-100 rounded-xl sm:rounded-2xl flex items-center justify-between cursor-pointer"><div className="flex items-center gap-3"><Warehouse className="text-indigo-600 sm:w-5 sm:h-5" size={18} /> <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Omborxona</span></div><input type="checkbox" {...methods.register('hasWarehouse')} /></label></div>
                            {allValues.hasWarehouse && <FormField name="warehouseManager" label="Ombor mas'uli" />}
                            <FormField name="financeType" label="Moliyalashtirish *" options={['Davlat', 'Xususiy', 'Aralash']} />
                            <FormField name="budget" label="Byudjet *" type="number" />
                        </>)}

                        {step === 7 && (<>
                            <div className="md:col-span-2 p-5 sm:p-8 bg-indigo-50 border border-indigo-100 rounded-2xl sm:rounded-[32px] flex items-center gap-4 sm:gap-6">
                                <div className="p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl shadow-sm text-indigo-600 shrink-0"><FileText size={24} className="sm:w-8 sm:h-8" /></div>
                                <div><h4 className="font-black text-indigo-900 text-xs sm:text-sm">Hujjatlar</h4><p className="text-[10px] sm:text-xs text-indigo-800/60 font-medium">Brokerlash komissiyasi buyrug'i, tasdiqlangan kuni va amal qilish muddatini kiriting.</p></div>
                            </div>
                            <label className="md:col-span-2 cursor-pointer p-5 sm:p-6 bg-white rounded-2xl border-2 border-dashed border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <input type="file" accept="application/pdf,image/*" className="hidden" onChange={(event) => handleBrokerageDocumentUpload(event.target.files?.[0])} />
                                <div>
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Brokerlash hujjati</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1">PDF yoki rasm yuklang. Fayl real bazaga URL sifatida yoziladi.</p>
                                </div>
                                <span className={clsx("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest", allValues.brokerageDocumentFile ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500")}>
                                  {allValues.brokerageDocumentFile ? 'Yuklangan' : 'Yuklash'}
                                </span>
                            </label>
                            <FormField name="commissionOrder" label="Brokerlash komissiyasi buyrug'i" placeholder="Masalan: 12-AB sonli buyruq" />
                            <FormField name="commissionApprovedDate" label="Tasdiqlangan kuni" type="date" />
                            <FormField name="commissionValidUntil" label="Amal qilish muddati" type="date" />
                        </>)}

                        {step === 8 && (
                            <div className="md:col-span-2 space-y-6 sm:space-y-8 pb-6 sm:pb-10">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                    <SummaryCard icon={Building2} title="Asosiy" data={{'Nomi': allValues.name, 'Turi': allValues.type}} />
                                    <SummaryCard icon={FileText} title="Hujjatlar" data={{'Brokerlash': allValues.brokerageDocumentFile ? 'Yuklangan' : "Yo'q", 'Buyruq': allValues.commissionOrder || 'Kiritilmagan', 'Tasdiqlangan kuni': allValues.commissionApprovedDate || 'Kiritilmagan', 'Muddat': allValues.commissionValidUntil || 'Kiritilmagan'}} />
                                    <SummaryCard icon={UserRound} title="Rahbar" data={{'F.I.O': allValues.directorName, 'Yili': allValues.directorBirthYear, 'Login': credentialPreview.username}} />
                                    <SummaryCard icon={Baby} title="Sig'im" data={{'Soni': allValues.capacity, 'Bolalar': allValues.currentChildren}} />
                                    <SummaryCard icon={UsersRound} title="Xodimlar" data={{'Tarbiyachi': allValues.educators, 'Hamshira': allValues.nurseCount || 0}} />
                                    <SummaryCard icon={Activity} title="Sanitariya" data={{'Ish vaqti': allValues.workHours ? `${allValues.workHours} soat` : 'Kiritilmagan', 'Holat': allValues.sanitation, 'Suv': allValues.water}} />
                                    <SummaryCard icon={Wallet} title="Moliya" data={{'Turi': allValues.financeType, 'Byudjet': allValues.budget === '' || allValues.budget == null ? 'Kiritilmagan' : Number(allValues.budget).toLocaleString()}} />
                                </div>
                                <div className="p-5 sm:p-8 bg-slate-900 rounded-2xl sm:rounded-[40px] text-white">
                                    <h3 className="text-xl sm:text-2xl font-black tracking-tight">Tayyor!</h3>
                                    <p className="text-white/50 text-xs sm:text-sm mt-1">Ma'lumotlarni tasdiqlang va saqlang.</p>
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
                    <button
                      onClick={handleSubmit(onSubmit, onInvalid)}
                      className="px-6 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-emerald-600 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all flex items-center gap-2 sm:gap-3 shadow-xl whitespace-nowrap hover:bg-emerald-700"
                      title="Saqlash"
                    >
                      <Save size={16} /> Saqlash
                    </button>
                )}
            </div>
        </div>
      </motion.div>
    </div>
  );
};

