// e-commerce သာ သုံးနေစဉ် POS / အရောင်းပိုင်း နှင့် AI Assistant ကို ဖျောက်ထား — true ပြောင်းလျှင် menu card နှင့် route ပြန်ပေါ်
export const FEATURES = {
  posSales: false,
  aiAssistant: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;
