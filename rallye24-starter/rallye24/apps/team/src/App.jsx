
import React, { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

export default function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [riddles, setRiddles] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess))
    return () => sub.subscription.unsubscribe()
  }, [])

  async function signUp(e) {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
  }

  async function signIn(e) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function loadRiddles() {
    const { data, error } = await supabase.from('riddles').select('*').eq('is_active', true).limit(5)
    if (error) { alert(error.message); return }
    setRiddles(data ?? [])
  }

  if (!session) {
    return (
      <main style={{padding:20,fontFamily:'system-ui'}}>
        <h1>Rallye24 — Équipe</h1>
        <form onSubmit={signIn} style={{display:'grid',gap:8,maxWidth:320}}>
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input placeholder="Mot de passe" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <div style={{display:'flex',gap:8}}>
            <button type="submit">Se connecter</button>
            <button type="button" onClick={signUp}>Créer un compte</button>
          </div>
        </form>
      </main>
    )
  }

  return (
    <main style={{padding:20,fontFamily:'system-ui'}}>
      <h1>Rallye24 — Équipe</h1>
      <button onClick={signOut}>Se déconnecter</button>
      <section style={{marginTop:20}}>
        <h2>Énigmes actives (démo)</h2>
        <button onClick={loadRiddles}>Charger 5 énigmes</button>
        <ul>
          {riddles.map(r => (
            <li key={r.id}><strong>#{r.index_hint}</strong> — {r.rtype}</li>
          ))}
        </ul>
        <p style={{opacity:.7}}>Écran minimal pour vérifier la lecture des données.</p>
      </section>
    </main>
  )
}
