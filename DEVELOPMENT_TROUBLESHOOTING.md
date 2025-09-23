# JobGenie Development Troubleshooting Guide

## 🔧 Common Issues and Solutions

### 1. Firebase Auth Errors (network-request-failed)

**Error**: `Firebase: Error (auth/network-request-failed)`

**Solution**:
```bash
# Start Firebase emulators
firebase emulators:start --only auth,firestore --project demo-project
```

**Check emulators are running**:
- Auth Emulator: http://localhost:9099
- Firestore Emulator: http://localhost:8080
- Firebase UI: http://localhost:4000

### 2. PWA Plugin Errors

**Error**: `Failed to load module script: Expected a JavaScript-or-Wasm module script`

**Solution**: The Vite config has been updated to disable PWA features in development:
```typescript
// vite.config.ts
define: {
  __VITE_PWA__: false
}
```

### 3. WebSocket Connection Issues

**Error**: `WebSocket connection to 'ws://localhost:undefined' failed`

**Solution**: Vite config now explicitly sets HMR port:
```typescript
server: {
  port: 5173,
  host: 'localhost',
  hmr: {
    port: 5173,
  }
}
```

### 4. Font Loading Errors

**Error**: `Failed to load resource: net::ERR_CONNECTION_REFUSED` for font files

**Solution**: 
- Fonts are now loaded locally via `@fontsource` packages
- Fallback fonts are configured in `tailwind.config.ts`
- If issues persist, check internet connection or use system fonts

### 5. Environment Variables

**Missing Configuration**:
```bash
# Copy environment template
cp env.example .env.local

# Edit with your values
nano .env.local
```

**Required for full functionality**:
```env
VITE_FIREBASE_API_KEY=demo-key
VITE_FIREBASE_PROJECT_ID=demo-project
VITE_OPENAI_API_KEY=your-openai-key (for AI features)
VITE_LINKEDIN_CLIENT_ID=your-linkedin-id (for LinkedIn import)
```

## 🚀 Quick Start Commands

### Option 1: Automated Setup
```bash
./scripts/dev-setup.sh
```

### Option 2: Manual Setup
```bash
# Terminal 1: Start Firebase emulators
firebase emulators:start --only auth,firestore --project demo-project

# Terminal 2: Start development server
pnpm run dev
```

## 🔍 Debugging Steps

### 1. Check Services Status
```bash
# Check if emulators are running
curl http://localhost:9099  # Auth emulator
curl http://localhost:8080  # Firestore emulator

# Check development server
curl http://localhost:5173  # Vite dev server
```

### 2. Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Chrome/Firefox)
- Clear application data in DevTools
- Disable browser extensions

### 3. Reset Development Environment
```bash
# Stop all services
pkill -f "firebase"
pkill -f "vite"

# Clear caches
rm -rf node_modules/.vite
rm -rf .firebase

# Restart
pnpm install
./scripts/dev-setup.sh
```

## 📱 Testing User Registration

### 1. Open Application
Navigate to: http://localhost:5173

### 2. Test Firebase Connection
- Open browser DevTools (F12)
- Check Console for Firebase emulator warnings (these are normal)
- Look for green "Firebase emulator" messages

### 3. Create Test Account
```
Email: test@example.com
Password: testpassword123
First Name: Test
Last Name: User
```

### 4. Verify Account Creation
- Check Firebase UI: http://localhost:4000
- Look in Authentication > Users tab
- User should appear in emulator

## 🐛 Still Having Issues?

### 1. Check Logs
```bash
# Firebase emulator logs
firebase emulators:start --only auth,firestore --project demo-project --debug

# Vite logs
pnpm run dev --debug
```

### 2. Verify Dependencies
```bash
# Check if all packages are installed
pnpm install

# Verify Firebase CLI
firebase --version

# Check Node.js version (should be 18+)
node --version
```

### 3. Network Issues
```bash
# Check if ports are available
netstat -tulpn | grep :5173  # Vite
netstat -tulpn | grep :9099  # Firebase Auth
netstat -tulpn | grep :8080  # Firestore
```

### 4. Reset Firebase Emulators
```bash
# Stop emulators
firebase emulators:stop

# Clear emulator data
rm -rf .firebase/

# Restart with fresh data
firebase emulators:start --only auth,firestore --project demo-project
```

## ✅ Success Indicators

When everything is working correctly, you should see:

1. **Browser Console**:
   - ✅ "Firebase emulator" warning (this is expected)
   - ✅ No network request errors
   - ✅ React DevTools message

2. **Firebase UI** (http://localhost:4000):
   - ✅ Auth and Firestore emulators showing "running"
   - ✅ Can view/create users in Auth tab

3. **Application**:
   - ✅ Fonts load correctly
   - ✅ Sign up form works without errors
   - ✅ User accounts created successfully

## 📞 Additional Support

If issues persist:
1. Check the [Firebase Emulator Documentation](https://firebase.google.com/docs/emulator-suite)
2. Review [Vite Configuration Guide](https://vitejs.dev/config/)
3. Verify all environment variables are set correctly
