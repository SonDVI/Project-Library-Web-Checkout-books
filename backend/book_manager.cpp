#include "book_manager.h"
#include <fstream>
#include <sstream>
#include <algorithm>
#include <ctime>
using namespace std;

AdminDatabaseManager::AdminDatabaseManager(string dummy_parameter) {}

// ==========================================
// CÁC HÀM LÕI: ĐỌC/GHI FILE TEXT
// ==========================================
void AdminDatabaseManager::loadBooks() {
    books.clear();
    ifstream file(booksFile);
    if (!file.is_open()) {
        file.open("../database/books.txt");
        if(!file.is_open()) return;
    }
    string line;
    getline(file, line);

    while(getline(file, line)) {
        if(line.empty()) continue;
        stringstream ss(line);
        string temp;
        BorrowedBook b;

        getline(ss, temp, ','); b.id = stoi(temp.empty() ? "0" : temp);
        getline(ss, b.book_title, ',');
        getline(ss, b.author, ',');
        getline(ss, b.category, ',');
        getline(ss, temp, ','); b.borrow_price = stod(temp.empty() ? "0" : temp);
        getline(ss, b.image_url, ',');
        getline(ss, b.author_image_url, ',');
        getline(ss, b.summary, ',');
        getline(ss, b.borrower_email, ',');
        getline(ss, b.borrow_date, ',');
        getline(ss, b.status, ',');

        books.push_back(b);
    }
    file.close();
}

void AdminDatabaseManager::saveBooks() {
    ofstream file(booksFile, ios::trunc);
    file << "id,book_title,author,category,borrow_price,image_url,author_image_url,summary,borrower_email,borrow_date,status\n";
    for(size_t i = 0; i < books.size(); i++) {
        file << books[i].id << "," << books[i].book_title << "," << books[i].author << "," 
             << books[i].category << "," << books[i].borrow_price << "," << books[i].image_url << "," 
             << books[i].author_image_url << "," << books[i].summary << "," << books[i].borrower_email << "," 
             << books[i].borrow_date << "," << books[i].status;
        if(i < books.size() - 1) file << "\n";
    }
    file.close();
}

void AdminDatabaseManager::loadReviews() {
    reviews.clear();
    ifstream file(reviewsFile);
    if(!file.is_open()) {
        file.open("../database/reviews.txt");
        if(!file.is_open()) return;
    }

    string line;
    getline(file, line);
    while(getline(file, line)) {
        if(line.empty()) continue;
        stringstream ss(line);
        
        string temp;
        BookReview a;

        getline(ss, temp, ','); a.id = stoi(temp.empty() ? "0" : temp);
        getline(ss, temp, ','); a.book_id = stoi(temp.empty() ? "0" : temp);
        getline(ss, a.user_name, ',');
        getline(ss, temp, ','); a.rating = stoi(temp.empty() ? "0" : temp);
        getline(ss, a.comment, ',');
        getline(ss, a.created_at, ',');

        reviews.push_back(a);
    }
    file.close();
}

void AdminDatabaseManager::saveReviews() {
    ofstream file(reviewsFile, ios::trunc);
    file << "id,book_id,user_name,rating,comment,created_at\n";
    for(size_t i = 0; i < reviews.size(); i++) {
        file << reviews[i].id << "," << reviews[i].book_id << "," << reviews[i].user_name << "," 
             << reviews[i].rating << "," << reviews[i].comment << "," << reviews[i].created_at;
        if(i < reviews.size() - 1) file << "\n";
    }
    file.close();
}

void AdminDatabaseManager::loadFavorites() {
    favorites.clear();
    ifstream file(favsFile);
    if(!file.is_open()) {
        file.open("../database/favorites.txt");
        if(!file.is_open()) return;
    }

    string line;
    getline(file, line);

    while(getline(file, line)) {
        if(line.empty()) continue;
        stringstream ss(line);
        string temp;
        UserFavorite c;

        getline(ss, temp, ','); c.id = stoi(temp.empty() ? "0" : temp);
        getline(ss, c.user_email, ',');
        getline(ss, temp, ','); c.book_id = stoi(temp.empty() ? "0" : temp);

        favorites.push_back(c);
    }
    file.close();
}

void AdminDatabaseManager::saveFavorites() {
    ofstream file(favsFile, ios::trunc);
    file << "id,user_email,book_id\n";
    for(size_t i = 0; i < favorites.size(); i++) {
        file << favorites[i].id << "," << favorites[i].user_email << "," << favorites[i].book_id;
        if(i < favorites.size() - 1) file << "\n";
    }
    file.close();
}

// ==========================================
// CÁC HÀM XỬ LÝ SÁCH API
// ==========================================
bool AdminDatabaseManager::initDatabase() {
    loadBooks();
    loadReviews();
    loadFavorites();
    if(books.empty()) {
        addAvailableBook("Giai tich 1", "Toan Hoc Hust", "Giao Trinh", 15000, "", "", "");
        addAvailableBook("C++ for begginer", "Son Nguyen", "Giao Trinh", 15000, "", "", "");

        books[0].borrower_email = "dung.nh231234@sis.hust.edu.vn"; books[0].borrow_date = "10/06/2026"; books[0].status = "Active";
        books[1].borrower_email = "admin@sis.hust.edu.vn"; books[1].borrow_date = "01/06/2026"; books[1].status = "Active";
        saveBooks();
    }
    return true;
}

DashboardStats AdminDatabaseManager::getDashboardStats() {
    DashboardStats stats = {0, 0, 0};
    stats.total_titles = books.size();
    for(const auto& b : books) {
        if(b.status != "Available") stats.total_borrowed_transactions++;
        if(b.status == "Overdue") stats.total_overdue++;
    }
    return stats;
}

vector<BorrowedBook> AdminDatabaseManager::getAllBorrowedBooks() {
    return books;
}

bool AdminDatabaseManager::addAvailableBook(string title, string author, string category, double price, string img, string auth_img, string sum) {
    int newId = 1;
    if(!books.empty()) newId = books.back().id + 1;
    
    BorrowedBook b = {newId, title, author, category, price, img, auth_img, sum, "—", "—", "Available"};
    books.push_back(b);
    saveBooks();
    return true;
}

bool AdminDatabaseManager::deleteBook(int id) {
    bool found = false;
    for(auto it = books.begin(); it != books.end(); it++) {
        if(it->id == id) {
            books.erase(it);
            found = true;
            break;
        }
    }
    if(found) saveBooks();
    return found;
}

bool AdminDatabaseManager::updateBook(int id, string title, string author, string category, double price, string img, string auth_img, string sum, string status, string date) {
    for(auto& b : books) {
        if(b.id == id) {
            b.book_title = title;
            b.author = author;
            b.category = category;
            b.borrow_price = price;
            b.image_url = img;
            b.author_image_url = auth_img;
            b.summary = sum;
            b.status = status;
            b.borrow_date = date;
            saveBooks();
            return true;
        }
    }
    return false;
}

vector<BookReview> AdminDatabaseManager::getReviews(int book_id) {
    vector<BookReview> list;
    for(auto it = reviews.rbegin(); it != reviews.rend(); it++) {
        if(it->book_id == book_id) {
            list.push_back(*it);
        }
    }
    return list;
}

bool AdminDatabaseManager::addReview(int book_id, string user_name, int rating, string comment) {
    int newId = 1;
    if(!reviews.empty()) newId = reviews.back().id + 1;

    time_t now = time(0);
    tm *ltm = localtime(&now);

    char buffer[20];
    strftime(buffer, sizeof(buffer), "%Y-%m-%d", ltm);

    string today(buffer);

    BookReview r  = {newId, book_id, user_name, rating, comment, today};
    reviews.push_back(r);

    saveReviews();
    return true;
}

bool AdminDatabaseManager::checkoutBook(int id, string email, string due_date) {
    for(auto& b : books) {
        if(b.id == id && b.status == "Available") {
            b.status = "Active";
            b.borrower_email = email;
            b.borrow_date = due_date;
            saveBooks();
            return true;
        }
    }
    return false;
}

vector<int> AdminDatabaseManager::getUserFavorites(string email) {
    vector<int> favs;
    for(const auto& f : favorites) {
        if(f.user_email == email) {
            favs.push_back(f.book_id);
        }
    }
    return favs;
}

int AdminDatabaseManager::toggleFavorite(string email, int book_id) {
    for(auto it = favorites.begin(); it != favorites.end(); it++) {
        if(it->user_email == email && it->book_id == book_id) {
            favorites.erase(it);
            saveFavorites();
            return 0;
        }
    }
    int newId = 1;
    if(!favorites.empty()) newId = favorites.back().id + 1;

    favorites.push_back({newId, email, book_id});
    saveFavorites();
    return 1;
}