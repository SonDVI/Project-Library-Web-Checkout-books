#include <sqlite3.h>
#include <iostream>
#include <vector>
#include <string>
#include <utility>


//cấu trúc lưu trữ của sách
struct BorrowedBook {
    int id;                                     //id người mượn
    std::string book_title;                     //tiêu đề
    std::string author;                         //tác giả
    std::string category;                       //thể loại
    double borrow_price;                        //giá
    std::string image_url;                      //đường dẫn image của bìa sách
    std::string author_image_url;               //đường dẫn image của tác giả
    std::string summary;                        //nội dung cơ bản của sách
    std::string borrower_email;                 //email của người mượn sách
    std::string borrow_date;                    //hạn trả
    std::string status;                         //tình trạng sách
};


//cấu trúc lưu trữ bảng dashboard_admin
struct DashboardStats {
    int total_titles;                               //tổng số sách
    int total_borrowed_transactions;                //tổng số sách đang được mượn
    int total_overdue;                              //tổng số sách quá hạn
};

//cấu trúc lưu trữ các đánh giá về sách
struct BookReview {
    int id;                                         //id người đánh giá
    int book_id;                                    //id book
    std::string user_name;                          //tên người đánh giá
    int rating;                                     //điểm đánh giá
    std::string comment;                            //comment
    std::string created_at;                         
};

class AdminDatabaseManager {
private:
    std::string db_name;

public:
    AdminDatabaseManager(std::string database_file) : db_name(database_file) {}

    bool initDatabase() {
        sqlite3* db = nullptr;              //Chuẩn bị con trỏ đại diện cho cánh cửa Database, gán bằng rỗng (nullptr) cho an toàn.

        //ở file Database. Hàm c_str() ép kiểu chuỗi string của C++ thành mảng char của C (chuẩn mà SQLite yêu cầu).
        //Mở thất bại -->return false (báo lỗi)
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
        
        //  THÊM MỚI: Tạo bảng lưu trữ Đánh giá sách
        const char* table_reviews_sql = 
            "CREATE TABLE IF NOT EXISTS book_reviews ("     //tạo bảng nếu chưa có
            "id INTEGER PRIMARY KEY AUTOINCREMENT,"         //tự động cập nhật id người dùng
            "book_id INTEGER NOT NULL,"                     //id book không được trống dữ liệu
            "user_name TEXT NOT NULL,"                      //tên người dùng không được trống dữ liệu
            "rating INTEGER NOT NULL,"                      //rating không được trống dữ liệu
            "comment TEXT,"                                 //comment có thể trống dữ liệu
            "created_at TEXT DEFAULT CURRENT_DATE);";       //ngày tạo mặc định theo thời gian hiện tại  
            
            //mở sqlite, thực hiện lệnh mấy cái không cần thiết thì gán rỗng
        sqlite3_exec(db, table_reviews_sql, nullptr, nullptr, nullptr);

        //  THÊM MỚI: Bảng lưu trữ Sách Yêu Thích của từng User
        const char* table_fav_sql = 
            "CREATE TABLE IF NOT EXISTS user_favorites ("
            "id INTEGER PRIMARY KEY AUTOINCREMENT,"
            "user_email TEXT NOT NULL,"
            "book_id INTEGER NOT NULL,"
            "UNIQUE(user_email, book_id));"; // UNIQUE để mỗi user chỉ được thả 1 tim/1 sách
        sqlite3_exec(db, table_fav_sql, nullptr, nullptr, nullptr);
        
        // (Mock dữ liệu mẫu giữ nguyên)
        //nếu chữa có dữ liệu thì tạo 2 sách mẫu để test lệnh
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

    // (Các hàm getDashboardStats, getAllBorrowedBooks, addAvailableBook, deleteBook, updateBook giữ nguyên hoàn toàn)
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

    bool updateBook(int id, std::string title, std::string author, std::string category, double price, std::string img, std::string auth_img, std::string sum, std::string status, std::string date) {
        sqlite3* db = nullptr;
        if (sqlite3_open(db_name.c_str(), &db) != SQLITE_OK) return false;
        sqlite3_stmt* stmt = nullptr;
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

    // ========================================================
    //  THÊM MỚI: CÁC HÀM XỬ LÝ ĐÁNH GIÁ (REVIEWS)
    // ========================================================
    std::vector<BookReview> getReviews(int book_id) {
        std::vector<BookReview> list;
        sqlite3* db = nullptr;
        if (sqlite3_open(db_name.c_str(), &db) != SQLITE_OK) return list;

        sqlite3_stmt* stmt = nullptr;
        const char* sql = "SELECT id, book_id, user_name, rating, comment, created_at FROM book_reviews WHERE book_id = ? ORDER BY id DESC;";
        if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
            sqlite3_bind_int(stmt, 1, book_id);
            while (sqlite3_step(stmt) == SQLITE_ROW) {
                BookReview r;
                r.id = sqlite3_column_int(stmt, 0);
                r.book_id = sqlite3_column_int(stmt, 1);
                r.user_name = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
                r.rating = sqlite3_column_int(stmt, 3);
                r.comment = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 4));
                r.created_at = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 5));
                list.push_back(r);
            }
        }
        if (stmt) sqlite3_finalize(stmt);
        if (db) sqlite3_close(db);
        return list;
    }

    bool addReview(int book_id, std::string user_name, int rating, std::string comment) {
        sqlite3* db = nullptr;
        if (sqlite3_open(db_name.c_str(), &db) != SQLITE_OK) return false;

        sqlite3_stmt* stmt = nullptr;
        const char* sql = "INSERT INTO book_reviews (book_id, user_name, rating, comment) VALUES (?, ?, ?, ?);";
        bool success = false;
        if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
            sqlite3_bind_int(stmt, 1, book_id);
            sqlite3_bind_text(stmt, 2, user_name.c_str(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_int(stmt, 3, rating);
            sqlite3_bind_text(stmt, 4, comment.c_str(), -1, SQLITE_TRANSIENT);
            success = (sqlite3_step(stmt) == SQLITE_DONE);
        }
        if (stmt) sqlite3_finalize(stmt);
        if (db) sqlite3_close(db);
        return success;
    }
    //  HÀM XUẤT KHO SÁCH (CHECKOUT CHO NGƯỜI DÙNG MƯỢN)
    bool checkoutBook(int id, std::string email, std::string due_date) {
        sqlite3* db = nullptr;
        if (sqlite3_open(db_name.c_str(), &db) != SQLITE_OK) return false;
        
        sqlite3_stmt* stmt = nullptr;
        // Lệnh UPDATE: Chỉ cho phép mượn nếu sách đang ở trạng thái 'Available'
        const char* sql = "UPDATE borrowed_books SET status = 'Active', borrower_email = ?, borrow_date = ? WHERE id = ? AND status = 'Available';";
        bool success = false;
        
        if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
            sqlite3_bind_text(stmt, 1, email.c_str(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(stmt, 2, due_date.c_str(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_int(stmt, 3, id);
            
            if (sqlite3_step(stmt) == SQLITE_DONE) {
                // Kiểm tra xem có dòng nào thực sự bị thay đổi không (Tránh trùng đơn)
                if (sqlite3_changes(db) > 0) success = true;
            }
        }
        if (stmt) sqlite3_finalize(stmt);
        if (db) sqlite3_close(db);
        return success;
    }
    // ========================================================
    // CÁC HÀM XỬ LÝ SÁCH YÊU THÍCH (FAVORITES)
    // ========================================================
    std::vector<int> getUserFavorites(std::string email) {
        std::vector<int> favs;
        sqlite3* db = nullptr;
        if (sqlite3_open(db_name.c_str(), &db) != SQLITE_OK) return favs;
        sqlite3_stmt* stmt = nullptr;
        if (sqlite3_prepare_v2(db, "SELECT book_id FROM user_favorites WHERE user_email = ?;", -1, &stmt, nullptr) == SQLITE_OK) {
            sqlite3_bind_text(stmt, 1, email.c_str(), -1, SQLITE_TRANSIENT);
            while (sqlite3_step(stmt) == SQLITE_ROW) {
                favs.push_back(sqlite3_column_int(stmt, 0));
            }
        }
        if (stmt) sqlite3_finalize(stmt);
        if (db) sqlite3_close(db);
        return favs;
    }

    int toggleFavorite(std::string email, int book_id) {
        sqlite3* db = nullptr;
        if (sqlite3_open(db_name.c_str(), &db) != SQLITE_OK) return -1;
        sqlite3_stmt* stmt = nullptr;
        int status = 1; // 1 = Vừa thả tim, 0 = Đã hủy tim
        
        // Kiểm tra xem User đã thả tim cuốn này chưa
        bool exists = false;
        if (sqlite3_prepare_v2(db, "SELECT id FROM user_favorites WHERE user_email = ? AND book_id = ?;", -1, &stmt, nullptr) == SQLITE_OK) {
            sqlite3_bind_text(stmt, 1, email.c_str(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_int(stmt, 2, book_id);
            if (sqlite3_step(stmt) == SQLITE_ROW) exists = true;
        }
        if (stmt) sqlite3_finalize(stmt);

        stmt = nullptr;
        if (exists) {
            // Đã tim rồi -> Ấn lần nữa là Hủy tim (DELETE)
            if (sqlite3_prepare_v2(db, "DELETE FROM user_favorites WHERE user_email = ? AND book_id = ?;", -1, &stmt, nullptr) == SQLITE_OK) {
                sqlite3_bind_text(stmt, 1, email.c_str(), -1, SQLITE_TRANSIENT);
                sqlite3_bind_int(stmt, 2, book_id);
                sqlite3_step(stmt);
            }
            status = 0;
        } else {
            // Chưa tim -> Ghi nhận thả tim (INSERT)
            if (sqlite3_prepare_v2(db, "INSERT INTO user_favorites (user_email, book_id) VALUES (?, ?);", -1, &stmt, nullptr) == SQLITE_OK) {
                sqlite3_bind_text(stmt, 1, email.c_str(), -1, SQLITE_TRANSIENT);
                sqlite3_bind_int(stmt, 2, book_id);
                sqlite3_step(stmt);
            }
        }
        if (stmt) sqlite3_finalize(stmt);
        if (db) sqlite3_close(db);
        return status;
    }
};