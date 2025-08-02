#!/bin/bash

echo "🚀 RealChat2 Deployment Script"
echo "================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit for RealChat2"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. 🐙 Push to GitHub:"
echo "   git remote add origin https://github.com/yourusername/realchat2.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "2. 🌐 Deploy Backend (Railway):"
echo "   - Go to https://railway.app"
echo "   - Sign up with GitHub"
echo "   - Create New Project → Deploy from GitHub repo"
echo "   - Select your repository"
echo "   - Add environment variables (see DEPLOYMENT_GUIDE.md)"
echo ""
echo "3. 🎨 Deploy Frontend (Vercel):"
echo "   - Go to https://vercel.com"
echo "   - Sign up with GitHub"
echo "   - Import Project → Import Git Repository"
echo "   - Select your repository"
echo "   - Configure: Root Directory = Frontend"
echo ""
echo "4. 🗄️ Set up MongoDB Atlas:"
echo "   - Go to https://cloud.mongodb.com"
echo "   - Create free cluster"
echo "   - Get connection string"
echo "   - Add to Railway environment variables"
echo ""
echo "5. 🔗 Update API URLs:"
echo "   - Update Frontend/src/config/api.ts with your backend URL"
echo "   - Redeploy frontend"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
echo "🎉 After deployment, share this link:"
echo "   https://your-app.vercel.app" 