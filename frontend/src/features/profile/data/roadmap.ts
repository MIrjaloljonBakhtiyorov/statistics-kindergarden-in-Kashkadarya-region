export type RoadmapTaskStatus = "not_started" | "in_progress" | "completed" | "delayed";

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  responsible: string;
  startDate: string;
  endDate: string;
  status: RoadmapTaskStatus;
  progress: number;
  hasDocument: boolean;
  documentName?: string;
}

export const mockRoadmap: RoadmapTask[] = [
  {
    id: "rt_001",
    title: "MVP / Prototip",
    description: "Ishlaydigan minimal mahsulot versiyasini tayyorlash",
    responsible: "Azizbek Karimov",
    startDate: "2024-10-01",
    endDate: "2024-11-30",
    status: "completed",
    progress: 100,
    hasDocument: true,
    documentName: "mvp_report.pdf",
  },
  {
    id: "rt_002",
    title: "Mahsulotni takomillashtirish",
    description: "Foydalanuvchi fikrlari asosida mahsulotni yaxshilash",
    responsible: "Sherzod Rahimov",
    startDate: "2024-12-01",
    endDate: "2025-01-31",
    status: "in_progress",
    progress: 65,
    hasDocument: false,
  },
  {
    id: "rt_003",
    title: "Pilot foydalanuvchilar",
    description: "Kamida 10 ta real foydalanuvchi bilan sinov o'tkazish",
    responsible: "Dilnoza Yusupova",
    startDate: "2025-01-01",
    endDate: "2025-02-28",
    status: "in_progress",
    progress: 40,
    hasDocument: false,
  },
  {
    id: "rt_004",
    title: "Yuridik shaxs ro'yxatdan o'tkazish",
    description: "Kompaniyani davlat ro'yxatidan o'tkazish",
    responsible: "Azizbek Karimov",
    startDate: "2025-02-01",
    endDate: "2025-03-31",
    status: "not_started",
    progress: 0,
    hasDocument: false,
  },
  {
    id: "rt_005",
    title: "Ish o'rinlari yaratish",
    description: "Kamida 2 ta doimiy xodim qabul qilish",
    responsible: "Azizbek Karimov",
    startDate: "2025-03-01",
    endDate: "2025-04-30",
    status: "not_started",
    progress: 0,
    hasDocument: false,
  },
  {
    id: "rt_006",
    title: "Birinchi sotuv",
    description: "Birinchi to'lovli mijoz va shartnoma",
    responsible: "Jamoa",
    startDate: "2025-02-15",
    endDate: "2025-04-30",
    status: "not_started",
    progress: 0,
    hasDocument: false,
  },
];
