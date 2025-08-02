# 🚀 RealChat2 - Quick Deployment

Deploy RealChat2 to share with others via a public link!

## ⚡ Quick Start (5 minutes)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/realchat2.git
git push -u origin main
```

### 2. Deploy Backend (Railway)
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Create New Project → Deploy from GitHub repo
4. Select your repository
5. Add Environment Variables:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/realtime-chat
   JWT_SECRET=your_super_secret_jwt_key
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
6. Copy the deployment URL

### 3. Deploy Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import Project → Import Git Repository
4. Configure:
   - Root Directory: `Frontend`
   - Framework Preset: Vite
5. Deploy

### 4. Update API URL
Update `Frontend/src/config/api.ts` with your Railway backend URL and redeploy.

### 5. Set up MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create free cluster
3. Get connection string
4. Add to Railway environment variables

## 🔗 Your Public Link
After deployment, share this link:
```
https://your-app.vercel.app
```

## 👤 Admin Access
- **Name**: Deep
- **Phone**: 7005461841

## 📖 Detailed Guide
See `DEPLOYMENT_GUIDE.md` for complete instructions.

## 🆘 Need Help?
1. Check deployment logs
2. Verify environment variables
3. Test API endpoints
4. Check MongoDB connection

## 🎉 Success!
Your RealChat2 app is now live and shareable! 