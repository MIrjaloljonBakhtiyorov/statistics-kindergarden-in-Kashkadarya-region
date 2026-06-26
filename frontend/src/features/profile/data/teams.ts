export type TeamMemberRole =
  | "project_leader"
  | "frontend"
  | "backend"
  | "mobile"
  | "ai_specialist"
  | "designer"
  | "marketer"
  | "finance"
  | "business_analyst"
  | "sector_specialist"
  | "mentor"
  | "advisor"
  | "other";

export type TeamStatus = "active" | "incomplete" | "pending" | "blocked";
export type InviteStatus = "pending" | "accepted" | "rejected";

export interface TeamMember {
  id: string;
  name: string;
  role: TeamMemberRole;
  phone?: string;
  isMentor: boolean;
  isAdvisor: boolean;
  joinedAt: string;
  confirmed: boolean;
}

export interface TeamInvite {
  id: string;
  teamName: string;
  invitedBy: string;
  role: TeamMemberRole;
  sentAt: string;
  status: InviteStatus;
}

export interface Team {
  id: string;
  name: string;
  shortDescription: string;
  logoUrl?: string;
  leader: string;
  members: TeamMember[];
  project?: string;
  direction: string;
  status: TeamStatus;
  isLeader: boolean;
  createdAt: string;
}

export const mockTeams: Team[] = [
  {
    id: "team_001",
    name: "Smart Agro Solutions",
    shortDescription: "Qishloq xo'jaligida sun'iy intellektdan foydalanish",
    leader: "Azizbek Karimov",
    members: [
      { id: "m1", name: "Azizbek Karimov", role: "project_leader", isMentor: false, isAdvisor: false, joinedAt: "2024-03-15", confirmed: true },
      { id: "m2", name: "Dilnoza Yusupova", role: "backend", phone: "+998901111111", isMentor: false, isAdvisor: false, joinedAt: "2024-03-16", confirmed: true },
      { id: "m3", name: "Sherzod Rahimov", role: "frontend", phone: "+998902222222", isMentor: false, isAdvisor: false, joinedAt: "2024-03-17", confirmed: true },
      { id: "m4", name: "Prof. Normatov Bahodir", role: "mentor", isMentor: true, isAdvisor: false, joinedAt: "2024-03-20", confirmed: true },
    ],
    project: "AgroAI Monitor",
    direction: "Agrotexnologiyalar va suv tejamkor yechimlar",
    status: "active",
    isLeader: true,
    createdAt: "2024-03-15",
  },
  {
    id: "team_002",
    name: "EduTech Lab",
    shortDescription: "Zamonaviy ta'lim platformasi",
    leader: "Malika Toshmatova",
    members: [
      { id: "m5", name: "Malika Toshmatova", role: "project_leader", isMentor: false, isAdvisor: false, joinedAt: "2024-04-01", confirmed: true },
      { id: "m6", name: "Azizbek Karimov", role: "backend", isMentor: false, isAdvisor: false, joinedAt: "2024-04-02", confirmed: true },
    ],
    project: "InterLearn",
    direction: "Ta'lim texnologiyalari",
    status: "active",
    isLeader: false,
    createdAt: "2024-04-01",
  },
];

export const mockInvites: TeamInvite[] = [
  {
    id: "inv_001",
    teamName: "FinTech Innovators",
    invitedBy: "Jasur Qodirov",
    role: "business_analyst",
    sentAt: "2024-06-20T14:00:00Z",
    status: "pending",
  },
  {
    id: "inv_002",
    teamName: "Green Energy",
    invitedBy: "Sarvar Xolmatov",
    role: "ai_specialist",
    sentAt: "2024-06-18T09:00:00Z",
    status: "pending",
  },
];
