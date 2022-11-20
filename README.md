## Requirements

REST API to serve/edit calendar events
The purpose of this component is to enable web based clients to manage calendar events (aka meetings).

A meeting consists of:

- owner
- start time
- end time
- name
- meeting room (Two meetings can't be placed in the same room at the same time!)

The API should allow for:

- list all meetings a user (owner) has for a particular day
- list all meetings a user (owner) has ever had
- create a new meeting
- update an existing meeting
- delete a meeting

For simplicity, you could assume there is only one meeting owner (user).

### INITIAL SETUP
Run in terminal following initial commands: 
npm i -> to install dependencies
npm start -> to start the server

# DUE TO LACK OF CLIENT SERVER IMPLEMENTATION, PLEASE, FOLLOW THE STEPS TO TEST API:

## REGISTER USER: 
Send POST request to /api/users/register with body params: username and password in the following format:
{
    "username":"someUsername", 
    "password":"somePassword", 
}
If body params are present and there is no duplication in Users DB, register will be successful and JWT Token with UserData obj will be populated to cookie(AUTH_COOKIE) headers. 

## USER LOGIN: 
Send POST request to /api/users/login with body params: username and password in the following format:
{
    "username":"someUsername", 
    "password":"somePassword", 
}
If body params are present and there is an exact same user with the same data in the DB, login will be successful and JWT Token with UserData obj will be populated to cookie(AUTH_COOKIE) headers. 

## USER LOGOUT: 
Send POST request to /api/users/logout (no body needed) and JWT Token with UserData obj will be removed from the AUTH_COOKIE. 

#### We implement basic user CRUD and auth, so we can successfully implement Meetings creation with owner! 
## TODO

1. Make init setups [x]
2. Make server work [x]
3. Configure endpoints [x]
4. Setup DB Models [x]
5. Configure controllers [x]
6. Implement user creation and authentication
    a. Register [x]
    b. Login [x]
    c. Logout [x]
7. Test CRUD
    a. Create a meeting [x] -> avoid duplication
    b. List a meeting (if owner) [x]
    c. List today meetings [ ] (if owner)
    d. List past meetings [ ] (if owner)
    e. Edit meeting [ ] (if owner)
    f. Delete meeting [ ] (if owner)
8. Make middlewares
    a. Auth [x]
    b. Guards [x]
9. Make utils
    a. FilterObject [x]
    b. BsonToJson [x]
10. Refactor response statuses 