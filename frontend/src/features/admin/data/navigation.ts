import {
  LayoutDashboard,
  Trophy,
  Users,
  Files,
  UserCog,
  Scale,
  Grid3X3,
  Layers,
  ClipboardCheck,
  Medal,
  Gavel,
  Award,
  Activity,
  Bell,
  BarChart3,
  Settings,
  Building2,
  MapPin,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
}

export const navigationItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    id: "competitions",
    label: "Tanlovlar",
    path: "/admin/competitions",
    icon: Trophy,
  },
  {
    id: "users",
    label: "Foydalanuvchilar",
    path: "/admin/users",
    icon: Users,
  },
  {
    id: "applications",
    label: "Arizalar",
    path: "/admin/applications",
    icon: Files,
  },
  {
    id: "coordinators",
    label: "Mas'ullar",
    path: "/admin/coordinators",
    icon: UserCog,
  },
  {
    id: "judges",
    label: "Hakamlar",
    path: "/admin/judges",
    icon: Scale,
  },

  {
    id: "directions",
    label: "Yo'nalishlar",
    path: "/admin/directions",
    icon: Grid3X3,
  },
  {
    id: "institutions",
    label: "OTMlar",
    path: "/admin/institutions",
    icon: Building2,
  },
  {
    id: "regions",
    label: "Hududlar",
    path: "/admin/regions",
    icon: MapPin,
  },
  {
    id: "stages",
    label: "Bosqichlar",
    path: "/admin/stages",
    icon: Layers,
  },
  {
    id: "evaluations",
    label: "Baholash",
    path: "/admin/evaluations",
    icon: ClipboardCheck,
  },
  {
    id: "results",
    label: "Natijalar",
    path: "/admin/results",
    icon: Medal,
  },
  {
    id: "appeals",
    label: "Apellyatsiyalar",
    path: "/admin/appeals",
    icon: Gavel,
  },
  {
    id: "certificates",
    label: "Sertifikatlar",
    path: "/admin/certificates",
    icon: Award,
  },
  {
    id: "monitoring",
    label: "Monitoring",
    path: "/admin/monitoring",
    icon: Activity,
  },
  {
    id: "notifications",
    label: "Xabarlar",
    path: "/admin/notifications",
    icon: Bell,
  },
  {
    id: "reports",
    label: "Hisobotlar",
    path: "/admin/reports",
    icon: BarChart3,
  },
  {
    id: "settings",
    label: "Sozlamalar",
    path: "/admin/settings",
    icon: Settings,
  },
];
