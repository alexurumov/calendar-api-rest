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
Send POST request with body params: username and password in the following format:
{
    "username":"someUsername", 
    "password":"somePassword", 
}
If body params are present and there is no duplication in Users DB, register will be successful and JWT Token with UserData obj will be populated to cookie(AUTH_COOKIE) headers. 
## TODO

1. Make init setups [x]
2. Make server work [x]
3. Configure endpoints [x]
4. Setup DB Models [x]
5. Configure controllers [x]
6. Implement user creation and authentication
    a. Register [x]
    b. Login [ ]
    c. Logout [ ]
7. Test CRUD
    a. Create a meeting [x]
    b. List meetings [ ]
    c. Edit meeting [ ]
    d. Delete meeting [ ]