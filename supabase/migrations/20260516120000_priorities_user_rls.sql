-- PriorityMaster: multi-tenant RLS on priorities (auth.uid() = user_id)
-- הרץ ב-Supabase SQL Editor או: supabase db push

-- 1) עמודת user_id (אם חסרה מהמיגרציות הישנות)
alter table public.priorities
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

create index if not exists priorities_user_id_idx on public.priorities (user_id);

-- 2) RLS פעיל
alter table public.priorities enable row level security;

-- 3) הסרת כל המדיניות הקיימת (כולל priorities_allow_all / public read)
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'priorities'
  loop
    execute format('drop policy if exists %I on public.priorities', pol.policyname);
  end loop;
end $$;

-- 4) הרשאות: רק משתמשים מחוברים (לא anon)
revoke all on table public.priorities from anon;
revoke all on table public.priorities from public;

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.priorities to authenticated;

-- 5) מדיניות: גישה רק לשורות של המשתמש המחובר
create policy "priorities_select_own"
  on public.priorities
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "priorities_insert_own"
  on public.priorities
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "priorities_update_own"
  on public.priorities
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "priorities_delete_own"
  on public.priorities
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- הערה: שורות ישנות עם user_id = NULL לא יוצגו לאף משתמש עד שיוקצו או יימחקו.
