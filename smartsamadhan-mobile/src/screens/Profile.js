import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement profile update with DatabaseContext
    Alert.alert('Success', 'Profile updated successfully');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => logout(navigation) }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>Profile</Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Full Name</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              placeholder="Enter full name"
              placeholderTextColor={theme.colors.textSecondary}
            />
          ) : (
            <Text style={[styles.value, { color: theme.colors.textSecondary }]}>{formData.fullName || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
          <Text style={[styles.value, { color: theme.colors.textSecondary }]}>{formData.email}</Text>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Phone</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Enter phone number"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={[styles.value, { color: theme.colors.textSecondary }]}>{formData.phone || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Address</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.textArea, {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Enter address"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          ) : (
            <Text style={[styles.value, { color: theme.colors.textSecondary }]}>{formData.address || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.colors.success }]} onPress={handleSave}>
                <Text style={[styles.buttonText, { color: theme.colors.surface }]}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={[styles.editButton, { backgroundColor: theme.colors.primary }]} onPress={() => setIsEditing(true)}>
              <Text style={[styles.buttonText, { color: theme.colors.surface }]}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.colors.danger }]} onPress={handleLogout}>
          <Text style={[styles.logoutText, { color: theme.colors.surface }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  card: { padding: 20, borderRadius: 10, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  field: { marginBottom: 15 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  value: { fontSize: 16, paddingVertical: 8 },
  input: { borderWidth: 1, padding: 10, borderRadius: 5, fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  buttonContainer: { marginTop: 20 },
  editButton: { padding: 15, borderRadius: 5, alignItems: 'center' },
  saveButton: { padding: 15, borderRadius: 5, alignItems: 'center', marginBottom: 10 },
  cancelButton: { alignItems: 'center', padding: 10 },
  cancelText: { fontSize: 16 },
  buttonText: { fontSize: 16 },
  logoutButton: { marginTop: 20, alignItems: 'center', padding: 15, borderRadius: 5 },
  logoutText: { fontSize: 16 }
});
