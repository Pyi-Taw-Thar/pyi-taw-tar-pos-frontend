import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { WorkQueueItemConfig, WorkQueueKey } from "../../config/menuConfig";

export type WorkQueueTileState =
  | { status: "loading" }
  | { status: "ready"; count: number }
  | { status: "error" };

interface WorkQueueProps {
  items: WorkQueueItemConfig[];
  states: Record<WorkQueueKey, WorkQueueTileState>;
}

export const WorkQueue: React.FC<WorkQueueProps> = ({ items, states }) => {
  const { t } = useLanguage();

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => {
        const state = states[item.key] || { status: "loading" };
        const isReady = state.status === "ready";
        const isError = state.status === "error";
        const isLoading = state.status === "loading";
        const count = isReady ? state.count : 0;
        const hasAttention = isReady && count > 0;

        const containerClasses = hasAttention
          ? "bg-amber-50 border-amber-200"
          : "bg-white border-slate-200";

        const actionBtnClasses = hasAttention
          ? "border-primary/40 bg-white text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary group-focus-visible:bg-primary group-focus-visible:text-white group-focus-visible:border-primary"
          : "border-slate-200 bg-white text-slate-500 group-hover:border-primary group-hover:text-primary group-focus-visible:border-primary group-focus-visible:text-primary";

        const labelText = t(item.labelKey);
        const actionText = t(item.actionKey);
        const statusText = isLoading
          ? ""
          : isError
          ? t("menu.workQueue.unavailable")
          : hasAttention
          ? t(item.activeTextKey, { n: count })
          : t(item.zeroTextKey);

        const ariaLabel = statusText
          ? `${labelText} — ${statusText}။ ${actionText}`
          : `${labelText}။ ${actionText}`;

        return (
          <Link
            key={item.key}
            to={item.path}
            aria-label={ariaLabel}
            className={`group cursor-pointer rounded-xl border p-4 min-h-[104px] flex flex-col justify-between transition hover:border-primary hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary outline-none active:scale-[0.98] motion-reduce:active:scale-100 ${containerClasses}`}
          >
            <div>
              {/* ကိန်းဂဏန်း / Skeleton / Error */}
              <div className="min-h-[36px] flex items-center">
                {isLoading ? (
                  <div
                    className="h-8 w-12 rounded bg-slate-200 animate-pulse"
                    aria-hidden="true"
                  />
                ) : (
                  <span
                    className={`text-[32px] font-bold leading-none tabular-nums motion-safe:transition-opacity motion-safe:duration-200 opacity-100 ${
                      hasAttention ? "text-[#1E2937]" : "text-slate-400"
                    }`}
                  >
                    {isError ? "—" : count}
                  </span>
                )}
              </div>

              {/* ခေါင်းစဉ်နှင့် အခြေအနေ ဝါကျ */}
              <div className="mt-2">
                <div className="text-[15px] font-semibold text-[#1E2937] leading-[1.6]">
                  {labelText}
                </div>
                {isLoading ? (
                  <div
                    className="h-4 w-24 rounded bg-slate-100 animate-pulse mt-1"
                    aria-hidden="true"
                  />
                ) : (
                  <div
                    className={`text-[13px] leading-[1.6] motion-safe:transition-opacity motion-safe:duration-200 opacity-100 ${
                      hasAttention
                        ? "font-medium text-[#B45309]"
                        : "text-slate-500"
                    }`}
                  >
                    {statusText}
                  </div>
                )}
              </div>
            </div>

            {/* လုပ်ဆောင်ချက် ခလုတ် (nested link မဖြစ်စေရန် span ဖြင့်) */}
            <span
              className={`mt-3 self-start inline-flex items-center gap-1 rounded-lg border px-3 min-h-[36px] text-[13px] font-semibold leading-[1.6] transition-colors ${actionBtnClasses}`}
            >
              <span>{actionText}</span>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </span>
          </Link>
        );
      })}
    </div>
  );
};
