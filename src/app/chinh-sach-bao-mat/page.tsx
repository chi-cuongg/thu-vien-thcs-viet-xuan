import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: "Chính sách quyền riêng tư" };

// Trang công khai, được khai báo làm "privacy policy link" trên màn hình đồng ý OAuth của Google
export default function ChinhSachBaoMat() {
  return (
    <>
      <PageHeader
        title="Chính sách quyền riêng tư"
        description={`Cách ${SITE.name} thu thập và sử dụng thông tin của người dùng.`}
      />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold">Thông tin chúng tôi thu thập</h2>
          <p className="mt-2 text-muted">
            Khi bạn đăng nhập bằng Google, website chỉ nhận tên, địa chỉ email và ảnh đại diện từ tài khoản Google
            của bạn. Học sinh đăng nhập bằng mã học sinh do thủ thư cấp. Website cũng lưu lịch sử đặt mượn và mượn
            trả sách giấy của bạn tại thư viện.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold">Mục đích sử dụng</h2>
          <p className="mt-2 text-muted">
            Thông tin chỉ dùng để xác định người dùng, phân quyền (học sinh, giáo viên, thủ thư) và quản lý việc mượn
            sách của thư viện nhà trường. Chúng tôi không bán, chia sẻ thông tin cho bên thứ ba và không dùng cho
            quảng cáo.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold">Lưu trữ và xoá dữ liệu</h2>
          <p className="mt-2 text-muted">
            Dữ liệu được lưu trên máy chủ của nhà trường thuê để vận hành website. Bạn có thể đề nghị thủ thư xoá tài
            khoản và dữ liệu của mình bất cứ lúc nào.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold">Liên hệ</h2>
          <p className="mt-2 text-muted">
            Mọi thắc mắc xin liên hệ thư viện {SITE.school}, {SITE.address}.
          </p>
        </section>
      </div>
    </>
  );
}
