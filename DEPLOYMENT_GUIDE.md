# RealChat Deployment Guide

This guide will help you deploy RealChat to production so others can access it via a public link.

## 🚀 Quick Deployment Options

### Option 1: Vercel + Railway (Recommended)
- **Frontend**: Vercel (Free)
- **Backend**: Railway (Free tier available)
- **Database**: MongoDB Atlas (Free tier available)

### Option 2: Vercel + Render
- **Frontend**: Vercel (Free)
- **Backend**: Render (Free tier available)
- **Database**: MongoDB Atlas (Free tier available)

## 📋 Prerequisites

1. **GitHub Account**: To host your code
2. **Vercel Account**: For frontend deployment
3. **Railway/Render Account**: For backend deployment
4. **MongoDB Atlas Account**: For database

## 🔧 Step-by-Step Deployment

### Step 1: Prepare Your Code

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/realchat2.git
   git push -u origin main
   ```

### Step 2: Deploy Backend (Railway)

1. **Go to [Railway.app](https://railway.app)**
2. **Sign up/Login** with GitHub
3. **Create New Project** → **Deploy from GitHub repo**
4. **Select your repository**
5. **Add Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-frontend-url.vercel.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```
6. **Deploy** - Railway will automatically detect it's a Node.js app
7. **Copy the deployment URL** (e.g., `https://your-app.railway.app`)

### Step 3: Deploy Frontend (Vercel)

1. **Go to [Vercel.com](https://vercel.com)**
2. **Sign up/Login** with GitHub
3. **Import Project** → **Import Git Repository**
4. **Select your repository**
5. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. **Add Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
7. **Deploy**

### Step 4: Update API Configuration

After getting your backend URL, update the frontend configuration:

1. **Update `Frontend/src/config/api.ts`**:
   ```typescript
   export const API_BASE_URL = isDevelopment 
     ? 'http://localhost:5000' 
     : 'https://your-backend-url.railway.app';
   ```

2. **Redeploy frontend** on Vercel

### Step 5: Set Up MongoDB Atlas

1. **Go to [MongoDB Atlas](https://cloud.mongodb.com)**
2. **Create Free Cluster**
3. **Get Connection String**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/realtime-chat
   ```
4. **Add to Railway environment variables**

### Step 6: Create Admin User

After deployment, create the admin user:

1. **Access your backend URL**: `https://your-backend-url.railway.app/health`
2. **Run the setup script** (you can add this as a Railway command):
   ```bash
   npm run setup
   ```

## 🔗 Your Public Links

After deployment, you'll have:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`
- **Admin Login**: 
  - Name: `Change`
  - Phone: `Change`

## 📱 Share with Others

Share this link with others:
```
https://your-app.vercel.app
```

They can:
1. Visit the landing page
2. Click "Get Started"
3. Enter their name and phone number
4. Receive OTP (check console for demo)
5. Start chatting!

## 🔧 Alternative: Render Deployment

If you prefer Render over Railway:

### Backend on Render:
1. **Go to [Render.com](https://render.com)**
2. **Create New Web Service**
3. **Connect GitHub repository**
4. **Configure**:
   - **Name**: `realchat2-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `Backend`
5. **Add Environment Variables** (same as Railway)
6. **Deploy**

## 🛠️ Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Ensure `FRONTEND_URL` is set correctly in backend
   - Check that frontend URL matches exactly

2. **Database Connection**:
   - Verify MongoDB Atlas connection string
   - Ensure IP whitelist includes `0.0.0.0/0`

3. **Build Errors**:
   - Check Node.js version compatibility
   - Ensure all dependencies are in `package.json`

4. **Environment Variables**:
   - Double-check all variables are set correctly
   - Restart deployment after adding variables

## 📞 Support

If you encounter issues:
1. Check the deployment logs
2. Verify environment variables
3. Test API endpoints directly
4. Check MongoDB connection

## 🎉 Success!

Once deployed, your RealChat application will be accessible to anyone with the link, no installation required! 
