#ifndef USER_MANAGER_H
#define USER_MANAGER_H

#include <string>
#include <vector>

struct User{
    std::string id;
    std::string name;
    std::string email;
    std::string password;
    std::string role;
};

class UserManager {
    private :
    std::vector<User> users;
    std::string dbPath; 

    void loadUsers();

    public :
    UserManager(const std::string& path);
    bool authenticate(const std::string& email, const std::string& password, User& loggedInUser);
    bool registerUser(const std::string& name, const std::string& email, const std::string& password);
    int getTotalUsers(); 
    
    
    std::vector<User> getAllUsers();
    bool deleteUser(const std::string& email);
};
#endif