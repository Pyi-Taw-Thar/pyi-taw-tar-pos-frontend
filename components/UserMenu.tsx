import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useApp } from "../context/AppContext";
import { performLogout } from "../utils/logout";

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { currentUser } = useApp();

  const adminData = useMemo(() => {
    try {
      const saved = localStorage.getItem("adminData");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const userRole = useMemo(() => {
    if (adminData?.role) return String(adminData.role).toLowerCase();
    return String(currentUser?.role || "staff").toLowerCase();
  }, [adminData?.role, currentUser?.role]);

  const userName = adminData?.name || currentUser?.name || "User";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    performLogout(navigate, t);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-lg text-white hover:bg-white/10 transition-colors text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white">
          <User className="w-4 h-4" />
        </div>
        <span className="font-medium max-w-[100px] sm:max-w-[140px] truncate">
          {userName}
        </span>
        <span className="text-[10px] text-white/60 bg-white/10 px-1.5 py-0.5 rounded uppercase hidden sm:inline">
          {userRole}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-white/70 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 overflow-hidden text-slate-800">
          <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/50">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {userName}
            </p>
            <p className="text-xs text-slate-500 capitalize">
              Role: <span className="font-medium text-slate-700">{userRole}</span>
            </p>
          </div>

          <div className="py-1">
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>{t("sidebar.settings")}</span>
            </Link>
          </div>

          <div className="border-t border-slate-100 py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>{t("sidebar.logout")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
