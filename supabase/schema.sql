-- PUK IT: run this entire file once in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(), title text not null, description text not null,
  is_published boolean not null default true, sort_order integer not null default 100, created_at timestamptz not null default now()
);
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(), title text not null, description text not null default '', category text not null default '', image_url text,
  is_published boolean not null default true, sort_order integer not null default 100, created_at timestamptz not null default now()
);
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(), name text not null check (char_length(name) <= 150), contact text not null check (char_length(contact) <= 200),
  service text not null, message text not null check (char_length(message) <= 3000), status text not null default 'ใหม่', created_at timestamptz not null default now()
);
create table if not exists public.site_settings (key text primary key, value jsonb not null, updated_at timestamptz not null default now());

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.profiles where id = auth.uid() and is_admin = true); $$;
revoke all on function public.is_admin() from public; grant execute on function public.is_admin() to anon, authenticated;

alter table public.profiles enable row level security; alter table public.services enable row level security; alter table public.projects enable row level security; alter table public.leads enable row level security; alter table public.site_settings enable row level security;
create policy "admin reads profiles" on public.profiles for select to authenticated using (public.is_admin());
create policy "public reads services" on public.services for select using (is_published = true);
create policy "admins manage services" on public.services for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads projects" on public.projects for select using (is_published = true);
create policy "admins manage projects" on public.projects for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "anyone may submit lead" on public.leads for insert to anon, authenticated with check (true);
create policy "admins manage leads" on public.leads for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads settings" on public.site_settings for select using (true);
create policy "admins manage settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.services(title,description,sort_order) values
('ดูแลระบบ IT','ดูแลคอมพิวเตอร์ อุปกรณ์สำนักงาน แก้ปัญหาโปรแกรม และให้คำแนะนำแบบรายครั้งหรือรายเดือน',1),
('เดินสาย LAN & Network','ออกแบบและติดตั้งระบบเครือข่าย เดินสาย LAN ติดตั้งตู้ Rack และจัดระเบียบอุปกรณ์',2),
('ติดตั้ง Wi-Fi','สำรวจพื้นที่ วางจุดกระจายสัญญาณ และติดตั้ง Wi-Fi ที่ครอบคลุมและปลอดภัย',3),
('Server & Backup','ติดตั้ง ดูแล และตรวจสอบเซิร์ฟเวอร์ พร้อมวางระบบสำรองข้อมูล',4)
on conflict do nothing;
insert into public.projects(title,description,category,sort_order) values
('สำนักงาน 40 จุดใช้งาน','ระบบเครือข่ายสำหรับสำนักงาน','เดินสาย LAN · ติดตั้งตู้ Rack',1),
('ร้านกาแฟและพื้นที่ลูกค้า','วางจุดกระจายสัญญาณตามพื้นที่','Site survey · Wi-Fi setup',2),
('ระบบ Server และ Backup','ตั้งค่าการตรวจสอบและสำรองข้อมูล','Monitoring · Data backup',3)
on conflict do nothing;
insert into public.site_settings(key,value) values ('hero_text','{"text":"รับดูแลคอมพิวเตอร์ เซิร์ฟเวอร์ และระบบเครือข่าย พร้อมเดินสาย LAN และติดตั้ง Wi-Fi สำหรับสำนักงาน ร้านค้า และธุรกิจทุกขนาด"}') on conflict (key) do nothing;
-- หลังสร้างบัญชีแรกจาก Authentication > Users ให้รันคำสั่งนี้หนึ่งครั้ง (แทน UUID และอีเมล):
-- insert into public.profiles(id,email,is_admin) values ('USER_UUID','your@email.com',true);
