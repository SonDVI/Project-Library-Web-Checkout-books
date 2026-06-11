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
    std::string dbPath; // database path

    void loadUsers();


    public :
    UserManager(const std::string& path);
    //check if email and password is right
    bool authenticate(const std::string& email, const std::string& password, User& loggedInUser);
    //registering user and go to
    bool registerUser(const std::string& name, const std::string& email, const std::string& password);
};
#endif