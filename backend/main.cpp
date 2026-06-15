#define _WIN32_WINNT 0x0A00 
#include <iostream>
#include <string>
#include "httplib.h"                            //Thư viện để tạo web server
#include "json.hpp"                             // đọc ghi json            
#include "user_manager.h" 
#include "book_manager.cpp" 

using namespace httplib;
using json = nlohmann::json;
using namespace std;

UserManager userManager("../database/users.txt");               //truyền đường dẫn tới file db

int main() {
    Server svr;                                                 //Khởi tạo máy chủ

    AdminDatabaseManager dbManager("hust_library.db");          //khởi tạo quản lí sách, truyền tên databse SQlite
    dbManager.initDatabase();                                   //lệnh tạo bảng (nếu chưa có)


    //Cấp phép cho lấy dữ liệu (chia sẻ tài nguyên chéo nguồn gốc)
    //C++ đang ở cổng 8080, trong khi front end chạy ở cổng 5500
    auto cors_middleware = [](const Request& req, Response& res) {


        // 1. Cho phép AI CŨNG ĐƯỢC (dấu *) gọi API lấy dữ liệu
        res.set_header("Access-Control-Allow-Origin", "*");


        // 2. Cho phép người lạ được dùng các loại hành động này (GET để lấy sách, POST để mượn sách, DELETE để xóa)
        res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");


        // 3. Cho phép người lạ gửi kèm các thông tin định dạng chữ (Content-Type)
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
    };
    // ========================================================
    // API TEST SERVER STATUS
    // ========================================================
    svr.Get("/api/test", [&](const Request& req, Response& res) {   //mở công api test cho lệnh get
        cors_middleware(req, res);                                  //cấp phép cors

        // Khởi tạo một đối tượng JSON với 2 trường dữ liệu: trạng thái (status) và tên tác giả (developer).
        json responseData = {{"status", "success"}, {"developer", "Nguyen Bao Son"}};

        // .dump() là hàm ép cái đối tượng JSON ở trên thành một chuỗi văn bản (String) để truyền qua mạng.
        // "application/json" là nhãn dãn báo web đây là json (dùng được)
        res.set_content(responseData.dump(), "application/json");
    });
    

    // ========================================================
    // API LOGIN & REGISTER
    // ========================================================
    svr.Post("/api/login", [&](const Request& req, Response& res) {
        cors_middleware(req, res);                                  //cấp phép cors

        //chạy try_catch để check xem dữ liệu gửi sai định dạng hay hỏng không
        //tránh sập, nếu try sập thì sang catch
        try {
            // Dịch gói tin văn bản (req.body) thành đối tượng JSON để C++ hiểu được
            auto body = json::parse(req.body);  
            User loggedInUser;                  //biến lưu thông tin đăng nhập nếu đúng
            if (userManager.authenticate(body["email"], body["password"], loggedInUser)) {      //check in4
                // Nếu ĐÚNG: Gói thông tin Tên và Quyền (Role) thành JSON để gửi về cho Web
                json r = {{"status", "success"}, {"name", loggedInUser.name}, {"role", loggedInUser.role}};
                res.set_content(r.dump(), "application/json");
            } else {
                res.status = 401;               // Nếu SAI pass/email: Trả về mã lỗi 401 (Unauthorized - Không được phép truy cập)
            }
        } catch (...) { res.status = 400; }         // Nếu có bất kỳ lỗi vặt nào xảy ra (ví dụ: mất mạng, lỗi chuỗi), báo lỗi 400 (Bad Request)
    });

    svr.Post("/api/register", [&](const Request& req, Response& res) {
        cors_middleware(req, res);
        try {
            auto body = json::parse(req.body);
            if (userManager.registerUser(body["name"], body["email"], body["password"])) {
                res.set_content("{\"status\": \"success\"}", "application/json");
            } else { res.status = 400; }
        } catch (...) { res.status = 400; }
    });

    // ========================================================
    // API KHO SÁCH ADMIN
    // ========================================================
    svr.Get("/api/admin/books", [&](const Request& req, Response& res) {
        cors_middleware(req, res);
        std::vector<BorrowedBook> dbBooks = dbManager.getAllBorrowedBooks();
        json j_array = json::array();
        for (const auto& b : dbBooks) {
            json item;
            item["raw_id"] = b.id;
            item["id"] = "TX-" + to_string(9000 + b.id);
            item["title"] = b.book_title;
            item["author"] = b.author;
            item["category"] = b.category;
            item["price"] = to_string((int)b.borrow_price);
            item["image_url"] = b.image_url;
            item["author_image_url"] = b.author_image_url;
            item["summary"] = b.summary;
            item["borrower"] = b.borrower_email;
            item["dueDate"] = b.borrow_date;
            item["db_status"] = b.status;
            
            if (b.status == "Active" || b.status == "Overdue") {
                item["status"] = "borrowed";
            } else {
                item["status"] = "available";
                item["borrower"] = "—";
                item["dueDate"] = "—";
            }
            j_array.push_back(item);
        }
        res.set_content(j_array.dump(), "application/json");
    });

    svr.Post("/api/admin/books", [&](const Request& req, Response& res) {
        cors_middleware(req, res);
        try {
            auto body = json::parse(req.body);
            string price_str = body.contains("price") ? body["price"].get<string>() : "0";
            double price = price_str.empty() ? 0.0 : stod(price_str);
            if (dbManager.addAvailableBook(body["title"], body["author"], body["category"], price, body["image_url"], body["author_image_url"], body["summary"])) {
                res.set_content("{\"status\": \"success\"}", "application/json");
            } else { res.status = 500; }
        } catch (...) { res.status = 400; }
    });

    svr.Delete(R"(/api/admin/books/(\d+))", [&](const Request& req, Response& res) {
        cors_middleware(req, res);
        if (dbManager.deleteBook(stoi(req.matches[1]))) res.set_content("{\"status\": \"success\"}", "application/json");
        else res.status = 500;
    });

    svr.Put(R"(/api/admin/books/(\d+))", [&](const Request& req, Response& res) {
        cors_middleware(req, res);
        try {
            auto body = json::parse(req.body);
            string price_str = body.contains("price") ? body["price"].get<string>() : "0";
            double price = price_str.empty() ? 0.0 : stod(price_str);
            if (dbManager.updateBook(stoi(req.matches[1]), body["title"], body["author"], body["category"], price, body["image_url"], body["author_image_url"], body["summary"], body["status"], body["date"])) {
                res.set_content("{\"status\": \"success\"}", "application/json");
            } else res.status = 500;
        } catch (...) { res.status = 400; }
    });

    // ========================================================
    //  API QUẢN TRỊ TÀI KHOẢN NGƯỜI DÙNG (MỚI XỊN SÒ)
    // ========================================================
    svr.Get("/api/admin/users", [&](const Request& req, Response& res) {
        cors_middleware(req, res);
        
        std::vector<User> allUsers = userManager.getAllUsers();
        std::vector<BorrowedBook> dbBooks = dbManager.getAllBorrowedBooks();
        json j_users = json::array();
        
        for (const auto& u : allUsers) {
            json node;
            node["id"] = "UV-" + to_string(100 + stoi(u.id));
            node["name"] = u.name;
            node["email"] = u.email;
            node["password"] = u.password;
            node["role"] = u.role;
            node["classname"] = u.classname;
            
            int b_count = 0; int t_paid = 0; bool overdue_flag = false;
            json active_bks = json::array();
            
            for (const auto& b : dbBooks) {
                if (b.borrower_email == u.email && (b.status == "Active" || b.status == "Overdue")) {
                    b_count++;
                    t_paid += (int)b.borrow_price;
                    if (b.status == "Overdue") overdue_flag = true;
                    
                    json bk;
                    bk["title"] = b.book_title;
                    bk["price"] = (int)b.borrow_price;
                    bk["dueDate"] = b.borrow_date;
                    active_bks.push_back(bk);
                }
            }
            node["borrow_count"] = b_count;
            node["total_paid"] = t_paid;
            node["has_overdue"] = overdue_flag;
            node["borrowed_books"] = active_bks;
            j_users.push_back(node);
        }
        res.set_content(j_users.dump(), "application/json");
    });

    svr.Post("/api/admin/users/delete", [&](const Request& req, Response& res) {
        cors_middleware(req, res);
        try {
            auto body = json::parse(req.body);
            if (userManager.deleteUser(body["email"])) res.set_content("{\"status\": \"success\"}", "application/json");
            else res.status = 404;
        } catch (...) { res.status = 400; }
    });
    // ========================================================
    // API CẬP NHẬT THÔNG TIN PROFILE (MỚI)
    // ========================================================
    svr.Put("/api/users/update", [&](const Request& req, Response& res) {
        cors_middleware(req, res);
        try {
            auto body = json::parse(req.body);
            string email = body["email"];
            string name = body["name"];
            string classname = body.value("classname", "Chưa cập nhật");
            string password = body.value("password", "");

            if (userManager.updateUser(email, name, password, classname)) {
                res.set_content("{\"status\": \"success\"}", "application/json");
            } else {
                res.status = 500;
                res.set_content("{\"error\": \"Loi ghi Database!\"}", "application/json");
            }
        } catch (...) { res.status = 400; }
    });
    // ========================================================
    //  API ĐÁNH GIÁ SÁCH (REVIEWS)
    // ========================================================
    svr.Get(R"(/api/reviews/(\d+))", [&](const Request& req, Response& res) {
        cors_middleware(req, res);
        int book_id = stoi(req.matches[1]);
        auto reviews = dbManager.getReviews(book_id);
        json j_arr = json::array();
        for (const auto& r : reviews) {
            j_arr.push_back({
                {"id", r.id},
                {"user_name", r.user_name},
                {"rating", r.rating},
                {"comment", r.comment},
                {"created_at", r.created_at}
            });
        }
        res.set_content(j_arr.dump(), "application/json");
    });

    svr.Post("/api/reviews", [&](const Request& req, Response& res) {
        cors_middleware(req, res);
        try {
            auto body = json::parse(req.body);
            int book_id = body["book_id"];
            string user_name = body["user_name"];
            int rating = body["rating"];
            string comment = body["comment"];

            if (dbManager.addReview(book_id, user_name, rating, comment)) {
                res.set_content("{\"status\": \"success\"}", "application/json");
            } else res.status = 500;
        } catch (...) { res.status = 400; }
    });

    // ========================================================
    // API NGƯỜI DÙNG XÁC NHẬN MƯỢN SÁCH (CHECKOUT)
    // ========================================================
    svr.Post("/api/checkout", [&](const Request& req, Response& res) {      //api login
        cors_middleware(req, res);                                          //
        try {
            auto body = json::parse(req.body);
            int book_id = body["book_id"];
            string email = body["email"];
            string due_date = body["due_date"]; // Lấy ngày trả do JS tính toán

            if (dbManager.checkoutBook(book_id, email, due_date)) {
                res.set_content("{\"status\": \"success\"}", "application/json");
            } else {
                res.status = 400; // Sách có thể đã bị ai đó nhanh tay mượn mất
                res.set_content("{\"error\": \"Sach khong kha dung hoac da bi muon!\"}", "application/json");
            }
        } catch (...) { res.status = 400; }
    });

    // ========================================================
    //  API XỬ LÝ SÁCH YÊU THÍCH (FAVORITES)
    // ========================================================
    svr.Get("/api/favorites", [&](const Request& req, Response& res) {
        cors_middleware(req, res);
        string email = req.get_param_value("email");
        auto favs = dbManager.getUserFavorites(email);
        json j = favs;
        res.set_content(j.dump(), "application/json");
    });

    svr.Post("/api/favorites/toggle", [&](const Request& req, Response& res) {
        cors_middleware(req, res);
        try {
            auto body = json::parse(req.body);
            string email = body["email"];
            int book_id = body["book_id"];
            int result = dbManager.toggleFavorite(email, book_id);
            res.set_content("{\"status\": \"success\", \"is_loved\": " + to_string(result) + "}", "application/json");
        } catch (...) { res.status = 400; }
    });
    // ========================================================
    // API STATS
    // ========================================================
    svr.Get("/api/admin/stats", [&](const Request& req, Response& res) {
        cors_middleware(req, res);
        DashboardStats bookStats = dbManager.getDashboardStats();
        json r = {{"total_books", bookStats.total_titles}, {"borrowed_books", bookStats.total_borrowed_transactions}, {"overdue_books", bookStats.total_overdue}, {"total_users", userManager.getTotalUsers()}};
        res.set_content(r.dump(), "application/json");
    });
    // Tiền kiểm tra gửi yêu cầu http nếu trả về access-control-allow-origin thì cho phép web gửi yêu cầu chính thức tới server
    svr.Options(R"(.*)", [&](const Request& req, Response& res) { cors_middleware(req, res); });
    // Khởi động server
    cout << "-------------------------------------------\n";
    cout << " HUST LBC Backend Server is running...\n";
    cout << " Thu truy cap: http://localhost:8080/api/test\n";
    cout << "-------------------------------------------\n";
    
    //giữ cho server không tắt, chừng nào tắt terminal
    svr.listen("0.0.0.0", 8080);        //(Any IPv4 Address)
    return 0;
}