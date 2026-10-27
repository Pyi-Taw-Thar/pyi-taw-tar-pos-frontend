// e-commerce သာ သုံးနေစဉ် POS / အရောင်းပိုင်းကို ဖျောက်ထား — true ပြောင်းလျှင် menu card နှင့် route ပြန်ပေါ်
export const FEATURES = {
  posSales: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;
