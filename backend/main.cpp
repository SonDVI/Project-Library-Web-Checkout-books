#define _WIN32_WINNT 0x0A00
#include <iostream>
#include <string>
#include "httplib.h"
#include "json.hpp"
#include "user_manager.h" 
#include "book_manager.cpp" 

using namespace httplib;
using json = nlohmann::json;
using namespace std;

UserManager userManager("../database/users.txt");

int main() {
    Server svr;

    AdminDatabaseManager dbManager("hust_library.db");
    dbManager.initDatabase();

    auto cors_middleware = [](const Request& req, Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
    };

    svr.Get("/api/test", [&](const Request& req, Response& res) {
        cors_middleware(req, res); 
        json responseData = {{"status", "success"}, {"developer", "Nguyen Bao Son"}};
        res.set_content(responseData.dump(), "application/json");
    });

    // ========================================================
    // API LOGIN & REGISTER
    // ========================================================
    svr.Post("/api/login", [&](const Request& req, Response& res) {
        cors_middleware(req, res);
        try {
            auto body = json::parse(req.body);
            User loggedInUser;
            if (userManager.authenticate(body["email"], body["password"], loggedInUser)) {
                json r = {{"status", "success"}, {"name", loggedInUser.name}, {"role", loggedInUser.role}};
                res.set_content(r.dump(), "application/json");
            } else {
                res.status = 401;
            }
        } catch (...) { res.status = 400; }
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
    // 🌟 API QUẢN TRỊ TÀI KHOẢN NGƯỜI DÙNG (MỚI XỊN SÒ)
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
    // API STATS
    // ========================================================
    svr.Get("/api/admin/stats", [&](const Request& req, Response& res) {
        cors_middleware(req, res);
        DashboardStats bookStats = dbManager.getDashboardStats();
        json r = {{"total_books", bookStats.total_titles}, {"borrowed_books", bookStats.total_borrowed_transactions}, {"overdue_books", bookStats.total_overdue}, {"total_users", userManager.getTotalUsers()}};
        res.set_content(r.dump(), "application/json");
    });

    svr.Options(R"(.*)", [&](const Request& req, Response& res) { cors_middleware(req, res); });
    // Khởi động server
    cout << "-------------------------------------------\n";
    cout << " HUST LBC Backend Server is running...\n";
    cout << " Thu truy cap: http://localhost:8080/api/test\n";
    cout << "-------------------------------------------\n";
    svr.listen("0.0.0.0", 8080);
    return 0;
}