# 🔐 Secrets & Environment Variables Setup

## 📋 Required Secrets

### 1. Firebase Service Account JSON
**Where:** Backend root directory  
**File:** `firebase-service-account.json`

**How to get:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `engine-11-a08c8`
3. Click Settings (⚙️) → Project settings
4. Go to "Service accounts" tab
5. Click "Generate new private key"
6. Download the JSON file
7. Rename to `firebase-service-account.json`
8. Place in `backend/` directory

**⚠️ IMPORTANT:** Never commit this file to Git! It's already in .gitignore

---

### 2. VAPID Keys for Push Notifications
**Where:** Both backend and frontend .env files

**How to generate:**
```bash
cd backend
node generate-vapid-keys.js
```

This will output:
- VAPID_PUBLIC_KEY (add to both backend and frontend .env)
- VAPID_PRIVATE_KEY (add to backend .env only)

**⚠️ SECURITY:**
- Public key can be in frontend (safe)
- Private key must NEVER be exposed (backend only)

---

### 3. JWT Secret
**Where:** Backend .env file  
**Variable:** `JWT_SECRET`

**How to generate:**
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Using PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

---

### 4. MongoDB Connection String
**Where:** Backend .env file  
**Variable:** `MONGODB_URI`

**Local Development:**
```
MONGODB_URI=mongodb://localhost:27017/enginia-do
```

**Production (MongoDB Atlas):**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `<dbname>` with `enginia-do`

Example:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/enginia-do?retryWrites=true&w=majority
```

---

## 🛠️ Setup Steps

### Backend Setup
1. Copy the example file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `.env` and fill in:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Generate using the command above
   - `VAPID_PUBLIC_KEY` - Generate using `node generate-vapid-keys.js`
   - `VAPID_PRIVATE_KEY` - From the same generation
   - `VAPID_EMAIL` - Your email address
   - `FRONTEND_URL` - Your frontend URL (for CORS)

3. Add Firebase service account:
   - Download from Firebase Console
   - Save as `backend/firebase-service-account.json`

### Frontend Setup
1. Copy the example file:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Edit `.env` and fill in:
   - `REACT_APP_API_URL` - Your backend URL
   - `REACT_APP_VAPID_PUBLIC_KEY` - Same public key from backend

3. Firebase config is already filled in (using engine-11-a08c8 project)

---

## 🚀 Production Deployment

### Backend (Render/Heroku)
Add these environment variables in your hosting platform:

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<your-generated-jwt-secret>
VAPID_PUBLIC_KEY=<your-vapid-public-key>
VAPID_PRIVATE_KEY=<your-vapid-private-key>
VAPID_EMAIL=<your-email>
FIREBASE_PROJECT_ID=engine-11-a08c8
FRONTEND_URL=<your-frontend-production-url>
```

**Firebase Service Account:**
- Some platforms (like Render) allow file uploads
- Others require encoding as base64 or using secrets manager
- See your platform's documentation for handling JSON credentials

### Frontend (Vercel/Netlify)
Add these environment variables:

```bash
REACT_APP_API_URL=<your-backend-production-url>
REACT_APP_VAPID_PUBLIC_KEY=<your-vapid-public-key>
REACT_APP_FIREBASE_API_KEY=AIzaSyBmVWT4dd3m-H9Wf5ksBSmGA6AKiqk1Nkg
REACT_APP_FIREBASE_AUTH_DOMAIN=engine-11-a08c8.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=engine-11-a08c8
REACT_APP_FIREBASE_STORAGE_BUCKET=engine-11-a08c8.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=543027789224
REACT_APP_FIREBASE_APP_ID=1:543027789224:web:8b9e94f68379b0b1e7319d
REACT_APP_FIREBASE_MEASUREMENT_ID=G-7D624BB27G
```

---

## ✅ Verification Checklist

### Backend
- [ ] `.env` file created and filled
- [ ] `firebase-service-account.json` downloaded and placed
- [ ] VAPID keys generated and added
- [ ] MongoDB connection tested
- [ ] JWT secret is secure and random

### Frontend  
- [ ] `.env` file created and filled
- [ ] Backend API URL is correct
- [ ] VAPID public key matches backend
- [ ] Firebase config is correct

### Security
- [ ] `.env` files are in `.gitignore`
- [ ] `firebase-service-account.json` is in `.gitignore`
- [ ] No secrets committed to Git
- [ ] Production secrets are different from development

---

## 🆘 Troubleshooting

**"Firebase not initialized"**
- Check `firebase-service-account.json` exists in backend/
- Verify file path in FIREBASE_SERVICE_ACCOUNT_PATH
- Check file has valid JSON format

**"Push notifications not working"**
- Verify VAPID keys match in frontend and backend
- Check VAPID_PUBLIC_KEY is correct in both .env files
- Test with `node generate-vapid-keys.js` and regenerate if needed

**"Cannot connect to MongoDB"**
- Check MONGODB_URI format
- For Atlas: Ensure IP whitelist includes your IP (or 0.0.0.0/0 for all)
- Verify username and password are correct
- Check network connectivity

**"JWT token invalid"**
- Ensure JWT_SECRET is set and same across all backend instances
- Generate a new secure secret if compromised
- Clear browser cookies/localStorage and login again
