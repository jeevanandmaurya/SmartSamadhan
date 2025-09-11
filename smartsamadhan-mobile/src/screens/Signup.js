import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function SignupScreen({ navigation }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    address: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { signup } = useAuth();
  const { theme } = useTheme();

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.fullName || !formData.password || !formData.confirmPassword) {
      setError('All required fields must be filled');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await signup(formData.email, formData.password, {
        username: formData.username,
        full_name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
      });

      if (error) {
        setError(error.message || 'Failed to create account');
        return;
      }

      setIsSuccess(true);
      setTimeout(() => { navigation.navigate('Login'); }, 1200);

    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <View style={[styles.successContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={styles.successEmoji}>✅</Text>
        <Text style={[styles.successTitle, { color: theme.colors.primary }]}>Signup Successful</Text>
        <Text style={[styles.successMessage, { color: theme.colors.text }]}>Your account has been created successfully.</Text>
        <Text style={[styles.redirectText, { color: theme.colors.textSecondary }]}>Redirecting to login...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>Sign Up</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Create your SmartSamadhan account</Text>

        {error ? <Text style={[styles.error, { color: theme.colors.danger, backgroundColor: theme.colors.light }]}>{error}</Text> : null}

        <TextInput
          style={[styles.input, {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }]}
          placeholder="Full Name *"
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.fullName}
          onChangeText={(value) => handleInputChange('fullName', value)}
        />

        <TextInput
          style={[styles.input, {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }]}
          placeholder="Username *"
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.username}
          onChangeText={(value) => handleInputChange('username', value)}
        />

        <TextInput
          style={[styles.input, {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }]}
          placeholder="Email *"
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={[styles.input, {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }]}
          placeholder="Phone"
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.phone}
          onChangeText={(value) => handleInputChange('phone', value)}
          keyboardType="phone-pad"
        />

        <TextInput
          style={[styles.input, {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }]}
          placeholder="Address"
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.address}
          onChangeText={(value) => handleInputChange('address', value)}
          multiline
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }]}
            placeholder="Password *"
            placeholderTextColor={theme.colors.textSecondary}
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
            <Text style={{ color: theme.colors.textSecondary }}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }]}
            placeholder="Confirm Password *"
            placeholderTextColor={theme.colors.textSecondary}
            secureTextEntry={!showConfirmPassword}
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
            <Text style={{ color: theme.colors.textSecondary }}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled, { backgroundColor: isLoading ? theme.colors.secondary : theme.colors.primary }]} onPress={handleSignup} disabled={isLoading}>
          <Text style={[styles.buttonText, { color: theme.colors.surface }]}>{isLoading ? "Signing Up..." : "Sign Up"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
          <Text style={[styles.link, { color: theme.colors.primary }]}>Already have an account? Login</Text>
        </TouchableOpacity>

        <Text style={[styles.requirements, { color: theme.colors.textSecondary }]}>Password must be at least 6 characters long.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: { padding: 32, borderRadius: 10, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  title: { fontSize: 24, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5, fontSize: 16 },
  passwordContainer: { position: 'relative' },
  eyeButton: { position: 'absolute', right: 10, top: 10 },
  error: { marginBottom: 10, textAlign: 'center', padding: 10, borderRadius: 5 },
  button: { padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { fontSize: 16 },
  linkContainer: { marginTop: 10 },
  link: { textAlign: 'center' },
  requirements: { fontSize: 12, marginTop: 10, textAlign: 'center' },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  successEmoji: { fontSize: 48, marginBottom: 20 },
  successTitle: { fontSize: 24, marginBottom: 10, textAlign: 'center' },
  successMessage: { fontSize: 16, marginBottom: 10, textAlign: 'center' },
  redirectText: { fontSize: 14, textAlign: 'center' }
});
