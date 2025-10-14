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
}

function renderRows(rows) {
  const tb = document.getElementById("tbody");
  if (!rows || rows.length === 0) {
    tb.innerHTML = `<tr><td colspan="3">Aucune équipe.</td></tr>`;
    return;
  }
  tb.innerHTML = rows
    .map(
      (r) => `
      <tr>
        <td>${r.team_name ?? ""}</td>
        <td>${r.role ?? ""}</td>
        <td><span class="muted">—</span></td>
      </tr>`
    )
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
