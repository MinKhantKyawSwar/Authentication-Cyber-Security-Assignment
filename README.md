Authentic: Token-Based Authentication System
Setup and Start Guide
This guide outlines the steps required to clone the repository and start both the Express.js backend API and the React frontend application for development.

Prerequisites
Ensure you have the following installed on your system:

Node.js (Version 18 or higher)

npm (comes bundled with Node.js)

Git (if you don't currently have this folder in your local machine)

1. Clone the Repository
   Clone the project repository to your local machine.

git clone [https://github.com/MinKhantKyawSwar/Authentication-Cyber-Security-Assignment.git]

2. Backend Setup (Express API)
   The backend handles authentication logic, token minting, database interaction, and API endpoints.

Navigate and Install Dependencies
Move into the backend directory and install the required Node.js packages.

````cd backend
``` npm install

Configure Environment Variables
Create a file named .env in the backend/ directory and add your configuration. This is crucial for security (JWT secrets, database connection strings, etc.).

Note: Replace the placeholder values with actual secure keys.

Start the Backend Development Server
Start the server, which will typically run on http://localhost:4000.

npm run dev

The server is now running and ready to handle API calls.

3. Frontend Setup (React App)
   The frontend is the client application that interacts with the backend, storing and managing the Access Token.

Navigate and Install Dependencies
Move into the frontend directory and install the React application dependencies.

``` cd ../frontend # Assuming you are currently in the backend/ directory, if not cd frontend
``` npm install

Configure Frontend Environment Variables
Create a file named .env in the frontend/ directory to configure the base URL for the API.

Start the Frontend Development Server
Start the React development server. It usually runs on http://localhost:5173 and opens automatically in your browser.

npm run dev

The React application is now running and communicating with the Express API.

Authentication System Technical Overview
The authentication system provides secure, scalable, token-based authentication for web applications by separating concerns between two token types.

Tokens
Access Token: JWT, 15 minutes
Used on every API call via the Authorization: Bearer <token> header.

Refresh Token: Opaque random string, 30 days

Never exposed to TypeScript

Used only by the backend to mint new access tokens

Authentication Flow
Registration or Login completes with OTP verification → issues:

accessToken (JWT) returned in the response body

Client stores access token in localStorage or memory and uses it for API calls

Server rotates the refresh token cookie on every refresh

If the refresh token is expired or invalid, the server denies refresh and the client must re-login

Logout clears the access token client-side and revokes the refresh token server-side (and clears the cookie)

## Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client (Browser/App)
    participant S as Server (Auth API)

    U->>C: Enters credentials + OTP
    C->>S: POST /api/auth/login (credentials)
    S-->>C: "OTP sent"
    C->>S: POST /api/auth/verify-otp (OTP)
    S-->>C: accessToken (body) + refreshToken (cookie)

    Note over C: Stores accessToken in localStorage<br>Uses refreshToken from cookie

    C->>S: API request with Authorization: Bearer accessToken
    S-->>C: Protected resource

    Note over C,S: After 15 min, accessToken expires

    C->>S: POST /api/auth/refresh (with cookie)
    S-->>C: New accessToken + rotated refreshToken cookie

    C->>S: API request with new Authorization header
    S-->>C: Protected resource

    U->>C: Clicks Logout
    C->>S: POST /api/auth/logout
    S-->>C: Cookie cleared, refresh revoked
    C-->>U: Clears accessToken from localStorage, redirect to login
````
