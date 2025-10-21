import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IconButton } from 'react-native-paper';

import HomeScreen from '../screens/HomeScreen';
import CarsScreens from '../screens/CarsScreens';
import CarDetailsScreen from '../screens/CarDetailsScreen';
import BookServiceScreen from '../screens/BookServiceScreen';
import SellCarScreen from '../screens/SellCarScreen';
import AdminDashboard from '../screens/AdminScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SignupScreen from '../screens/SignupScreen';
import LoginScreen from '../screens/LoginScreen';
import LoaderScreen from '../screens/loaderScreen';
import { colors } from '../utils/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

//
// ✅ Define CarsStack — handles Cars list + Car details
//
function CarsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen
        name="CarsList"
        component={CarsScreens}
        options={{ title: 'Cars' }}
      />
      <Stack.Screen
        name="CarDetails"
        component={CarDetailsScreen}
        options={{ title: 'Car Details' }}
      />
    </Stack.Navigator>
  );
}

//
// ✅ Define Tab Navigator — main bottom tabs
//
function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: '#666',
        tabBarStyle: { backgroundColor: '#111', borderTopColor: '#222' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <IconButton icon="home" iconColor={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Cars"
        component={CarsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <IconButton icon="car" iconColor={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Book"
        component={BookServiceScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <IconButton icon="wrench" iconColor={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Sell"
        component={SellCarScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <IconButton icon="currency-usd" iconColor={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <IconButton icon="account" iconColor={color} size={size} />
          ),
        }}
      />
      {/* <Tab.Screen
        name="Admin"
        component={AdminDashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <IconButton icon="admin" iconColor={color} size={size} />
          ),
        }}
      /> */}
    </Tab.Navigator>
  );
}

//
// ✅ Root Stack — Auth + Tabs + Hidden screens
//
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Loader shown on app start */}
      <Stack.Screen name="Loader" component={LoaderScreen} />

      {/* Auth screens */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Admin" component={AdminDashboard} />
      <Stack.Screen name="Home" component={HomeScreen} />


      {/* Main app */}
      <Stack.Screen name="MainTabs" component={Tabs} />

      {/* Hidden detail screens */}
      <Stack.Screen
        name="CarDetails"
        component={CarDetailsScreen}
        options={{
          headerShown: true,
          title: 'Car Details',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}
