export const SITE = {
  name: "Thư viện THCS Vĩnh Thành - Phân hiệu Việt Xuân",
  shortName: "Thư viện Việt Xuân",
  school: "THCS Vĩnh Thành - Phân hiệu Việt Xuân",
  address: "Xã Vĩnh Thành, tỉnh Phú Thọ",
  description: "Kho học liệu điện tử và tra cứu sách của Thư viện THCS Vĩnh Thành - Phân hiệu Việt Xuân.",
};

// icon: tên icon lucide, map trong components/category-icon.tsx; nhan: nhãn ngắn cho menu điện thoại
export const NAV = [
  { href: "/", label: "Trang chủ", nhan: "Trang chủ", icon: "House" },
  { href: "/danh-muc", label: "Danh mục", nhan: "Danh mục", icon: "LayoutGrid" },
  { href: "/tra-cuu", label: "Tra cứu sách giấy", nhan: "Tra cứu", icon: "Library" },
  { href: "/tu-sach", label: "Tủ sách", nhan: "Tủ sách", icon: "BookCopy" },
] as const;
