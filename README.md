# 🚀 **ClipHub** - Universal Clipboard & File Transfer

<div align="center">

**The modern way to share text and files instantly across any device.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-clipdothub.netlify.app-blue?style=for-the-badge)](https://clipdothub.netlify.app/)

</div>
---

## ✨ **What is ClipHub?**

ClipHub is a **universal clipboard bridge** that lets you share text instantly and transfer files across devices.

Think of it as your **personal clipboard that works across all your devices** — laptop, phone, tablet.

---

## 🎯 **Perfect For**
- Students sharing notes between devices
- Developers transferring code snippets  
- Teams collaborating quickly  
- Anyone moving data between devices

---

## 🔥 **Key Features**

### 📝 Text Sharing
- No signup required  
- Custom keys (e.g., `my-notes`)  
- Auto-expiry  
- Password protection  
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

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Yug1275/ClipHub.git
cd ClipHub
```

---

### 2️⃣ Install Dependencies
Install packages for both the client and local server:

```bash
npm run install:local
```

---

### 3️⃣ Start the Local Server
Open a new terminal and run:

```bash
cd local-server
npm run dev
```

> 🚀 Local server runs on: **http://localhost:5001**

---

### 4️⃣ Start the Client (Website)
Open another terminal and run:

```bash
cd client
npm run dev
```

> 🌐 Client runs on: **http://localhost:5173**

---

### ✅ You're Ready!
- Open `http://localhost:5173`
- Start sharing text and files instantly ⚡

---

## 🔥 **Why Local Mode?**
- ⚡ Faster (no internet latency)  
- 🔒 Private (no cloud storage)  
- 🧩 No DB or setup required  
- 📡 Works on same WiFi  

---

## 🛠️ **Tech Stack**

| Frontend | Backend | Real-time |
|:---:|:---:|:---:|
| React + Vite | Node.js + Express | WebSockets |
| Tailwind CSS | Local Server | Live Sync |

---

## 📖 **How to Use**

### 📝 Text Sharing
```
1. Enter a key (e.g., "notes")
2. Paste content
3. Click Save
4. Share the key
```

### 📁 File Sharing
```
1. Enter a key
2. Upload file
3. Share the key
```

---

## 📚 **API (Local Server)**

### Save Clip
```
POST /clip
{
  "key": "test",
  "content": "Hello"
}
```

### Get Clip
```
GET /clip/:key
```

---

## 🤝 **Contributing**

1. Fork the repo  
2. Create branch  
3. Commit changes  
4. Push  
5. Open PR  

---

## 🐛 **Troubleshooting**

### Port already in use
```
Change port in local-server config
```

### Client not connecting
```
Make sure local server is running on port 5001
```

---

## 📄 **License**

MIT License

---

## 🙏 **Acknowledgments**
- React  
- Node.js  
- Tailwind CSS  

---

<div align="center">

## 🚀 Ready to share instantly?

⭐ Star this repo if you found it helpful!

</div>

---

**ClipHub - Share anything, anywhere. Instantly.** 🌟   
