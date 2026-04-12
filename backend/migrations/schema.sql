-- ============================================================
-- TRUSTRENT — SUPABASE POSTGRESQL SCHEMA
-- Run this in the Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
create table users (
  id uuid primary key default uuid_generate_v4(),
  firebase_uid text unique not null,
  mobile text unique not null,
  name text,
  email text,
  role text check (role in ('tenant', 'landlord')),
  profile_pic_url text,
  aadhaar_hash text unique,
  is_aadhaar_verified boolean default false,
  is_profile_complete boolean default false,
  trust_score numeric(3,2) default 0.00,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- SHADOW RECORDS (permanent, never deleted)
-- ============================================================
create table shadow_records (
  id uuid primary key default uuid_generate_v4(),
  aadhaar_hash text unique not null,
  mobile text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- LISTINGS
-- ============================================================
create table listings (
  id uuid primary key default uuid_generate_v4(),
  landlord_id uuid references users(id) on delete cascade,
  title text not null,
  description text,
  rent integer not null,
  bhk integer not null,
  address text not null,
  lat numeric(10,7) not null,
  lng numeric(10,7) not null,
  furnishing text check (furnishing in ('furnished', 'semi-furnished', 'unfurnished')) default 'unfurnished',
  amenities text[] default '{}',
  is_active boolean default true,
  is_archived boolean default false,
  view_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- LISTING PHOTOS
-- ============================================================
create table listing_photos (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id) on delete cascade,
  photo_url text not null,
  "order" integer default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- BOOKINGS (visit requests)
-- ============================================================
create table bookings (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references users(id) on delete cascade,
  landlord_id uuid references users(id) on delete cascade,
  listing_id uuid references listings(id) on delete cascade,
  slot_date date not null,
  slot_time time not null,
  status text check (status in ('pending', 'confirmed', 'declined', 'cancelled', 'completed')) default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- TENANCIES (active occupations)
-- ============================================================
create table tenancies (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) on delete set null,
  listing_id uuid references listings(id) on delete cascade,
  landlord_id uuid references users(id) on delete cascade,
  tenant_id uuid references users(id) on delete cascade,
  start_date date not null default now(),
  end_date date,
  status text check (status in ('requested', 'active', 'ended')) default 'requested',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- REVIEWS
-- ============================================================
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) on delete cascade,
  listing_id uuid references listings(id) on delete cascade,
  reviewer_id uuid references users(id) on delete cascade,
  reviewee_id uuid references users(id) on delete cascade,
  tenancy_id uuid references tenancies(id) on delete cascade,
  type text check (type in ('visit', 'living')) default 'visit',
  rating integer check (rating between 1 and 5) not null,
  comment text,
  created_at timestamptz default now(),
  unique(booking_id, reviewer_id),
  unique(tenancy_id, reviewer_id)
);

-- ============================================================
-- REVIEW PHOTOS
-- ============================================================
create table review_photos (
  id uuid primary key default uuid_generate_v4(),
  review_id uuid references reviews(id) on delete cascade,
  photo_url text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- SAVED PROPERTIES
-- ============================================================
create table saved_properties (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  listing_id uuid references listings(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, listing_id)
);

-- ============================================================
-- MESSAGES
-- ============================================================
create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id text not null,
  sender_id uuid references users(id) on delete cascade,
  receiver_id uuid references users(id) on delete cascade,
  listing_id uuid references listings(id) on delete set null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index idx_messages_conversation on messages(conversation_id);
create index idx_messages_receiver on messages(receiver_id, is_read);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  message text not null,
  type text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index idx_notifications_user on notifications(user_id, is_read);

-- ============================================================
-- SUPABASE REALTIME
-- Enable realtime on messages table so frontend can subscribe
-- ============================================================
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table users enable row level security;
alter table listings enable row level security;
alter table bookings enable row level security;
alter table reviews enable row level security;
alter table saved_properties enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table tenancies enable row level security;
alter table review_photos enable row level security;

-- Users: anyone can read profiles, only owner can update
create policy "Public profiles" on users for select using (true);
create policy "Own profile update" on users for update using (auth.uid()::text = firebase_uid);

-- Listings: anyone can read active, only landlord can write
create policy "Public listings" on listings for select using (is_active = true and is_archived = false);
create policy "Landlord manages listings" on listings for all using (landlord_id = auth.uid());

-- Bookings: only involved parties can see
create policy "Booking parties" on bookings for select using (
  tenant_id = auth.uid() or landlord_id = auth.uid()
);

-- Tenancies: only participants
create policy "Tenancy participants" on tenancies for select using (
  tenant_id = auth.uid() or landlord_id = auth.uid()
);

-- Review Photos: public display
create policy "Public review photos" on review_photos for select using (true);

-- Messages: only participants
create policy "Message participants" on messages for select using (
  sender_id = auth.uid() or receiver_id = auth.uid()
);

-- Notifications: only owner
create policy "Own notifications" on notifications for select using (user_id = auth.uid());

-- NOTE: Backend uses service role key (bypasses RLS) for all writes.
-- RLS above protects direct frontend/Supabase JS client access.
