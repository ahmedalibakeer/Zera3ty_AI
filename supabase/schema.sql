-- Zera3ty AI: Supabase PostgreSQL schema. Run in the Supabase SQL editor.
create extension if not exists pgcrypto;

create type public.user_role as enum ('user', 'admin');
create type public.submission_status as enum ('new', 'reviewing', 'replied');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  original_name text not null,
  content_type text not null check (content_type in ('image/jpeg','image/png','image/webp')),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 5242880),
  description text not null default '' check (char_length(description) <= 1200),
  status public.submission_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.replies (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  admin_id uuid not null references public.profiles(id),
  message text not null check (char_length(message) between 1 and 5000),
  idempotency_key text not null,
  created_at timestamptz not null default now()
);
create unique index replies_admin_idempotency_idx on public.replies(admin_id, idempotency_key);

-- One notification record per reply makes email delivery idempotent.
create table public.email_notifications (
  id uuid primary key default gen_random_uuid(),
  reply_id uuid not null unique references public.replies(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  resend_id text,
  last_error text,
  updated_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) <= 320),
  message text not null check (char_length(message) between 1 and 3000),
  created_at timestamptz not null default now()
);

create index submissions_user_created_idx on public.submissions(user_id, created_at desc);
create index submissions_status_created_idx on public.submissions(status, created_at desc);
create index replies_submission_created_idx on public.replies(submission_id, created_at);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;
create or replace function public.handle_user_email_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set email = coalesce(new.email, '') where id = new.id;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();
create trigger on_auth_user_updated after update of email on auth.users
for each row execute procedure public.handle_user_email_update();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin');
$$;

create or replace function public.public_stats()
returns json language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'users', (select count(*) from public.profiles),
    'subscribers', (select count(*) from public.subscriptions),
    'images', (select count(*) from public.submissions)
  );
$$;
revoke all on function public.public_stats() from public;
grant execute on function public.public_stats() to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.submissions enable row level security;
alter table public.replies enable row level security;
alter table public.email_notifications enable row level security;
alter table public.contact_messages enable row level security;

-- Keep identity and role fields immutable to user sessions.
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

create policy "profiles readable by self or admins" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "users update own profile" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()) and role = 'user');

create policy "subscriptions readable by owner or admins" on public.subscriptions for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "users subscribe themselves" on public.subscriptions for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "submissions readable by owner or admins" on public.submissions for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "users create own submissions" on public.submissions for insert to authenticated
  with check (user_id = (select auth.uid()) and (storage_path like (select auth.uid())::text || '/%'));
create policy "admins update submissions" on public.submissions for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "replies readable by owner or admins" on public.replies for select to authenticated
  using ((select public.is_admin()) or exists (select 1 from public.submissions s where s.id = submission_id and s.user_id = (select auth.uid())));
create policy "admins create replies" on public.replies for insert to authenticated
  with check ((select public.is_admin()) and admin_id = (select auth.uid()));
create policy "email notifications admins only" on public.email_notifications for select to authenticated
  using ((select public.is_admin()));
create policy "admins manage email notifications" on public.email_notifications for insert to authenticated
  with check ((select public.is_admin()));
create policy "admins update email notifications" on public.email_notifications for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "contact messages anyone can submit" on public.contact_messages for insert to anon, authenticated
  with check (true);
create policy "admins read contact messages" on public.contact_messages for select to authenticated
  using ((select public.is_admin()));

-- Private bucket. The first folder segment must equal the authenticated user id.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('plant-submissions', 'plant-submissions', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

create policy "users read own images and admins read all" on storage.objects for select to authenticated
  using (bucket_id = 'plant-submissions' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin())));
create policy "users upload own images" on storage.objects for insert to authenticated
  with check (bucket_id = 'plant-submissions' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "users delete own images" on storage.objects for delete to authenticated
  using (bucket_id = 'plant-submissions' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Enable database change events for signed-in users (RLS still applies).
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'submissions') then
    alter publication supabase_realtime add table public.submissions;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'replies') then
    alter publication supabase_realtime add table public.replies;
  end if;
end $$;

