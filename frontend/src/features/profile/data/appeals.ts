export type AppealStatus = "draft" | "submitted" | "under_review" | "need_info" | "approved" | "rejected";

export type AppealReason =
  | "procedure_violation"
  | "calculation_error"
  | "conflict_of_interest"
  | "other";

export interface Appeal {
  id: string;
  applicationNumber: string;
  projectName: string;
  reason: AppealReason;
  reasonText: string;
  description: string;
  submittedAt?: string;
  status: AppealStatus;
  adminResponse?: string;
  respondedAt?: string;
}

export const mockAppeals: Appeal[] = [
  {
    id: "appeal_001",
    applicationNumber: "QSL-2024-0142",
    projectName: "AgroAI Monitor",
    reason: "calculation_error",
    reasonText: "Ball hisoblashda texnik xatolik",
    description: "3-hakamning bali 15 ball kamroq kiritilgan. PDF hisobotda ko'rsatilgandek 78 ball bo'lishi kerak edi.",
    submittedAt: "2024-07-10T11:30:00Z",
    status: "under_review",
    adminResponse: undefined,
  },
  {
    id: "appeal_002",
    applicationNumber: "QSL-2024-0189",
    projectName: "InterLearn Platform",
    reason: "procedure_violation",
    reasonText: "Tanlov tartibi buzilgan",
    description: "Ariza qabul muddati o'tib ketgandan keyin ariza qabul qilingan.",
    submittedAt: "2024-07-05T09:00:00Z",
    status: "rejected",
    adminResponse: "Ariza belgilangan muddatda qabul qilingan. Tizimda texnik vaqt farqi bo'lgan.",
    respondedAt: "2024-07-08T15:00:00Z",
  },
];
