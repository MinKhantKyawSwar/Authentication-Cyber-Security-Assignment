# Authentic: Token-Based Authentication System - Setup and Technical Guide

This guide outlines the steps required to clone the repository and start both the Express.js backend API and the React frontend application for development, along with a technical overview of the authentication system.

---

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (Version 18 or higher)
- **npm** (comes bundled with Node.js)
- **Git** (required to clone the repository)

---

## 1. Clone the Repository

Clone the project repository to your local machine. I have already provided this with code file so you can skip this one.

```bash
git clone https://github.com/MinKhantKyawSwar/Authentication-Cyber-Security-Assignment.git
```

## 2. Backend Setup (Express API)

The backend handles authentication logic, token minting, database interaction, and API endpoints.

### Navigate and Install Dependencies

Move into the backend directory and install the required Node.js packages.

```bash
cd backend
npm install
```

### Database setup

For the database, MongoDB is used so it is required to install MongoDB Compass in your PC.

1. Download it from https://www.mongodb.com/try/download/compass

Follow the installation instructions for your operating system.

2. Enter My Mongodb string:

Start your MongoDB server using mongod if installed locally. My connection string will be

```bash
mongodb+srv://BUC:bucstudent123@cluster0.oz53auk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### Configure Environment Variables

** Since this one is also provided in the zip file, you can skip it too.** Create a file named `.env` in the `backend/` directory and add your configuration. This is crucial for security (JWT secrets, database connection strings, etc.).

### Start the Backend Development Server

Start the server, which will typically run on `http://localhost:4000`.

```bash
npm run dev
```

The server is now running and ready to handle API calls.

## 3. Frontend Setup (React App)

The frontend is the client application that interacts with the backend, storing and managing the Access Token.

### Navigate and Install Dependencies

Move into the frontend directory and install the React application dependencies.

```bash
cd ../frontend # Assuming you are currently in the backend/ directory, if not cd frontend
npm install
```

### Start the Frontend Development Server

Start the React development server. It usually runs on `http://localhost:8080` and opens automatically in your browser.

```bash
npm run dev
```

The React application is now running and communicating with the Express API.

## Authentication System Technical Overview: Token System

The system provides secure, scalable, token-based authentication by separating concerns between two token types: the Access Token and the Refresh Token.

### Authentication Flow Sequence Diagram

This sequence diagram illustrates the complete authentication and token-refresh cycle, including the initial login, API calls, token refresh, and logout.

### Authentication Flow Sequence Diagram (Updated with reCAPTCHA & Google OAuth)

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client (Browser/App)
    participant S as Server (Auth API)
    participant G as Google Auth

    %% Registration with reCAPTCHA
    U->>C: Enters registration details
    C->>S: POST /api/auth/register (details + reCAPTCHA token)
    S-->>C: Success or reCAPTCHA validation error

    %% Login with optional reCAPTCHA
    U->>C: Enters credentials
    C->>S: POST /api/auth/login (credentials)
    alt Too many failed logins
        S-->>C: reCAPTCHA required
        U->>C: Solves reCAPTCHA
        C->>S: POST /api/auth/login (credentials + reCAPTCHA token)
    end
    S-->>C: "OTP sent" or accessToken/refreshToken (if no OTP step)

    U->>C: Enters OTP (if required)
    C->>S: POST /api/auth/verify-otp (OTP)
    S-->>C: accessToken (body) + refreshToken (cookie)

    Note over C: Stores accessToken in localStorage\nrefreshToken is managed by browser/cookie

    %% API Requests
    C->>S: API request with Authorization: Bearer accessToken
    S-->>C: Protected resource

    Note over C,S: After ~15 min, accessToken expires

    C->>S: API request with expired accessToken
    S-->>C: 401 Unauthorized/Token Expired

    C->>S: POST /api/auth/refresh (with refreshToken cookie)
    S-->>C: New accessToken + rotated refreshToken cookie

    C->>S: API request with new Authorization: Bearer accessToken
    S-->>C: Protected resource

    %% Google OAuth
    U->>C: Clicks "Login with Google"
    C->>G: Redirect to Google OAuth
    G-->>C: OAuth token
    C->>S: POST /api/auth/google-login (OAuth token)
    S-->>C: accessToken (body) + refreshToken (cookie)

    %% Logout
    U->>C: Clicks Logout
    C->>S: POST /api/auth/logout
    S-->>C: Cookie cleared, refresh token revoked
    C-->>U: Clears accessToken from localStorage, redirect to login
```
