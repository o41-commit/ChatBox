import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/poppins";
import "./index.css";
import App from "./App.jsx";
import { initTheme } from "./utils/theme";

// Initialize theme from localStorage (applies before React mounts)
initTheme();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
