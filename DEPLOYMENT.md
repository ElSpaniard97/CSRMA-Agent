# Deployment Guide

Complete step-by-step instructions for deploying the AI Infrastructure Troubleshooting Agent.

---

## Prerequisites

- [x] GitHub account
- [x] Render account (sign up at https://render.com)
- [x] OpenAI API key (get at https://platform.openai.com/api-keys)
- [x] Node.js 18+ installed locally (for testing)

---

## Part 1: Backend Deployment (Render)

### Step 1: Prepare Your Repository

1. **Fork or clone this repository**
   ```bash
   git clone https://github.com/elspaniard97/imbedded-csrma-ai-agent.git
   cd imbedded-csrma-ai-agent
   ```

2. **Generate required secrets**
   
   Generate JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Output: a8f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1
   ```
   
   Generate password hash:
   ```bash
   node -e "console.log(require('bcryptjs').hashSync('YourSecurePassword123', 10))"
   # Output: $2a$10$rZ8kQ9XYZ... (long hash)
   ```
   
   **Save these values!** You'll need them for Render.

### Step 2: Create Render Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account (if not already)
4. Select your repository: `imbedded-csrma-ai-agent`
5. Configure the service:

   **Basic Settings:**
   - **Name:** `ai-troubleshooting-backend` (or your choice)
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** Leave empty (defaults to repository root)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

   **Instance Type:**
   - **Free** (for testing/personal use)
   - **Starter** or higher (for production - no cold starts)

6. Click **"Create Web Service"**

### Step 3: Configure Environment Variables

1. In your new service dashboard, go to **"Environment"** tab
2. Click **"Add Environment Variable"** for each:

   ```
   Key: OPENAI_API_KEY
   Value: sk-proj-your-actual-key-here
   ```
   
   ```
   Key: JWT_SECRET
   Value: (paste the 64-char hex string from Step 1)
   ```
   
   ```
   Key: ADMIN_USERNAME
   Value: admin
   ```
   
   ```
   Key: ADMIN_PASSWORD_HASH
   Value: (paste the bcrypt hash from Step 1)
   ```

3. Click **"Save Changes"**

### Step 4: Wait for Deployment

1. Render will automatically build and deploy (takes 3-5 minutes)
2. Monitor the **"Logs"** tab for progress
3. Look for: `Server listening on 10000` (success!)
4. Your backend URL will be: `https://your-service-name.onrender.com`

### Step 5: Test Backend

Open your backend URL in browser:
```
https://your-service-name.onrender.com/healthz
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456
}
```

✅ Backend is ready!

---

## Part 2: Frontend Deployment (GitHub Pages)

### Step 1: Update Backend URLs

1. **Edit `index.html`** (lines 97-102)
   ```javascript
   // Replace with your Render URL from Part 1
   window.BACKEND_URL = "https://your-service-name.onrender.com/api/chat";
   window.LOGIN_URL = "https://your-service-name.onrender.com/auth/login";
   ```

2. **Commit and push changes**
   ```bash
   git add index.html
   git commit -m "Update backend URLs for deployment"
   git push origin main
   ```

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **"Settings"** tab
3. Scroll to **"Pages"** in left sidebar
4. Under **"Source":**
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **"Save"**

### Step 3: Wait for Deployment

1. GitHub will build and deploy (takes 1-2 minutes)
2. Your site URL will be shown at top of Pages settings:
   ```
   Your site is live at https://yourusername.github.io/imbedded-csrma-ai-agent/
   ```
3. Click the URL to test

### Step 4: Update CORS on Backend

If you see CORS errors:

1. **Edit `server.js`** (lines 36-43) on your local machine
2. Add your GitHub Pages URL:
   ```javascript
   const ALLOWED_ORIGINS = new Set([
     "https://yourusername.github.io",  // Add this line
     "https://elspaniard97.github.io",
     "http://localhost:5500",
     // ... rest
   ]);
   ```
3. **Commit and push**
   ```bash
   git add server.js
   git commit -m "Add GitHub Pages URL to CORS allowlist"
   git push origin main
   ```
4. Render will auto-redeploy (monitor Logs tab)

✅ Frontend is ready!

---

## Part 3: First Login & Testing

### Step 1: Access Your Application

1. Open your GitHub Pages URL
2. You should see the login screen

### Step 2: Login

Use the credentials you set in Part 1, Step 3:
- **Username:** `admin` (or what you set)
- **Password:** (the password you used to generate the hash)

⚠️ **Important:** Use the actual password, NOT the hash!

### Step 3: Test Basic Functionality

1. ✅ Click a preset (Network, Server, Script, Hardware)
2. ✅ Type a test message: "Test connection"
3. ✅ Click "Send"
4. ✅ Wait for AI response (should take 5-10 seconds)
5. ✅ Try copying ticket notes
6. ✅ Test Settings modal (change theme)
7. ✅ Test Scripts modal (upload a sample .txt file)

If all tests pass: **🎉 Deployment successful!**

---

## Part 4: Monitoring & Maintenance

### Check Backend Logs

Render Dashboard → Your Service → **Logs** tab

Look for:
- `✓ OPENAI_API_KEY is set` ✅
- `✓ JWT_SECRET is set` ✅
- `✓ ADMIN_USERNAME is set` ✅
- `✓ ADMIN_PASSWORD_HASH is set` ✅
- `Server listening on 10000` ✅

### Monitor Usage

**Render:**
- Free tier: 750 hours/month
- Spins down after 15 min inactivity
- First request after spin-down: ~30s delay

**OpenAI:**
- Check usage at https://platform.openai.com/usage
- Set spending limits in OpenAI dashboard
- Typical cost: $5-20/month for moderate use

### Update Application

To deploy new changes:

**Frontend only:**
```bash
git add .
git commit -m "Update frontend"
git push origin main
# GitHub Pages auto-deploys
```

**Backend only:**
```bash
git add .
git commit -m "Update backend"
git push origin main
# Render auto-deploys
```

---

## Troubleshooting Common Issues

### Issue: "Unauthorized" after login

**Cause:** JWT_SECRET mismatch or token expired

**Solution:**
1. Verify JWT_SECRET in Render environment variables
2. Try logging out and back in
3. Clear browser localStorage: DevTools → Application → Local Storage → Clear

### Issue: CORS errors in browser console

**Cause:** Frontend URL not in backend allowlist

**Solution:**
1. Edit `server.js` → `ALLOWED_ORIGINS`
2. Add your GitHub Pages URL
3. Push to trigger Render redeploy

### Issue: "OpenAI API key not configured"

**Cause:** OPENAI_API_KEY not set or invalid

**Solution:**
1. Check Render environment variables
2. Verify key starts with `sk-proj-` or `sk-`
3. Test key at https://platform.openai.com/playground

### Issue: Login fails with correct password

**Cause:** ADMIN_PASSWORD_HASH is plain text instead of hash

**Solution:**
1. Generate proper bcrypt hash:
   ```bash
   node -e "console.log(require('bcryptjs').hashSync('YourPassword', 10))"
   ```
2. Update ADMIN_PASSWORD_HASH in Render environment
3. Save and wait for redeploy

### Issue: Cold start delays (Render Free Tier)

**Cause:** Service spins down after 15 min inactivity

**Solutions:**
- Upgrade to Starter plan ($7/month) for always-on
- Use external keep-alive service (e.g., UptimeRobot)
- Accept 30s first-request delay

### Issue: Scripts not saving

**Cause:** /data directory permissions

**Solution:**
1. Render provides /data with correct permissions
2. Check environment variables:
   ```
   SCRIPTS_DIR=/data/scripts
   SETTINGS_PATH=/data/settings.json
   ```
3. Monitor Render logs for permission errors

---

## Advanced Configuration

### Custom Domain (GitHub Pages)

1. Buy domain from registrar (Namecheap, Google Domains, etc.)
2. Add DNS records:
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   
   Type: A
   Name: @
   Value: 185.199.109.153
   
   Type: A
   Name: @
   Value: 185.199.110.153
   
   Type: A
   Name: @
   Value: 185.199.111.153
   
   Type: CNAME
   Name: www
   Value: yourusername.github.io
   ```
3. GitHub Settings → Pages → Custom domain → Enter your domain
4. Wait for DNS propagation (up to 48 hours)

### Custom Domain (Render Backend)

Render Starter plan or higher required:
1. Render Dashboard → Your Service → Settings
2. Scroll to "Custom Domain"
3. Add your domain (e.g., `api.yourdomain.com`)
4. Update DNS records as shown
5. Update frontend `index.html` with new backend URL

### Enable HTTPS (Automatic)

Both GitHub Pages and Render provide free SSL certificates:
- **GitHub Pages:** Automatic after DNS propagation
- **Render:** Automatic on all plans

### Database Migration (Future)

To add PostgreSQL for multi-user support:
1. Render Dashboard → New → PostgreSQL
2. Connect to your web service
3. Update `server.js` to use database instead of JSON files
4. Migrate existing data

---

## Security Checklist

Before going to production:

- [ ] JWT_SECRET is at least 32 characters (random)
- [ ] ADMIN_PASSWORD_HASH is bcrypt hash (not plain text)
- [ ] OpenAI API key has spending limits set
- [ ] CORS allowlist only includes your domains
- [ ] HTTPS enabled on both frontend and backend
- [ ] Environment variables never committed to git
- [ ] Regular backups of /data directory (manual download from Render)
- [ ] Monitor Render logs for suspicious activity
- [ ] Review OpenAI usage monthly

---

## Next Steps

✅ Application is deployed and working!

**Recommended actions:**
1. Set up monitoring (Uptime Robot, Sentry, etc.)
2. Configure OpenAI spending limits
3. Add team members (future feature)
4. Customize presets for your use cases
5. Train your team on proper usage
6. Document internal procedures

**Share with your team:**
- Frontend URL: `https://yourusername.github.io/imbedded-csrma-ai-agent/`
- Username: `admin` (or your configured username)
- Password: (securely share with authorized users)

---

## Support

Need help? Check:
- Main README.md for detailed documentation
- GitHub Issues for common problems
- Render docs: https://render.com/docs
- OpenAI docs: https://platform.openai.com/docs

**Happy troubleshooting! 🔧**
