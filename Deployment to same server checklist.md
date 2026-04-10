# ATAPOLY CBT Deployment Checklist

### 1. Backend Setup
- Navigate to `server` folder: `cd path/to/backend`
- Install dependencies: `npm install`
- Ensure Express listens on all interfaces: `app.listen(PORT, '0.0.0.0')`

### 2. Frontend Build
- Navigate to frontend folder: `cd path/to/frontend`
- Build frontend: `npm run build`
- Copy build output (`dist` / `build`) to `backend/public`

### 3. API Configuration
- Open frontend API file (`api.ts` / `api.js`)
- Set base URL to relative path: `const API_BASE = import.meta.env.VITE_API_URL || "";`
- Ensure all requests use relative paths: `/api/auth/login`, `/api/exams`, etc.

### 4. Serve Frontend with Express
- Import `path` in `index.js`: `const path = require('path');`
- Add after API routes:
```js
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
```

### 5. Network & IP
- Set static LAN IP for server (e.g., `172.20.10.50`)
- Ensure all student computers are on same Wi-Fi/LAN

### 6. Start Server
- Run server: `node index.js` or `npx nodemon index.js`
- Verify: `🎓 ATAPOLY CBT Server running on http://0.0.0.0:3001`

### 7. Student Access
- Open browser on student computer: `http://<SERVER_IP>:3001`
- Test login and exam functionality

### 8. Exam-Ready Checks
- Auto-save enabled (answers saved immediately)
- Single login per student enforced
- Database backup before exam
- Optional: stress-test with multiple simultaneous users

✅ All set – CBT is ready for use!

---
**Note:** To create a downloadable PDF, save this document as `atapoly_cbt_deployment_checklist.md` and use a Markdown-to-PDF tool like `pandoc` or your code editor's export feature.

