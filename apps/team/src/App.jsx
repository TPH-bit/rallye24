
import React, { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

// interpolation simple: remplace {{key}} par ctx[key]
function interpolate(str = '', ctx = {}) {
  return str.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => (ctx[k] ?? ''))
}

export default function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [teamName, setTeamName] = useState('')
  const [profile, setProfile] = useState(null)
  const [riddles, setRiddles] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    supabase.from('profiles').select('*').eq('id', session.user.id).single()
      .then(({ data, error }) => {
        if (error) console.warn(error.message)
        setProfile(data)
      })
  }, [session])

  async function signUp(e) {
    e.preventDefault()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { alert(error.message); return }
    const user = data.user
    if (!user) { alert('Compte créé. Vérifie l’email si confirmation requise.'); return }
    // Mettre à jour ou insérer le profil avec le nom d'équipe
    const { error: upErr } = await supabase
      .from('profiles')
      .update({ team_name: teamName || 'Equipe' })
      .eq('id', user.id)
    if (upErr) {
      await supabase.from('profiles').insert({ id: user.id, role: 'team', team_name: teamName || 'Equipe' })
    }
    alert('Compte créé. Connecte-toi.')
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
        <form onSubmit={signIn} style={{display:'grid',gap:8,maxWidth:340}}>
          <input placeholder="Nom d'équipe" value={teamName} onChange={e=>setTeamName(e.target.value)} />
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
      <h1>Rallye24 — Équipe {profile?.team_name ? `« ${profile.team_name} »` : ''}</h1>
      <button onClick={signOut}>Se déconnecter</button>
      <section style={{marginTop:20}}>
        <h2>Énigmes actives (démo)</h2>
        <button onClick={loadRiddles}>Charger 5 énigmes</button>
        <ul>
          {riddles.map(r => {
            const md = r?.payload?.markdown || ''
            const personalized = interpolate(md, { team_name: profile?.team_name })
            return (
              <li key={r.id}>
                <div style={{fontWeight:'600'}}>#{r.index_hint} — {r.rtype}</div>
                <div>{personalized}</div>
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
