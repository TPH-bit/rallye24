
export const LOCALES = ['fr','en']
export let locale = 'fr'
export function setLocale(l){ if(LOCALES.includes(l)) locale = l }
const dict = {
  fr: { title:'Rallye24 — Équipe', sign_in:'Se connecter', create_account:'Créer un compte', sign_out:'Se déconnecter', load_riddles:'Charger 5 énigmes', team_name:"Nom de l'équipe", email:'Email', password:'Mot de passe', active_riddles:'Énigmes actives' },
  en: { title:'Rallye24 — Team', sign_in:'Sign in', create_account:'Create account', sign_out:'Sign out', load_riddles:'Load 5 riddles', team_name:'Team name', email:'Email', password:'Password', active_riddles:'Active riddles' }
}
export function t(key){ return (dict[locale] && dict[locale][key]) || key }
