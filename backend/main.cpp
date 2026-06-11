#define _WIN32_WINNT 0x0A00
#include <iostream>
#include <string>
#include "httplib.h"
#include "json.hpp"
#include "user_manager.h" 
using namespace httplib;
using json = nlohmann::json;
using namespace std;

UserManager userManager("../database/users.txt");

int main() {
    Server svr;

    auto cors_middleware = [](const Request& req, Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
    };

    svr.Get("/api/test", [&](const Request& req, Response& res) {
        cors_middleware(req, res); 
        json responseData = {
            {"status", "success"},
            {"message", "Xin chao! Backend C++ cua HUST LBC da hoat dong!"},
            {"developer", "Nguyen Bao Son"}
        };
        res.set_content(responseData.dump(), "application/json");
    });

    // ========================================================
    // API LOGIN
    // ========================================================
    svr.Post("/api/login", [&](const Request& req, Response& res) {
        cors_middleware(req, res);
        try {
            // open data
            auto body = json::parse(req.body);
            string email = body["email"];
            string password = body["password"];

            User loggedInUser;
            bool success = userManager.authenticate(email, password, loggedInUser);
            
            if (success) {
                res.status = 200;
                // 🌟 CHỖ NÀY ĐÃ ĐƯỢC SỬA: Đóng gói thêm Name và Role trả về cho Frontend
                json responseData = {
                    {"status", "success"},
                    {"name", loggedInUser.name},
                    {"role", loggedInUser.role}
                };
                res.set_content(responseData.dump(), "application/json");
            } else {
                res.status = 401;
                res.set_content("{\"error\": \"Sai mat khau!\"}", "application/json");
            }
        }
        catch (const exception& e) {
            res.status = 400; 
            res.set_content("{\"error\": \"Gửi sai định dạng!\"}", "application/json");
        }
    });

    // ========================================================
    // API ĐĂNG KÝ (Nhận Request từ Frontend khi bấm Sign Up)
    // ========================================================
    svr.Post("/api/register", [&](const Request& req, Response& res) {
        cors_middleware(req, res);
        try {
            auto body = json::parse(req.body);
            string name = body["name"];
            string email = body["email"];
            string password = body["password"];

            bool isSuccess = userManager.registerUser(name, email, password);
            
            if (isSuccess) {
                res.status = 200;
                res.set_content("{\"status\": \"success\"}", "application/json");
            } else {
                res.status = 400;
                res.set_content("{\"error\": \"Email da ton tai!\"}", "application/json");
            }
        }
        catch (const exception& e) {
            res.status = 400; 
            res.set_content("{\"error\": \"Gửi sai định dạng!\"}", "application/json");
        }
    });

    // ========================================================
    // QUẦY ĐỠ LỆNH OPTIONS TỪ TRÌNH DUYỆT (CORS)
    // ========================================================
    svr.Options(R"(.*)", [&](const Request& req, Response& res) {
        cors_middleware(req, res);
    });

    // Khởi động server
    cout << "-------------------------------------------\n";
    cout << " HUST LBC Backend Server is running...\n";
    cout << " Thu truy cap: http://localhost:8080/api/test\n";
    cout << "-------------------------------------------\n";
    
    // Server lắng nghe luôn phải là LỆNH CUỐI CÙNG của file main
    svr.listen("0.0.0.0", 8080);
    
    return 0;
}