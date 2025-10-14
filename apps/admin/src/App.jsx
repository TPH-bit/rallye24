// apps/admin/src/App.jsx
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { DeleteTeamButton } from "./components/DeleteTeamButton";

export default function App() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  async function load() {
    setLoading(true);
    setErr(null);
    // charge id, team_name, role
    const { data, error } = await supabase
      .from("profiles")
      .select("id, team_name, role")
      .order("role", { nullsFirst: true })
      .order("team_name", { nullsLast: true });
    if (error) setErr(error.message);
    else setTeams(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function removeFromList(teamId) {
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
  }

  if (loading) return <div style={{ padding: 16 }}>Chargement…</div>;
  if (err) return <div style={{ padding: 16, color: "red" }}>Erreur: {err}</div>;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 12 }}>Gestion des équipes</h1>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #ddd",
        }}
      >
        <thead>
          <tr style={{ background: "#f7f7f7" }}>
            <th style={th}>Nom</th>
            <th style={th}>Rôle</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id} style={{ borderTop: "1px solid #eee" }}>
              <td style={td}>{team.team_name || "—"}</td>
              <td style={td}>{team.role || "team"}</td>
              <td style={td}>
                <DeleteTeamButton
                  teamId={team.id}
                  teamName={team.team_name || "Cette équipe"}
                  onDeleted={() => removeFromList(team.id)}
                />
              </td>
            </tr>
          ))}
          {teams.length === 0 && (
            <tr>
              <td style={td} colSpan={3}>
                Aucune équipe.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: 12 }}>
        <button onClick={load}>Rafraîchir</button>
      </div>
    </div>
  );
}

const th = { textAlign: "left", padding: 8, borderLeft: "1px solid #ddd" };
const td = { padding: 8, borderLeft: "1px solid #eee" };
