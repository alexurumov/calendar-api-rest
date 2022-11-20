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

## MEETINGS CREATE
Send POST request to /api/meetings with following body format: 
{
    "name": "some name", 
    "room": "some room", 
    "startTime": "some date", format: {{year}-{month}-{day}T{hours}:{minutes}:{seconds}.{timezone}Z}
    "endTime": "some date"
}
Name must be unique! Start and end time must not conflict with existing meetings in the room! 

## MEETINGS GET/:id -> obtain a particular meeting
Send GET request to /api/meetings with querry param = the id of the meeting you want to be displayed
Example: /api/meetings/637a17fe6cd08cc45af852c7
A guard is implemented to show details for meetings you are only the owner of! 

## MEETINGS PUT/:id -> edit an existing meeting
Send PUT request to /api/meetings with querry param = the id of the meeting you want to edit and the body with updated fields
Example: /api/meetings/637a17fe6cd08cc45af852c7
{
    "name": "some name", 
    "room": "some room", 
    "startTime": "some date", format: {{year}-{month}-{day}T{hours}:{minutes}:{seconds}.{timezone}Z}
    "endTime": "some date"
}
A guard is implemented to show details for meetings you are only the owner of! 

## MEETINGS DELETE/:id -> remove a particular meeting
Send DELETE request to /api/meetings with querry param = the id of the meeting you want to be removed
Example: /api/meetings/637a17fe6cd08cc45af852c7
A guard is implemented to show details for meetings you are only the owner of! 

## MEETINGS GET -> get a list of all meetings
Send GET request to /api/meetings 
A guard is implemented to show meetings you are only the owner of! 

## MEETINGS GET PAST -> get a list of all meetings you have ever had
Send GET request to /api/meetings/ with querry param = 'past'
A guard is implemented to show meetings you are only the owner of! 

## MEETINGS GET TODAY -> get a list of all meetings you have for today
Send GET request to /api/meetings/ with querry param = 'today'
A guard is implemented to show meetings you are only the owner of! 
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
    a. Create a meeting [x] -> avoid duplication [x]
    b. List a meeting (if owner) [x]
    c. List today meetings [ ] (if owner)
    d. List past meetings [ ] (if owner)
    e. Edit meeting [x] (if owner)
    f. Delete meeting [ ] (if owner)
8. Make middlewares
    a. Auth [x]
    b. Guards [x]
9. Make utils
    a. FilterObject [x]
    b. BsonToJson [x]
10. Refactor response statuses [ ]
11. Complete README for endpoints and actions [x]