import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient.js";

export default function App() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  async function loadTeams() {
    setLoading(true);
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setMsg(`Erreur chargement: ${error.message}`);
    else {
      setTeams(data || []);
      setMsg("");
    }
    setLoading(false);
  }

  async function createTeam(e) {
    e.preventDefault();
    setMsg("");
    if (!name.trim() || !code.trim()) {
      setMsg("Nom et code requis.");
      return;
    }
    const { error } = await supabase
      .from("teams")
      .insert([{ name: name.trim(), code: code.trim() }]);
    if (error) {
      setMsg(`Erreur création: ${error.message}`);
      return;
    }
    setName("");
    setCode("");
    setMsg("Équipe créée.");
    await loadTeams();
  }

  useEffect(() => {
    loadTeams();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <h1 style={{ margin: 0, marginBottom: 10 }}>Rallye24 — Équipe</h1>

      {msg && (
        <div style={{ background: "#0f3", opacity: 0.85, padding: 10, marginBottom: 12 }}>
          {msg}
        </div>
      )}

      <form
        onSubmit={createTeam}
        style={{
          display: "grid",
          gap: 10,
          gridTemplateColumns: "1fr 200px 140px",
          alignItems: "center",
          background: "#1b2230",
          padding: 12,
          borderRadius: 8,
          marginBottom: 18,
        }}
      >
        <input
          placeholder="Nom de l’équipe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #2b3445" }}
        />
        <input
          placeholder="Code (ex: GM24-A)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #2b3445" }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "none",
            background: "#ffcd00",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Créer une équipe
        </button>
      </form>

      <section
        style={{
          background: "#121721",
          borderRadius: 8,
          padding: 12,
          minHeight: 120,
        }}

       <h2 style={{ margin: 0, marginBottom: 10, fontSize: 18 }}>Liste des équipes</h2>
        {loading ? (
          <p>Chargement…</p>
        ) : teams.length === 0 ? (
          <p>Aucune équipe.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {teams.map((t) => (
              <li
                key={t.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 140px 220px",
                  gap: 8,
                  padding: "10px 8px",
                  borderBottom: "1px solid #232b3a",
                }}
              >
                <span style={{ fontWeight: 600 }}>{t.name}</span>
                <span style={{ background: "#223048", padding: "4px 8px", borderRadius: 6 }}>
                  {t.code}
                </span>
                <span style={{ color: "#9fb0c7" }}>
                  {new Date(t.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
