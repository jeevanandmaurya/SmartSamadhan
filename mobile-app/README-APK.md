# SmartSamadhan APK Build Guide

This guide will help you generate an optimized APK release with minimal size for the SmartSamadhan mobile application.

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Expo CLI** (`npm install -g @expo/cli`)
3. **EAS CLI** (`npm install -g eas-cli`)
4. **Expo Account** (sign up at [expo.dev](https://expo.dev))

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd mobile-app
npm install
```

### 2. Login to Expo
```bash
npx expo login
```

### 3. Configure EAS Project
```bash
npx eas build:configure
```

### 4. Build Optimized APK
```bash
# Option 1: Quick APK build
npm run build:production-apk

# Option 2: Custom build script (recommended)
npm run build:custom

# Option 3: Manual build
npx eas build --profile production-apk --platform android
```

## 📱 Build Profiles

### Available Build Types

| Profile | Description | Output | Size Optimization |
|---------|-------------|--------|-------------------|
| `development` | Debug build with dev tools | APK | Minimal |
| `preview` | Staging build | APK | Moderate |
| `production` | Release build (AAB) | AAB | Maximum |
| `production-apk` | Release APK | APK | Maximum |

### Size Optimization Features

✅ **ProGuard/R8 Enabled**
- Removes unused code
- Obfuscates class/method names
- Reduces APK size by ~20-30%

✅ **Resource Shrinking**
- Removes unused resources
- Optimizes asset compression
- Reduces APK size by ~10-15%

✅ **Metro Bundler Optimization**
- Tree shaking enabled
- Console logs removed in production
- Dead code elimination

✅ **Asset Optimization**
- SVG optimization
- Image compression
- Font subsetting

## 📊 Expected APK Sizes

| Build Type | Approximate Size | Notes |
|------------|------------------|-------|
| Development | 80-120 MB | Includes dev tools |
| Preview | 60-90 MB | Moderate optimization |
| Production APK | 40-70 MB | Maximum optimization |

*Sizes may vary based on assets and dependencies*

## 🔧 Configuration Files

### eas.json
```json
{
  "build": {
    "production-apk": {
      "extends": "production",
      "android": {
        "gradleCommand": ":app:assembleRelease",
        "buildType": "apk"
      }
    }
  }
}
```

### app.json (Key Optimizations)
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "enableProguardInReleaseBuilds": true,
            "enableShrinkResourcesInReleaseBuilds": true
          }
        }
      ]
    ]
  }
}
```

### metro.config.js
```javascript
// Optimizes bundling for smaller size
const config = getDefaultConfig(__dirname, {
  minifierConfig: {
    compress: {
      drop_console: true,  // Remove console.logs
      drop_debugger: true
    }
  }
});
```

## 📋 Build Steps

### Step 1: Environment Setup
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
npx expo login

# Configure project
npx eas build:configure
```

### Step 2: Pre-build Optimization
```bash
# Clean dependencies
npm run clean

# Install dependencies
npm install

# Prebuild Android project
npx expo prebuild --platform android --clean
```

### Step 3: Build APK
```bash
# Build optimized APK
npm run build:production-apk

# Or use custom script
npm run build:custom
```

### Step 4: Download APK
After build completion:
1. Go to [expo.dev](https://expo.dev)
2. Navigate to your project
3. Download the APK from the builds section

## 🔍 Troubleshooting

### Common Issues

**Build Fails with "Resource not found"**
```bash
# Clear EAS cache
npx eas build:clean

# Rebuild
npm run build:production-apk
```

**APK Size Too Large**
```bash
# Check bundle analyzer
npx expo bundle-analyzer

# Optimize assets
npm run optimize
```

**Permissions Issues**
```bash
# Check Android permissions in app.json
# Ensure all required permissions are listed
```

### Performance Tips

1. **Minimize Dependencies**: Remove unused packages
2. **Optimize Images**: Use WebP format, compress images
3. **Tree Shaking**: Ensure proper imports/exports
4. **Asset Bundling**: Use assetBundlePatterns wisely

## 📱 Testing the APK

### Install on Device
```bash
# Transfer APK to device
adb install app-release.apk

# Or use wireless debugging
adb connect <device-ip>
adb install app-release.apk
```

### Test Key Features
- [ ] App launches successfully
- [ ] Navigation works
- [ ] Form submission works
- [ ] Image upload works
- [ ] GPS location works
- [ ] Offline functionality

## 🚀 Deployment

### Submit to Play Store
```bash
# Submit AAB to Play Store
npx eas submit --platform android

# Or submit APK directly
npx eas submit --platform android --path app-release.apk
```

### Update Existing App
```bash
# Increment version in app.json
# Build new APK
npm run build:production-apk

# Submit update
npx eas submit
```

## 📊 Monitoring

### Build Analytics
- Monitor build times
- Track APK sizes
- Analyze bundle composition

### Performance Metrics
- App startup time
- Memory usage
- Battery consumption

## 🆘 Support

If you encounter issues:

1. Check [Expo Documentation](https://docs.expo.dev/)
2. Review [EAS Build Docs](https://docs.expo.dev/build/introduction/)
3. Check [React Native Community](https://reactnative.dev/docs/getting-started)

## 📝 Notes

- **AAB vs APK**: AAB is recommended for Play Store, APK for direct distribution
- **Signing**: EAS handles signing automatically
- **Updates**: Use EAS Update for over-the-air updates
- **Security**: Enable ProGuard for production builds

---

**Happy Building! 🎉**
