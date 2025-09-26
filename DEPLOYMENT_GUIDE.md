# 🚀 JobGenie Firebase Deployment Guide

## 📋 Prerequisites

Before deploying JobGenie to Firebase, ensure you have:

1. **Firebase CLI installed globally:**
   ```bash
   npm install -g firebase-tools
   ```

2. **A Firebase project created** at [Firebase Console](https://console.firebase.google.com/)

3. **Firebase services enabled:**
   - Authentication (Email/Password provider)
   - Cloud Firestore
   - Hosting

## 🔧 Initial Setup

### 1. Login to Firebase CLI
```bash
firebase login
```

### 2. Initialize Firebase Project
```bash
firebase init
```

Select:
- ☑️ Firestore: Configure security rules and indexes files
- ☑️ Hosting: Configure files for Firebase Hosting and (optionally) GitHub Action deploys

### 3. Configure Firebase Project
```bash
firebase use --add
```
Choose your Firebase project and give it an alias (e.g., "production").

## 🌍 Environment Configuration

### 1. Production Environment Variables
Create a production `.env` file with your Firebase configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Gemini AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Environment
VITE_ENVIRONMENT=production
```

### 2. Firebase Configuration Files

The project includes these Firebase configuration files:

- **`firebase.json`** - Firebase hosting and services configuration
- **`firestore.rules`** - Firestore security rules
- **`firestore.indexes.json`** - Firestore database indexes

## 🚀 Deployment Process

### Option 1: Automated Deployment Script
```bash
./deploy.sh
```

### Option 2: Manual Deployment
```bash
# 1. Build the project
pnpm run build

# 2. Deploy to Firebase
firebase deploy
```

### Option 3: Deploy Specific Services
```bash
# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Firestore indexes
firebase deploy --only firestore:indexes
```

## 🔒 Security Configuration

### Firestore Security Rules
The project includes comprehensive security rules in `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Jobs are publicly readable but only admin writable
    match /jobs/{jobId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 📊 Monitoring & Analytics

### Firebase Console Access
After deployment, monitor your app at:
- **Hosting**: https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting
- **Authentication**: https://console.firebase.google.com/project/YOUR_PROJECT_ID/authentication
- **Firestore**: https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore

### Performance Monitoring
Enable Firebase Performance Monitoring for production insights:

```bash
firebase init performance
```

## 🔄 Continuous Deployment

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build project
        run: pnpm run build
        
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules dist
   pnpm install
   pnpm run build
   ```

2. **Authentication Errors**
   ```bash
   # Re-login to Firebase
   firebase logout
   firebase login
   ```

3. **Permission Errors**
   - Check Firebase project permissions
   - Verify Firestore security rules
   - Ensure Authentication is properly configured

4. **Environment Variables**
   - Verify all required environment variables are set
   - Check Firebase configuration values
   - Ensure Gemini API key is valid

### Deployment Verification

After deployment, verify these features work:
- ✅ User registration and login
- ✅ Profile updates
- ✅ Job search and filtering
- ✅ AI chatbot functionality
- ✅ Responsive design on mobile/desktop

## 📱 Custom Domain (Optional)

### Setup Custom Domain
1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the DNS configuration steps
4. Wait for SSL certificate provisioning

### Domain Configuration
```bash
# Add custom domain via CLI
firebase hosting:channel:deploy preview --expires 30d
```

## 🚀 Post-Deployment

### 1. Test Production App
- Visit your Firebase Hosting URL
- Test all major features
- Verify mobile responsiveness
- Check performance metrics

### 2. Monitor Logs
```bash
# View hosting logs
firebase hosting:channel:list

# View function logs (if using Cloud Functions)
firebase functions:log
```

### 3. Set up Alerts
Configure Firebase monitoring alerts for:
- High error rates
- Performance issues
- Authentication failures
- Database quota limits

## 🎯 Production Checklist

Before going live:

- [ ] Environment variables configured
- [ ] Firebase services enabled
- [ ] Security rules deployed
- [ ] SSL certificate active
- [ ] Performance monitoring enabled
- [ ] Error tracking configured
- [ ] Backup strategy in place
- [ ] Custom domain configured (if applicable)
- [ ] Analytics tracking enabled
- [ ] SEO optimization complete

---

## 🆘 Support

If you encounter issues during deployment:

1. Check Firebase Console for error details
2. Review `firebase-debug.log` for detailed errors
3. Verify environment configuration
4. Test locally with `pnpm run dev` first

**Your JobGenie app will be live at:** `https://YOUR_PROJECT_ID.web.app`

🎉 **Happy deploying!** 🎉
