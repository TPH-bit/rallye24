import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";

/* Libellés de rôle */
function roleLabel(role) {
  if (role === "gm") return "GM";
  if (role === "admin") return "ADMIN";
  if (role === "team") return "EQUIPE";
  return "";
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
  } else {
    s.background = "#eef5ff";
    s.border = "1px solid #cfe2ff";
    s.color = "#084298";
  }
  return s;
}

export default function App() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [me, setMe] = useState(null); // user connecté (email)
  const [search, setSearch] = useState("");

  /* --------- Chargement utilisateur connecté --------- */
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setMe(data?.user || null);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setMe(session?.user || null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  /* --------- Chargement des profils (équipes) --------- */
  const fetchTeams = async () => {
    setLoading(true);
    setError("");
    setInfo("");

    const { data, error } = await supabase
      .from("profiles")
      .select("id, team_name, role")
      .order("role", { ascending: true, nullsFirst: true })
      .order("team_name", { ascending: true, nullsFirst: true });

    if (error) setError(error.message ?? String(error));
    else setTeams(data ?? []);

    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  /* --------- Realtime: profils (insert/update/delete) --------- */
  useEffect(() => {
    const ch = supabase
      .channel("profiles-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => fetchTeams()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  /* --------- Suppression d'une équipe --------- */
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
    setInfo("");

    // RPC attend un team_id = id du profil équipe
    const { error } = await supabase.rpc("delete_team", { team_id: team.id });
    setBusyId(null);

    if (error) {
      setError(error.message ?? String(error));
      return;
    }
    setTeams((prev) => prev.filter((t) => t.id !== team.id));
    setInfo("Équipe supprimée.");
  }

  async function signOut() {
    setError("");
    setInfo("");
    await supabase.auth.signOut();
    setMe(null);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((t) => {
      const name = (t.team_name || "").toLowerCase();
      const r = (t.role || "").toLowerCase();
      return name.includes(q) || r.includes(q);
    });
  }, [teams, search]);

  return (
    <div style={{ maxWidth: 960, margin: "40px auto", padding: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <h1 style={{ marginBottom: 16, marginTop: 0 }}>Gestion des équipes (GM)</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {me?.email ? (
            <span style={{ fontSize: 14, color: "#555" }}>{me.email}</span>
          ) : (
            <span style={{ fontSize: 14, color: "#999" }}>Non connecté</span>
          )}
          <button onClick={signOut} style={btn()} title="Se déconnecter">Se déconnecter</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={fetchTeams} disabled={loading} style={btn()}>
          {loading ? "Chargement…" : "Rafraîchir"}
        </button>
        <input
          placeholder="Filtrer par nom / rôle…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", flex: 1 }}
        />
      </div>

      {error ? <div style={alertBox("error")}>{error}</div> : null}
      {info ? <div style={alertBox("info")}>{info}</div> : null}

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
            {filtered.map((t) => (
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
            {filtered.length === 0 && (
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
