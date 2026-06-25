-- Users & Profiles
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  avatar_url text,
  phone text,
  nationality text,
  bio text,
  is_guide boolean default false,
  is_verified boolean default false,
  trust_score integer default 0,
  travel_style text[],
  languages text[],
  created_at timestamptz default now()
);

-- Destinations
create table destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  slug text unique not null,
  cover_image text,
  description text,
  category text[],
  avg_price_inr integer,
  best_season text,
  visa_required boolean default true,
  created_at timestamptz default now()
);

-- Packages
create table packages (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references destinations,
  title text not null,
  description text,
  duration_days integer,
  price_per_person integer,
  max_people integer,
  inclusions text[],
  exclusions text[],
  itinerary jsonb,
  images text[],
  category text,
  badge text,
  rating decimal(2,1),
  review_count integer default 0,
  created_at timestamptz default now()
);

-- Bookings
create table bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles,
  package_id uuid references packages,
  booking_type text,
  status text default 'pending',
  travel_date date,
  num_travelers integer,
  total_amount integer,
  razorpay_payment_id text,
  razorpay_order_id text,
  details jsonb,
  created_at timestamptz default now()
);

-- Social: Traveler Matching
create table traveler_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles,
  destination text,
  travel_dates daterange,
  travel_style text,
  looking_for text,
  latitude decimal,
  longitude decimal,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Local Guides
create table guides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles,
  city text,
  expertise text[],
  hourly_rate integer,
  daily_rate integer,
  languages text[],
  description text,
  photos text[],
  rating decimal(2,1),
  total_reviews integer default 0,
  is_verified boolean default false,
  created_at timestamptz default now()
);

-- Chat Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references profiles,
  receiver_id uuid references profiles,
  trip_id uuid,
  content text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Digital Travel Locker
create table travel_locker (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles,
  doc_type text,
  doc_name text,
  file_url text,
  expiry_date date,
  created_at timestamptz default now()
);

-- Reviews
create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles,
  package_id uuid references packages,
  guide_id uuid references guides,
  rating integer check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- Rewards
create table rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles,
  points integer default 0,
  transactions jsonb[],
  created_at timestamptz default now()
);

-- Group Trips
create table group_trips (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references profiles,
  destination text,
  departure_date date,
  return_date date,
  max_members integer,
  current_members integer default 1,
  trip_style text,
  description text,
  cost_per_person integer,
  status text default 'open',
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  insert into public.rewards (user_id, points, transactions)
  values (new.id, 100, array['{"type":"signup_bonus","points":100}'::jsonb]);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security
alter table profiles enable row level security;
alter table bookings enable row level security;
alter table messages enable row level security;
alter table travel_locker enable row level security;
alter table rewards enable row level security;

create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can view own bookings"
  on bookings for select using (auth.uid() = user_id);

create policy "Users can create own bookings"
  on bookings for insert with check (auth.uid() = user_id);

create policy "Users can view own messages"
  on messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages"
  on messages for insert with check (auth.uid() = sender_id);

create policy "Users can view own locker docs"
  on travel_locker for select using (auth.uid() = user_id);

create policy "Users can manage own locker docs"
  on travel_locker for all using (auth.uid() = user_id);

create policy "Users can view own rewards"
  on rewards for select using (auth.uid() = user_id);

-- Public read for destinations, packages, guides, group_trips
alter table destinations enable row level security;
alter table packages enable row level security;
alter table guides enable row level security;
alter table group_trips enable row level security;
alter table reviews enable row level security;
alter table traveler_profiles enable row level security;

create policy "Destinations are public" on destinations for select using (true);
create policy "Packages are public" on packages for select using (true);
create policy "Guides are public" on guides for select using (true);
create policy "Group trips are public" on group_trips for select using (true);
create policy "Reviews are public" on reviews for select using (true);
create policy "Traveler profiles are public" on traveler_profiles for select using (true);

-- Realtime for messages
alter publication supabase_realtime add table messages;

-- Storage bucket for travel locker
insert into storage.buckets (id, name, public) values ('travel-locker', 'travel-locker', false);

create policy "Users can upload own docs"
  on storage.objects for insert
  with check (bucket_id = 'travel-locker' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view own docs"
  on storage.objects for select
  using (bucket_id = 'travel-locker' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own docs"
  on storage.objects for delete
  using (bucket_id = 'travel-locker' and auth.uid()::text = (storage.foldername(name))[1]);
