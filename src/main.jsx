import React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./context/AppContext.jsx";
import App from "./App.jsx";
import "./index.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
createRoot(document.getElementById("root")).render(
  <AppProvider>
    <App />
    <SpeedInsights />
  </AppProvider>,
);
