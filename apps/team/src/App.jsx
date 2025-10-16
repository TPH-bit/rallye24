import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient.js";

export default function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  // --- Auth ---
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

  async function signUp(e) {
    e.preventDefault();
    setMsg("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMsg(`Signup NOK: ${error.message}`);
    else setMsg("Compte créé. Vérifie tes mails si Magic Link activé.");
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  // --- Teams ---
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

  useEffect(() => {
    if (session) loadTeams();
  }, [session]);

  // --- UI ---
  if (!session) {
    return (
      <div style={{ maxWidth: 420, margin: "60px auto", padding: 20 }}>
        <h1 style={{ margin: 0, marginBottom: 10 }}>Rallye24 — Connexion</h1>
        {msg && <div style={{ background: "#0f3", opacity: 0.85, padding: 10, margin
