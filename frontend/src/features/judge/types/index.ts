export interface Judge {
  id: string;
  login: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  organization: string;
  position: string;
  specialization: string;
  experienceYears: number;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  judgeCategory: string;
  directions: string[];
  assignedCompetition?: string;
  assignedStage?: string;
  assignedLocation?: string;
  assignedProjects: number;
  evalStartDate?: string;
  evalEndDate?: string;
  mustChangePassword: boolean;
  status: string;
  agreedCriteria?: boolean;
  agreedIndependent?: boolean;
  agreedConfidential?: boolean;
  agreedNoConflict?: boolean;
  agreedNoShare?: boolean;
}

export type EvalStatus = "pending" | "draft" | "submitted";

export type Recommendation = "promising" | "not_promising";

export interface JudgeProject {
  id: string;
  applicationNumber: string;
  projectName: string;
  teamName?: string;
  direction: string;
  stage: string;
  region?: string;
  institution?: string;
  evalDeadline?: string;
  assignedDate: string;
  evalStatus: EvalStatus;
  evalId?: string;
  evalUpdated?: string;
  summary?: string;
  problem?: string;
  problemRelevance?: string;
  problemScale?: string;
  solution?: string;
  solutionInnovation?: string;
  mvpExists?: boolean;
  prototypeExists?: boolean;
  demoUrl?: string;
  githubUrl?: string;
  targetCustomers?: string;
  marketSize?: string;
  competitors?: string;
  businessModel?: string;
  revenueSources?: string;
  financialNeed?: string;
  pilotRegion?: string;
  pilotOrg?: string;
  scalability?: string;
  teamMembers?: TeamMember[];
  materials?: Material[];
  presentationDate?: string;
  presentationTime?: string;
  presentationVenue?: string;
  presentationLink?: string;
  presentationDuration?: number;
  qaDuration?: number;
  // Evaluation data
  scores?: Record<string, number>;
  comments?: Record<string, string>;
  totalScore?: number;
  strengths?: string;
  weaknesses?: string;
  techRisks?: string;
  marketRisks?: string;
  businessModelIssues?: string;
  teamAssessment?: string;
  improvements?: string;
  pilotFeasibility?: string;
  regionalRelevance?: string;
  nextSteps?: string;
  recommendation?: Recommendation;
  justification?: string;
  submittedAt?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  specialization?: string;
  experience?: string;
  responsibility?: string;
  avatarUrl?: string;
}

export interface Material {
  id: string;
  type: "presentation" | "business_plan" | "document" | "video" | "demo" | "github" | "image" | "other";
  title: string;
  url: string;
  fileSize?: string;
}

export interface EvalCriterion {
  id: string;
  key: string;
  name: string;
  description: string;
  maxScore: number;
  icon: string;
}

export const EVAL_CRITERIA: EvalCriterion[] = [
  { id: "1", key: "relevance", name: "Muammoning dolzarbligi va ko'lami", description: "Muammo qanchalik dolzarb va keng ko'lamli ekanligini baholang", maxScore: 15, icon: "Target" },
  { id: "2", key: "solution", name: "Yechimning samaradorligi va innovatsionligi", description: "Taklif etilayotgan yechim qanchalik samarali va yangiligini baholang", maxScore: 15, icon: "Lightbulb" },
  { id: "3", key: "mvp", name: "MVP, prototip yoki amaliy model", description: "Mavjud MVP yoki prototipning sifati va tayyor ekanligini baholang", maxScore: 15, icon: "Layers" },
  { id: "4", key: "market", name: "Bozor va maqsadli mijozlar", description: "Bozor tahlili, maqsadli auditoriya va raqobat muhitini baholang", maxScore: 15, icon: "BarChart3" },
  { id: "5", key: "implementation", name: "Amaliyotga joriy etish va pilot imkoniyati", description: "Loyihaning real hayotga joriy etilish imkoniyatini baholang", maxScore: 15, icon: "Rocket" },
  { id: "6", key: "business", name: "Biznes modeli va moliyaviy barqarorlik", description: "Biznes modeli va moliyaviy barqarorlikni baholang", maxScore: 10, icon: "DollarSign" },
  { id: "7", key: "team", name: "Jamoa salohiyati", description: "Jamoa a'zolarining malakasi va salohiyatini baholang", maxScore: 10, icon: "Users" },
  { id: "8", key: "presentation", name: "Taqdimot va savollarga javob", description: "Taqdimot sifati va savollarga berilgan javoblarni baholang", maxScore: 5, icon: "Presentation" },
];

export interface DashboardStats {
  total: number;
  pending: number;
  draft: number;
  submitted: number;
}

export interface JudgeNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  actionUrl?: string;
  actionLabel?: string;
  read: boolean;
  createdAt: string;
}
