import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

function roleLabel(role) {
  if (role === "gm") return "GM";
  if (role === "admin") return "ADMIN";
  if (role === "team") return "EQUIPE";
  return "";
}

export default function App() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  async function loadTeams() {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("profiles")
      .select("id, team_name, role")
      .order("role", { ascending: true, nullsFirst: true })
      .order("team_name", { ascending: true, nullsFirst: true });

    if (error) setError(error.message ?? String(error));
    else setTeams(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadTeams();
  }, []);

  async function handleDelete(team) {
    if (!team?.id) return;
    if (team.role !== "team") {
      alert("Par sécurité, suppression réservée aux équipes (role = team).");
      return;
    }
    const ok = confirm(
      `Supprimer définitivement l’équipe « ${team.team_name || team.id} » ?`
    );
    if (!ok) return;

    setBusyId(team.id);
    setError("");
    const { error } = await supabase.rpc("delete_team", { team_id: team.id });
    setBusyId(null);

    if (error) {
      alert(error.message ?? String(error));
      return;
    }
    setTeams((prev) => prev.filter((t) => t.id !== team.id));
    alert("Équipe supprimée.");
  }

  return (
    <div style={{ maxWidth: 960, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 16 }}>Gestion des équipes (GM)</h1>

      <div style={{ marginBottom: 12 }}>
        <button onClick={loadTeams} disabled={loading} style={btn()}>
          {loading ? "Chargement…" : "Rafraîchir"}
        </button>
      </div>

      {error ? <div style={alertBox("error")}>{error}</div> : null}

      {loading ? (
        <div>Chargement…</div>
      ) : (
        <table style={table()}>
          <thead>
            <tr>
              <th style={thTd()}>Nom</th>
              <th style={thTd()}>Rôle</th>
              <th style={thTd()}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => (
              <tr key={t.id}>
                <td style={thTd()}>{t.team_name || t.id}</td>
                <td style={thTd()}>{roleLabel(t.role)}</td>
                <td style={thTd()}>
                  <button
                    onClick={() => handleDelete(t)}
                    disabled={busyId === t.id || t.role !== "team"}
                    style={btn("danger", busyId === t.id || t.role !== "team")}
                    title={
                      t.role !== "team"
                        ? "Par sécurité, suppression réservée aux équipes."
                        : "Supprimer l’équipe"
                    }
                  >
                    {busyId === t.id ? "Suppression…" : "Supprimer"}
                  </button>
                </td>
              </tr>
            ))}
            {teams.length === 0 && (
              <tr>
                <td style={thTd()} colSpan={3}>
                  Aucune équipe.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* Styles inline simples */
function btn(kind = "primary", disabled = false) {
  const base = {
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #ccc",
    cursor: disabled ? "not-allowed" : "pointer",
    background: "#f4f4f4",
  };
  if (kind === "danger") {
    base.background = disabled ? "#f8d7da" : "#dc3545";
    base.color = disabled ? "#7a1b25" : "#fff";
    base.border = "1px solid #c82333";
  }
  return base;
}
function table() {
  return { width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" };
}
function thTd() {
  return { border: "1px solid #ddd", padding: "8px", textAlign: "left" };
}
function alertBox(type = "info") {
  const s = { padding: "8px 12px", borderRadius: 6, marginBottom: 12 };
  if (type === "error") {
    s.background = "#fdecea";
    s.border = "1px solid #f5c2c7";
    s.color = "#842029";
  }
  return s;
}
