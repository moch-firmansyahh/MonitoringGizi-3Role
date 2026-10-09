import { RolePengguna } from "@/types";

export const PUBLIC_ROUTES = ["/login"];

export const ROLE_ROUTE_PREFIXES: Record<RolePengguna, string[]> = {
  posyandu: [
    "/pencatatan-anak",
    "/rekap-data-gizi",
    "/riwayat-pemeriksaan",
    "/rujukan",
    "/anak",
  ],
  puskesmas: ["/puskesmas", "/anak"],
  orang_tua: ["/orang-tua"],
};

export const AUTH_COOKIE_NAME = "simgizi_session";
export const ROLE_COOKIE_NAME = "simgizi_role";
