
# Rallye24 — v3 (personnalisation d'énigmes)

Deux applis :
- `apps/admin` — admin
- `apps/team` — équipes (avec nom + interpolation {{team_name}})

Variables Vercel requises :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

SQL exemple d'énigme personnalisée :
```sql
insert into public.riddles (game_id,index_hint,rtype,payload,is_active)
select id, 2, 'text',
       '{"markdown":"Bonjour équipe {{team_name}}. Rendez-vous au vieux pont."}'::jsonb,
       true
from public.games
where title='Démo R24'
limit 1;
```
