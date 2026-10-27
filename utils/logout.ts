import { removeAuthToken } from "../services/axios";
import { toast } from "sonner";
import type { NavigateFunction } from "react-router-dom";

export const performLogout = (
  navigate: NavigateFunction,
  t: (key: string, params?: Record<string, string | number>) => string,
  onAfterLogout?: () => void
) => {
  removeAuthToken();
  localStorage.removeItem("adminData");
  toast.success(t("sidebar.loggedOut"));
  navigate("/login");
  if (onAfterLogout) {
    onAfterLogout();
  }
};
