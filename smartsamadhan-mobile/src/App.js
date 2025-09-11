import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { AuthProvider, DatabaseProvider, ThemeProvider, useTheme } from './contexts';
import LoginScreen from './screens/Login';
import SignupScreen from './screens/Signup';
import HomeScreen from './screens/Home';
import ReportIssueScreen from './screens/ReportIssue';
import ReportDetailsScreen from './screens/ReportDetails';
import ProfileScreen from './screens/Profile';
import SettingsScreen from './screens/Settings';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.surface,
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarStyle: { backgroundColor: theme.colors.card },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="ReportIssue"
        component={ReportIssueScreen}
        options={{
          title: 'Report Issue',
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>📝</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>👤</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

function ThemedNavigation() {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="ReportDetails" component={ReportDetailsScreen} options={{
          title: 'Report Details',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.surface,
          headerTitleStyle: { fontWeight: 'bold' },
        }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DatabaseProvider>
        <AuthProvider>
          <ThemedNavigation />
        </AuthProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
}
