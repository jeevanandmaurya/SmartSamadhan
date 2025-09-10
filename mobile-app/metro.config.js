const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // Enable minification for production builds
  minifierConfig: {
    compress: {
      // Remove console logs in production
      drop_console: true,
      drop_debugger: true,
    },
    mangle: {
      // Enable mangling for smaller bundle size
      safari10: true,
    },
  },
});

// Optimize asset handling
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => !['svg'].includes(ext)
);

// Add SVG transformer
config.transformer.babelTransformerPath = require.resolve(
  'react-native-svg-transformer'
);

// Enable tree shaking
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
