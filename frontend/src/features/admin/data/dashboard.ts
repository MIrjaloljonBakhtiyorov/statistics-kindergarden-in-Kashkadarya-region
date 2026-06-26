export interface StatCardData {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  color: "blue" | "green" | "purple" | "gold" | "cyan" | "red";
}

export const statsData: StatCardData[] = [
  {
    id: "users",
    title: "Jami ro'yxatdan o'tgan foydalanuvchilar",
    value: "24,841",
    change: "+12.4%",
    trend: "up",
    color: "blue",
  },
  {
    id: "participants",
    title: "Jami ishtirokchilar",
    value: "8,632",
    change: "+15.7%",
    trend: "up",
    color: "green",
  },
  {
    id: "teams",
    title: "Jami jamoalar",
    value: "1,942",
    change: "+18.3%",
    trend: "up",
    color: "purple",
  },
  {
    id: "applications",
    title: "Jami arizalar",
    value: "2,736",
    change: "+16.8%",
    trend: "up",
    color: "blue",
  },
  {
    id: "finalists",
    title: "Finalchilar",
    value: "120",
    change: "+8.6%",
    trend: "up",
    color: "gold",
  },
  {
    id: "winners",
    title: "G'oliblar",
    value: "18",
    change: "+5.3%",
    trend: "up",
    color: "gold",
  },
  {
    id: "judges",
    title: "Hakamlar soni",
    value: "64",
    change: "0%",
    trend: "neutral",
    color: "cyan",
  },
  {
    id: "appeals",
    title: "Apellyatsiyalar",
    value: "23",
    change: "+21.1%",
    trend: "up",
    color: "purple",
  },
];

export const applicationsTrendData = [
  { month: "Dek", value: 312 },
  { month: "Yan", value: 478 },
  { month: "Fev", value: 562 },
  { month: "Mar", value: 689 },
  { month: "Apr", value: 821 },
  { month: "May", value: 874 },
];

export const applicationsByDirectionData = [
  { name: "Axborot texnologiyalari", value: 1023, color: "#2f7df6" },
  { name: "Qishloq xo'jaligi", value: 642, color: "#22b7ff" },
  { name: "Ijtimoiy loyihalar", value: 481, color: "#2ed57a" },
  { name: "Sanoat va ishlab chiqarish", value: 328, color: "#a855f7" },
  { name: "Ta'lim texnologiyalari", value: 182, color: "#f5b942" },
  { name: "Boshqalar", value: 80, color: "#718096" },
];

export interface StageProgress {
  id: string;
  name: string;
  current: number;
  total: number;
  percentage: number;
  status: "completed" | "in-progress" | "pending";
}

export const stagesProgressData: StageProgress[] = [
  {
    id: "receiving",
    name: "Arizalarni qabul qilish",
    current: 2736,
    total: 2736,
    percentage: 100,
    status: "completed",
  },
  {
    id: "sorting",
    name: "Saralash",
    current: 1942,
    total: 2736,
    percentage: 71,
    status: "in-progress",
  },
  {
    id: "judging",
    name: "Hakamlar baholashi",
    current: 932,
    total: 2736,
    percentage: 34,
    status: "in-progress",
  },
  {
    id: "final",
    name: "Final",
    current: 120,
    total: 120,
    percentage: 100,
    status: "completed",
  },
  {
    id: "winners",
    name: "G'oliblarni aniqlash",
    current: 18,
    total: 18,
    percentage: 100,
    status: "completed",
  },
];

export interface RecentApplication {
  id: string;
  teamName: string;
  direction: string;
  submittedDate: string;
  stage: string;
  status: "new" | "sorting" | "judging" | "final" | "rejected";
}

export const recentApplicationsData: RecentApplication[] = [
  {
    id: "APP-2847",
    teamName: "AgroSmart Qashqadaryo",
    direction: "Qishloq xo'jaligi",
    submittedDate: "2026-05-18",
    stage: "Hakamlar baholashi",
    status: "judging",
  },
  {
    id: "APP-2846",
    teamName: "EcoBuild",
    direction: "Sanoat va ishlab chiqarish",
    submittedDate: "2026-05-18",
    stage: "Saralash",
    status: "sorting",
  },
  {
    id: "APP-2845",
    teamName: "EduTech Innovators",
    direction: "Ta'lim texnologiyalari",
    submittedDate: "2026-05-17",
    stage: "Final",
    status: "final",
  },
  {
    id: "APP-2844",
    teamName: "SmartWater",
    direction: "Qishloq xo'jaligi",
    submittedDate: "2026-05-17",
    stage: "Yangi",
    status: "new",
  },
  {
    id: "APP-2843",
    teamName: "AI Vision",
    direction: "Axborot texnologiyalari",
    submittedDate: "2026-05-16",
    stage: "Rad etilgan",
    status: "rejected",
  },
];

export interface RegionalData {
  region: string;
  count: number;
}

export const regionalDistributionData: RegionalData[] = [
  { region: "Qarshi shahri", count: 812 },
  { region: "Shahrisabz tumani", count: 412 },
  { region: "G'uzor tumani", count: 309 },
  { region: "Kasbi tumani", count: 287 },
  { region: "Yakkabog' tumani", count: 214 },
  { region: "Boshqalar", count: 702 },
];
