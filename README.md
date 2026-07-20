<div align="center">

<img src="./client/public/favicon.ico" alt="ClipHub Logo" width="120" />

# ClipHub

### Universal Clipboard & Secure File Sharing Platform

Share text snippets and files instantly across devices with secure links, password protection, expiration controls, and seamless cloud synchronization.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-ClipHub-blue?style=for-the-badge)](https://clipdothub.netlify.app)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)
![Redis](https://img.shields.io/badge/Cache-Redis-DC382D?style=for-the-badge&logo=redis)

</div>

---

# 📖 Table of Contents

- About
- Features
- Tech Stack
- System Architecture
- Sequence Diagram
- Project Structure
- Getting Started
- Environment Variables
- API Overview
- Security Features
- Future Enhancements
- Contributing
- License

---

# ✨ About ClipHub

ClipHub is a modern clipboard and file sharing platform that enables users to securely share text snippets and files across devices using shareable links.

Whether you're moving notes between your laptop and phone, sharing code snippets with teammates, or transferring files without email, ClipHub provides a fast and secure solution.

---

# ✨ Features

## 📝 Text Sharing

- Instant clipboard sharing
- Custom share keys
- Password protection
- Auto expiration
- View limits
- QR code sharing

## 📁 File Sharing

- Secure file uploads
- Multiple file formats
- Download tracking
- Automatic expiry
- Shareable download links

## 👤 Authentication

- JWT Authentication
- User Registration & Login
- Protected Routes
- Profile Management

## ⚡ Performance

- Redis caching
- Fast retrieval
- Optimized API responses
- Efficient storage

## 🔒 Security

- Password hashing
- Input validation
- Rate limiting
- Secure authentication
- Auto cleanup of expired data

---

# 🛠 Tech Stack

| Category | Technologies |
|-----------|--------------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Cache | Redis |
| Authentication | JWT |
| Storage | Local File Storage |
| Deployment | Netlify, Render |

---

# 🏗 System Architecture

> left.

<p align="center">

<img src="./docs/images/Architecture_Diagram.jpg" width="100%"/>

</p>

---

# 🔄 System Sequence Diagram

> The following sequence diagram outlines the core user journey, from authentication to sharing and downloading content.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as React Frontend
    participant Auth as Authentication
    participant Backend as Express Backend
    participant DB as MongoDB
    participant Redis as Redis Cache
    participant Storage as File Storage

    %% 1. User Authenticates
    User->>Frontend: Enter credentials
    activate Frontend
    Frontend->>Auth: Request authentication
    activate Auth
    Auth->>DB: Verify user credentials
    activate DB
    DB-->>Auth: Verification successful
    deactivate DB
    Auth-->>Frontend: Return session token
    deactivate Auth
    Frontend-->>User: Display authenticated view
    deactivate Frontend

    %% 2-4. Content Upload, Validation, and Storage
    User->>Frontend: Submit content (Text or File)
    activate Frontend
    Frontend->>Backend: Upload content with session token
    activate Backend
    Backend->>Auth: Validate user session
    activate Auth
    Auth-->>Backend: Session valid
    deactivate Auth
    
    Backend->>Backend: Validate content & settings
    
    Backend->>DB: Save persistent metadata
    activate DB
    DB-->>Backend: Metadata saved
    deactivate DB
    
    Backend->>Redis: Cache content & ephemeral data
    activate Redis
    Redis-->>Backend: Cache confirmed
    deactivate Redis
    
    Backend->>Storage: Store physical files
    activate Storage
    Storage-->>Backend: Storage confirmed
    deactivate Storage
    
    Backend-->>Frontend: Return secure shareable link
    deactivate Backend
    Frontend-->>User: Display shareable link
    deactivate Frontend

    %% 5-6. Access Shared Content
    User->>Frontend: Access shareable link
    activate Frontend
    Frontend->>Backend: Request shared content
    activate Backend
    
    Backend->>Redis: Check cache
    activate Redis
    Redis-->>Backend: Cache hit/miss
    deactivate Redis
    
    Backend->>DB: Fetch metadata & verify access rules
    activate DB
    DB-->>Backend: Access granted
    deactivate DB
    
    Backend->>Storage: Retrieve file content (if not cached)
    activate Storage
    Storage-->>Backend: Content retrieved
    deactivate Storage
    
    Backend-->>Frontend: Return secure content
    deactivate Backend
    Frontend-->>User: Display shared content
    deactivate Frontend
```

---

# ⚙️ How ClipHub Works

1. User signs in (optional for text sharing).
2. User creates a text clip or uploads a file.
3. Backend validates the request.
4. Metadata is stored in MongoDB.
5. Temporary content is cached using Redis when applicable.
6. Files are stored securely.
7. A unique shareable link is generated.
8. Anyone with the link can securely access the shared content.

---

# 📂 Project Structure

```text
ClipHub/
├── client/                 # React Frontend (Vite + Tailwind)
│   ├── public/             # Static assets (Favicon)
│   ├── src/                
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Application pages
│   │   └── utils/          # Frontend utilities
│   ├── package.json        
│   └── vite.config.js      
│
├── server/                 # Express Backend (Global Mode)
│   ├── config/             # DB & Redis connection config
│   ├── controllers/        # Request handlers (Auth, Clip, File)
│   ├── middleware/         # Auth & validation middleware
│   ├── models/             # Mongoose schemas (User, File)
│   ├── routes/             # API route definitions
│   ├── utils/              # Backend utilities (JWT, TTL)
│   ├── index.js            # Main server entry point
│   └── package.json        
│
├── local-server/           # Express Backend (Local LAN Mode)
│
└── README.md               # Project documentation
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/Yug1275/ClipHub.git

cd ClipHub
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file inside the server directory.

```env
PORT=

MONGODB_URI=

JWT_SECRET=

REDIS_URL=

CLIENT_URL=
```

---

## Start Development

### Backend

```bash
cd server

npm run dev
```

### Frontend

```bash
cd client

npm run dev
```

Application:

```
Frontend:
http://localhost:5173

Backend:
http://localhost:5000
```

---

# 🌐 Local LAN Mode

ClipHub also supports Local Network mode for sharing content without cloud infrastructure.

Simply start the local server:

```bash
cd local-server

npm run dev
```

Then open

```
http://localhost:5173
```

---

# 📡 API Overview

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Register |
| POST | /api/clip | Create Clip |
| GET | /api/clip/:key | Retrieve Clip |
| POST | /api/file | Upload File |
| GET | /api/file/:key | Download File |

---

# 🔒 Security Features

- JWT Authentication
- Password Encryption
- Rate Limiting
- Input Validation
- Protected Routes
- Auto Expiration
- Secure Share Links

---

# ⚡ Storage Architecture

## MongoDB

Stores:

- User Accounts
- File Metadata
- Authentication Data
- Sharing Information

## Redis Cache

Stores:

- Temporary Text Clips
- Frequently Accessed Metadata
- Cached Responses
- Expiry-Based Data

## File Storage

Stores uploaded files securely until expiration.

---

# 🚀 Future Enhancements

- Google Login
- File Preview
- Folder Sharing
- Team Workspaces
- Email Sharing
- Notifications
- End-to-End Encryption

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

<div align="center">

### ⭐ If you found this project helpful, consider giving it a star!

**Built with ❤️ by Yug Patel**

</div>
