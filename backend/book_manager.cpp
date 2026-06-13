#include <sqlite3.h>
#include <iostream>
#include <vector>
#include <string>
#include <utility>

struct BorrowedBook {
    int id;
    std::string book_title;
    std::string author;
    std::string category;
    double borrow_price;
    std::string image_url;
    std::string author_image_url;
    std::string summary;
    std::string borrower_email;
    std::string borrow_date;
    std::string status;
};

struct DashboardStats {
    int total_titles;
    int total_borrowed_transactions;
    int total_overdue;
};

class AdminDatabaseManager {
private:
    std::string db_name;

public:
    AdminDatabaseManager(std::string database_file) : db_name(database_file) {}

    bool initDatabase() {
        sqlite3* db = nullptr;
        if (sqlite3_open(db_name.c_str(), &db) != SQLITE_OK) return false;

        const char* table_borrow_sql = 
            "CREATE TABLE IF NOT EXISTS borrowed_books ("
            "id INTEGER PRIMARY KEY AUTOINCREMENT,"
            "book_title TEXT NOT NULL,"
            "author TEXT DEFAULT 'Chưa cập nhật',"
            "category TEXT DEFAULT 'Chưa phân loại',"
            "borrow_price REAL DEFAULT 0.0,"
            "image_url TEXT DEFAULT '',"
            "author_image_url TEXT DEFAULT '',"
            "summary TEXT DEFAULT '',"
            "borrower_email TEXT NOT NULL,"
            "borrow_date TEXT NOT NULL,"
            "status TEXT DEFAULT 'Active');";

        sqlite3_exec(db, table_borrow_sql, nullptr, nullptr, nullptr);
        
        sqlite3_stmt* stmt = nullptr;
        int count_borrow = 0;
        if (sqlite3_prepare_v2(db, "SELECT COUNT(*) FROM borrowed_books;", -1, &stmt, nullptr) == SQLITE_OK) {
            if (sqlite3_step(stmt) == SQLITE_ROW) count_borrow = sqlite3_column_int(stmt, 0);
        }
        if (stmt) sqlite3_finalize(stmt);

        if (count_borrow == 0) {
            const char* mock_borrow = 
                "INSERT INTO borrowed_books (book_title, author, category, borrow_price, image_url, author_image_url, summary, borrower_email, borrow_date, status) VALUES "
                "('Giai tich 1', 'Toan hoc HUST', 'Giao trinh', 15000, '', '', '', 'dung.nh231234@sis.hust.edu.vn', '10/06/2026', 'Active'),"
                "('C++ for Backend Systems', 'Tác giả Ẩn danh', 'Truyen thong so', 25000, '', '', '', 'admin@sis.hust.edu.vn', '01/06/2026', 'Active');";
            sqlite3_exec(db, mock_borrow, nullptr, nullptr, nullptr);
        }
        if (db) sqlite3_close(db);
        return true;
    }

    DashboardStats getDashboardStats() {
        DashboardStats stats = {0, 0, 0};
        sqlite3* db = nullptr;
        if (sqlite3_open(db_name.c_str(), &db) != SQLITE_OK) return stats;

        sqlite3_stmt* stmt = nullptr;
        if (sqlite3_prepare_v2(db, "SELECT COUNT(*) FROM borrowed_books;", -1, &stmt, nullptr) == SQLITE_OK) {
            if (sqlite3_step(stmt) == SQLITE_ROW) stats.total_titles = sqlite3_column_int(stmt, 0);
        }
        if (stmt) sqlite3_finalize(stmt);
        
        stmt = nullptr;
        if (sqlite3_prepare_v2(db, "SELECT COUNT(*) FROM borrowed_books WHERE status != 'Available';", -1, &stmt, nullptr) == SQLITE_OK) {
            if (sqlite3_step(stmt) == SQLITE_ROW) stats.total_borrowed_transactions = sqlite3_column_int(stmt, 0);
        }
        if (stmt) sqlite3_finalize(stmt);

        stmt = nullptr;
        if (sqlite3_prepare_v2(db, "SELECT COUNT(*) FROM borrowed_books WHERE status = 'Overdue';", -1, &stmt, nullptr) == SQLITE_OK) {
            if (sqlite3_step(stmt) == SQLITE_ROW) stats.total_overdue = sqlite3_column_int(stmt, 0);
        }
        if (stmt) sqlite3_finalize(stmt);

        if (db) sqlite3_close(db);
        return stats;
    }

    std::vector<BorrowedBook> getAllBorrowedBooks() {
        std::vector<BorrowedBook> list;
        sqlite3* db = nullptr;
        if (sqlite3_open(db_name.c_str(), &db) != SQLITE_OK) return list;

        sqlite3_stmt* stmt = nullptr;
        const char* sql = "SELECT id, book_title, author, category, borrow_price, image_url, author_image_url, summary, borrower_email, borrow_date, status FROM borrowed_books ORDER BY id DESC;";
        
        // KIỂM TRA LỖI: Chỉ lấy dữ liệu nếu câu lệnh đúng chuẩn cấu trúc bảng mới
        if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
            while (sqlite3_step(stmt) == SQLITE_ROW) {
                BorrowedBook b;
                b.id = sqlite3_column_int(stmt, 0);
                b.book_title = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1) ? sqlite3_column_text(stmt, 1) : (const unsigned char*)"");
                b.author = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2) ? sqlite3_column_text(stmt, 2) : (const unsigned char*)"");
                b.category = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3) ? sqlite3_column_text(stmt, 3) : (const unsigned char*)"");
                b.borrow_price = sqlite3_column_double(stmt, 4);
                b.image_url = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 5) ? sqlite3_column_text(stmt, 5) : (const unsigned char*)"");
                b.author_image_url = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 6) ? sqlite3_column_text(stmt, 6) : (const unsigned char*)"");
                b.summary = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 7) ? sqlite3_column_text(stmt, 7) : (const unsigned char*)"");
                b.borrower_email = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 8) ? sqlite3_column_text(stmt, 8) : (const unsigned char*)"");
                b.borrow_date = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 9) ? sqlite3_column_text(stmt, 9) : (const unsigned char*)"");
                b.status = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 10) ? sqlite3_column_text(stmt, 10) : (const unsigned char*)"");
                list.push_back(b);
            }
        }
        if (stmt) sqlite3_finalize(stmt);
        if (db) sqlite3_close(db);
        return list;
    }

    bool addAvailableBook(std::string title, std::string author, std::string category, double price, std::string img, std::string auth_img, std::string sum) {
        sqlite3* db = nullptr;
        if (sqlite3_open(db_name.c_str(), &db) != SQLITE_OK) return false;
        
        sqlite3_stmt* stmt = nullptr;
        const char* sql = "INSERT INTO borrowed_books (book_title, author, category, borrow_price, image_url, author_image_url, summary, borrower_email, borrow_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, '—', '—', 'Available');";
        
        bool success = false;
        if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
            sqlite3_bind_text(stmt, 1, title.c_str(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(stmt, 2, author.c_str(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(stmt, 3, category.c_str(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_double(stmt, 4, price);
            sqlite3_bind_text(stmt, 5, img.c_str(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(stmt, 6, auth_img.c_str(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(stmt, 7, sum.c_str(), -1, SQLITE_TRANSIENT);
            
            success = (sqlite3_step(stmt) == SQLITE_DONE);
        }
        if (stmt) sqlite3_finalize(stmt);
        if (db) sqlite3_close(db);
        return success;
    }
    // 1. HÀM XÓA SÁCH (SÁT THỦ)
    bool deleteBook(int id) {
        sqlite3* db = nullptr;
        if (sqlite3_open(db_name.c_str(), &db) != SQLITE_OK) return false;
        
        sqlite3_stmt* stmt = nullptr;
        const char* sql = "DELETE FROM borrowed_books WHERE id = ?;";
        bool success = false;
        
        if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
            sqlite3_bind_int(stmt, 1, id);
            success = (sqlite3_step(stmt) == SQLITE_DONE);
        }
        if (stmt) sqlite3_finalize(stmt);
        if (db) sqlite3_close(db);
        return success;
    }

    // 2. HÀM CHỈNH SỬA SÁCH (BÁC SĨ)
    bool updateBook(int id, std::string title, std::string author, std::string category, double price, std::string img, std::string auth_img, std::string sum, std::string status, std::string date) {
        sqlite3* db = nullptr;
        if (sqlite3_open(db_name.c_str(), &db) != SQLITE_OK) return false;
        
        sqlite3_stmt* stmt = nullptr;
        // Cập nhật toàn bộ thông tin, bao gồm cả trạng thái và ngày trả
        const char* sql = "UPDATE borrowed_books SET book_title = ?, author = ?, category = ?, borrow_price = ?, image_url = ?, author_image_url = ?, summary = ?, status = ?, borrow_date = ? WHERE id = ?;";
        bool success = false;
        
        if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
            sqlite3_bind_text(stmt, 1, title.c_str(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(stmt, 2, author.c_str(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(stmt, 3, category.c_str(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_double(stmt, 4, price);
            sqlite3_bind_text(stmt, 5, img.c_str(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(stmt, 6, auth_img.c_str(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(stmt, 7, sum.c_str(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(stmt, 8, status.c_str(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(stmt, 9, date.c_str(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_int(stmt, 10, id);
            
            success = (sqlite3_step(stmt) == SQLITE_DONE);
        }
        if (stmt) sqlite3_finalize(stmt);
        if (db) sqlite3_close(db);
        return success;
    }
};