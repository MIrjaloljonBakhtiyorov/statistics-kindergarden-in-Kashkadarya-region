export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "needs_correction"
  | "accepted"
  | "accepted_sorting"
  | "rejected_sorting"
  | "otm_stage"
  | "district_stage"
  | "province_recommended"
  | "reserve"
  | "province_final"
  | "finalist"
  | "winner_1"
  | "winner_2"
  | "winner_3"
  | "rejected"
  | "disqualified";

export interface ApplicationFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
}

export interface Application {
  id: string;
  applicationNumber: string;
  projectName: string;
  shortSummary: string;
  direction: string;
  team?: string;
  submittedAt?: string;
  stage: string;
  status: ApplicationStatus;
  progress: number;
  hasMVP: boolean;
  demoUrl?: string;
  files: ApplicationFile[];
  competition: string;
}

export const mockApplications: Application[] = [
  {
    id: "app_001",
    applicationNumber: "QSL-2024-0142",
    projectName: "AgroAI Monitor",
    shortSummary: "Qishloq xo'jaligida sun'iy intellekt yordamida hosildorlikni oshirish tizimi",
    direction: "Agrotexnologiyalar va suv tejamkor yechimlar",
    team: "Smart Agro Solutions",
    submittedAt: "2024-04-10T10:30:00Z",
    stage: "Viloyat finali",
    status: "province_final",
    progress: 85,
    hasMVP: true,
    demoUrl: "https://agroai.demo.uz",
    files: [
      { id: "f1", name: "taqdimot.pptx", type: "pptx", size: "4.2 MB", uploadedAt: "2024-04-10" },
      { id: "f2", name: "biznes_reja.pdf", type: "pdf", size: "1.8 MB", uploadedAt: "2024-04-10" },
    ],
    competition: "Qashqadaryo Startup Ligasi 2024",
  },
  {
    id: "app_002",
    applicationNumber: "QSL-2024-0189",
    projectName: "InterLearn Platform",
    shortSummary: "Maktab o'quvchilari uchun interaktiv ta'lim platformasi",
    direction: "Ta'lim texnologiyalari",
    team: "EduTech Lab",
    submittedAt: "2024-04-22T14:00:00Z",
    stage: "OTM saralashi",
    status: "otm_stage",
    progress: 55,
    hasMVP: false,
    files: [
      { id: "f3", name: "taqdimot.pdf", type: "pdf", size: "3.1 MB", uploadedAt: "2024-04-22" },
    ],
    competition: "Qashqadaryo Startup Ligasi 2024",
  },
  {
    id: "app_003",
    applicationNumber: "",
    projectName: "HealthTrack Mobile",
    shortSummary: "Sog'liqni nazorat qilish mobil ilovasi",
    direction: "Tibbiyot va ijtimoiy xizmatlar",
    submittedAt: undefined,
    stage: "Qoralama",
    status: "draft",
    progress: 30,
    hasMVP: false,
    files: [],
    competition: "Qashqadaryo Startup Ligasi 2024",
  },
];
