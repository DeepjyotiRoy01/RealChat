# 🚀 RealChat2 - Real-Time Chat Application

<div align="center">

![RealChat2 Logo](https://img.shields.io/badge/RealChat2-Real--Time%20Chat-blue?style=for-the-badge&logo=chat&logoColor=white)
![React](https://img.shields.io/badge/React-18.0.0-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18.0.0-339933?style=for-the-badge&logo=node.js)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.0.0-010101?style=for-the-badge&logo=socket.io)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0-06B6D4?style=for-the-badge&logo=tailwind-css)

**A modern, real-time chat application with advanced features and beautiful UI**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20Online-green?style=for-the-badge&logo=vercel)](https://your-app.vercel.app)
[![Deploy](https://img.shields.io/badge/Deploy%20to%20Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/realchat2)
[![Issues](https://img.shields.io/badge/Issues-Report%20Bug-red?style=for-the-badge&logo=github)](https://github.com/yourusername/realchat2/issues)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🎯 Demo](#-demo)
- [🚀 Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🔧 Development](#-development)
- [🌐 Deployment](#-deployment)
- [📱 Usage](#-usage)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)

---

## ✨ Features

### 🎨 **Core Features**
- **Real-time Messaging** - Instant message delivery with Socket.IO
- **User Authentication** - Phone number + OTP verification system
- **Contact Management** - Add/remove contacts for private chats
- **Admin Panel** - Complete user management and approval system
- **Avatar Customization** - 100+ emoji avatars to choose from
- **Online Status** - Real-time online/offline indicators
- **Message History** - Persistent chat history with MongoDB
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile

### 🔥 **Advanced Features**
- **Typing Indicators** - See when someone is typing
- **Read Receipts** - Know when messages are read
- **Message Timestamps** - Detailed message timing
- **File Sharing** - Share images and documents
- **Search Messages** - Find specific messages quickly
- **Push Notifications** - Get notified of new messages
- **Dark/Light Theme** - Beautiful theme switching
- **Admin Privileges** - Full user management capabilities

### 🛡️ **Security Features**
- **JWT Authentication** - Secure token-based authentication
- **OTP Verification** - Two-factor authentication
- **Input Validation** - Comprehensive data validation
- **Rate Limiting** - Protection against spam
- **CORS Protection** - Cross-origin request security
- **Password Hashing** - Secure password storage with bcrypt

---

## 🎯 Demo

<div align="center">

### 📱 **Live Demo**
[![RealChat2 Demo](https://img.shields.io/badge/🚀%20Try%20RealChat2%20Live-Live%20Demo-green?style=for-the-badge&logo=vercel)](https://your-app.vercel.app)

### 🎥 **Demo Screenshots**

| Landing Page | Chat Interface | Admin Panel |
|--------------|----------------|-------------|
| ![Landing](https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Landing+Page) | ![Chat](https://via.placeholder.com/300x200/10B981/FFFFFF?text=Chat+Interface) | ![Admin](https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Admin+Panel) |

</div>

---

## 🚀 Quick Start

### **Option 1: Deploy to Production (Recommended)**
```bash
# Clone the repository
git clone https://github.com/yourusername/realchat2.git
cd realchat2

# Follow the deployment guide
# See DEPLOYMENT_GUIDE.md for detailed instructions
```

### **Option 2: Run Locally**
```bash
# Clone the repository
git clone https://github.com/yourusername/realchat2.git
cd realchat2

# Install dependencies
npm install

# Start development servers
npm run dev
```

---

## 📦 Installation

### **Prerequisites**
- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **MongoDB** (v6.0 or higher)
- **Git** (v2.0 or higher)

### **System Requirements**
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Network**: Stable internet connection
- **OS**: Windows 10+, macOS 10.15+, or Ubuntu 18.04+

### **Installation Steps**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/realchat2.git
   cd realchat2
   ```

2. **Install Dependencies**
   ```bash
   # Install backend dependencies
   cd Backend
   npm install
   
   # Install frontend dependencies
   cd ../Frontend
   npm install
   ```

3. **Set Up Environment Variables**
   ```bash
   # Copy environment example
   cd ../Backend
   copy env.example .env
   
   # Edit .env file with your configuration
   # See Configuration section for details
   ```

4. **Set Up Database**
   ```bash
   # Start MongoDB (if running locally)
   mongod
   
   # Or use MongoDB Atlas (recommended for production)
   # See DEPLOYMENT_GUIDE.md for Atlas setup
   ```

5. **Create Admin User**
   ```bash
   cd Backend
   npm run setup
   ```

6. **Start Development Servers**
   ```bash
   # Terminal 1: Start Backend
   cd Backend
   npm run dev
   
   # Terminal 2: Start Frontend
   cd Frontend
   npm run dev
   ```

---

## ⚙️ Configuration

### **Environment Variables**

Create a `.env` file in the `Backend` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/realtime-chat
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/realtime-chat

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional: Email Configuration (for OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### **Frontend Configuration**

Update `Frontend/src/config/api.ts`:

```typescript
const isDevelopment = import.meta.env.DEV;

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000' 
  : 'https://your-backend-url.railway.app';

export const SOCKET_URL = isDevelopment 
  ? 'http://localhost:5000' 
  : 'https://your-backend-url.railway.app';
```

---

## 🔧 Development

### **Available Scripts**

#### **Backend Scripts**
```bash
cd Backend

npm run dev          # Start development server with nodemon
npm start           # Start production server
npm run setup       # Create admin user
npm test            # Run tests
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
```

#### **Frontend Scripts**
```bash
cd Frontend

npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
```

### **Development Workflow**

1. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   cd Backend && npm run dev
   
   # Terminal 2: Frontend
   cd Frontend && npm run dev
   ```

2. **Access the Application**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:5000
   - **Admin Login**: 
     - Name: `Deep`
     - Phone: `7005461841`

3. **Testing**
   ```bash
   # Test backend
   cd Backend && npm test
   
   # Test frontend
   cd Frontend && npm test
   ```

---

## 🌐 Deployment

### **Quick Deployment Options**

| Platform | Frontend | Backend | Database | Cost |
|----------|----------|---------|----------|------|
| **Vercel + Railway** | ✅ | ✅ | MongoDB Atlas | Free |
| **Vercel + Render** | ✅ | ✅ | MongoDB Atlas | Free |
| **Netlify + Heroku** | ✅ | ✅ | MongoDB Atlas | Free |
| **AWS** | ✅ | ✅ | MongoDB Atlas | Paid |

### **Deployment Steps**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy Backend (Railway)**
   - Go to [Railway.app](https://railway.app)
   - Connect GitHub repository
   - Add environment variables
   - Deploy

3. **Deploy Frontend (Vercel)**
   - Go to [Vercel.com](https://vercel.com)
   - Import GitHub repository
   - Configure: Root Directory = `Frontend`
   - Deploy

4. **Set Up MongoDB Atlas**
   - Create free cluster
   - Get connection string
   - Add to Railway environment variables

📖 **Detailed deployment guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 📱 Usage

### **For Users**

1. **Visit the Application**
   - Go to: https://your-app.vercel.app

2. **Create Account**
   - Enter your name and phone number
   - Receive OTP (check console for demo)
   - Verify OTP to access chat

3. **Add Contacts**
   - Click "Add Contact" button
   - Enter phone number of other users
   - Start chatting with contacts

4. **Customize Profile**
   - Click on your avatar
   - Choose from 100+ emoji avatars
   - Save your new avatar

### **For Admins**

1. **Admin Login**
   - Name: `Deep`
   - Phone: `7005461841`

2. **Manage Users**
   - View all users in the system
   - Approve/reject user requests
   - Monitor user activity

3. **System Management**
   - Access admin dashboard
   - Manage user permissions
   - View system statistics

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
- **Shadcn/ui** - Beautiful component library
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Socket.IO Client** - Real-time communication
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing
- **helmet** - Security middleware
- **morgan** - HTTP request logger

### **Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server
- **Git** - Version control
- **npm** - Package manager

---

## 📁 Project Structure

```
RealChat2/
├── 📁 Frontend/                 # React frontend application
│   ├── 📁 src/
│   │   ├── 📁 components/       # Reusable UI components
│   │   │   ├── 📁 chat/        # Chat-specific components
│   │   │   ├── 📁 ui/          # Base UI components
│   │   │   └── 📄 AvatarSelector.tsx
│   │   ├── 📁 pages/           # Page components
│   │   │   ├── 📄 LandingPage.tsx
│   │   │   ├── 📄 LoginPage.tsx
│   │   │   ├── 📄 OTPVerification.tsx
│   │   │   └── 📄 ChatApp.tsx
│   │   ├── 📁 hooks/           # Custom React hooks
│   │   ├── 📁 types/           # TypeScript type definitions
│   │   ├── 📁 lib/             # Utility libraries
│   │   ├── 📁 config/          # Configuration files
│   │   └── 📄 App.tsx          # Main application component
│   ├── 📄 package.json         # Frontend dependencies
│   ├── 📄 vite.config.ts       # Vite configuration
│   ├── 📄 tailwind.config.ts   # Tailwind CSS configuration
│   └── 📄 index.html           # HTML template
├── 📁 Backend/                  # Node.js backend application
│   ├── 📁 src/
│   │   ├── 📁 controllers/     # Request handlers
│   │   │   ├── 📄 authController.js
│   │   │   ├── 📄 userController.js
│   │   │   ├── 📄 chatController.js
│   │   │   └── 📄 messageController.js
│   │   ├── 📁 models/          # Database models
│   │   │   ├── 📄 User.js
│   │   │   ├── 📄 Chat.js
│   │   │   ├── 📄 Message.js
│   │   │   └── 📄 UserRequest.js
│   │   ├── 📁 routes/          # API routes
│   │   │   ├── 📄 auth.js
│   │   │   ├── 📄 users.js
│   │   │   ├── 📄 chats.js
│   │   │   └── 📄 messages.js
│   │   ├── 📁 middleware/      # Custom middleware
│   │   │   ├── 📄 auth.js
│   │   │   ├── 📄 error.js
│   │   │   └── 📄 validation.js
│   │   ├── 📁 config/          # Configuration files
│   │   │   ├── 📄 database.js
│   │   │   └── 📄 setupAdmin.js
│   │   ├── 📁 socket/          # Socket.IO handlers
│   │   │   └── 📄 socketHandler.js
│   │   ├── 📁 utils/           # Utility functions
│   │   └── 📄 server.js        # Main server file
│   ├── 📄 package.json         # Backend dependencies
│   ├── 📄 .env                 # Environment variables
│   └── 📄 env.example          # Environment template
├── 📄 .gitignore               # Git ignore rules
├── 📄 README.md                # Project documentation
├── 📄 DEPLOYMENT_GUIDE.md      # Deployment instructions
├── 📄 README_DEPLOYMENT.md     # Quick deployment guide
├── 📄 deploy.sh                # Deployment script
└── 📄 requirements.txt         # Project requirements
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### **How to Contribute**

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/realchat2.git
   cd realchat2
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Your Changes**
   - Follow the coding standards
   - Add tests for new features
   - Update documentation

4. **Commit Your Changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

5. **Push to Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Create Pull Request**
   - Go to GitHub repository
   - Click "New Pull Request"
   - Describe your changes

### **Development Guidelines**

- **Code Style**: Follow ESLint and Prettier configuration
- **Testing**: Write tests for new features
- **Documentation**: Update README and comments
- **Commits**: Use conventional commit messages
- **Branches**: Use descriptive branch names

### **Reporting Issues**

- Use GitHub Issues
- Provide detailed bug reports
- Include steps to reproduce
- Add screenshots if applicable

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 RealChat2

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Node.js Community** - For the powerful runtime
- **Socket.IO** - For real-time communication
- **MongoDB** - For the flexible database
- **Tailwind CSS** - For the beautiful styling
- **Vercel** - For the amazing deployment platform
- **Railway** - For the reliable backend hosting
- **All Contributors** - For making this project better

---

<div align="center">

**Made with ❤️ by the RealChat2 Team**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yourusername/realchat2)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/yourusername)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/yourusername)

**⭐ Star this repository if you found it helpful!**

</div> 