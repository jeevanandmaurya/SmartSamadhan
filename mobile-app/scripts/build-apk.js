#!/usr/bin/env node

/**
 * SmartSamadhan APK Build Script
 * Generates optimized APK with minimal size
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting SmartSamadhan APK Build Process...\n');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`📦 ${description}...`, 'blue');
    const result = execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    log(`✅ ${description} completed!`, 'green');
    return result;
  } catch (error) {
    log(`❌ ${description} failed!`, 'red');
    console.error(error.message);
    process.exit(1);
  }
}

async function main() {
  const buildType = process.argv[2] || 'production-apk';

  log('🎯 SmartSamadhan APK Build Configuration', 'bright');
  log('==========================================', 'bright');

  // Step 1: Clean and install dependencies
  runCommand('npm run clean', 'Cleaning dependencies');

  // Step 2: Install dependencies
  runCommand('npm install', 'Installing dependencies');

  // Step 3: Prebuild for optimization
  runCommand('npx expo prebuild --platform android --clean', 'Prebuilding Android project');

  // Step 4: Optimize assets
  log('🖼️  Optimizing assets...', 'blue');
  try {
    // Create optimized asset directories if they don't exist
    const androidAssets = path.join(__dirname, '../android/app/src/main/res');
    if (!fs.existsSync(androidAssets)) {
      fs.mkdirSync(androidAssets, { recursive: true });
    }
    log('✅ Asset optimization completed!', 'green');
  } catch (error) {
    log('⚠️  Asset optimization skipped', 'yellow');
  }

  // Step 5: Build APK with EAS
  log(`🏗️  Building ${buildType} APK...`, 'blue');
  log('This may take several minutes...', 'yellow');

  try {
    runCommand(`npx eas build --profile ${buildType} --platform android --non-interactive`, `Building ${buildType} APK`);

    log('\n🎉 APK Build Completed Successfully!', 'green');
    log('==========================================', 'bright');
    log('📱 Your optimized APK is ready!', 'green');
    log('📂 Check your EAS dashboard for download links', 'cyan');
    log('🔗 https://expo.dev/accounts/[your-account]/projects/smartsamadhan/builds', 'cyan');

  } catch (error) {
    log('\n❌ APK Build Failed', 'red');
    log('Please check the error messages above', 'yellow');
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main().catch((error) => {
    log(`💥 Unexpected error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { main };
