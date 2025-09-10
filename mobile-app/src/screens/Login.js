import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, RadialGradient, Pattern, Circle, Rect, Text as SvgText, G } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

// Simplified SVG Background Component
const LoginBackgroundSvg = ({ width, height }) => (
  <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
    <Defs>
      <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0" stopColor="#4f46e5" stopOpacity="1"/>
        <Stop offset="0.3" stopColor="#6366f1" stopOpacity="1"/>
        <Stop offset="0.7" stopColor="#8b5cf6" stopOpacity="1"/>
        <Stop offset="1" stopColor="#a855f7" stopOpacity="1"/>
      </LinearGradient>
      <RadialGradient id="glow" cx="50%" cy="30%" r="60%">
        <Stop offset="0" stopColor="#ffffff" stopOpacity="0.15"/>
        <Stop offset="1" stopColor="#ffffff" stopOpacity="0"/>
      </RadialGradient>
    </Defs>

    {/* Background Gradient - Full Screen */}
    <Rect width={width} height={height} fill="url(#bgGradient)"/>
    <Rect width={width} height={height} fill="url(#glow)"/>

    {/* SmartSamadhan Text - Centered */}
    <SvgText
      x={width / 2}
      y={height * 0.2}
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
      fontSize={Math.min(width * 0.08, 32)}
      fill="white"
      fontWeight="700"
    >
      Smart Samadhan
    </SvgText>

    <SvgText
      x={width / 2}
      y={height * 0.25}
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
      fontSize={Math.min(width * 0.04, 16)}
      fill="white"
      opacity="0.9"
    >
      Empowering Citizens, Enabling Change
    </SvgText>

    {/* Decorative Elements - Positioned Relatively */}
    <Circle cx={width * 0.13} cy={height * 0.12} r={width * 0.05} fill="white" opacity="0.1"/>
    <Circle cx={width * 0.87} cy={height * 0.18} r={width * 0.04} fill="white" opacity="0.08"/>
    <Circle cx={width * 0.27} cy={height * 0.87} r={width * 0.07} fill="white" opacity="0.06"/>
    <Circle cx={width * 0.73} cy={height * 0.80} r={width * 0.05} fill="white" opacity="0.07"/>
    <Circle cx={width * 0.5} cy={height * 0.6} r={width * 0.03} fill="white" opacity="0.05"/>
    <Circle cx={width * 0.2} cy={height * 0.4} r={width * 0.02} fill="white" opacity="0.08"/>
    <Circle cx={width * 0.8} cy={height * 0.5} r={width * 0.025} fill="white" opacity="0.06"/>
  </Svg>
);

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { loginUser } = useAuth();
  const { theme } = useTheme();

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    const { error } = await loginUser(email, password);
    if (error) {
      setError(error.message || 'Invalid credentials');
    } else {
      navigation.navigate('Main');
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* SVG Background - Full Screen */}
      <View style={styles.svgContainer}>
        <LoginBackgroundSvg
          width={screenWidth}
          height={screenHeight}
        />
      </View>

      {/* Semi-transparent overlay for better text readability */}
      <View style={styles.overlay} />

      {/* Content Container */}
      <View style={styles.contentContainer}>
        <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>Welcome</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Login to SmartSamadhan</Text>

          {error ? <Text style={[styles.error, { color: theme.colors.danger, backgroundColor: theme.colors.light }]}>{error}</Text> : null}

          <TextInput
            style={[styles.input, {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }]}
            placeholder="Email"
            placeholderTextColor={theme.colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              placeholder="Password"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Text style={{ color: theme.colors.textSecondary }}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={handleLogin}>
            <Text style={[styles.buttonText, { color: theme.colors.surface }]}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.linkContainer}>
            <Text style={[styles.link, { color: theme.colors.primary }]}>Don't have an account? Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: screenWidth,
    height: screenHeight,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 32,
    borderRadius: 10,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },
  title: { fontSize: 24, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5, fontSize: 16 },
  passwordContainer: { position: 'relative' },
  eyeButton: { position: 'absolute', right: 10, top: 10 },
  error: { marginBottom: 10, textAlign: 'center', padding: 10, borderRadius: 5 },
  button: { padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  buttonText: { fontSize: 16 },
  linkContainer: { marginTop: 10 },
  link: { textAlign: 'center' }
});
