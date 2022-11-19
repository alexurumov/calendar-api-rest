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

## TODO

1. Make init setups [x]
2. Make server work [x]
3. Configure endpoints [ ]
4. Setup DB Models [ ]
5. Configure controllers and services [ ]
6. Test CRUD [ ]
    a. Create a meeting [ ]
    b. List meetings [ ]
    c. Edit meeting [ ]
    d. Delete meeting [ ]