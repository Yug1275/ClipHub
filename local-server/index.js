import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
// Remove any artificial limits or memory overhead for multer to allow extremely fast disk streaming
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024 // 10 GB limit for local network max buffer
  }
});

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-upload-mode', 'Cache-Control', 'Pragma']
}));
app.use(express.json());

const store = new Map();

// Generate cleanup interval
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store) {
    if (value.expiry < now) {
      if (value.type === 'file' && value.path) {
        fs.unlink(value.path, () => {});
      }
      store.delete(key);
    }
  }
}, 5000);

// Basic auth endpoints to satisfy frontend checks without real users
app.post("/api/auth/login", (req, res) => {
  res.json({
    success: true,
    token: "local-dummy-token",
    user: { id: "local-user", name: "Local User" }
  });
});

app.post("/api/auth/signup", (req, res) => {
  res.json({
    success: true,
    token: "local-dummy-token",
    user: { id: "local-user", name: "Local User" }
  });
});

app.get("/api/user/profile", (req, res) => {
  res.json({
    success: true,
    user: { id: "local-user", name: "Local User", email: "local@localhost" },
    stats: { totalClips: 0, totalFiles: 0, storageUsed: 0 }
  });
});

// Text clip endpoints
app.post("/api/clip", (req, res) => {
  const { key, content, expiry, password, viewLimit, maxViews } = req.body;
  
  // Default to 1 hour if not specified in MS
  let expiryMs = 60 * 60 * 1000;
  if (expiry) {
    const value = parseInt(expiry);
    if (expiry.endsWith('m')) expiryMs = value * 60 * 1000;
    else if (expiry.endsWith('h')) expiryMs = value * 60 * 60 * 1000;
    else if (expiry.endsWith('d')) expiryMs = value * 24 * 60 * 60 * 1000;
  }

  // Handle both map keys from client
  const limit = viewLimit ? parseInt(viewLimit) : (maxViews ? parseInt(maxViews) : null);
  const exists = store.has(key);

  store.set(key, {
    type: 'text',
    content,
    password,      
    viewLimit: limit,
    views: 0,
    expiry: Date.now() + expiryMs,
    createdAt: new Date().toISOString()
  });

  res.json({ 
    success: true, 
    key,
    overwritten: exists,
    expiresIn: Math.floor(expiryMs / 1000)
  });
});

app.get("/api/clip/:key/exists", (req, res) => {
  const data = store.get(req.params.key);
  if (!data) {
    return res.json({ success: true, exists: false });
  }
  if (data.expiry < Date.now()) {
    store.delete(req.params.key);
    return res.json({ success: true, exists: false });
  }
  res.json({ success: true, exists: true, type: data.type });
});

app.get("/api/clip/:key", (req, res) => {
  const data = store.get(req.params.key);

  if (!data || data.type !== 'text') {
    return res.status(404).json({ error: "Not found or expired" });
  }

  if (data.expiry < Date.now()) {
    store.delete(req.params.key);
    return res.status(410).json({ error: "Expired" });
  }

  if (data.password) {
    if (!req.query.password) {
      return res.status(401).json({ error: "This clip is password protected" });
    }
    if (data.password !== req.query.password) {
      return res.status(401).json({ error: "Invalid password" });
    }
  }

  data.views++;

  if (data.viewLimit && data.views >= data.viewLimit) {
    store.delete(req.params.key);
  }

  res.json({ 
    success: true,
    data: {
      content: data.content,
      createdAt: data.createdAt,
      viewCount: data.views,
      type: data.type
    } 
  });
});

app.get("/api/clip/:key/info", (req, res) => {
  const data = store.get(req.params.key);

  if (!data) {
    return res.status(404).json({ error: "Not found or expired" });
  }

  res.json({ 
    success: true,
    info: {
      exists: true,
      type: data.type,
      hasPassword: !!data.password,
      viewCount: data.views,
      createdAt: data.createdAt
    } 
  });
});

app.delete("/api/clip/:key", (req, res) => {
  store.delete(req.params.key);
  res.json({ success: true });
});

// File endpoints
app.post("/api/file", upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const { key, expiry, password, viewLimit, maxViews } = req.body;

  let expiryMs = 24 * 60 * 60 * 1000;
  if (expiry) {
    const value = parseInt(expiry);
    if (expiry.endsWith('m')) expiryMs = value * 60 * 1000;
    else if (expiry.endsWith('h')) expiryMs = value * 60 * 60 * 1000;
    else if (expiry.endsWith('d')) expiryMs = value * 24 * 60 * 60 * 1000;      
  }

  // Handle both possible keys from client
  const limit = viewLimit ? parseInt(viewLimit) : (maxViews ? parseInt(maxViews) : null);
  const exists = store.has(key);

  store.set(key, {
    type: 'file',
    path: req.file.path,
    filename: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    password,
    viewLimit: limit,
    views: 0,
    expiry: Date.now() + expiryMs,
    createdAt: new Date().toISOString()
  });

  res.json({
    success: true,
    key,
    overwritten: exists,
    expiresIn: Math.floor(expiryMs / 1000),
    file: {
      name: req.file.originalname,
      size: req.file.size
    }
  });
});

app.get("/api/file/:key/exists", (req, res) => {
  const data = store.get(req.params.key);
  if (!data) {
    return res.json({ success: true, exists: false });
  }
  if (data.expiry < Date.now()) {
    store.delete(req.params.key);
    return res.json({ success: true, exists: false });
  }
  res.json({ success: true, exists: true, type: data.type });
});

app.get("/api/file/:key", (req, res) => {
  const data = store.get(req.params.key);

  if (!data || data.type !== 'file') {
    return res.status(404).json({ error: "Not found or expired" });
  }

  if (data.expiry < Date.now()) {
    store.delete(req.params.key);
    return res.status(410).json({ error: "Expired" });
  }

  if (data.password) {
    if (!req.query.password) {
      return res.status(401).json({ error: "This file is password protected" });
    }
    if (data.password !== req.query.password) {
      return res.status(401).json({ error: "Invalid password" });
    }
  }

  data.views++;

  if (data.viewLimit && data.views >= data.viewLimit) {
    store.delete(req.params.key);
  }

  res.download(data.path, data.filename);
});

app.delete("/api/file/:key", (req, res) => {
  const data = store.get(req.params.key);
  if (data && data.path) {
    fs.unlink(data.path, () => {});
  }
  store.delete(req.params.key);
  res.json({ success: true });
});

const PORT = 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(` Local server running on http://0.0.0.0:${PORT}`);
});
