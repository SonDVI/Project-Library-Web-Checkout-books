# Project được làm bởi hai thành viên thuộc lớp TTS & Kỹ thuật Đa Phương Tiện - 01 
---
## Nguyễn Bảo Sơn                         
## MSSV : 2025146605                       

## Nguyễn khánh Duy
## MSSV : 202514569
                                                                                                  
---

readme_content = """# HUST LBC - Library Book Checkout System

Một hệ thống quản lý và mượn trả sách Thư viện số cao cấp (Premium Full-Stack Platform) dành riêng cho sinh viên Đại học Bách Khoa Hà Nội (HUST). Dự án kết hợp hài hòa giữa giao diện đồ họa hiện đại mang phong cách Fintech/OLED Luxury ở Frontend và hiệu năng xử lý dữ liệu mạnh mẽ của C++ ở Backend.

---

## Tổng Quan Về Website
HUST LBC không chỉ đơn thuần là một trang web mượn sách, mà là một **Hệ sinh thái Quản lý Ấn phẩm Cá nhân hóa** bao gồm 5 phân hệ cốt lõi:
1. **Trang Chủ (Home Portal):** Băng chuyền (Carousel) hiển thị tự động các tựa sách mới nhất và danh sách tác giả thịnh hành được đồng bộ trực tiếp từ cơ sở dữ liệu.
2. **Danh Mục Sách (Catalog):** Bộ lọc đa năng (Thể loại, Tình trạng sẵn sàng, Sách yêu thích ) tích hợp công cụ tìm kiếm thông minh (Combo Search) với hiệu ứng trượt thác nối tiếp (Cascade Fade-In Up).
3. **Chi Tiết Ấn Phẩm (Cinematic Book Detail):** Giao diện OLED True Black sang trọng hiển thị đầy đủ thông số sách, hệ thống đếm lượt mượn thực tế, và khu vực đánh giá (Review/Rating) tương tác từ độc giả.
4. **Bảng Điều Khiển (Command Center Dashboard):** Hệ thống phân tích dữ liệu thời gian thực (Real-time Data Analytics) xếp hạng Top độc giả tích cực, Sách hot trong kho, và Tác giả phổ biến dựa trên tần suất mượn thực tế.
5. **Cài Đặt Hệ Thống (System Settings):** Đồng bộ cấu hình toàn diện bao gồm chuyển đổi giao diện (Dark Mode mặc định / Light Mode Kính sữa Alabaster mờ) và đa ngôn ngữ linh hoạt (Tiếng Việt, Tiếng Anh, Tiếng Nhật).

---

##  Vai Trò Của Trí Tuệ Nhân Tạo (AI Assisted)
Dự án được tối ưu hóa toàn diện với sự đồng hành và hỗ trợ đắc lực từ trí tuệ nhân tạo (AI) trong hai giai đoạn quan trọng:
* **UI/UX Design Concept:** AI hỗ trợ lên ý tưởng bứt phá, thoát khỏi các khuôn mẫu UI truyền thống để hướng tới phong cách thiết kế kính mờ cao cấp (Luxury Glassmorphism), xử lý dải màu đổ bóng tinh tế (Ambient Glow) và tối ưu hóa trải nghiệm người dùng liền mạch (User Flow Optimization).
* **System Logic & Engineering:** AI đóng vai trò như một chuyên gia tư vấn kiến trúc phần mềm, hỗ trợ gỡ lỗi bất đồng bộ (Asynchronous JavaScript), tối ưu thuật toán bóc tách dữ liệu chuẩn, và xây dựng logic kết nối API trơn tru từ Frontend xuống các endpoint xử lý dữ liệu của Server C++.

---

##  Hướng Dẫn Vận Hành & Khởi Chạy Hệ Thống

Hệ thống hoạt động theo mô hình Client-Server độc lập, giao tiếp thông qua giao thức HTTP RESTful API (link github:https://github.com/yhirose/cpp-httplib)

### 1. Khởi động Backend (C++ Server & SQLite)
Yêu cầu máy máy tính đã cài đặt trình biên dịch `g++` và thư viện SQLite3.
* **Bước 1:** Di chuyển vào thư mục lưu trữ backend.
* **Bước 2:** Biên dịch mã nguồn bộ não C++:
* g++ main.cpp book_manager.cpp -o server -lsqlite3
  Lưu ý để quản lí cơ sở dữ liệu cần tải : DB browse SQLite hoặc quản lí qua trang Admin đã được cung cấp trên trình duyệt.
* **Bước 3:** Mở Server local host trên máy tính cá nhân :
* ./server
  khi thấy dòng chữ "HUST LBC Backend Server is running..." thì server đã chạy thành công.
### 2. Khởi chạy Frontend (Giao diện Web)
Vì Frontend được xây dựng hoàn toàn bằng mã nguồn tĩnh tối ưu (Pure HTML/CSS/JS), việc khởi chạy cực kỳ đơn giản:

* **Cách 1 (Chạy cục bộ):** Click đúp trực tiếp vào file index.html trên máy tính để mở bằng trình duyệt (Chrome, Edge, Safari).

* **Cách 2 (Môi trường phát triển):** Sử dụng extension Live Server trên VS Code để khởi tạo một host tĩnh cục bộ, giúp trải nghiệm mượt mà và tối ưu nhất.




### DataFlow
  *[Trình duyệt Người dùng] ---> (Bắn yêu cầu API Fetch) ---> [Server C++ Port 8080]
           ^                                                         |
           |                                                         v
    (Render UI/UX mượt mà) <--- (Trả kết quả JSON) <--- [Cơ sở dữ liệu SQLite]*
