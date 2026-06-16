#ifndef BOOK_MANAGER_H
#define BOOK_MANAGER_H

#include <vector>
#include <string>

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

struct BookReview {
    int id;
    int book_id;
    std::string user_name;
    int rating;
    std::string comment;
    std::string created_at;
};

struct UserFavorite {
    int id;
    std::string user_email;
    int book_id; 
};

class AdminDatabaseManager {
private:
    std::string booksFile = "../database/books.txt";
    std::string reviewsFile = "../database/reviews.txt";
    std::string favsFile = "../database/favorites.txt";

    std::vector<BorrowedBook> books;
    std::vector<BookReview> reviews;
    std::vector<UserFavorite> favorites;

    void loadBooks();
    void saveBooks();
    void loadReviews();
    void saveReviews();
    void loadFavorites();
    void saveFavorites();

public:
    AdminDatabaseManager(std::string dummy_parameter);

    bool initDatabase();

    DashboardStats getDashboardStats();
    std::vector<BorrowedBook> getAllBorrowedBooks();

    bool addAvailableBook(std::string title, std::string author, std::string category, double price, std::string img, std::string auth_img, std::string sum);
    bool deleteBook(int id);
    bool updateBook(int id, std::string title, std::string author, std::string category, double price, std::string img, std::string auth_img, std::string sum, std::string status, std::string date);

    std::vector<BookReview> getReviews(int book_id);
    bool addReview(int book_id, std::string user_name, int rating, std::string comment);
    
    bool checkoutBook(int id, std::string email, std::string due_date);
    std::vector<int> getUserFavorites(std::string email);
    int toggleFavorite(std::string email, int book_id);
};

#endif