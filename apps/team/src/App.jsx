import React, { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import { interpolate } from './lib/interpolate'
import { t } from './lib/i18n'

const fmtDate = () => new Date().toLocaleDateString('fr-FR')

export default function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [teamName, setTeamName] = useState('')
  const [infoMsg, setInfoMsg] = useState('')   // << message info

  const [profile, setProfile] = useState(null)
  const [riddles, setRiddles] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) { setRiddles([]); setProfile(null); return }
    ;(async () => {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      setProfile(p ?? null)
      await loadRiddles()
    })()
  }, [session])

  async function signUp(e) {
    e.preventDefault()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setInfoMsg(error.message); return }

    const user = data.user
    if (user) {
      const { error: upErr } = await supabase
        .from('profiles')
        .update({ team_name: teamName || 'Équipe', role: 'team' })
        .eq('id', user.id)
      if (upErr) {
        await supabase
          .from('profiles')
          .insert({ id: user.id, role: 'team', team_name: teamName || 'Équipe' })
      }
    }

    await supabase.auth.signOut()
    setInfoMsg(`Équipe "${teamName || 'nouvelle équipe'}" créée. Vous pouvez maintenant vous connecter.`)
    setPassword('')
  }

  async function signIn(e) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setInfoMsg(error.message)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function loadRiddles() {
    setLoading(true)
    const { data, error } = await supabase
      .from('riddles')
      .select('*')
      .eq('is_active', true)
      .limit(5)
    setLoading(false)
    if (error) { setInfoMsg(error.message); return }
    setRiddles(data ?? [])
  }

  if (!session) {
    return (
      <div className="wrap">
        <h1>{t('title')}</h1>

        {infoMsg && (
          <div style={{
            margin: '10px 0 14px', padding: '10px 14px',
            background: '#0d3b1e', color: '#d1fae5',
            border: '1px solid #065f46', borderRadius: 8
          }}>
            {infoMsg}
          </div>
        )}

        <div className="card">
          <div className="row">
            <input placeholder={t('team_name')} value={teamName} onChange={e => setTeamName(e.target.value)} />
            <input placeholder={t('email')} value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder={t('password')} value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="row">
            <button onClick={signIn}>{t('sign_in')}</button>
            <button onClick={signUp}>{t('create_account')}</button>
          </div>
        </div>
      </div>
    )
  }

  const ctx = {
    team_name: profile?.team_name || 'Équipe',
    team_email: session?.user?.email || '',
    today: fmtDate(),
  }

  return (
    <div className="wrap">
      <h1>{t('title')} {profile?.team_name ? `« ${profile.team_name} »` : ''}</h1>
      <div className="row">
        <button onClick={signOut}>{t('sign_out')}</button>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <span className="badge">{t('active_riddles')}</span>
        {loading && <div style={{ marginTop: 10 }}>Chargement…</div>}
        <ul>
          {[...riddles]
            .sort((a, b) => (a.index_hint ?? 0) - (b.index_hint ?? 0))
            .map(r => {
              const md = r?.payload?.markdown || ''
              const personalized = interpolate(md, ctx)
              return (
                <li key={r.id} style={{ margin: '14px 0' }}>
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>Énigme {r.index_hint}</div>
                  <div>{personalized}</div>
                </li>
              )
            })}
        </ul>
      </div>
    </div>
  )
}
