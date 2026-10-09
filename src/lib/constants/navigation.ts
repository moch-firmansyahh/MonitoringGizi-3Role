import {
  LayoutDashboard,
  UserPlus,
  FileText,
  Clock,
  Send,
  Building2,
  AlertTriangle,
  ClipboardList,
  Home,
  TrendingUp,
  Calendar,
  PlusCircle,
  LucideIcon,
} from "lucide-react";
import { RolePengguna } from "@/types";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

export const ROLE_NAV_ITEMS: Record<RolePengguna, NavItem[]> = {
  posyandu: [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
    },
    {
      id: "pencatatan-anak",
      label: "Pencatatan Data Anak",
      icon: UserPlus,
      href: "/pencatatan-anak",
    },
    {
      id: "rekap-data-gizi",
      label: "Rekap Data Gizi",
      icon: FileText,
      href: "/rekap-data-gizi",
    },
    {
      id: "riwayat-pemeriksaan",
      label: "Riwayat Pemeriksaan",
      icon: Clock,
      href: "/riwayat-pemeriksaan",
    },
    {
      id: "rujukan",
      label: "Rujukan Faskes",
      icon: Send,
      href: "/rujukan",
    },
  ],
  puskesmas: [
    {
      id: "dashboard",
      label: "Dashboard Wilayah",
      icon: LayoutDashboard,
      href: "/puskesmas",
    },
    {
      id: "posyandu",
      label: "Posyandu Binaan",
      icon: Building2,
      href: "/puskesmas/posyandu",
    },
    {
      id: "balita-berisiko",
      label: "Balita Berisiko",
      icon: AlertTriangle,
      href: "/puskesmas/balita-berisiko",
    },
    {
      id: "rujukan",
      label: "Inbox Rujukan",
      icon: ClipboardList,
      href: "/puskesmas/rujukan",
    },
    {
      id: "laporan",
      label: "Laporan Wilayah",
      icon: FileText,
      href: "/puskesmas/laporan",
    },
  ],
  orang_tua: [
    {
      id: "beranda",
      label: "Beranda",
      icon: Home,
      href: "/orang-tua",
    },
    {
      id: "perkembangan",
      label: "Perkembangan",
      icon: TrendingUp,
      href: "/orang-tua/perkembangan",
    },
    {
      id: "jadwal",
      label: "Jadwal",
      icon: Calendar,
      href: "/orang-tua/jadwal",
    },
    {
      id: "klaim",
      label: "Tautkan Anak",
      icon: PlusCircle,
      href: "/orang-tua/klaim",
    },
  ],
};

export const ROLE_HOMEPAGE: Record<RolePengguna, string> = {
  posyandu: "/",
  puskesmas: "/puskesmas",
  orang_tua: "/orang-tua",
};
