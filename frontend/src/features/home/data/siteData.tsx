import {
  Award,
  BarChart3,
  BrainCircuit,
  Briefcase,
  Building2,
  CalendarDays,
  Cross,
  Cuboid,
  Cpu,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Landmark,
  Leaf,
  Lightbulb,
  MapPinned,
  Rocket,
  Search,
  Settings,
  Sprout,
  Star,
  Target,
  Trophy,
  Users,
  WalletCards
} from "lucide-react";
import type { DateItem, Direction, FaqItem, ImportanceItem, InfoCard, NewsItem, Prize, StartupType, Step } from "../../../shared/types";

export const infoCards: InfoCard[] = [
  {
    icon: Lightbulb,
    title: "Startap nima?",
    description:
      "Innovatsion g'oya asosida yaratiladigan va tez o'sishga yo'naltirilgan texnologik yoki biznes loyiha.",
    tone: "blue"
  },
  {
    icon: Settings,
    title: "Qanday quriladi?",
    description:
      "Muammo aniqlanadi, yechim ishlab chiqiladi, MVP yaratiladi va bozor sinovidan o'tkaziladi.",
    tone: "purple"
  },
  {
    icon: Users,
    title: "Kimlar qatnashadi?",
    description: "Talabalar, yosh tadqiqotchilar, tadbirkorlar, mustaqil ishtirokchilar va jamoalar.",
    tone: "gold"
  }
];

export const steps: Step[] = [
  { number: "01", icon: Search, title: "Muammoni aniqlash", description: "Haqiqiy va dolzarb muammoni o'rganish." },
  { number: "02", icon: Lightbulb, title: "Yechim ishlab chiqish", description: "Muammoni hal qiluvchi innovatsion g'oyani shakllantirish." },
  { number: "03", icon: Cuboid, title: "MVP yaratish", description: "Minimal ishlaydigan mahsulot yoki prototip yaratish." },
  { number: "04", icon: BarChart3, title: "Bozor sinovi", description: "Foydalanuvchilar bilan sinovdan o'tkazish va fikr olish." },
  { number: "05", icon: Rocket, title: "Rivojlantirish va investitsiya", description: "Mahsulotni kengaytirish, sotuv va investitsiya jalb qilish." }
];

export const directions: Direction[] = [
  { icon: BrainCircuit, title: "IT va Sun'iy intellekt", color: "#155EEF" },
  { icon: Sprout, title: "Agrotexnologiyalar", color: "#0F9F6E" },
  { icon: GraduationCap, title: "Ta'lim texnologiyalari", color: "#4338CA" },
  { icon: HeartHandshake, title: "Tibbiyot va ijtimoiy xizmatlar", color: "#E11D48" },
  { icon: WalletCards, title: "Fintex", color: "#F5A623" },
  { icon: Landmark, title: "Davlat xizmatlari va raqamlashtirish", color: "#6D28D9" },
  { icon: Leaf, title: "Yashil texnologiyalar", color: "#16A34A" },
  { icon: MapPinned, title: "Turizm va xizmat ko'rsatish", color: "#0891B2" },
  { icon: Briefcase, title: "Sanoat va logistika", color: "#EA580C" },
  { icon: Cpu, title: "Boshqa innovatsion loyihalar", color: "#7C3AED" }
];

export const startupTypes: StartupType[] = [
  {
    icon: BrainCircuit,
    title: "Texnologik startap",
    description: "Yangi texnologiyalar va raqamli yechimlarga asoslangan loyihalar."
  },
  {
    icon: Users,
    title: "Ijtimoiy startap",
    description: "Jamiyat muammolarini innovatsion yondashuvlar orqali hal qiluvchi loyihalar."
  },
  {
    icon: Leaf,
    title: "Agro startap",
    description: "Qishloq xo'jaligi va oziq-ovqat sohasida samaradorlikni oshiruvchi loyihalar."
  },
  {
    icon: GraduationCap,
    title: "EdTech",
    description: "Ta'lim jarayonini yaxshilovchi va yangi imkoniyatlar yaratadigan loyihalar."
  },
  {
    icon: Cross,
    title: "MedTech",
    description: "Tibbiyot va sog'liqni saqlashda innovatsion yechimlar taklif qiluvchi loyihalar."
  },
  {
    icon: Leaf,
    title: "GreenTech",
    description: "Atrof-muhitni asrash va barqaror rivojlanishga xizmat qiluvchi loyihalar."
  },
  {
    icon: WalletCards,
    title: "FinTech",
    description: "Moliyaviy xizmatlarni raqamli texnologiyalar orqali yaxshilovchi loyihalar."
  },
  {
    icon: Building2,
    title: "GovTech",
    description: "Davlat boshqaruvi va xizmatlarini raqamlashtiruvchi samarali loyihalar."
  }
];

export const districts = [
  "Qarshi shahri",
  "Shahrisabz shahri",
  "G'uzor tumani",
  "Dehqonobod tumani",
  "Qamashi tumani",
  "Qarshi tumani",
  "Kasbi tumani",
  "Kitob tumani",
  "Koson tumani",
  "Ko'kdala tumani",
  "Mirishkor tumani",
  "Muborak tumani",
  "Nishon tumani",
  "Chiroqchi tumani",
  "Shahrisabz tumani",
  "Yakkabog' tumani"
];

export const universities = [
  "Qarshi xalqaro universiteti",
  "Xalqaro innovatsion universitet — Effect EDU",
  "Iqtisodiyot va pedagogika universiteti",
  "Axborot texnologiyalari va menejment universiteti",
  "Osiyo texnologiyalar universiteti",
  "Turon universiteti",
  "Shahrisabz davlat pedagogika instituti",
  "Qarshi davlat texnika universiteti",
  "Qarshi davlat universiteti",
];

export const employmentOptions = ["Talaba", "Magistrant", "Doktorant", "Dasturchi", "Boshqa"];

export const prizes: Prize[] = [
  { id: "first", place: "1-o'rin", amount: "50 mln so'm", description: "Gold trophy va eng katta mukofot", tone: "gold", icon: Trophy },
  { id: "second", place: "2-o'rin", amount: "30 mln so'm", description: "Silver trophy va rivojlanish imkoniyati", tone: "silver", icon: Trophy },
  { id: "third", place: "3-o'rin", amount: "20 mln so'm", description: "Bronze trophy va qo'llab-quvvatlash", tone: "bronze", icon: Trophy },
  { id: "special", place: "Maxsus nominatsiyalar", amount: "10 mln so'm", description: "Maxsus yo'nalishlar uchun rag'bat", tone: "special", icon: Star }
];

export const aboutHighlights = [
  "Shaffof va adolatli baholash",
  "Mutaxassis hakamlar hay'ati",
  "Akseleratsiya va mentorlik",
  "Pilot loyihalarni amalga oshirish",
  "Investitsiya va hamkorlik imkoniyatlari",
  "Innovatsion ekotizimni rivojlantirish"
];

export const aboutCards = [
  { title: "Hududiy miqyosda", text: "Qashqadaryo tuman va shaharlaridagi tashabbuslarni bir maydonga jamlaydi." },
  { title: "Ochiq va shaffof", text: "Ariza, saralash va baholash jarayonlari aniq mezonlar asosida yuritiladi." },
  { title: "Mentorlik va akseleratsiya", text: "Finalchilar ekspertlar bilan ishlash va loyihani kuchaytirish imkoniyatiga ega bo'ladi." },
  { title: "Investitsiyaga tayyorlash", text: "Istiqbolli loyihalar pilot, hamkorlik va investitsiya bosqichiga olib chiqiladi." }
];

export const importanceItems: ImportanceItem[] = [
  { icon: BarChart3, title: "Iqtisodiy o'sish", text: "Startaplar yangi biznes modellarini yaratib, iqtisodiyotning o'sishiga xizmat qiladi." },
  { icon: Users, title: "Yangi ish o'rinlari", text: "Yoshlar uchun zamonaviy va yuqori malakali ish imkoniyatlarini yaratadi." },
  { icon: Rocket, title: "Innovatsion yechimlar", text: "Hududdagi dolzarb muammolarga tezkor va samarali yechimlar taklif qiladi." },
  { icon: Globe2, title: "Global raqobat", text: "Mahalliy mahsulotlarning xalqaro bozorga chiqish imkoniyatini oshiradi." },
  { icon: Target, title: "Yoshlar imkoniyati", text: "Yoshlarning bilim, tashabbus va g'oyalarini real biznesga aylantiradi." },
  { icon: Settings, title: "Raqamli transformatsiya", text: "Davlat, biznes va ijtimoiy sohalarda raqamli o'zgarishlarni jadallashtiradi." }
];

export const importantDates: DateItem[] = [
  { id: "application", date: "1-15 iyul", title: "Arizalarni qabul qilish" },
  { id: "selection", date: "16-30 iyul", title: "OTM va tuman/shahar saralash bosqichlari" },
  { id: "final", date: "1-15 avgust", title: "Viloyat final bosqichi" },
  { id: "awards", date: "30-avgustgacha", title: "G'oliblarni taqdirlash" }
];

export const faqItems: FaqItem[] = [
  { question: "Tanlovda kimlar qatnashishi mumkin?", answer: "Talabalar, magistrantlar, doktorantlar, yosh tadqiqotchilar, dasturchilar, yosh tadbirkorlar, mustaqil ishtirokchilar va startap jamoalari qatnashishi mumkin." },
  { question: "Jamoada necha nafar a'zo bo'lishi mumkin?", answer: "Jamoa tarkibi tanlov nizomida belgilanadigan limit asosida qabul qilinadi. Ariza topshirishda jamoa a'zolari ma'lumotlari alohida ko'rsatiladi." },
  { question: "Qaysi yo'nalishdagi loyihalar qabul qilinadi?", answer: "IT va sun'iy intellekt, agrotexnologiya, ta'lim, tibbiyot, fintex, davlat xizmatlari, yashil texnologiyalar, turizm, sanoat va boshqa innovatsion loyihalar qabul qilinadi." },
  { question: "MVP bo'lishi shartmi?", answer: "MVP mavjudligi loyiha bahosini kuchaytiradi. Lekin g'oya bosqichidagi istiqbolli loyihalar ham tanlov shartlariga muvofiq ko'rib chiqilishi mumkin." },
  { question: "Ariza qanday topshiriladi?", answer: "Ro'yxatdan o'tish sahifasi orqali profil to'ldiriladi, loyiha ma'lumotlari kiritiladi va kerakli hujjatlar yuklanadi." },
  { question: "Baholash qanday amalga oshiriladi?", answer: "Baholash oldindan belgilangan mezonlar, 100 ballik tizim va mutaxassis hakamlar hay'ati orqali amalga oshiriladi." },
  { question: "G'oliblar qanday aniqlanadi?", answer: "G'oliblar yakuniy reyting, hakamlar bahosi, saralash natijalari va Tashkiliy qo'mita qarori asosida aniqlanadi." },
  { question: "Finalchilarga sertifikat beriladimi?", answer: "Ha, finalchilar va belgilangan nominatsiya ishtirokchilari uchun elektron sertifikatlar taqdim etiladi." }
];

export const newsItems: NewsItem[] = [
  {
    date: "20 iyun 2026",
    category: "E'lon",
    title: "Qashqadaryo Startup Ligasi uchun tayyorgarlik boshlandi",
    description: "Hududdagi innovatsion loyihalarni saralash va qo'llab-quvvatlash bo'yicha yangi mavsum jarayonlari shakllantirilmoqda.",
    imageUrl: "https://images.unsplash.com/photo-1669633760258-186e9dee81e7?auto=format&fit=crop&q=80&w=1200",
    imageAlt: "Startup jamoasi taqdimot ekranida loyiha muhokama qilmoqda",
    sourceUrl: "https://unsplash.com/photos/a-group-of-people-sitting-in-chairs-in-front-of-a-projector-screen-9majps0fBCM"
  },
  {
    date: "25 iyun 2026",
    category: "Mentorlik",
    title: "Finalchilar uchun mentorlik dasturi rejalashtirilmoqda",
    description: "Ekspertlar loyihalarning biznes modeli, MVP va bozor strategiyasini kuchaytirishda yordam beradi.",
    imageUrl: "https://images.unsplash.com/photo-1638029202288-451a89e0d55f?auto=format&fit=crop&q=80&w=1200",
    imageAlt: "Dasturchilar hackathon muhitida kod yozmoqda",
    sourceUrl: "https://unsplash.com/photos/a-man-using-a-laptop-computer-on-a-wooden-table-14JOIxmsOqA"
  },
  {
    date: "1 iyul 2026",
    category: "Ariza",
    title: "Arizalarni qabul qilish bosqichi ochiladi",
    description: "Ishtirokchilar telefon raqami orqali ro'yxatdan o'tib, loyiha ma'lumotlarini platformaga kiritishlari mumkin bo'ladi.",
    imageUrl: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=1200",
    imageAlt: "Neon yorug'likdagi laptop texnologik startap muhitini ifodalaydi",
    sourceUrl: "https://unsplash.com/s/photos/coding-laptop"
  }
];

export const landingVisuals = {
  about: {
    imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=1400",
    imageAlt: "Startup jamoasi mentor bilan loyiha strategiyasini muhokama qilmoqda",
    sourceUrl: "https://unsplash.com/s/photos/startup-meeting"
  },
  process: {
    imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1400",
    imageAlt: "Jamoa whiteboard yonida mahsulot prototipi va vazifalarni rejalashtirmoqda",
    sourceUrl: "https://unsplash.com/s/photos/founder"
  },
  importance: {
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1400",
    imageAlt: "Texnologiya, ta'lim va innovatsion ish muhiti",
    sourceUrl: "https://unsplash.com/s/photos/school-technology"
  }
};

export const contactItems = [
  { icon: Landmark, label: "Manzil", value: "Qashqadaryo viloyati, Qarshi shahri" },
  { icon: CalendarDays, label: "Telefon", value: "+998 78 000 00 00" },
  { icon: Award, label: "Email", value: "info@tanlov.qashqadaryo.uz" },
  { icon: Globe2, label: "Web sayt", value: "tanlov.qashqadaryo.uz" },
  { icon: CalendarDays, label: "Ish vaqti", value: "Dushanba-Juma, 09:00-18:00" }
];
