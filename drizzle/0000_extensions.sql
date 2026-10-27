-- Extension và hàm dùng cho tìm kiếm tiếng Việt không dấu. Phải chạy trước khi tạo bảng
-- (cột search_text là cột generated gọi vn_unaccent).
CREATE EXTENSION IF NOT EXISTS unaccent;
--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
-- Bỏ dấu + chữ thường: "Toán hình" -> "toan hinh". Khai báo immutable để dùng trong cột generated và index.
CREATE OR REPLACE FUNCTION public.vn_unaccent(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = public
AS $$
  SELECT lower(public.unaccent('public.unaccent'::regdictionary,
    replace(replace(coalesce(input, ''), 'đ', 'd'), 'Đ', 'D')))
$$;
