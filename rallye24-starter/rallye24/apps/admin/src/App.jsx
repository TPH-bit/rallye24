
import React, { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

export default function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [scores, setScores] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess))
    return () => sub.subscription.unsubscribe()
  }, [])

  async function signIn(e) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function loadScores() {
    const { data, error } = await supabase.from('scores').select('*')
    if (error) { alert(error.message); return }
    setScores(data ?? [])
  }

  if (!session) {
    return (
      <main style={{padding:20,fontFamily:'system-ui'}}>
        <h1>Rallye24 — Admin</h1>
        <form onSubmit={signIn} style={{display:'grid',gap:8,maxWidth:320}}>
          <input placeholder="Email admin" value={email} onChange={e=>setEmail(e.target.value)} />
          <input placeholder="Mot de passe" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button type="submit">Se connecter</button>
        </form>
        <p style={{opacity:.7}}>Utilise le compte créé dans Supabase → Authentication → Users.</p>
      </main>
    )
  }

  return (
    <main style={{padding:20,fontFamily:'system-ui'}}>
      <h1>Rallye24 — Admin</h1>
      <button onClick={signOut}>Se déconnecter</button>
      <section style={{marginTop:20}}>
        <h2>Classement (lecture seule)</h2>
        <button onClick={loadScores}>Charger les scores</button>
        <ul>
          {scores.map(s => (
            <li key={s.team_id}><code>{s.team_id}</code> — {s.total_points} pts</li>
          ))}
        </ul>
        <p style={{opacity:.7}}>Écran minimal pour vérifier la connexion et la vue <code>scores</code>.</p>
      </section>
    </main>
  )
}
