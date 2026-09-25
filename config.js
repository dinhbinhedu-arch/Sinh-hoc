/* =====================================================================
   CẤU HÌNH TRANG WEB: thầy/cô chỉ cần sửa file này.

   Quy tắc khi sửa:
   • Chữ luôn đặt trong dấu nháy kép "...". Muốn xuống dòng trong chữ, dùng \n
   • Mỗi mục trong danh sách nằm trong { ... } và cách nhau bằng dấu phẩy.
   • Sửa xong, mở lại trang. Nếu trang trắng hoặc báo lỗi cấu hình,
     thường là thiếu hoặc thừa một dấu phẩy, dấu nháy hoặc dấu ngoặc.
   ===================================================================== */

window.SITE = {

  // ---------- Thông tin chung ----------
  thuongHieu: "DINHBINH.EDU",
  ten: "Phòng thí nghiệm ảo Sinh học",
  moTa: "Mô phỏng tương tác, bài tập về nhà và tư liệu tra cứu cho môn Sinh học.",
  lienHe: "",            // ví dụ: "Nhắn Zalo lớp hoặc email: ten@truong.edu.vn"

  // ---------- Bài tập lấy từ Google Sheet (không bắt buộc) ----------
  // Dán link CSV của Google Sheet đã "Xuất bản lên web" vào đây.
  // Khi có link này, trang sẽ đọc bài tập từ Sheet thay cho danh sách baiTap bên dưới.
  // Xem README.md, mục "Giao bài tập bằng Google Sheet".
  baiTapSheetCsv: "",

  // ---------- Trợ lý AI (không bắt buộc) ----------
  // Để trống: trợ lý chạy chế độ miễn phí (trả lời theo dữ liệu soạn sẵn).
  // Dán địa chỉ Cloudflare Worker vào đây để bật AI thật. Xem README.md, mục "Bật trợ lý AI".
  aiEndpoint: "",

  // ---------- Các bài mô phỏng ----------
  // id: tên ngắn không dấu, không cách (dùng để nối với bài tập)
  // file: đường dẫn tới file mô phỏng trong thư mục sims/
  // anh: ảnh bìa (không bắt buộc, để "" sẽ tự tạo bìa)
  moPhong: [
    {
      id: "buom-bach-duong",
      ten: "Bướm sâu đo bạch dương",
      chuDe: "Tiến hoá",
      lop: "Lớp 12",
      thoiLuong: "20–30 phút",
      file: "sims/buom-bach-duong.html",
      anh: "assets/covers/buom-bach-duong.svg",
      moTa: "Em đóng vai chim săn mồi trong rừng bạch dương 3D, quan sát chọn lọc tự nhiên làm thay đổi màu sắc quần thể bướm qua các thế hệ.",
      tuKhoa: ["chọn lọc tự nhiên", "tiến hoá", "biston betularia", "ngụy trang", "công nghiệp", "darwin", "biến dị", "đột biến", "bướm"],
      huongDan: "Chọn môi trường và dự đoán, rồi bấm Bắt đầu săn. Đi bằng W A S D hoặc phím mũi tên (điện thoại: nút ▲◀▼▶), kéo chuột để nhìn quanh, nhấp vào bướm để ăn. Hết lượt, xem tỉ lệ sống sót, trả lời câu hỏi và sang thế hệ tiếp theo. Nút ? cạnh mỗi mục có giải thích."
    }
    // Thêm bài mới: sao chép cả khối { ... } ở trên, dán sau dấu phẩy, rồi sửa nội dung.
  ],

  // ---------- Bài tập về nhà (dùng khi chưa có Google Sheet) ----------
  // hanNop: "năm-tháng-ngày", ví dụ "2026-10-02"
  // moPhong: id của bài mô phỏng liên quan (hoặc để "")
  // linkNop: link Google Form nộp bài
  baiTap: [
    {
      tieuDe: "Bài mẫu: Chọn lọc tự nhiên ở bướm sâu đo",
      lop: "Tất cả",
      hanNop: "2026-10-02",
      moPhong: "buom-bach-duong",
      yeuCau: "1. Chọn môi trường Khu công nghiệp, quần thể 20 sáng và 20 tối. Tự săn 3 thế hệ.\n2. Bấm Sao chép bảng số liệu và dán vào phiếu nộp bài.\n3. Làm phần Câu hỏi vận dụng và ghi lại câu trả lời 2 câu tự luận.\n4. Nộp bài qua nút Nộp bài.",
      linkNop: ""
    }
  ],

  // ---------- Tư liệu tra cứu ----------
  // loai: "Bài đọc", "Video", "Tài liệu", "Trang web"...
  tuLieu: [
    {
      ten: "Chọn lọc tự nhiên (Wikipedia tiếng Việt)",
      loai: "Bài đọc",
      link: "https://vi.wikipedia.org/wiki/Chọn_lọc_tự_nhiên",
      moTa: "Khái niệm, cơ chế và các ví dụ về chọn lọc tự nhiên.",
      tuKhoa: ["chọn lọc tự nhiên", "tiến hoá", "darwin"]
    },
    {
      ten: "Charles Darwin (Wikipedia tiếng Việt)",
      loai: "Bài đọc",
      link: "https://vi.wikipedia.org/wiki/Charles_Darwin",
      moTa: "Cuộc đời, chuyến đi trên tàu Beagle và học thuyết tiến hoá của Darwin.",
      tuKhoa: ["darwin", "tiến hoá", "lịch sử"]
    },
    {
      ten: "Peppered moth evolution (Wikipedia tiếng Anh)",
      loai: "Bài đọc",
      link: "https://en.wikipedia.org/wiki/Peppered_moth_evolution",
      moTa: "Toàn bộ câu chuyện bướm sâu đo bạch dương ở Anh, các thí nghiệm của Kettlewell và Majerus. Bài tiếng Anh, dành cho em muốn đọc sâu.",
      tuKhoa: ["bướm", "biston betularia", "công nghiệp", "kettlewell", "tiếng anh"]
    },
    {
      ten: "Kháng kháng sinh (Wikipedia tiếng Việt)",
      loai: "Bài đọc",
      link: "https://vi.wikipedia.org/wiki/Kháng_kháng_sinh",
      moTa: "Vì sao vi khuẩn kháng thuốc: một ví dụ chọn lọc tự nhiên ngay trong đời sống.",
      tuKhoa: ["kháng sinh", "vi khuẩn", "vận dụng", "y học"]
    }
  ],

  // ---------- Hỏi đáp (trợ lý dùng để trả lời học sinh) ----------
  // tuKhoa: những từ học sinh hay gõ khi hỏi câu này
  hoiDap: [
    {
      hoi: "Làm sao để mở một bài mô phỏng?",
      tuKhoa: ["mở", "vào", "bắt đầu", "chơi", "mô phỏng", "thí nghiệm"],
      traLoi: "Kéo tới mục **Mô phỏng**, bấm nút **Mở mô phỏng** trên thẻ bài em cần. Muốn quay lại, bấm **← Trang chủ** ở góc trên của bài."
    },
    {
      hoi: "Nộp bài tập như thế nào?",
      tuKhoa: ["nộp", "gửi", "nộp bài", "form", "phiếu"],
      traLoi: "Ở mục **Bài tập**, mỗi bài có nút **Nộp bài**. Nút này mở phiếu Google Form, em điền đủ thông tin rồi bấm Gửi. Nếu nút báo *Chưa có link nộp bài*, hãy hỏi lại thầy/cô."
    },
    {
      hoi: "Mô phỏng bị trắng màn hình hoặc không chạy?",
      tuKhoa: ["trắng", "lỗi", "không chạy", "không hiện", "đứng", "lag", "giật", "chậm", "đen"],
      traLoi: "Hãy thử: (1) kiểm tra máy có mạng, vì mô phỏng cần tải thư viện 3D; (2) dùng Google Chrome hoặc Microsoft Edge bản mới; (3) đóng bớt tab khác rồi tải lại trang (F5); (4) máy yếu thì chọn độ khó **Dễ** và tắt âm thanh."
    },
    {
      hoi: "Điều khiển trên điện thoại thế nào?",
      tuKhoa: ["điện thoại", "cảm ứng", "di chuyển", "đi lại", "điều khiển", "ipad", "máy tính bảng"],
      traLoi: "Giữ các nút **▲◀▼▶** ở góc trái để đi, **vuốt** màn hình để nhìn quanh, **chụm hai ngón** để phóng to, **chạm** vào con bướm để ăn. Nên xoay ngang điện thoại cho dễ nhìn."
    },
    {
      hoi: "Làm sao sao chép bảng số liệu?",
      tuKhoa: ["sao chép", "copy", "bảng", "số liệu", "dữ liệu", "excel", "word"],
      traLoi: "Trong bài mô phỏng, mở mục **Bảng số liệu để chép vào vở** rồi bấm **Sao chép bảng**. Sau đó dán (Ctrl+V) vào Word, Excel hoặc ô trả lời của Google Form."
    },
    {
      hoi: "Em có được dùng AI làm hộ bài tập không?",
      tuKhoa: ["làm hộ", "giải hộ", "đáp án", "chép", "ai làm"],
      traLoi: "Trợ lý chỉ **gợi ý và giải thích** để em tự làm, không đưa đáp án có sẵn. Bài nộp phải là suy nghĩ và số liệu của chính em."
    },
    {
      hoi: "Số liệu của em có bị mất khi tắt trang không?",
      tuKhoa: ["mất", "lưu", "tắt", "tải lại", "số liệu"],
      traLoi: "Có. Mô phỏng không tự lưu số liệu khi em đóng trang. Hãy **sao chép bảng số liệu** và nộp bài trước khi tắt."
    }
  ]
};
