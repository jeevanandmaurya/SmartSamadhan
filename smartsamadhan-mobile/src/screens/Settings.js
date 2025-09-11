import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsScreen({ navigation }) {
  const { user } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          // TODO: Implement account deletion
          Alert.alert('Account Deleted', 'Your account has been deleted.');
        }}
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Notifications',
      items: [
        {
          label: 'Push Notifications',
          type: 'switch',
          value: notifications,
          onValueChange: setNotifications
        }
      ]
    },
    {
      title: 'Appearance',
      items: [
        {
          label: 'Dark Mode',
          type: 'switch',
          value: isDarkMode,
          onValueChange: toggleTheme
        }
      ]
    },
    {
      title: 'Privacy & Location',
      items: [
        {
          label: 'Location Services',
          type: 'switch',
          value: locationServices,
          onValueChange: setLocationServices
        }
      ]
    },
    {
      title: 'Account',
      items: [
        {
          label: 'Change Password',
          type: 'button',
          onPress: () => Alert.alert('Coming Soon', 'Password change feature will be available soon.')
        },
        {
          label: 'Delete Account',
          type: 'button',
          danger: true,
          onPress: handleDeleteAccount
        }
      ]
    },
    {
      title: 'About',
      items: [
        {
          label: 'Version',
          type: 'info',
          value: '1.0.0'
        },
        {
          label: 'Terms of Service',
          type: 'button',
          onPress: () => Alert.alert('Terms', 'Terms of Service will be displayed here.')
        },
        {
          label: 'Privacy Policy',
          type: 'button',
          onPress: () => Alert.alert('Privacy', 'Privacy Policy will be displayed here.')
        }
      ]
    }
  ];

  const renderSettingItem = (item, index) => {
    switch (item.type) {
      case 'switch':
        return (
          <View key={index} style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{item.label}</Text>
            <Switch
              value={item.value}
              onValueChange={item.onValueChange}
              trackColor={{ false: theme.colors.secondary, true: theme.colors.primary }}
              thumbColor={item.value ? theme.colors.primary : theme.colors.surface}
            />
          </View>
        );
      case 'button':
        return (
          <TouchableOpacity
            key={index}
            style={[styles.settingItem, styles.buttonItem, { borderBottomColor: theme.colors.border }]}
            onPress={item.onPress}
          >
            <Text style={[styles.settingLabel, { color: item.danger ? '#dc3545' : theme.colors.text }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      case 'info':
        return (
          <View key={index} style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{item.label}</Text>
            <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>{item.value}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>Settings</Text>

        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{section.title}</Text>
            {section.items.map((item, itemIndex) => renderSettingItem(item, itemIndex))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  card: { padding: 20, borderRadius: 10, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  buttonItem: { borderBottomWidth: 0 },
  settingLabel: { fontSize: 16 },
  settingValue: { fontSize: 16 },
  dangerText: { color: '#dc3545' }
});
