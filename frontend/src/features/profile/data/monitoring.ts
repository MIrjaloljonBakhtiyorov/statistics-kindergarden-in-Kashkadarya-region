export type MonitoringReportStatus = "draft" | "submitted" | "confirmed" | "returned";

export interface MonitoringReport {
  id: string;
  month: number;
  year: number;
  completedWork: string;
  kpi: string;
  problems?: string;
  nextPlan: string;
  mvpStatus: string;
  pilotStatus: string;
  customersCount: number;
  jobsCreated: number;
  revenue: string;
  investment: string;
  partnerships: string;
  overallProgress: number;
  status: MonitoringReportStatus;
  adminComment?: string;
  submittedAt?: string;
}

export const mockMonitoring: MonitoringReport[] = [
  {
    id: "mr_001",
    month: 10,
    year: 2024,
    completedWork: "MVP ishlab chiqildi va dastlabki testlar o'tkazildi",
    kpi: "MVP tayyorlash — bajarildi. Prototip demo — bajarildi.",
    nextPlan: "Pilot foydalanuvchilarni jalb qilish",
    mvpStatus: "Tayyor",
    pilotStatus: "Boshlanmagan",
    customersCount: 0,
    jobsCreated: 0,
    revenue: "0",
    investment: "0",
    partnerships: "Qarshi DU bilan memorandum imzolandi",
    overallProgress: 25,
    status: "confirmed",
    adminComment: "Yaxshi progress. Keyingi oy pilot bosqichiga o'ting.",
    submittedAt: "2024-11-05T10:00:00Z",
  },
  {
    id: "mr_002",
    month: 11,
    year: 2024,
    completedWork: "Mahsulot takomillashtirildi, 5 ta pilot foydalanuvchi jalb qilindi",
    kpi: "Pilot foydalanuvchilar — 5 ta (maqsad 10). MVP v2 — tayyor.",
    problems: "Pilot foydalanuvchilarni jalb qilish kutilganidan qiyin bo'ldi",
    nextPlan: "Qolgan 5 ta foydalanuvchini jalb qilish va shartnoma imzolash",
    mvpStatus: "v2 tayyor",
    pilotStatus: "5/10 foydalanuvchi",
    customersCount: 5,
    jobsCreated: 0,
    revenue: "0",
    investment: "0",
    partnerships: "2 ta fermerlik xo'jaligi bilan kelishuv",
    overallProgress: 45,
    status: "submitted",
    submittedAt: "2024-12-03T14:00:00Z",
  },
  {
    id: "mr_003",
    month: 12,
    year: 2024,
    completedWork: "",
    kpi: "",
    nextPlan: "",
    mvpStatus: "",
    pilotStatus: "",
    customersCount: 0,
    jobsCreated: 0,
    revenue: "0",
    investment: "0",
    partnerships: "",
    overallProgress: 0,
    status: "draft",
  },
];
