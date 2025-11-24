# TeamBuilder Backend API 🚀

The robust and scalable backend infrastructure for **TeamBuilder**, designed to power real-time collaboration, secure authentication, and efficient team management for cohort-based courses.

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (with [Mongoose](https://mongoosejs.com/))
- **Authentication**: 
  - JWT (JSON Web Tokens) for stateless auth
  - [Passport.js](https://www.passportjs.org/) for OAuth (Google & GitHub)
- **Real-time**: [Socket.io](https://socket.io/) (Planned/Integrated for Chat)
- **File Storage**: [Cloudinary](https://cloudinary.com/) (via Multer)
- **Security**: [Helmet](https://helmetjs.github.io/), CORS configuration
- **Validation**: [Express Validator](https://express-validator.github.io/) (implied usage pattern)

## 🌟 Key Features

- **Secure Authentication**: Complete flow including Register, Login, OAuth, Password Reset, and Email Verification.
- **Role-Based Access Control (RBAC)**: Middleware to protect routes based on user roles (Admin, User).
- **Real-time Chat**: Infrastructure for 1-on-1 and Group chats with message persistence.
- **Team Management**: APIs to create teams, add/remove members, and manage cohorts.
- **Profile System**: Comprehensive user profiles with avatar uploads and cohort tracking.
- **Microservices Integration**: Connects with a separate Mail Service for transactional emails.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Instance (Local or Atlas)
- Cloudinary Account (for file uploads)

### Installation

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the `backend` root with the following variables:
    ```env
    PORT=8080
    MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/teambuilder
    CORS_ORIGIN=http://localhost:3000
    
    # JWT Secrets
    ACCESS_TOKEN_SECRET=your_access_secret_key
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_SECRET=your_refresh_secret_key
    REFRESH_TOKEN_EXPIRY=10d
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME=...
    CLOUDINARY_API_KEY=...
    CLOUDINARY_API_SECRET=...
    
    # OAuth
    GOOGLE_CLIENT_ID=...
    GOOGLE_CLIENT_SECRET=...
    GOOGLE_CALLBACK_URL=http://localhost:8080/api/v1/auth/google/callback
    
    GITHUB_CLIENT_ID=...
    GITHUB_CLIENT_SECRET=...
    GITHUB_CALLBACK_URL=http://localhost:8080/api/v1/auth/github/callback
    
    # Mail Service
    MAIL_SERVICE_URL=http://localhost:3001
    MAIL_SERVICE_TOKEN=your_internal_service_token
    ```

4.  **Start the Server:**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:8080`.

## 📡 API Endpoints Overview

### Authentication (`/api/v1/auth`)
- `POST /register`: Create a new account.
- `POST /login`: Authenticate user.
- `POST /logout`: Invalidate session.
- `POST /refresh-token`: Get new access token.
- `POST /forgot-password`: Initiate password reset.
- `POST /reset-password/:token`: Complete password reset.
- `GET /google` & `/github`: OAuth entry points.

### Chat & Messaging (`/api/v1/chat`, `/api/v1/messages`)
- `GET /chat`: List all user chats.
- `POST /chat/c/:receiverId`: Start 1-on-1 chat.
- `POST /chat/group`: Create group chat.
- `POST /messages/:chatId`: Send a message with attachments.

### Teams & Cohorts (`/api/v1/team`, `/api/v1/cohort`)
- `POST /cohort`: Create a new cohort (Admin).
- `POST /team`: Create a new team within a cohort.
- `PUT /team/:teamId`: Manage team members.

## 📂 Project Structure

```
backend/
├── src/
│   ├── config/          # DB connection & external service configs
│   ├── controllers/     # Request handlers (logic layer)
│   ├── middlewares/     # Auth, Error handling, Multer
│   ├── models/          # Mongoose Schemas
│   ├── routes/          # API Route definitions
│   ├── utils/           # Helper functions (ApiResponse, ApiError)
│   ├── app.js           # Express app setup
│   └── index.js         # Entry point
└── ...
```

## 🤝 Contributing

1. Fork the repo.
2. Create a feature branch.
3. Commit your changes.
4. Push to the branch.
5. Create a Pull Request.

---

Built with ❤️ for the TeamBuilder Ecosystem.
