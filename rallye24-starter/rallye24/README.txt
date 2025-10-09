
# Rallye24 — Starter v2 (Team name support)

Deux applis PWA :
- `apps/admin` — organisateur
- `apps/team` — équipes avec nom personnalisé

## Variables Vercel requises
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## SQL (option) — créer un profil auto à l’inscription
Dans Supabase → SQL Editor, exécuter :
```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, team_name)
  values (new.id, 'team', 'Equipe');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
```

## Déploiement
1. Pousse ce dossier sur GitHub (`rallye24`).
2. Vercel → Import Project → Root Directory `apps/admin` puis `apps/team`.
3. Ajoute les variables d’environnement si besoin.
