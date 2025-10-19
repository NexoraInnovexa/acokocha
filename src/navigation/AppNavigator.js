import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IconButton } from 'react-native-paper';

import HomeScreen from '../screens/HomeScreen';
import CarsScreens from '../screens/CarsScreens'; // ✅ matches your file
import CarDetailsScreen from '../screens/CarDetailsScreen';
import BookServiceScreen from '../screens/BookServiceScreen';
import SellCarScreen from '../screens/SellCarScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../utils/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

//
// ✅ Define CarsStack — this handles Cars list + Car details
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

      {/* ✅ CarsStack used here */}
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
    </Tab.Navigator>
  );
}

//
// ✅ Root Stack (to keep CarDetails hidden from bottom tabs)
//
export default function AppNavigator() {
  return (
    <Stack.Navigator>
      {/* Main tab navigation */}
      <Stack.Screen
        name="MainTabs"
        component={Tabs}
        options={{ headerShown: false }}
      />

      {/* Hidden screen (navigated to programmatically) */}
      <Stack.Screen
        name="CarDetails"
        component={CarDetailsScreen}
        options={{
          title: 'Car Details',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}
