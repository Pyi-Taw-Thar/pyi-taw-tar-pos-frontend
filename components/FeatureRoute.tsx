import React from "react";
import { Navigate } from "react-router-dom";
import { FEATURES, type FeatureKey } from "../config/features";

// flag ပိတ်ထားသော page ကို URL တိုက်ရိုက်ဖြင့် ဝင်လျှင် menu သို့ ပြန်ပို့
export const FeatureRoute: React.FC<{
  feature: FeatureKey;
  children: React.ReactElement;
}> = ({ feature, children }) =>
  FEATURES[feature] ? children : <Navigate to="/menu" replace />;
