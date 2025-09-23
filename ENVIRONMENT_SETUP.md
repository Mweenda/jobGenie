# 🔐 JobGenie Environment Configuration

## 🚀 Quick Setup

### 1. Create Environment File
```bash
# Copy the template to create your .env file
cp env.template .env

# Or use the setup script
./scripts/setup-env.sh
```

### 2. Configure Your API Keys
Edit `.env` and update these values:

```bash
# Required for AI features
VITE_OPENAI_API_KEY=sk-your_actual_openai_key_here
VITE_GEMINI_API_KEY=your_actual_gemini_key_here

# Required for vector search
VITE_PINECONE_API_KEY=your_actual_pinecone_key_here
VITE_PINECONE_ENVIRONMENT=your_pinecone_environment_here
```

## 🔥 Firebase Configuration

Your Firebase configuration is already secured in environment variables:

```bash
# Firebase Configuration (already set with your project values)
VITE_FIREBASE_API_KEY=AIzaSyDIu1qX4SYPJg97vew7CGERZ9gVlqcIIJY
VITE_FIREBASE_AUTH_DOMAIN=jobgenie-71964.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jobgenie-71964
VITE_FIREBASE_STORAGE_BUCKET=jobgenie-71964.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=770726995729
VITE_FIREBASE_APP_ID=1:770726995729:web:c6eeca548ac2706dc50eb0
VITE_FIREBASE_MEASUREMENT_ID=G-60QZB17YHP
```

## 🛡️ Security Features

### ✅ What's Secured
- **Firebase configuration** moved to environment variables
- **API keys** protected from version control
- **Development/Production** environment separation
- **Firebase Analytics** only enabled in production
- **Emulator settings** for local development

### 🔒 Git Security
Your `.gitignore` already protects:
```gitignore
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### 📁 File Structure
```
jobGenie/
├── .env                    # Your actual environment variables (git-ignored)
├── env.template           # Template with your Firebase config
├── .gitignore            # Protects sensitive files
├── src/lib/firebase.ts   # Secure Firebase initialization
└── scripts/setup-env.sh # Environment setup script
```

## 🔧 Firebase Configuration Details

The Firebase config now includes:

### **Authentication & Firestore**
- Automatic emulator connection in development
- Production configuration via environment variables
- Error handling for emulator connection

### **Analytics**
- Only initialized in production
- Requires `measurementId` to be present
- Safe for server-side rendering

### **Code Example**
```typescript
// Secure Firebase initialization
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... other config from environment variables
}

// Analytics only in production
export const analytics = typeof window !== 'undefined' && 
  !import.meta.env.DEV && 
  firebaseConfig.measurementId 
    ? getAnalytics(app) 
    : null
```

## 🚀 Getting Started

### 1. Environment Setup
```bash
# Copy template and configure
cp env.template .env
# Edit .env with your API keys
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Start Development
```bash
# Start Firebase emulators
firebase emulators:start --only auth,firestore

# Start dev server (in another terminal)
pnpm run dev
```

### 4. Production Deploy
```bash
# Build for production
pnpm run build

# Deploy (your Firebase config is secure!)
firebase deploy
```

## 🔍 Environment Variables Reference

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | ✅ | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | ✅ | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | ✅ | `jobgenie-71964` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage | ✅ | `project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID | ✅ | `123456789` |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | ✅ | `1:123:web:abc` |
| `VITE_FIREBASE_MEASUREMENT_ID` | Analytics ID | ✅ | `G-ABC123` |
| `VITE_OPENAI_API_KEY` | OpenAI API key | ⚠️ | `sk-...` |
| `VITE_GEMINI_API_KEY` | Google Gemini API key | ⚠️ | `your-key` |
| `VITE_PINECONE_API_KEY` | Pinecone API key | ⚠️ | `your-key` |
| `VITE_PINECONE_ENVIRONMENT` | Pinecone environment | ⚠️ | `us-west1-gcp` |

**Legend:** ✅ Required | ⚠️ Required for AI features

## 🛠️ Troubleshooting

### Missing Environment Variables
If you see errors about missing config:
1. Ensure `.env` file exists in project root
2. Check all required variables are set
3. Restart your development server

### Firebase Emulator Issues
If emulators won't connect:
1. Check emulators are running: `firebase emulators:start`
2. Verify ports 9099 (auth) and 8080 (firestore) are free
3. Check console for connection errors

### Production Deployment
For production deployment:
1. Set environment variables in your hosting platform
2. Ensure all `VITE_*` variables are configured
3. Test build locally: `pnpm run build`

## ✅ Security Checklist

- [x] Firebase config moved to environment variables
- [x] `.env` file added to `.gitignore`
- [x] Template file created for team setup
- [x] Analytics only enabled in production
- [x] Emulator configuration for development
- [x] Setup script for easy configuration
- [x] Documentation for team members

**Your Firebase configuration is now secure and ready for production! 🔐**
