-- Enable RLS
alter default privileges revoke execute on functions from public;

-- WORKSHOPS
create table if not exists workshops (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  title text not null,
  category text not null default 'Arts & Creativity',
  status text not null default 'Planning',
  date date,
  location text,
  capacity integer,
  facilitator text,
  assigned_to text,
  audience text,
  budget numeric(10,2) default 0,
  notes text,
  ai_plan text
);

-- GRANT APPLICATIONS
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  grant_name text not null,
  funder text,
  grant_type text not null default 'Programme',
  date_submitted date,
  amount numeric(10,2) default 0,
  status text not null default 'Submitted',
  notes text,
  ai_draft text,
  linked_workshop_ids uuid[] default '{}'
);

-- EXPENSES
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  workshop_id uuid references workshops(id) on delete cascade,
  category text not null,
  amount numeric(10,2) not null,
  description text,
  date date,
  paid_by text
);

-- FOUND GRANTS (cached AI results)
create table if not exists found_grants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  funder text,
  description text,
  amount text,
  deadline text,
  category text,
  eligibility text,
  url text,
  grant_type text default 'Programme',
  workshop_match text,
  match_score text,
  building_note text
);

-- Row Level Security (open for now, add auth later)
alter table workshops enable row level security;
alter table applications enable row level security;
alter table expenses enable row level security;
alter table found_grants enable row level security;

create policy "allow all" on workshops for all using (true) with check (true);
create policy "allow all" on applications for all using (true) with check (true);
create policy "allow all" on expenses for all using (true) with check (true);
create policy "allow all" on found_grants for all using (true) with check (true);
