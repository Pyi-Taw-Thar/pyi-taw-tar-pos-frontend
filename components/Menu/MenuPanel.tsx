import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { MenuSection, MenuItem } from "../../config/menuConfig";

interface MenuPanelProps {
  section: MenuSection;
}

export const MenuPanel: React.FC<MenuPanelProps> = ({ section }) => {
  const { t } = useLanguage();

  return (
    <section className="bg-slate-50 rounded-xl border border-slate-200 p-3">
      <h3 className="px-1 pb-2 text-[17px] font-semibold text-slate-800 leading-[1.6]">
        {t(section.titleKey)}
      </h3>
      <div className="space-y-2">
        {section.items.map((item: MenuItem) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="group flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 min-h-[60px] cursor-pointer shadow-sm hover:border-primary hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary outline-none active:scale-[0.99] motion-reduce:active:scale-100 transition"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white group-focus-visible:bg-primary group-focus-visible:text-white transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold text-slate-800 leading-[1.6] truncate group-hover:text-primary group-focus-visible:text-primary transition-colors">
                  {t(item.labelKey)}
                </div>
                <p className="text-[13px] text-slate-600 line-clamp-1 leading-[1.6]">
                  {t(item.descKey)}
                </p>
              </div>
              <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white group-focus-visible:bg-primary group-focus-visible:text-white transition-colors">
                <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
