// Danh mục, môn học, khối lớp, tủ sách của kho học liệu.
// Giữ đồng bộ với supabase/seed.sql — sau khi nối CSDL, trang sẽ đọc từ bảng danh_muc / mon_hoc / bo_suu_tap.

export type NhomDanhMuc = "hoc-lieu" | "sach-dien-tu" | "van-ban" | "hoat-dong";

export type DanhMuc = {
  slug: string;
  ten: string;
  nhom: NhomDanhMuc;
  moTa: string;
  icon: string; // tên icon lucide, map trong components/category-icon.tsx
};

export const NHOM_DANH_MUC: { id: NhomDanhMuc; ten: string }[] = [
  { id: "sach-dien-tu", ten: "Sách điện tử" },
  { id: "hoc-lieu", ten: "Học liệu dạy và học" },
  { id: "van-ban", ten: "Văn bản – Kế hoạch" },
  { id: "hoat-dong", ten: "Hoạt động thư viện" },
];

export const DANH_MUC: DanhMuc[] = [
  { slug: "sach-giao-khoa", ten: "Sách giáo khoa", nhom: "sach-dien-tu", moTa: "SGK lớp 6–9 các bộ sách", icon: "BookOpen" },
  { slug: "sach-nghiep-vu", ten: "Sách nghiệp vụ", nhom: "sach-dien-tu", moTa: "Sách giáo viên, tài liệu chuyên môn", icon: "BookMarked" },
  { slug: "sach-tham-khao", ten: "Sách tham khảo", nhom: "sach-dien-tu", moTa: "Bồi dưỡng, nâng cao, ôn luyện", icon: "BookCopy" },
  { slug: "sach-thieu-nhi", ten: "Thiếu nhi – Văn học", nhom: "sach-dien-tu", moTa: "Truyện, thơ, văn học Việt Nam và thế giới", icon: "Baby" },
  { slug: "sach-bac-ho", ten: "Sách Bác Hồ", nhom: "sach-dien-tu", moTa: "Cuộc đời, tư tưởng, tấm gương Hồ Chí Minh", icon: "Star" },
  { slug: "sach-phap-luat", ten: "Sách pháp luật", nhom: "sach-dien-tu", moTa: "Pháp luật, an toàn, kỹ năng công dân", icon: "Scale" },
  { slug: "sach-noi", ten: "Sách nói", nhom: "sach-dien-tu", moTa: "Nghe sách trực tuyến", icon: "Headphones" },
  { slug: "bai-giang", ten: "Bài giảng", nhom: "hoc-lieu", moTa: "Bài giảng điện tử của giáo viên", icon: "Presentation" },
  { slug: "giao-an", ten: "Giáo án – KHBD", nhom: "hoc-lieu", moTa: "Kế hoạch bài dạy theo môn, khối", icon: "NotebookPen" },
  { slug: "de-thi", ten: "Đề kiểm tra – Đề thi", nhom: "hoc-lieu", moTa: "Đề kiểm tra, đề thi HSG, ôn thi vào 10", icon: "ClipboardList" },
  { slug: "tu-lieu", ten: "Tư liệu", nhom: "hoc-lieu", moTa: "Tư liệu, chuyên đề, phiếu học tập", icon: "FileText" },
  { slug: "thi-nghiem", ten: "Thí nghiệm thực hành", nhom: "hoc-lieu", moTa: "Video thí nghiệm KHTN", icon: "FlaskConical" },
  { slug: "van-ban-chi-dao", ten: "Văn bản chỉ đạo", nhom: "van-ban", moTa: "Luật Thư viện, nghị định, thông tư", icon: "ScrollText" },
  { slug: "ke-hoach-hoat-dong", ten: "Kế hoạch hoạt động", nhom: "van-ban", moTa: "Kế hoạch, báo cáo của thư viện", icon: "CalendarDays" },
  { slug: "gioi-thieu-sach", ten: "Giới thiệu sách", nhom: "hoat-dong", moTa: "Bài giới thiệu sách hay", icon: "Newspaper" },
  { slug: "hinh-anh-hoat-dong", ten: "Hình ảnh hoạt động", nhom: "hoat-dong", moTa: "Ngày hội đọc sách, hoạt động thư viện", icon: "Images" },
  { slug: "goc-dia-phuong", ten: "Góc địa phương", nhom: "hoat-dong", moTa: "Lịch sử, văn hoá Vĩnh Tường – Phú Thọ", icon: "MapPin" },
];

export const MON_HOC: { id: string; ten: string }[] = [
  { id: "ngu-van", ten: "Ngữ văn" },
  { id: "toan", ten: "Toán" },
  { id: "tieng-anh", ten: "Tiếng Anh" },
  { id: "khtn", ten: "Khoa học tự nhiên" },
  { id: "lich-su-dia-li", ten: "Lịch sử và Địa lí" },
  { id: "gdcd", ten: "Giáo dục công dân" },
  { id: "tin-hoc", ten: "Tin học" },
  { id: "cong-nghe", ten: "Công nghệ" },
  { id: "gdtc", ten: "Giáo dục thể chất" },
  { id: "am-nhac", ten: "Âm nhạc" },
  { id: "mi-thuat", ten: "Mĩ thuật" },
  { id: "hdtn", ten: "Hoạt động trải nghiệm, hướng nghiệp" },
  { id: "gddp", ten: "Giáo dục địa phương" },
];

export const KHOI_LOP = [6, 7, 8, 9] as const;

export const TU_SACH: { slug: string; ten: string; moTa: string }[] = [
  { slug: "sach-hay-nen-doc", ten: "Sách hay nên đọc", moTa: "Thư viện gợi ý mỗi tháng" },
  { slug: "on-thi-vao-10", ten: "Ôn thi vào lớp 10", moTa: "Đề minh hoạ, chuyên đề Toán – Văn – Anh" },
  { slug: "tu-sach-bac-ho", ten: "Tủ sách Bác Hồ", moTa: "Học tập và làm theo tấm gương Bác" },
  { slug: "ky-nang-song", ten: "Tủ sách kỹ năng sống", moTa: "An toàn, mạng xã hội, phòng chống đuối nước" },
  { slug: "sach-noi", ten: "Sách nói", moTa: "Nghe truyện, nghe văn học" },
  { slug: "dia-phuong", ten: "Góc địa phương", moTa: "Vĩnh Tường – Phú Thọ quê hương em" },
];

export const LIEN_KET: { ten: string; url: string; moTa: string }[] = [
  { ten: "Hành trang số", url: "https://hanhtrangso.nxbgd.vn", moTa: "Đọc SGK điện tử – NXB Giáo dục Việt Nam" },
  { ten: "Kho học liệu số", url: "https://hoclieu.vn", moTa: "Bộ Giáo dục và Đào tạo" },
  { ten: "Thư viện Quốc gia Việt Nam", url: "https://nlv.gov.vn", moTa: "Tra cứu và đọc tài liệu số" },
  { ten: "OLM", url: "https://olm.vn", moTa: "Học và luyện tập trực tuyến" },
];

export function findDanhMuc(slug: string): DanhMuc | undefined {
  return DANH_MUC.find((d) => d.slug === slug);
}
