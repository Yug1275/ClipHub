# 🚀 **ClipHub** - Universal Clipboard & File Transfer

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

### 📁 File Sharing
- Drag & drop upload  
- Multiple formats supported  
- Download tracking  
- Smart expiry  

### ⚡ Real-time
- Live updates  
- User presence  
- Instant sync  

### 🛡️ Security
- Auto data deletion  
- Encrypted passwords  
- Rate limiting  
- Input validation  

---

## 🚀 **How to Run the Local Version**

The local version is perfect for fast transfers on your local network. It does **not** require MongoDB, Redis, or User Authentication.

> 💡 When running locally, you can completely ignore the `server` folder — it is only used for the global/cloud version.

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

---

**ClipHub - Share anything, anywhere. Instantly.** 🌟   
