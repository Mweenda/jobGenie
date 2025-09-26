# 🚀 Deploy JobGenie to https://jobgenie-71964.web.app/

## 📋 Quick Deployment Steps

### 1. **Login to Firebase** (Required first time only)
```bash
firebase login
```

### 2. **Deploy JobGenie**
```bash
./deploy-to-jobgenie.sh
```

**OR manually:**
```bash
# Set the project
firebase use jobgenie-71964

# Build and deploy
pnpm run build
firebase deploy --only hosting
```

---

## 🔧 Detailed Setup (If needed)

### Prerequisites Check
```bash
# Check if Firebase CLI is installed
firebase --version

# If not installed:
npm install -g firebase-tools
```

### Environment Variables
Make sure your `.env` file has the correct Firebase configuration for `jobgenie-71964`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=jobgenie-71964.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jobgenie-71964
VITE_FIREBASE_STORAGE_BUCKET=jobgenie-71964.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_key
VITE_ENVIRONMENT=production
```

---

## ⚡ Alternative Deployment Methods

### Method 1: NPM Scripts
```bash
# Build and deploy everything
pnpm run deploy

# Deploy only hosting
pnpm run deploy:hosting
```

### Method 2: Firebase CLI Direct
```bash
firebase use jobgenie-71964
firebase deploy
```

### Method 3: Preview Deployment (for testing)
```bash
pnpm run deploy:preview
```

---

## 🎯 After Deployment

### ✅ Verification Checklist
Once deployed, test these features at https://jobgenie-71964.web.app/:

- [ ] **Landing page loads** with glassmorphism effects
- [ ] **User registration** creates new accounts
- [ ] **User login** authenticates existing users
- [ ] **Profile updates** save correctly
- [ ] **Job search** displays results
- [ ] **AI chatbot** responds to queries
- [ ] **Mobile responsive** design works
- [ ] **Dark/light mode** toggle functions

### 🔍 Monitoring
Monitor your deployment:
- **Firebase Console**: https://console.firebase.google.com/project/jobgenie-71964
- **Hosting**: https://console.firebase.google.com/project/jobgenie-71964/hosting
- **Authentication**: https://console.firebase.google.com/project/jobgenie-71964/authentication
- **Firestore**: https://console.firebase.google.com/project/jobgenie-71964/firestore

---

## 🐛 Troubleshooting

### Authentication Issues
```bash
# If login fails
firebase logout
firebase login

# Check projects access
firebase projects:list
```

### Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules dist
pnpm install
pnpm run build
```

### Deployment Issues
```bash
# Check project access
firebase use jobgenie-71964

# Deploy with verbose logging
firebase deploy --only hosting --debug
```

---

## 🎉 Success!

After successful deployment:
- ✅ **Live URL**: https://jobgenie-71964.web.app/
- ✅ **SSL Certificate**: Automatically provisioned
- ✅ **Global CDN**: Fast worldwide access
- ✅ **Custom Domain**: Can be added in Firebase Console

**Your JobGenie application is now live and ready for users!** 🌐✨
