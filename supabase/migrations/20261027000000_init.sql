-- Kho học liệu điện tử – Thư viện THCS Việt Xuân
-- Schema khởi tạo: danh mục, tài liệu số (file trên Google Drive), sách giấy (đầu sách / bản sách),
-- bộ sưu tập, bài viết, liên kết, báo lỗi. Bật RLS cho mọi bảng.

create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- Bỏ dấu tiếng Việt + chữ thường, để "toan hinh" tìm ra "Toán hình". Khai báo immutable để dùng trong index.
create or replace function public.vn_unaccent(input text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select lower(extensions.unaccent('extensions.unaccent'::regdictionary,
    replace(replace(coalesce(input, ''), 'đ', 'd'), 'Đ', 'D')))
$$;

-- ---------------------------------------------------------------------------
-- Người dùng
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  ho_ten text,
  vai_tro text not null default 'giao_vien' check (vai_tro in ('admin', 'thu_thu', 'giao_vien', 'hoc_sinh')),
  to_chuyen_mon text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, ho_ten)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Thủ thư / admin: quản lý toàn bộ nội dung
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and vai_tro in ('admin', 'thu_thu')
  )
$$;

-- ---------------------------------------------------------------------------
-- Danh mục & bảng tra
-- ---------------------------------------------------------------------------
create table public.mon_hoc (
  id text primary key,                 -- slug: 'toan', 'ngu-van', ...
  ten text not null,
  thu_tu smallint not null default 0
);

create table public.danh_muc (
  id bigint generated always as identity primary key,
  slug text not null unique,
  ten text not null,
  nhom text not null,                  -- nhóm hiển thị: 'hoc-lieu', 'sach-dien-tu', ...
  parent_id bigint references public.danh_muc (id) on delete set null,
  mo_ta text,
  thu_tu smallint not null default 0
);

-- Ký hiệu môn loại (bảng phân loại 19 lớp) dùng trong sổ đăng ký cá biệt, ví dụ '51(083)'
create table public.mon_loai (
  ma text primary key,
  ten text not null
);

-- ---------------------------------------------------------------------------
-- Sách giấy: một đầu sách có nhiều bản, mỗi bản một số ĐKCB
-- ---------------------------------------------------------------------------
create table public.dau_sach (
  id bigint generated always as identity primary key,
  ten text not null,
  tap text,                            -- 'Tập 1', 'Tập 2'
  tac_gia text,
  nha_xb text,
  noi_xb text,
  nam_xb smallint,
  isbn text,
  mon_loai text references public.mon_loai (ma) on update cascade,
  mon_hoc_id text references public.mon_hoc (id),
  khoi_lop smallint[] not null default '{}',
  tom_tat text,
  anh_bia_url text,
  created_at timestamptz not null default now(),
  search_text text generated always as (
    public.vn_unaccent(ten || ' ' || coalesce(tap, '') || ' ' || coalesce(tac_gia, ''))
  ) stored
);

create index dau_sach_search_idx on public.dau_sach using gin (search_text extensions.gin_trgm_ops);

create table public.ban_sach (
  id bigint generated always as identity primary key,
  so_dkcb text not null unique,        -- 'STK.01033'
  dau_sach_id bigint not null references public.dau_sach (id) on delete cascade,
  kho text not null,                   -- tiền tố ĐKCB: 'STK', 'SGK', 'SNV', 'STN', ...
  nguon text not null default 'mua' check (nguon in ('mua', 'cap_phat', 'tang')),
  gia integer,
  ngay_nhap date,
  tinh_trang text not null default 'tren_gia'
    check (tinh_trang in ('tren_gia', 'dang_muon', 'hong', 'mat', 'thanh_ly')),
  vi_tri text,
  ghi_chu text
);

create index ban_sach_dau_sach_idx on public.ban_sach (dau_sach_id);

-- ---------------------------------------------------------------------------
-- Tài liệu số (file trên Google Drive hoặc video YouTube)
-- ---------------------------------------------------------------------------
create table public.tai_lieu (
  id bigint generated always as identity primary key,
  slug text not null unique,
  tieu_de text not null,
  tac_gia text,
  mo_ta text,
  loai text not null check (loai in (
    'sach', 'bai_giang', 'giao_an', 'de_thi', 'tu_lieu', 'video', 'audio', 'van_ban', 'hinh_anh'
  )),
  danh_muc_id bigint references public.danh_muc (id) on delete set null,
  mon_hoc_id text references public.mon_hoc (id),
  khoi_lop smallint[] not null default '{}',
  bo_sach text,                        -- 'kntt', 'ctst', 'canh-dieu', ...
  drive_file_id text unique,
  mime_type text,
  kich_thuoc bigint,
  so_trang integer,
  youtube_id text,
  anh_bia_url text,
  dau_sach_id bigint references public.dau_sach (id) on delete set null,  -- bản số của một sách giấy
  quyen_truy_cap text not null default 'cong_khai' check (quyen_truy_cap in ('cong_khai', 'dang_nhap', 'noi_bo')),
  cho_phep_tai boolean not null default false,
  trang_thai text not null default 'cho_duyet' check (trang_thai in ('cho_duyet', 'da_duyet', 'tu_choi')),
  nguon text,
  giay_phep text,
  nguoi_dang uuid references public.profiles (id) on delete set null,
  luot_xem integer not null default 0,
  luot_tai integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_text text generated always as (
    public.vn_unaccent(tieu_de || ' ' || coalesce(tac_gia, '') || ' ' || coalesce(mo_ta, ''))
  ) stored
);

create index tai_lieu_search_idx on public.tai_lieu using gin (search_text extensions.gin_trgm_ops);
create index tai_lieu_danh_muc_idx on public.tai_lieu (danh_muc_id, trang_thai);
create index tai_lieu_mon_hoc_idx on public.tai_lieu (mon_hoc_id, trang_thai);

-- ---------------------------------------------------------------------------
-- Tủ sách chuyên đề, bài viết, liên kết, báo lỗi
-- ---------------------------------------------------------------------------
create table public.bo_suu_tap (
  id bigint generated always as identity primary key,
  slug text not null unique,
  ten text not null,
  mo_ta text,
  anh_bia_url text,
  thu_tu smallint not null default 0,
  hien_trang_chu boolean not null default true
);

create table public.bo_suu_tap_muc (
  bo_suu_tap_id bigint not null references public.bo_suu_tap (id) on delete cascade,
  tai_lieu_id bigint not null references public.tai_lieu (id) on delete cascade,
  thu_tu smallint not null default 0,
  primary key (bo_suu_tap_id, tai_lieu_id)
);

create table public.bai_viet (
  id bigint generated always as identity primary key,
  slug text not null unique,
  tieu_de text not null,
  loai text not null default 'gioi_thieu_sach' check (loai in ('gioi_thieu_sach', 'tin_tuc', 'hoat_dong')),
  noi_dung text,
  anh_bia_url text,
  trang_thai text not null default 'nhap' check (trang_thai in ('nhap', 'da_dang')),
  tac_gia uuid references public.profiles (id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.lien_ket (
  id bigint generated always as identity primary key,
  nhom text not null check (nhom in ('hoc_lieu_so', 'lien_thong_thu_vien', 'bao_tap_chi')),
  ten text not null,
  url text not null,
  thu_tu smallint not null default 0
);

create table public.bao_loi (
  id bigint generated always as identity primary key,
  tai_lieu_id bigint not null references public.tai_lieu (id) on delete cascade,
  noi_dung text not null check (char_length(noi_dung) between 3 and 2000),
  trang_thai text not null default 'moi' check (trang_thai in ('moi', 'da_xu_ly')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Tìm kiếm không dấu (chạy với quyền người gọi nên vẫn tuân theo RLS)
-- ---------------------------------------------------------------------------
create or replace function public.tim_kiem_tai_lieu(q text, gioi_han integer default 30)
returns setof public.tai_lieu
language sql
stable
set search_path = ''
as $$
  select t.*
  from public.tai_lieu t
  where t.search_text operator(extensions.%) public.vn_unaccent(q)
     or t.search_text like '%' || public.vn_unaccent(q) || '%'
  order by extensions.similarity(t.search_text, public.vn_unaccent(q)) desc
  limit gioi_han
$$;

create or replace function public.tim_kiem_dau_sach(q text, gioi_han integer default 30)
returns setof public.dau_sach
language sql
stable
set search_path = ''
as $$
  select d.*
  from public.dau_sach d
  where d.search_text operator(extensions.%) public.vn_unaccent(q)
     or d.search_text like '%' || public.vn_unaccent(q) || '%'
  order by extensions.similarity(d.search_text, public.vn_unaccent(q)) desc
  limit gioi_han
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.mon_hoc enable row level security;
alter table public.danh_muc enable row level security;
alter table public.mon_loai enable row level security;
alter table public.dau_sach enable row level security;
alter table public.ban_sach enable row level security;
alter table public.tai_lieu enable row level security;
alter table public.bo_suu_tap enable row level security;
alter table public.bo_suu_tap_muc enable row level security;
alter table public.bai_viet enable row level security;
alter table public.lien_ket enable row level security;
alter table public.bao_loi enable row level security;

-- Hồ sơ: tự xem hồ sơ của mình; thủ thư xem và phân quyền
create policy "profiles: tự xem" on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy "profiles: thủ thư sửa" on public.profiles for update using (public.is_staff());

-- Bảng công khai: ai cũng đọc, thủ thư quản lý
create policy "mon_hoc: đọc" on public.mon_hoc for select using (true);
create policy "mon_hoc: thủ thư" on public.mon_hoc for all using (public.is_staff()) with check (public.is_staff());
create policy "danh_muc: đọc" on public.danh_muc for select using (true);
create policy "danh_muc: thủ thư" on public.danh_muc for all using (public.is_staff()) with check (public.is_staff());
create policy "mon_loai: đọc" on public.mon_loai for select using (true);
create policy "mon_loai: thủ thư" on public.mon_loai for all using (public.is_staff()) with check (public.is_staff());
create policy "dau_sach: đọc" on public.dau_sach for select using (true);
create policy "dau_sach: thủ thư" on public.dau_sach for all using (public.is_staff()) with check (public.is_staff());
create policy "ban_sach: đọc" on public.ban_sach for select using (true);
create policy "ban_sach: thủ thư" on public.ban_sach for all using (public.is_staff()) with check (public.is_staff());
create policy "bo_suu_tap: đọc" on public.bo_suu_tap for select using (true);
create policy "bo_suu_tap: thủ thư" on public.bo_suu_tap for all using (public.is_staff()) with check (public.is_staff());
create policy "bo_suu_tap_muc: đọc" on public.bo_suu_tap_muc for select using (true);
create policy "bo_suu_tap_muc: thủ thư" on public.bo_suu_tap_muc for all using (public.is_staff()) with check (public.is_staff());
create policy "lien_ket: đọc" on public.lien_ket for select using (true);
create policy "lien_ket: thủ thư" on public.lien_ket for all using (public.is_staff()) with check (public.is_staff());

-- Tài liệu: khách thấy tài liệu đã duyệt & công khai; người đăng nhập thấy thêm loại 'dang_nhap';
-- giáo viên thấy tài liệu mình đăng; thủ thư thấy tất cả
create policy "tai_lieu: đọc" on public.tai_lieu for select using (
  (trang_thai = 'da_duyet' and (quyen_truy_cap = 'cong_khai' or (quyen_truy_cap = 'dang_nhap' and auth.uid() is not null)))
  or nguoi_dang = auth.uid()
  or public.is_staff()
);
create policy "tai_lieu: giáo viên đăng (chờ duyệt)" on public.tai_lieu for insert with check (
  auth.uid() is not null and nguoi_dang = auth.uid() and trang_thai = 'cho_duyet'
);
create policy "tai_lieu: giáo viên sửa bài chờ duyệt" on public.tai_lieu for update
  using (nguoi_dang = auth.uid() and trang_thai = 'cho_duyet')
  with check (nguoi_dang = auth.uid() and trang_thai = 'cho_duyet');
create policy "tai_lieu: thủ thư" on public.tai_lieu for all using (public.is_staff()) with check (public.is_staff());

-- Bài viết: khách đọc bài đã đăng
create policy "bai_viet: đọc" on public.bai_viet for select using (trang_thai = 'da_dang' or public.is_staff());
create policy "bai_viet: thủ thư" on public.bai_viet for all using (public.is_staff()) with check (public.is_staff());

-- Báo lỗi: ai cũng gửi được, chỉ thủ thư đọc
create policy "bao_loi: gửi" on public.bao_loi for insert with check (trang_thai = 'moi');
create policy "bao_loi: thủ thư" on public.bao_loi for all using (public.is_staff()) with check (public.is_staff());
