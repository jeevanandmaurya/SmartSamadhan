import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // A light grey background
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
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
