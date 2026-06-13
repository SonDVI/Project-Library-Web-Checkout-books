#include "user_manager.h"
#include <fstream>
#include <sstream>
#include <iostream>

using namespace std;

UserManager::UserManager(const string& path) {
    dbPath = path;
    loadUsers();
}

void UserManager::loadUsers() {
    users.clear(); // Xóa sạch bộ nhớ tạm trước khi nạp mới
    ifstream file(dbPath);
    
    if(!file.is_open()) {
        file.open("database/users.txt");
        if (!file.is_open()) {
            cout << "CẢNH BÁO: Khong tim thay file users.txt o bat cu dau!\n";
            return;
        }
    }

    string line;
    getline(file, line); 
    while(getline(file, line)) {
        if(line.empty()) continue;
        stringstream ss(line);
        User u;
        
        getline(ss, u.id, ',');
        getline(ss, u.name, ',');
        getline(ss, u.email, ',');
        getline(ss, u.password, ',');
        getline(ss, u.role, ',');

        users.push_back(u); 
    }
    file.close(); 
}

bool UserManager::authenticate(const string& email, const string& password, User& loggedInUser) {
    for(const User& u : users) {
        if(u.email == email && u.password == password) {
            loggedInUser = u;
            return true;
        }
    }
    return false; 
}

bool UserManager::registerUser(const string& name, const string& email, const string& password) {
    for(const auto& u : users) {
        if(u.email == email) return false;
    }
    
    int newId = 1;
    if(!users.empty()) {
        newId = stoi(users.back().id) + 1;
    }

    User newUser = {to_string(newId), name, email, password, "student"};
    users.push_back(newUser); 

    ofstream file(dbPath, ios::app);
    if(file.is_open()) {
        file << "\n" << newUser.id << "," << newUser.name << "," << newUser.email << "," << newUser.password << "," << newUser.role;
        file.close();
        return true;
    }
    return false;
}

int UserManager::getTotalUsers() {
    return users.size();
}

std::vector<User> UserManager::getAllUsers() {
    return users;
}

// Hàm thực thi lệnh xóa tài khoản vật lý khỏi file .txt bảo toàn dòng đầu
bool UserManager::deleteUser(const string& email) {
    bool found = false;
    for (auto it = users.begin(); it != users.end(); ++it) {
        if (it->email == email) {
            users.erase(it);
            found = true;
            break;
        }
    }
    if (!found) return false;

    ofstream file(dbPath, ios::trunc);
    if (!file.is_open()) {
        file.open("database/users.txt", ios::trunc);
    }
    
    if (file.is_open()) {
        file << "id,name,email,password,role\n";
        for (size_t i = 0; i < users.size(); ++i) {
            file << users[i].id << "," << users[i].name << "," << users[i].email << "," << users[i].password << "," << users[i].role;
            if (i < users.size() - 1) file << "\n";
        }
        file.close();
        return true;
    }
    return false;
}