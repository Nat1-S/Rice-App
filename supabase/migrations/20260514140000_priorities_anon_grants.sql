-- PriorityMaster: תיקון מלא ל-RLS על priorities (הדבקה ב-SQL Editor של Supabase והרצה).
-- פותר: "new row violates row-level security policy for table priorities"

-- 1) טבלה
create table if not exists public.priorities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  reach numeric not null,
  impact numeric not null,
  confidence numeric not null,
  effort numeric not null,
  score numeric not null
);

-- 2) הרשאות בסיס (מפתח anon בדפדפן)
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on table public.priorities to anon, authenticated;

-- 3) RLS פעיל
alter table public.priorities enable row level security;

-- 4) מוחק את כל המדיניות הקיימת על הטבלה (גם שמות שלא ציפינו להם)
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

-- 5) מדינית אחת לכל הפעולות, לכל התפקידים (כולל anon)
--    PERMISSIVE הוא ברירת המחדל; USING + WITH CHECK מכסים גם INSERT
create policy "priorities_allow_all"
  on public.priorities
  as permissive
  for all
  to public
  using (true)
  with check (true);
