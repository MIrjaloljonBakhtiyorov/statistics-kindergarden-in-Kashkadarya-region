import type { AdminApplication, AdminJudge, AdminStage, AdminStat, AdminUser } from "../types";

export const adminStats: AdminStat[] = [
  { label: "Jami foydalanuvchilar", value: "2 486", trend: "+18%", tone: "blue" },
  { label: "Jami ishtirokchilar", value: "1 724", trend: "+12%", tone: "green" },
  { label: "Jami jamoalar", value: "316", trend: "+8%", tone: "purple" },
  { label: "Jami arizalar", value: "1 108", trend: "+21%", tone: "gold" },
  { label: "Yakuniy yuborilgan", value: "842", trend: "76%", tone: "blue" },
  { label: "Texnik tekshiruvda", value: "164", trend: "14%", tone: "purple" },
  { label: "Tuzatishga qaytarilgan", value: "58", trend: "5%", tone: "gold" },
  { label: "Rad etilgan", value: "44", trend: "4%", tone: "red" },
  { label: "OTM arizalari", value: "621", trend: "56%", tone: "blue" },
  { label: "Mustaqil arizalar", value: "487", trend: "44%", tone: "green" },
  { label: "MVP mavjud loyihalar", value: "392", trend: "35%", tone: "purple" },
  { label: "Finalchilar", value: "48", trend: "saralandi", tone: "gold" },
  { label: "Jami hakamlar", value: "36", trend: "27 faol", tone: "blue" },
  { label: "Apellyatsiyalar", value: "19", trend: "6 yangi", tone: "red" },
  { label: "Sertifikatlar", value: "214", trend: "berilgan", tone: "green" },
  { label: "Monitoringdagi loyihalar", value: "22", trend: "6 oy", tone: "purple" }
];

export const adminModules = [
  "Dashboard",
  "Foydalanuvchilar",
  "Rollar",
  "Mas'ullar",
  "Hakamlar",
  "Tanlovlar",
  "Yo'nalishlar",
  "OTM va hududlar",
  "Ariza shakli",
  "Arizalar",
  "Bosqichlar",
  "Baholash",
  "Reyting",
  "Natijalar",
  "Apellyatsiyalar",
  "Sertifikatlar",
  "Mukofot va bank",
  "Monitoring",
  "Kontent",
  "Hisobotlar",
  "Audit jurnali"
];

export const adminUsers: AdminUser[] = [
  {
    name: "Azizbek Karimov",
    phone: "+998 90 101 11 22",
    role: "Ishtirokchi, jamoa rahbari",
    source: "Qarshi davlat universiteti",
    status: "Faol"
  },
  {
    name: "Madina Rasulova",
    phone: "+998 91 777 45 33",
    role: "OTM koordinatori",
    source: "Qarshi muhandislik-iqtisodiyot instituti",
    status: "Faol"
  },
  {
    name: "Diyorbek Safarov",
    phone: "+998 93 512 88 90",
    role: "Ishtirokchi",
    source: "Kitob tumani",
    status: "Tuzatish kutilmoqda"
  },
  {
    name: "Nodira To'xtayeva",
    phone: "+998 99 244 72 13",
    role: "Hakam",
    source: "Viloyat bosqichi",
    status: "Tasdiqlanmagan"
  }
];

export const adminApplications: AdminApplication[] = [
  {
    number: "QSL-2026-0148",
    project: "Aqlli sug'orish sensori",
    participant: "AgroSmart Team",
    direction: "Agrotexnologiyalar",
    region: "Kasbi tumani",
    status: "Texnik tekshiruvda",
    score: "Kutilmoqda"
  },
  {
    number: "QSL-2026-0186",
    project: "Edu Mentor AI",
    participant: "Madina Rasulova",
    direction: "Ta'lim texnologiyalari",
    region: "Qarshi shahri",
    status: "Saralashga qabul qilingan",
    score: "86.4"
  },
  {
    number: "QSL-2026-0211",
    project: "Mahalla xizmatlari bot",
    participant: "Digital Qarshi",
    direction: "Davlat xizmatlari",
    region: "Shahrisabz shahri",
    status: "Tuzatishga qaytarilgan",
    score: "Kamchilik bor"
  }
];

export const adminJudges: AdminJudge[] = [
  { name: "Prof. Akmal Jo'rayev", field: "IT va AI", assigned: 18, done: 12, status: "Baholash jarayonida" },
  { name: "Dilshod Ibragimov", field: "Agrotexnologiya", assigned: 15, done: 15, status: "Yakunlagan" },
  { name: "Zarina Murodova", field: "Ta'lim texnologiyalari", assigned: 16, done: 0, status: "Boshlamagan" }
];

export const adminStages: AdminStage[] = [
  { title: "Arizalarni qabul qilish", date: "01.07 - 20.07", owner: "Mas'ul kotib", status: "Ochiq" },
  { title: "Texnik tekshiruv", date: "21.07 - 28.07", owner: "Administrator", status: "Rejalashtirilgan" },
  { title: "OTM/tuman saralashi", date: "29.07 - 08.08", owner: "Koordinatorlar", status: "Rejalashtirilgan" },
  { title: "Viloyat final bosqichi", date: "20.08", owner: "Tashkiliy qo'mita", status: "Kutilmoqda" }
];

export const adminAudit = [
  "Foydalanuvchi bloklash sababi saqlandi: noto'g'ri ma'lumot taqdim etish",
  "Rol biriktirildi: OTM koordinatori -> Madina Rasulova",
  "Ariza QSL-2026-0211 tuzatishga qaytarildi",
  "Hakamga 6 ta loyiha biriktirildi",
  "Baholash muddati o'zgardi va bildirishnoma yuborildi"
];
