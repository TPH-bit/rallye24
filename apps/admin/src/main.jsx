import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { supabase } from "./lib/supabaseClient.js";

const app = document.getElementById("app");

function renderLogin() {
  app.innerHTML = `
    <h1>Connexion GM</h1>
    <form id="login" class="row" style="margin:20px 0;">
      <input id="email" type="email" placeholder="Email GM" required />
      <input id="password" type="password" placeholder="Mot de passe" required />
      <button type="submit">Se connecter</button>
    </form>
    <p class="muted">Tu dois te connecter pour voir les équipes.</p>
    <p id="err" class="error"></p>
  `;
  document.getElementById("login").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      document.getElementById("err").textContent = error.message;
      return;
    }
    window.location.reload();
  });
}

function renderShell() {
  app.innerHTML = `
    <h1>Gestion des équipes (GM)</h1>
    <div class="row" style="margin:10px 0 20px;">
      <button id="refresh">Rafraîchir</button>
      <button id="logout">Se déconnecter</button>
    </div>

    <!-- Toast succès -->
    <div id="toast" style="position:fixed;top:20px;right:20px;padding:10px 14px;background:#16a34a;color:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.15);display:none;z-index:1000"></div>

    <table>
      <thead>
        <tr><th>Nom</th><th>Rôle</th><th>Actions</th></tr>
      </thead>
      <tbody id="tbody"><tr><td colspan="3">Chargement…</td></tr></tbody>
    </table>
  `;
  document.getElementById("refresh").onclick = loadTeams;
  document.getElementById("logout").onclick = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // Délégation de clic pour les boutons Supprimer
  document.getElementById("tbody").addEventListener("click", async (e) => {
    const btn = e.target.closest("button.btn-del");
    if (!btn) return;
    await deleteTeam(btn.dataset.id, btn.dataset.name);
  });
}

function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => (t.style.display = "none"), 2000);
}

function canDelete(role) {
  const r = String(role || "").trim().toLowerCase();
  return !(r === "gm" || r === "admin");
}

async function deleteTeam(id, name) {
  if (!confirm(`Supprimer définitivement "${name}" ?`)) return;
  const { error } = await supabase.rpc("delete_team", { _team_id: id });
  if (error) {
    alert(error.message);
    return;
  }
  await loadTeams();
  showToast(`Équipe "${name}" supprimée`);
}

function renderRows(rows) {
  const tb = document.getElementById("tbody");
  if (!rows || rows.length === 0) {
    tb.innerHTML = `<tr><td colspan="3">Aucune équipe.</td></tr>`;
    return;
  }
  tb.innerHTML = rows
    .map((r) => {
      const action = canDelete(r.role)
        ? `<button class="btn-del rounded" data-id="${r.id}" data-name="${r.team_name ?? ""}">Supprimer</button>`
        : `<span class="muted">—</span>`;
      return `
      <tr>
        <td>${r.team_name ?? ""}</td>
        <td>${r.role ?? ""}</td>
        <td>${action}</td>
      </tr>`;
    })
    .join("");
}

async function loadTeams() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, team_name, role")
    .order("team_name", { ascending: true });
  if (error) {
    renderRows([]);
    console.error(error);
    document.getElementById("tbody").innerHTML =
      `<tr><td colspan="3" class="error">${error.message}</td></tr>`;
    return;
  }
  renderRows(data);
}

async function boot() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    renderLogin();
    return;
  }
  renderShell();
  await loadTeams();
}

boot();
