# EV Charging App - User Service

This is the User Service for the EV Charging App, responsible for managing user accounts and their related data.

## Getting Started

### Prerequisites

- Node.js (version 18.18.0)

### Installation

1. Clone this repository.
2. Run `npm install` to install the project dependencies.


### 1) User Data Model
In a MongoDB database, the user data model for your EV Charging App might include the following fields:

- _id: MongoDB's automatically generated unique identifier for each user.
- username: The user's unique username.
- email: The user's email address.
- password: A securely hashed password.
- wallet_balance: The user's wallet balance (if applicable).
- rfid: Array (seperate collection).
- charging_history: An array of charging session records( seperate collection)
- other relevant user details: Depending on your specific app requirements, you may include additional fields.




### 2) User Service Endpoints

Define the API endpoints for the User Service. Example endpoints might include:

- GET /users: Retrieve a list of all users.
- GET /users/:id: Retrieve user details by ID.
- POST /users: Create a new user.
- PUT /users/:id: Update user details.
- DELETE /users/:id: Delete a user.
- POST /users/login: User login.
- POST /users/signup: User sign up.
- POST /users/logout: User logout.
- GET /users/:id/charging-history: Retrieve a user's charging history.


### 3) Authentication

- The API uses JSON Web Tokens (JWT) for authentication. Generate `refresh token ` and `access token` . 

### 4) Error Handling

- The API handles errors gracefully and returns informative error responses.

### 5) Database

- This service uses MongoDB to store user data. Make sure to set up the MongoDB connection using the `MONGO_URI` environment variable.



## RFID Tag Integration

This service provides functionality to integrate RFID tags for users to use for EV charging and access control.

### RFID Tags

- The service manages RFID tags for users, allowing them to associate and disassociate tags from their accounts.

### API Endpoints

- `GET /rfid-tags`: Retrieve a list of all RFID tags.
- `GET /rfid-tags/:id`: Retrieve RFID tag details by ID.
- `POST /rfid-tags`: Create a new RFID tag and associate it with a user.
- `PUT /rfid-tags/:id`: Update RFID tag details.
- `DELETE /rfid-tags/:id`: Deactivate or delete an RFID tag.
- `POST /users/:userId/assign-rfid-tag`: Associate an RFID tag with a user.
- `POST /users/:userId/remove-rfid-tag`: Disassociate an RFID tag from a user.