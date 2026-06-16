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
    users.clear();                                  //Giải phóng ram 
    ifstream file(dbPath);                          // Mở file users.txt ở chế độ đọc
    if(!file.is_open()) {                           //Nếu chưa mở file thành công
        file.open("database/users.txt");            //chuyển sang đường dẫn dự phòng
        if (!file.is_open()) return;                //Nếu đường dẫn dự phòng trỏ sai -->return
    }

    string line;
    getline(file, line);                            //lược bỏ dòng đầu chứa tiêu đề
    while(getline(file, line)) {                    //tiến hành đọc db
        if(line.empty()) continue;                  //Bỏ qua dòng trống
        stringstream ss(line);                      //tách từng thành phần 1 bằng stringstream
        User u;                                     // lưu vào các thuộc tính của cấu trúc user
        
        getline(ss, u.id, ',');                     
        getline(ss, u.name, ',');
        getline(ss, u.email, ',');
        getline(ss, u.password, ',');
        getline(ss, u.role, ',');
        
        //nếu classmate user chưa cập nhật thì lưu vào thuộc tính classname là :...
        if (!getline(ss, u.classname, ',')) {
            u.classname = "Chưa cập nhật";
        }

        users.push_back(u);                 //xong rồi thì push vào vector để lưu trữ 
    }
    file.close();                           //đóng file
}   



//Hàm xác thực trả về true false
//const để bảo vệ bộ nhớ tránh trong quá trình duyệt danh sách người dùng để kiểm tra email, pass thì không lỡ xóa đi thông tin này
//Biến tham chiếu User& loggedInUser (để hứng dữ liệu về nếu đăng nhập đúng)
bool UserManager::authenticate(const string& email, const string& password, User& loggedInUser) {
    for(const User& u : users) {
        if(u.email == email && u.password == password) {
            loggedInUser = u;
            return true;                                                                                                    //nếu check trong vector lưu trữ thấy email và pass giống thì đăng nhập đúng trả về true
        }
    }
    return false;                                                       //sai thì về false
}



//Hàm register tài khoản 
bool UserManager::registerUser(const string& name, const string& email, const string& password) {
    for(const auto& u : users) {
        if(u.email == email) return false;                                                                                                                                                                                                          //nếu email này đã dùng để tạo tài khoản trước đó thì không dùng để tạo tài khoản khác nữa
    }
    
    int newId = 1;
    if(!users.empty()) newId = stoi(users.back().id) + 1;               //mỗi lần tạo tài khoản thì id tự động cộng 1 để có id mới

    User newUser = {to_string(newId), name, email, password, "student", "Chưa cập nhật"};
    users.push_back(newUser);                                       //tạo xong rồi thì lưu vào vector lưu trữ



    //mở file database user để thêm dữ liệu user mới
    ofstream file(dbPath, ios::app);
    if(file.is_open()) {
        file << "\n" << newUser.id << "," << newUser.name << "," << newUser.email << "," << newUser.password << "," << newUser.role << "," << newUser.classname;
        file.close();
        return true;            //register thành công
    }
    return false;
}
//Hàm trả về tổng số người dùng xài cho AdminDashboard
int UserManager::getTotalUsers() { return users.size(); }


std::vector<User> UserManager::getAllUsers() { return users; }
//trả về toàn bộ thông tin người dùng xài cho admindashboard


//hàm xóa người dùng (admindashboard)
bool UserManager::deleteUser(const string& email) {
    bool found = false;
    for (auto it = users.begin(); it != users.end(); ++it) {
        if (it->email == email) {
            users.erase(it);                    //nếu email trong vector = email đang xét thì thực hiện xóa
            found = true; break;
        }
    }
    if (!found) return false;   //return false nếu không tồn tại




    //đồng bộ với database
    ofstream file(dbPath, ios::trunc);                      //mở file ở mode xóa hết cập nhật lại từ đầu
    if (!file.is_open()) file.open("database/users.txt", ios::trunc);
    if (file.is_open()) {
        file << "id,name,email,password,role,classname\n";
        for (size_t i = 0; i < users.size(); ++i) {
            //ghi lại dữ liệu
            file << users[i].id << "," << users[i].name << "," << users[i].email << "," << users[i].password << "," << users[i].role << "," << users[i].classname;
            if (i < users.size() - 1) file << "\n";             //xuống dòng phần tử cuối
        }
        file.close();
        return true;
    }
    return false;
}

//hàm cập nhật Profile người dùng (Profile)
bool UserManager::updateUser(const string& email, const string& newName, const string& newPass, const string& newClassname) {
    bool found = false;
    for (auto& u : users) {
        if (u.email == email) {
            u.name = newName;
            u.classname = newClassname;
            if (!newPass.empty()) u.password = newPass; // Chỉ đổi pass nếu người dùng có nhập
            found = true;
            break;
        }
    }
    if (!found) return false;


    //tiến hành đồng bộ database
    ofstream file(dbPath, ios::trunc);
    if (!file.is_open()) file.open("database/users.txt", ios::trunc);
    if (file.is_open()) {
        file << "id,name,email,password,role,classname\n";
        for (size_t i = 0; i < users.size(); ++i) {
            file << users[i].id << "," << users[i].name << "," << users[i].email << "," << users[i].password << "," << users[i].role << "," << users[i].classname;
            if (i < users.size() - 1) file << "\n";//
        }
        file.close();
        return true;
    }
    return false;
}