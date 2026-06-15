#ifndef USER_MANAGER_H
#define USER_MANAGER_H

#include <string>
#include <vector>

//cấu trúc lưu trữ người dùng
struct User{
    std::string id;                         //id người dùng
    std::string name;                       //Tên đăng nhập
    std::string email;                      //Email
    std::string password;                   //Mật khẩu đăng nhập
    std::string role;                       //vai trò Admin(hay người dùng)
    std::string classname;                  //Ngành đang học
};

class UserManager {
    private :
    std::vector<User> users;                //vector lưu trữ struct user
    std::string dbPath;                     //Đường dẫn tới database

    void loadUsers();

    public :
    UserManager(const std::string& path);
    bool authenticate(const std::string& email, const std::string& password, User& loggedInUser);
    bool registerUser(const std::string& name, const std::string& email, const std::string& password);
    int getTotalUsers(); 
    
    
    std::vector<User> getAllUsers();
    bool deleteUser(const std::string& email);
    bool updateUser(const std::string& email, const std::string& newName, const std::string& newPass, const std::string& newClassname);

};
#endif