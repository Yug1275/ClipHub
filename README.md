# ClipHub

A fast and secure clipboard and file transfer system with both global and local deployment modes.

---

## 🚀 How to Run the Local Version

The local version is perfect for fast transfers on your local network. It does **not** require MongoDB, Redis, or User Authentication.

### 1. Clone the repository
```bash
git clone <your-repo-link>
cd ClipHub
```

### 2. Install Dependencies
Install packages for both the client and local server by running this command in the root folder:
```bash
npm run install:local
```

### 3. Start the Local Server
Open a new terminal and run:
```bash
cd local-server
npm run dev
```
*The local server will start on port 5001.*

### 4. Start the Client (Website)
Open a second terminal and run:
```bash
cd client
npm run dev
```
*The client will start in standalone (local) mode.*

Open the browser link provided by Vite (e.g., `http://localhost:5173`) to use the app!