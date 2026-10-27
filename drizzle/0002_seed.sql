-- Dữ liệu khởi tạo — giữ đồng bộ với src/config/taxonomy.ts
insert into mon_hoc (id, ten, thu_tu) values
  ('ngu-van', 'Ngữ văn', 1),
  ('toan', 'Toán', 2),
  ('tieng-anh', 'Tiếng Anh', 3),
  ('khtn', 'Khoa học tự nhiên', 4),
  ('lich-su-dia-li', 'Lịch sử và Địa lí', 5),
  ('gdcd', 'Giáo dục công dân', 6),
  ('tin-hoc', 'Tin học', 7),
  ('cong-nghe', 'Công nghệ', 8),
  ('gdtc', 'Giáo dục thể chất', 9),
  ('am-nhac', 'Âm nhạc', 10),
  ('mi-thuat', 'Mĩ thuật', 11),
  ('hdtn', 'Hoạt động trải nghiệm, hướng nghiệp', 12),
  ('gddp', 'Giáo dục địa phương', 13)
on conflict (id) do nothing;
--> statement-breakpoint

insert into danh_muc (slug, ten, nhom, mo_ta, thu_tu) values
  ('sach-giao-khoa', 'Sách giáo khoa', 'sach-dien-tu', 'SGK lớp 6–9 các bộ sách', 1),
  ('sach-nghiep-vu', 'Sách nghiệp vụ', 'sach-dien-tu', 'Sách giáo viên, tài liệu chuyên môn', 2),
  ('sach-tham-khao', 'Sách tham khảo', 'sach-dien-tu', 'Bồi dưỡng, nâng cao, ôn luyện', 3),
  ('sach-thieu-nhi', 'Thiếu nhi – Văn học', 'sach-dien-tu', 'Truyện, thơ, văn học Việt Nam và thế giới', 4),
  ('sach-bac-ho', 'Sách Bác Hồ', 'sach-dien-tu', 'Cuộc đời, tư tưởng, tấm gương Hồ Chí Minh', 5),
  ('sach-phap-luat', 'Sách pháp luật', 'sach-dien-tu', 'Pháp luật, an toàn, kỹ năng công dân', 6),
  ('sach-noi', 'Sách nói', 'sach-dien-tu', 'Nghe sách trực tuyến', 7),
  ('bai-giang', 'Bài giảng', 'hoc-lieu', 'Bài giảng điện tử của giáo viên', 8),
  ('giao-an', 'Giáo án – KHBD', 'hoc-lieu', 'Kế hoạch bài dạy theo môn, khối', 9),
  ('de-thi', 'Đề kiểm tra – Đề thi', 'hoc-lieu', 'Đề kiểm tra, đề thi HSG, ôn thi vào 10', 10),
  ('tu-lieu', 'Tư liệu', 'hoc-lieu', 'Tư liệu, chuyên đề, phiếu học tập', 11),
  ('thi-nghiem', 'Thí nghiệm thực hành', 'hoc-lieu', 'Video thí nghiệm KHTN', 12),
  ('van-ban-chi-dao', 'Văn bản chỉ đạo', 'van-ban', 'Luật Thư viện, nghị định, thông tư', 13),
  ('ke-hoach-hoat-dong', 'Kế hoạch hoạt động', 'van-ban', 'Kế hoạch, báo cáo của thư viện', 14),
  ('gioi-thieu-sach', 'Giới thiệu sách', 'hoat-dong', 'Bài giới thiệu sách hay', 15),
  ('hinh-anh-hoat-dong', 'Hình ảnh hoạt động', 'hoat-dong', 'Ngày hội đọc sách, hoạt động thư viện', 16),
  ('goc-dia-phuong', 'Góc địa phương', 'hoat-dong', 'Lịch sử, văn hoá Vĩnh Tường – Phú Thọ', 17)
on conflict (slug) do nothing;
--> statement-breakpoint

insert into bo_suu_tap (slug, ten, mo_ta, thu_tu) values
  ('sach-hay-nen-doc', 'Sách hay nên đọc', 'Thư viện gợi ý mỗi tháng', 1),
  ('on-thi-vao-10', 'Ôn thi vào lớp 10', 'Đề minh hoạ, chuyên đề Toán – Văn – Anh', 2),
  ('tu-sach-bac-ho', 'Tủ sách Bác Hồ', 'Học tập và làm theo tấm gương Bác', 3),
  ('ky-nang-song', 'Tủ sách kỹ năng sống', 'An toàn, mạng xã hội, phòng chống đuối nước', 4),
  ('sach-noi', 'Sách nói', 'Nghe truyện, nghe văn học', 5),
  ('dia-phuong', 'Góc địa phương', 'Vĩnh Tường – Phú Thọ quê hương em', 6)
on conflict (slug) do nothing;
--> statement-breakpoint

insert into lien_ket (nhom, ten, url, thu_tu) values
  ('hoc_lieu_so', 'Hành trang số', 'https://hanhtrangso.nxbgd.vn', 1),
  ('hoc_lieu_so', 'Kho học liệu số', 'https://hoclieu.vn', 2),
  ('lien_thong_thu_vien', 'Thư viện Quốc gia Việt Nam', 'https://nlv.gov.vn', 3),
  ('hoc_lieu_so', 'OLM', 'https://olm.vn', 4);
