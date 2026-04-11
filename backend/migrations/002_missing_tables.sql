-- ============================================================
-- TRUSTRENT — MISSING TABLES MIGRATION
-- Run this in your Supabase SQL Editor (supabase.com → project → SQL editor)
-- Safe to run: uses CREATE TABLE IF NOT EXISTS to avoid errors
-- ============================================================

-- REVIEWS
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) on delete cascade,
  listing_id uuid references listings(id) on delete cascade,
  reviewer_id uuid references users(id) on delete cascade,
  reviewee_id uuid references users(id) on delete cascade,
  rating integer check (rating between 1 and 5) not null,
  comment text,
  created_at timestamptz default now(),
  unique(booking_id, reviewer_id)
);

-- NOTIFICATIONS
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  message text not null,
  type text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_notifications_user on notifications(user_id, is_read);

-- MESSAGES
create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id text not null,
  sender_id uuid references users(id) on delete cascade,
  receiver_id uuid references users(id) on delete cascade,
  listing_id uuid references listings(id) on delete set null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_messages_conversation on messages(conversation_id);
create index if not exists idx_messages_receiver on messages(receiver_id, is_read);

-- RLS for new tables
alter table reviews enable row level security;
alter table notifications enable row level security;
alter table messages enable row level security;

-- Reviews: anyone can read, only participants can write
create policy "Public reviews" on reviews for select using (true);
create policy "Review participants" on reviews for insert with check (reviewer_id::text = auth.uid()::text);

-- Notifications: only owner
create policy "Own notifications" on notifications for select using (user_id::text = auth.uid()::text);

-- Messages: only participants
create policy "Message participants" on messages for select using (
  sender_id::text = auth.uid()::text or receiver_id::text = auth.uid()::text
);

-- Enable realtime
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;
