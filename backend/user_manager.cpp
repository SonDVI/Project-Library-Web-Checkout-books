#include "user_manager.h"
#include <fstream>
#include <sstream>
#include <iostream>

using namespace std;

// Initializing Data
UserManager::UserManager(const string& path) {
    dbPath = path;
    loadUsers();
}

void UserManager::loadUsers() {
    ifstream file(dbPath);
    if(!file.is_open()) {
        cout << "Loi: khong the mo file database " << dbPath << "\n";
        return;
    }

    string line;
    getline(file, line); // Đọc dòng tiêu đề
    while(getline(file, line)) {
        if(line.empty()) continue;
        stringstream ss(line);
        User u;
        
        getline(ss, u.id, ',');
        getline(ss, u.name, ',');
        getline(ss, u.email, ',');
        getline(ss, u.password, ',');
        getline(ss, u.role, ',');

        users.push_back(u); // push vao vector quan li du lieu user
    }
    file.close(); // Nhớ đóng file
} 

// Login 
bool UserManager::authenticate(const string& email, const string& password, User& loggedInUser) { // Sửa lại tham số cho khớp file .h
    for(const User& u : users) {
        if(u.email == email && u.password == password) { // Sửa lỗi gõ sai chữ pasword
            loggedInUser = u;
            return true;
        }
    }
    return false; // Khong co Tai khoan khop
}

// Registering
bool UserManager::registerUser(const string& name, const string& email, const string& password) {
    for(const auto& u : users) {
        if(u.email == email) {
            cout << "Email Exists" << endl;
            return false;
        }
    }
    
    int newId = 1;
    if(!users.empty()) {
        newId = stoi(users.back().id) + 1;
    }

    User newUser = {to_string(newId), name, email, password, "student"};
    users.push_back(newUser); // tao acc xong thi push vao users de luu tam

    // luu thong tin vao o cung
    ofstream file(dbPath, ios::app);
    if(file.is_open()) {
        file << endl << newUser.id << "," << newUser.name << "," << newUser.email << "," << newUser.password << "," << newUser.role;
        file.close();
        cout << "Da Luu Ho So moi " << name << " vao database." << endl;
        return true;
    }
    
    return false; // Thêm return false để phòng trường hợp file không mở được
}