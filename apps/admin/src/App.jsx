// apps/admin/src/App.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import DeleteTeamButton from "./components/DeleteTeamButton";
import { DeleteTeamButton } from "./components/DeleteTeamButton";


export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Admin — Équipes</h1>
      <AuthGate>
        <TeamsList />
      </AuthGate>
    </div>
  );
}

// Oblige à être connecté (GM) dans l’onglet admin
function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(() =>
      supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  if (checking) return <p>Vérification…</p>;
  if (!user) return <p>Veuillez vous connecter en GM dans cet onglet.</p>;
  return <>{children}</>;
}

function TeamsList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    // On affiche toutes les équipes (team + admin + gm) pour gestion
    const { data, error } = await supabase
      .from("profiles")
      .select("id, team_name, role")
      .order("role", { ascending: true })
      .order("team_name", { ascending: true });

    if (error) {
      alert(`Lecture impossible: ${error.message}`);
    } else {
      setRows(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p>Chargement…</p>;

  return (
    <table cellPadding={6} border={1} style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left" }}>Nom</th>
          <th style={{ textAlign: "left" }}>Rôle</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>{r.team_name || <i>(sans nom)</i>}</td>
            <td>{r.role}</td>
            <td style={{ textAlign: "center" }}>
              {/* Ne pas autoriser la suppression des comptes GM/Admin */}
              {r.role === "team" ? (
                <DeleteTeamButton teamId={r.id} teamName={r.team_name || r.id} onDeleted={load} />
              ) : (
                <span style={{ color: "#999" }}>—</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

