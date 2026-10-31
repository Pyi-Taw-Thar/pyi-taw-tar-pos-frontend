import React, { useState, useEffect } from "react";

export interface ProductThumbProps {
  src?: string | null;
  size?: "sm" | "md";
  className?: string;
}

// ပစ္စည်းပုံပြသသည့် Shared Component (ပုံပျက်နေပါက သို့မဟုတ် ပုံမရှိပါက PTT placeholder သို့ အလိုအလျောက် ပြောင်းလဲပြသသည်)
export const ProductThumb: React.FC<ProductThumbProps> = ({
  src,
  size = "sm",
  className = "",
}) => {
  const [failed, setFailed] = useState(false);

  // src တန်ဖိုး ပြောင်းလဲသည့်အခါ failed state ကို ပြန်လည် reset ပြုလုပ်သည်
  useEffect(() => {
    setFailed(false);
  }, [src]);

  const sizeClass = size === "md" ? "w-12 h-12" : "w-10 h-10";

  // URL အမှန်တကယ် ရှိပြီး ပုံဆွဲတင်ရာတွင် မအောင်မြင်သေးပါက img tag ဖြင့် ပြသသည်
  const validSrc = typeof src === "string" && src.trim().length > 0 ? src.trim() : null;

  if (validSrc && !failed) {
    return (
      <img
        src={validSrc}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${sizeClass} object-cover rounded-lg border border-slate-200 flex-shrink-0 ${className}`}
      />
    );
  }

  // ပုံမရှိပါက သို့မဟုတ် ပုံဆွဲတင်မရပါက PTT placeholder ပြသသည်
  return (
    <div
      className={`${sizeClass} rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-semibold flex-shrink-0 ${className}`}
    >
      PTT
    </div>
  );
};
