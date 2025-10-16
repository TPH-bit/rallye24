import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient.js";

export default function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signIn(e) {
    e.preventDefault();
    setMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg(`Auth NOK: ${error.message}`);
  }

  async function signUp() {
    setMsg("");
    if (!email || !password || password.length < 10) {
      setMsg("Email requis et mot de passe ≥ 10 caractères.");
      return;
    }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMsg(`Signup NOK: ${error.message}`);
    else setMsg("Compte créé. Clique « Se connecter ».");
  }

  async function signOut() { await supabase.auth.signOut(); }

  async function loadTeams() {
    setLoading(true);
    const { data, error } = await supabase.from("teams").select("*").order("created_at", { ascending: false });
    if (error) setMsg(`Erreur chargement: ${error.message}`); else setTeams(data || []);
    setLoading(false);
  }

  async function createTeam(e) {
    e.preventDefault();
    setMsg("");
    if (!name.trim() || !code.trim()) { setMsg("Nom et code requis."); return; }
    const { error } = await supabase.from("teams").insert([{ name: name.trim(), code: code.trim() }]);
    if (error) { setMsg(`Erreur création: ${error.message}`); return; }
    setName(""); setCode(""); setMsg("Équipe créée."); await loadTeams();
  }

  useEffect(() => { if (session) loadTeams(); }, [session]);

  if (!session) {
    return (
      <div style={{ maxWidth: 420, margin: "60px auto", padding: 20 }}>
        <h1 style={{ margin: 0, marginBottom: 10 }}>Rallye24 — Connexion</h1>
        {msg && <div style={{ background: "#0f3", opacity: 0.85, padding: 10, marginBottom: 12 }}>{msg}</div>}
        <form onSubmit={signIn} style={{ display: "grid", gap: 10, background: "#1b2230", padding: 12, borderRadius: 8 }}>
          <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} style={{ padding: 10, borderRadius: 6, border: "1px solid #2b3445" }}/>
          <input type="password" placeholder="Mot de passe (≥10 car.)" value={password} onChange={(e)=>setPassword(e.target.value)} style={{ padding: 10, borderRadius: 6, border: "1px solid #2b3445" }}/>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button type="submit" style={{ padding: "10px 12px", borderRadius: 8, border: "none", background: "#ffcd00", fontWeight: 600, cursor: "pointer" }}>Se connecter</button>
            <button type="button" onClick={signUp} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #2b3445", background: "#121721", cursor: "pointer" }}>Créer un compte</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Rallye24 — Équipe</h1>
        <button onClick={signOut} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #2b3445", background: "#121721", cursor: "pointer" }}>Se déconnecter</button>
      </div>
      {msg && <div style={{ background: "#0f3", opacity: 0.85, padding: 10, margin: "12px 0" }}>{msg}</div>}
      <form onSubmit={createTeam} style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 200px 140px", alignItems: "center", background: "#1b2230", padding: 12, borderRadius: 8, marginBottom: 18 }}>
        <input placeholder="Nom de l’équipe" value={name} onChange={(e)=>setName(e.target.value)} style={{ padding: 10, borderRadius: 6, border: "1px solid #2b3445" }}/>
        <input placeholder="Code (ex: GM24-A)" value={code} onChange={(e)=>setCode(e.target.value)} style={{ padding: 10, borderRadius: 6, border: "1px solid #2b3445" }}/>
        <button type="submit" style={{ padding: "10px 12px", borderRadius: 8, border: "none", background: "#ffcd00", cursor: "pointer", fontWeight: 600 }}>Créer une équipe</button>
      </form>
      <section style={{ background: "#121721", borderRadius: 8, padding: 12, minHeight: 120 }}>
        <h2 style={{ margin: 0, marginBottom: 10, fontSize: 18 }}>Liste des équipes</h2>
        {loading ? <p>Chargement…</p> : teams.length === 0 ? <p>Aucune équipe.</p> : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {teams.map((t)=>(
              <li key={t.id} style={{ display: "grid", gridTemplateColumns: "1fr 140px 220px", gap: 8, padding: "10px 8px", borderBottom: "1px solid #232b3a" }}>
                <span style={{ fontWeight: 600 }}>{t.name}</span>
                <span style={{ background: "#223048", padding: "4px 8px", borderRadius: 6 }}>{t.code}</span>
                <span style={{ color: "#9fb0c7" }}>{new Date(t.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
