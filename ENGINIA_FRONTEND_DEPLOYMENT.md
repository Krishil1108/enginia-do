# Enginia-do Frontend Deployment Guide

This guide will help you deploy your Enginia-do Task Management frontend to various platforms (Netlify, Vercel, or Render).

## Prerequisites

- GitHub account with your repository: `Krishil1108/enginia-do`
- Backend deployed on Render: `https://enginia-do.onrender.com`
- Node.js (v14 or higher) for local development

## Step 1: Prepare Your Frontend

### 1.1 Verify Configuration

Ensure your `frontend/src/config.js` is properly configured:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 
  (isDevelopment ? 'http://localhost:5000/api' : 'https://enginia-do.onrender.com/api');
```

### 1.2 Update Environment Variables

Create/update `frontend/.env` for production:

```env
REACT_APP_API_URL=https://enginia-do.onrender.com/api
```

### 1.3 Update Backend CORS

Make sure your backend (`backend/server.js`) allows your frontend domain:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://enginia-do-frontend.netlify.app',
    'https://enginia-do-frontend.vercel.app'
  ],
  credentials: true
}));
```

## Option A: Deploy to Netlify (Recommended)

### A.1 Create Netlify Account

1. Go to [netlify.com](https://netlify.com)
2. Sign up or log in with GitHub

### A.2 Connect Repository

1. Click "New site from Git"
2. Choose "GitHub"
3. Search for and select `Krishil1108/enginia-do`
4. Click "Deploy site"

### A.3 Configure Build Settings

**Site Configuration:**
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/build`
- **Node version**: `18`

### A.4 Set Environment Variables

Go to Site settings → Environment variables:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://enginia-do.onrender.com/api` |
| `CI` | `false` |

### A.5 Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow DNS configuration instructions

### A.6 Deploy

1. Netlify will automatically build and deploy
2. Your site will be available at: `https://enginia-do-frontend.netlify.app`

---

## Option B: Deploy to Vercel

### B.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in with GitHub

### B.2 Import Project

1. Click "New Project"
2. Import `Krishil1108/enginia-do`
3. Configure project settings:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### B.3 Environment Variables

Add environment variables:

| Name | Value |
|------|-------|
| `REACT_APP_API_URL` | `https://enginia-do.onrender.com/api` |

### B.4 Deploy

1. Click "Deploy"
2. Your site will be available at: `https://enginia-do-frontend.vercel.app`

---

## Option C: Deploy to Render

### C.1 Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up or log in

### C.2 Create Static Site

1. Click "New +" → "Static Site"
2. Connect `Krishil1108/enginia-do` repository

### C.3 Configure Settings

**Build Settings:**
- **Name**: `enginia-do-frontend`
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Publish Directory**: `build`

**Environment Variables:**
| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://enginia-do.onrender.com/api` |
| `NODE_VERSION` | `18` |

### C.4 Deploy

1. Click "Create Static Site"
2. Your site will be available at: `https://enginia-do-frontend.onrender.com`

---

## Step 2: Configure Backend CORS

After deployment, update your backend CORS configuration with your actual frontend URL:

```javascript
// In backend/server.js
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-actual-frontend-url.netlify.app', // Replace with actual URL
    'https://your-actual-frontend-url.vercel.app',  // Replace with actual URL
    'https://your-actual-frontend-url.onrender.com' // Replace with actual URL
  ],
  credentials: true
}));
```

Push the changes to trigger auto-deployment on Render.

## Step 3: Test Deployment

### 3.1 Verify API Connection

1. Open your deployed frontend
2. Try logging in with owner credentials:
   - **Vaishal**: vaishal / 980476
   - **Nirali**: nirali / 307443

### 3.2 Test Core Features

- [ ] User authentication
- [ ] Task creation and management
- [ ] Real-time notifications
- [ ] PWA installation
- [ ] Mobile responsiveness
- [ ] Owner privilege access (Confidential Tasks, Admin Reports)

### 3.3 Check Browser Console

Look for any CORS or API connection errors.

## Step 4: PWA Configuration

### 4.1 HTTPS Requirement

PWA features require HTTPS. All deployment platforms provide HTTPS by default.

### 4.2 Service Worker

The service worker is pre-configured and will work automatically on deployment.

### 4.3 App Installation

Users can install the app by:
- **Mobile**: "Add to Home Screen" banner will appear
- **Desktop**: Install button in address bar

## Automatic Deployments

### Enable Auto-Deploy

All platforms support automatic deployments when you push to GitHub:

1. Make changes to frontend code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update frontend"
   git push enginia-do main
   ```
3. Platform automatically detects changes and redeploys

### Branch Protection

For production, consider:
- Using a `production` branch
- Setting up staging environments
- Implementing proper CI/CD pipelines

## Common Issues & Solutions

### Issue: "API calls failing"

**Solution:**
- Verify `REACT_APP_API_URL` is correct
- Check backend CORS configuration
- Ensure backend is deployed and accessible

### Issue: "Build failures"

**Solution:**
- Check Node.js version compatibility
- Verify all dependencies in `package.json`
- Check build logs for specific errors

### Issue: "PWA not installing"

**Solution:**
- Ensure site is served over HTTPS
- Check manifest.json is accessible
- Verify service worker is registered

### Issue: "Environment variables not working"

**Solution:**
- Environment variables must start with `REACT_APP_`
- Rebuild after adding environment variables
- Check platform-specific environment variable settings

## Performance Optimization

### Enable Gzip Compression

Most platforms enable this automatically, but verify in Network tab.

### CDN Configuration

- **Netlify**: Built-in global CDN
- **Vercel**: Built-in Edge Network
- **Render**: Built-in CDN

### Caching Strategy

Configure proper cache headers for static assets (handled automatically by platforms).

## Security Considerations

### Content Security Policy

Add CSP headers in platform settings:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://enginia-do.onrender.com
```

### Environment Variables

Never expose sensitive data in frontend environment variables - they are public.

## Monitoring & Analytics

### Error Tracking

Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for usage metrics

### Performance Monitoring

- Use platform-provided analytics
- Monitor Core Web Vitals
- Set up uptime monitoring

## Backup & Recovery

### Code Backup

- Code is backed up in GitHub
- Platforms maintain deployment history
- Consider additional backup strategies for databases

### Rollback Strategy

All platforms support rolling back to previous deployments through their dashboards.

---

## Deployment Checklist

**Pre-deployment:**
- [ ] Backend deployed and accessible at `https://enginia-do.onrender.com`
- [ ] Environment variables configured
- [ ] CORS properly set up
- [ ] Owner accounts created (Vaishal & Nirali)

**Deployment:**
- [ ] Platform account created
- [ ] Repository connected
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Custom domain configured (optional)

**Post-deployment:**
- [ ] Site accessible and loading
- [ ] API connection working
- [ ] Authentication working
- [ ] Owner privileges working
- [ ] PWA features working
- [ ] Mobile responsiveness verified

**Production:**
- [ ] Auto-deployment enabled
- [ ] Monitoring set up
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] Backup strategy in place

---

## Support Resources

- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Render**: [render.com/docs](https://render.com/docs)
- **React**: [create-react-app.dev/docs/deployment](https://create-react-app.dev/docs/deployment)

---

**Your Frontend URLs:**
- **Netlify**: `https://enginia-do-frontend.netlify.app`
- **Vercel**: `https://enginia-do-frontend.vercel.app`
- **Render**: `https://enginia-do-frontend.onrender.com`

*(Replace with your actual deployed URLs)*

---

*Last Updated: December 9, 2025*