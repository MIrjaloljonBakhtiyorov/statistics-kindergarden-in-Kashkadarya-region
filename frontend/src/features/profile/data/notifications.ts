export type NotificationType =
  | "application"
  | "team"
  | "sorting"
  | "result"
  | "monitoring"
  | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
}

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "application",
    title: "Arizangiz qabul qilindi",
    body: "QSL-2024-0142 raqamli arizangiz texnik tekshiruvdan o'tdi va saralashga qabul qilindi.",
    isRead: false,
    createdAt: "2024-06-22T08:00:00Z",
    actionUrl: "/profile/applications",
    actionLabel: "Arizani ko'rish",
  },
  {
    id: "n2",
    type: "sorting",
    title: "Taqdimot sanasi belgilandi",
    body: "Viloyat finali taqdimoti 20-avgust kuni soat 10:00 da Qarshi DU asosiy binoda bo'lib o'tadi.",
    isRead: false,
    createdAt: "2024-06-21T14:30:00Z",
    actionUrl: "/profile/overview",
    actionLabel: "Taqvimni ko'rish",
  },
  {
    id: "n3",
    type: "team",
    title: "Jamoaga taklif",
    body: "FinTech Innovators jamoasi sizni business_analyst sifatida jamoa a'zosi bo'lishga taklif qilmoqda.",
    isRead: false,
    createdAt: "2024-06-20T16:00:00Z",
    actionUrl: "/profile/teams",
    actionLabel: "Taklifni ko'rish",
  },
  {
    id: "n4",
    type: "system",
    title: "Profilni to'ldiring",
    body: "Profilingiz 85% to'ldirilgan. Pasport ma'lumotlaringizni kiriting.",
    isRead: true,
    createdAt: "2024-06-19T10:00:00Z",
    actionUrl: "/profile/personal",
    actionLabel: "Profilni tahrirlash",
  },
  {
    id: "n5",
    type: "result",
    title: "Sertifikat tayyorlandi",
    body: "OTM saralashi g'olibi sertifikatingiz tayyorlandi. Yuklab olishingiz mumkin.",
    isRead: true,
    createdAt: "2024-06-15T12:00:00Z",
    actionUrl: "/profile/certificates",
    actionLabel: "Sertifikatni ko'rish",
  },
  {
    id: "n6",
    type: "monitoring",
    title: "Monitoring hisoboti eslatmasi",
    body: "Iyun oyi monitoring hisobotini topshirish muddati 30-iyun.",
    isRead: true,
    createdAt: "2024-06-14T09:00:00Z",
    actionUrl: "/profile/monitoring",
    actionLabel: "Monitoring",
  },
];
