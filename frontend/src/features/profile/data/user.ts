export type UserRole =
  | "solo_participant"
  | "team_leader"
  | "team_member"
  | "mentor"
  | "advisor"
  | "otm_participant"
  | "independent_participant"
  | "initiative_member";

export type ParticipationType = "otm" | "independent" | "team";

export type EmploymentStatus =
  | "student"
  | "master"
  | "phd"
  | "developer"
  | "entrepreneur"
  | "unemployed"
  | "other";

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: string;
  age: number;
  gender: "male" | "female";
  pinfl: string;
  passportSeries: string;
  passportNumber: string;
  phone: string;
  phoneVerified: boolean;
  email: string;
  emailVerified: boolean;
  telegram: string;
  region: string;
  district: string;
  mahalla: string;
  street: string;
  role: UserRole;
  participationType: ParticipationType;
  employmentStatus: EmploymentStatus;
  institution?: string;
  faculty?: string;
  educationDirection?: string;
  course?: number;
  profileCompletion: number;
  profileLocked?: boolean;
  avatarUrl?: string;
  createdAt: string;
  lastLogin: string;
}

export const mockUser: UserProfile = {
  id: "user_001",
  firstName: "Azizbek",
  lastName: "Karimov",
  middleName: "Behruz o'g'li",
  birthDate: "2001-05-14",
  age: 23,
  gender: "male",
  pinfl: "14005********",
  passportSeries: "AB",
  passportNumber: "1234567",
  phone: "+998 90 123 45 67",
  phoneVerified: true,
  email: "azizbek.karimov@example.com",
  emailVerified: true,
  telegram: "@azizbek_k",
  region: "Qashqadaryo viloyati",
  district: "Qarshi shahar",
  mahalla: "Bog'ishamol MFY",
  street: "Navoiy ko'chasi, 12-uy",
  role: "team_leader",
  participationType: "otm",
  employmentStatus: "student",
  institution: "Qarshi Davlat Universiteti",
  faculty: "Axborot texnologiyalari",
  educationDirection: "Dasturiy injiniring",
  course: 3,
  profileCompletion: 85,
  profileLocked: false,
  avatarUrl: undefined,
  createdAt: "2024-03-15T10:30:00Z",
  lastLogin: "2024-06-22T09:15:00Z",
};
