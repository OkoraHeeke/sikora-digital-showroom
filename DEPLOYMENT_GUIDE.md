# 🚀 SIKORA Digital Showroom - Deployment Guide

## Quick Deploy Options

### Option 1: Netlify Drag & Drop (Fastest - 2 Minutes)
1. Download the `dist` folder from this project
2. Go to [netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist` folder onto the page
4. Your PWA is live with HTTPS!

### Option 2: GitHub + Netlify (Automatic Deploys)

#### Step 1: Create GitHub Repository
```bash
# 1. Go to https://github.com/new
# 2. Repository name: sikora-digital-showroom
# 3. Make it Public (for free Netlify)
# 4. Don't add README (we have one)
# 5. Click "Create repository"
```

#### Step 2: Push to GitHub
```bash
# Copy the repository URL from GitHub, then run:
git remote add origin https://github.com/YOUR_USERNAME/sikora-digital-showroom.git
git push -u origin main
```

#### Step 3: Connect to Netlify
```bash
# 1. Go to https://netlify.com
# 2. Click "New site from Git"
# 3. Choose GitHub and authorize
# 4. Select your repository
# 5. Build settings are auto-configured ✅
# 6. Click "Deploy site"
```

## ✨ What You Get

### PWA Features (HTTPS only)
- ✅ Install button in browser
- ✅ Offline functionality
- ✅ Desktop/mobile app experience
- ✅ App icons and splash screens

### Technical Features
- ✅ Automatic deploys on git push
- ✅ CDN distribution worldwide
- ✅ Optimized caching
- ✅ SPA routing support

## 🎯 Files Ready for Deployment

All configuration files are already created:
- ✅ `netlify.toml` - Build configuration
- ✅ `public/_redirects` - SPA routing
- ✅ `public/manifest.json` - PWA manifest
- ✅ `public/sw.js` - Service worker
- ✅ `.gitignore` - Git ignore rules

## 🔧 Commands Reference

### Local Development
```bash
npm install        # Install dependencies
npm run dev        # Start dev server (localhost:3000)
npm run build      # Create production build
npm run preview    # Preview production build
```

### Database (Optional)
```bash
npm run db:server  # Start API server (localhost:3001)
```

## 📱 Testing PWA

### Development (Limited PWA)
- URL: http://localhost:3000
- PWA features limited (no HTTPS)

### Production (Full PWA)
- URL: Your Netlify URL
- Full PWA functionality with HTTPS
- Install button appears automatically

## 🐛 Troubleshooting

### PWA Install Button Not Showing
- ✅ Use HTTPS (Netlify provides this)
- ✅ Wait 5-10 seconds after page load
- ✅ Check browser console for errors
- ✅ Try Chrome/Edge (best PWA support)

### Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Service Worker Issues
- Hard refresh: Ctrl+F5
- Clear browser cache
- Check Network tab for sw.js loading

## 🎉 Success Indicators

After deployment, you should see:
- ✅ Green "App installieren" button in header
- ✅ PWA installation prompt in browser
- ✅ App works offline after installation
- ✅ App icon on desktop/homescreen

---

**Ready to deploy?** Choose Option 1 for quickest results! 