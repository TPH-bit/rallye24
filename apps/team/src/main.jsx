import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Monte l'app sur <div id="app"></div> (défini dans index.html)
function mount() {
  const el = document.getElementById("app");
  if (!el) return;
  createRoot(el).render(<App />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
