# AGENTS.MD - NGUYÊN TẮC PHÁT TRIỂN DÀNH CHO AI AGENT & LẬP TRÌNH VIÊN

Tài liệu này xác lập các nguyên tắc kỹ thuật, kỷ luật lập trình và quy trình bắt buộc áp dụng cho toàn bộ AI Coding Agents cùng lập trình viên tham gia phát triển dự án Game 3D xây dựng trên nền tảng Next.js. Mọi hành vi vi phạm các nguyên tắc dưới đây đều bị coi là lỗi nghiêm trọng làm hỏng tính toàn vẹn của hệ thống.

---

## 1. NGUYÊN TẮC BẤT KHẢ XÂM PHẠM: THƯ MỤC ENGINE (`./engine` / `src/engine/`)

1. **Bản chất Thư viện Bất biến (Immutable Library):**
   - Thư mục `./engine` đóng vai trò là thư viện phần mềm độc lập (Zero-dependency Core Engine).
   - Tuyệt đối cấm Agent và lập trình viên tạo mới, chỉnh sửa, đổi tên, di chuyển hoặc xóa bất kỳ file nào nằm bên trong thư mục này.
   - Thư mục Engine phải luôn được xem là tài nguyên chỉ đọc (Read-Only).

2. **Cơ chế Giao tiếp Duy nhất:**
   - Ứng dụng chỉ được phép tương tác với Engine thông qua các Interface, Adapter, Bridge hoặc API công khai được export chính thức từ file index gốc của Engine.
   - Tuyệt đối không can thiệp vào cấu trúc nội bộ, không monkey-patching hoặc ghi đè trực tiếp các đối tượng bên trong Engine.

---

## 2. NGUYÊN TẮC BAO BỌC ENGINE TOÀN BỘ GAME (ZERO-ASSUMPTION POLICY)

1. **Bọc Engine Toàn diện (Total Encapsulation):**
   - Mọi vòng đời, hành vi, trạng thái, vật lý, va chạm, tính toán không gian và logic hiển thị của Game đều phải được bọc trọn vẹn thông qua các tầng Adapter/Facade trung gian tương ứng với Engine.
   - Không được để rò rỉ các thành phần cấp thấp của Engine ra ngoài giao diện người dùng hoặc các trang của Next.js mà không thông qua lớp bọc điều phối.

2. **Cấm Tuyệt đối Việc Tự Diễn / Tự Suy Đoán:**
   - Nghiêm cấm Agent tự ý bịa đặt, suy đoán thêm các quy tắc logic game, tính năng mới hoặc cơ chế vật lý không có trong đặc tả yêu cầu và không được Engine cung cấp.
   - Không tự ý nạp thêm các tài nguyên ngoài luồng hoặc can thiệp trực tiếp vào canvas WebGL mà bỏ qua quy trình chuẩn hóa của Engine.

---

## 3. NỀN TẢNG CÔNG NGHỆ: NEXT.JS & ĐỒ HỌA 3D (THREE.JS / WEBGL)

1. **Tích hợp Next.js Đúng Chuẩn:**
   - Toàn bộ canvas hiển thị đồ họa 3D, vòng lặp dựng hình (render loop) và các tiến trình liên quan đến WebGL phải được cô lập chính xác ở Client Components (chỉ thị `'use client'`).
   - Xử lý triệt để bài toán Server-Side Rendering (SSR) bằng cơ chế Dynamic Import (tắt SSR) đối với các thành phần đồ họa để tránh lỗi truy cập đối tượng `window`, `document` hoặc WebGL context trên máy chủ.
   - Tối ưu hóa vòng đời component trong Next.js: đảm bảo giải phóng bộ nhớ (dispose geometries, materials, textures, buffers) khi unmount để ngăn rò rỉ VRAM.

2. **Quản lý Hệ thống Đồ họa 3D:**
   - Sử dụng Three.js và WebGL qua các cầu nối (Bridge/Adapter) tiêu chuẩn, khớp nối dữ liệu từ Engine sang scene đồ họa.
   - Kiểm soát chặt chẽ hiệu năng render: tối ưu số lượng draw calls, xử lý frustum culling, phân cấp chi tiết hiển thị (LOD) và điều phối ánh sáng/bóng đổ theo đúng khả năng của phần cứng thiết bị.

---

## 4. TIÊU CHUẨN KIẾN TRÚC: CLEAN ARCHITECTURE & NGUYÊN LÝ SOLID

Mọi module phát triển xung quanh Game bắt buộc phải tuân thủ nghiêm ngặt mô hình kiến trúc phân lớp sạch và các nguyên tắc thiết kế hướng đối tượng:

1. **Tuân thủ Clean Architecture:**
   - **Tầng Domain (Nghiệp vụ cốt lõi):** Chứa các thực thể (Entities), quy tắc logic thuần túy của Game, hoàn toàn độc lập với Next.js, Three.js và WebGL.
   - **Tầng Application (Điều phối Use Cases):** Điều phối luồng xử lý giữa Domain, Engine và các dịch vụ ngoại vi.
   - **Tầng Interface Adapters (Cầu nối & Trình diễn):** Chứa Controllers, Presenters, Custom Hooks và Bridge đóng vai trò chuyển đổi dữ liệu giữa giao diện Next.js, hệ thống đồ họa 3D và tầng Application.
   - **Tầng Infrastructure (Hạ tầng kỹ thuật):** Quản lý đầu vào thiết bị (bàn phím, chuột, gamepad), tài nguyên mạng, âm thanh và kết nối với WebGL/Canvas.
   - **Quy tắc Phụ thuộc (Dependency Rule):** Luồng phụ thuộc chỉ được phép hướng từ ngoài vào trong. Mã nguồn nghiệp vụ không bao giờ được phép phụ thuộc vào thư viện bên ngoài hay framework hiển thị.

2. **Thực thi Nghiêm ngặt 5 Nguyên lý SOLID:**
   - **S (Single Responsibility Principle):** Mỗi class, service, hook hoặc component chỉ đảm nhận một trách nhiệm duy nhất. Tách biệt hoàn toàn logic tính toán vật lý, điều khiển người chơi, âm thanh và hiển thị.
   - **O (Open/Closed Principle):** Mở rộng tính năng bằng cách bổ sung class, adapter hoặc strategy mới; không can thiệp chỉnh sửa mã nguồn cốt lõi đã ổn định.
   - **L (Liskov Substitution Principle):** Các lớp con hoặc implementation phải có khả năng thay thế hoàn toàn cho lớp cha hoặc interface mà không làm thay đổi tính đúng đắn của chương trình.
   - **I (Interface Segregation Principle):** Tách nhỏ các interface thành các hợp đồng chức năng chuyên biệt. Không ép buộc một module phải implement các phương thức mà nó không sử dụng.
   - **D (Dependency Inversion Principle):** Tầng cấp cao không phụ thuộc vào tầng cấp thấp. Cả hai phải phụ thuộc vào abstraction (Interfaces). Bắt buộc áp dụng Dependency Injection hoặc Factory Pattern để quản lý sự phụ thuộc.

---

## 5. KỶ LUẬT CLEAN CODE & GIAO THỨC DỌN DẸP MÃ CHẾT (DEAD CODE)

1. **Tiêu chuẩn Code Sạch:**
   - Đặt tên biến, hàm, interface, class có ý nghĩa rõ ràng, phản ánh chính xác mục đích và nghiệp vụ.
   - Giữ hàm ngắn gọn, tập trung xử lý một nhiệm vụ; hạn chế tối đa độ sâu lồng nhau (nesting level).
   - Kiểm soát kiểu dữ liệu tĩnh nghiêm ngặt (Strict TypeScript), nghiêm cấm sử dụng kiểu `any` hoặc ép kiểu tùy tiện.

2. **Giao thức Dọn dẹp Mã Chết Bắt buộc:**
   - Khi chỉnh sửa, tái cấu trúc hoặc thay thế bất kỳ đoạn code nào, bắt buộc phải tìm và xóa sạch 100% mã chết (Dead Code).
   - Loại bỏ toàn bộ các import không còn sử dụng, các biến thừa, hàm mồ côi (không ai gọi), các khối lệnh không bao giờ chạm tới và các đoạn code bị comment vô nghĩa.
   - Tuyệt đối không để lại các file rác, file tạm hoặc file backup trong repository sau khi hoàn thành nhiệm vụ.

---

## 6. QUY ĐỊNH CHÚ THÍCH MÃ NGUỒN BẰNG TIẾNG VIỆT

1. **Đồng bộ Ngôn ngữ Chú thích:**
   - 100% chú thích (comments), tài liệu hàm (JSDoc/TSDoc) và thông báo nhật ký (logs) nội bộ phải được viết bằng tiếng Việt rõ ràng, mạch lạc, đúng thuật ngữ kỹ thuật.

2. **Nội dung Khối Chú thích:**
   - **Ở cấp độ File / Module:** Giải thích mục đích tồn tại của module, trách nhiệm trong hệ thống và ranh giới hoạt động.
   - **Ở cấp độ Class / Interface / Method:** Giải thích ý nghĩa của các tham số đầu vào, kết quả trả về, các ngoại lệ có thể phát sinh và lưu ý đặc biệt về mặt hiệu năng hoặc tài nguyên.
   - **Tại các thuật toán phức tạp:** Giải thích rõ tư duy giải quyết vấn đề, nguyên lý toán học hoặc lý do kỹ thuật đằng sau giải pháp. Nghiêm cấm chú thích hiển nhiên (dịch lại tên biến/hàm).

---

## 7. QUẢN TRỊ KIẾN TRÚC (ARCHITECTURE) & NHẬT KÝ THAY ĐỔI (CHANGELOG)

1. **Hồ sơ Kiến trúc Hệ thống (Architecture Document):**
   - Mọi quyết định thay đổi về luồng dữ liệu, phân tầng, cơ chế điều phối hoặc kết nối đồ họa đều phải được cập nhật ngay lập tức vào hồ sơ kiến trúc của dự án.
   - Tài liệu kiến trúc phải mô tả chính xác ranh giới của các tầng, danh mục interface công khai và cách thức game bao bọc lõi Engine.

2. **Duy trì Nhật ký Thay đổi (Changelog):**
   - Bắt buộc cập nhật tệp `CHANGELOG.md` theo chuẩn Keep a Changelog sau mỗi lần thực hiện sửa đổi mã nguồn.
   - Cấu trúc nhật ký phải phân định rành mạch các mục: `Added` (Tính năng/Module mới), `Changed` (Thay đổi kiến trúc/hành vi), `Deprecated` (Sắp loại bỏ), `Removed` (Mã chết hoặc thành phần đã xóa bỏ), `Fixed` (Sửa lỗi), `Security` (Khắc phục vấn đề an toàn/bảo mật).

---

## 8. TIÊU CHÍ NGHIỆM THU CỦA AGENT TRƯỚC KHI BÀN GIAO

Trước khi hoàn tất bất kỳ phiên làm việc nào, Agent phải tự động kiểm chứng và đảm bảo:
- Thư mục `./engine` hoàn toàn nguyên vẹn, không có bất kỳ thay đổi nào.
- Toàn bộ ứng dụng Next.js biên dịch thành công, không phát sinh lỗi TypeScript và không vi phạm quy tắc SSR.
- Không tồn tại mã chết, không còn import thừa hoặc biến không sử dụng.
- Mọi hàm, module mới đều có chú thích tiếng Việt đầy đủ và tuân thủ SOLID, Clean Architecture.
- Hồ sơ kiến trúc và Changelog đã được ghi nhận đầy đủ, khớp 100% với các thay đổi thực tế.