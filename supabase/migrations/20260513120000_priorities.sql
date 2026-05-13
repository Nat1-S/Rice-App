-- PriorityMaster: priorities table
create table if not exists public.priorities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  reach numeric not null,
  impact numeric not null,
  confidence numeric not null,
  effort numeric not null,
  score numeric not null
);

alter table public.priorities enable row level security;

-- Adjust policies for your auth model. For local dev / anon demo:
create policy "Allow public read" on public.priorities
  for select using (true);

create policy "Allow public insert" on public.priorities
  for insert with check (true);

create policy "Allow public update" on public.priorities
  for update using (true);

create policy "Allow public delete" on public.priorities
  for delete using (true);
