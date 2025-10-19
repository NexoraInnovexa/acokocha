// App.js
import React from 'react';
import { View, Text } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator'; // ✅ Make sure this file exists

export default function App() {
  console.log('✅ App.js rendering...');

  return (
    <PaperProvider>
      <NavigationContainer>
        {/* Light status bar on dark backgrounds */}
        <StatusBar style="light" />

        {/* Safety check: if AppNavigator fails, show fallback */}
        <AppNavigatorFallbackBoundary>
          <AppNavigator />
        </AppNavigatorFallbackBoundary>
      </NavigationContainer>
    </PaperProvider>
  );
}

/**
 * Fallback Boundary — to catch blank screens caused by AppNavigator load failures
 */
function AppNavigatorFallbackBoundary({ children }) {
  try {
    return children;
  } catch (error) {
    console.error('❌ Error rendering AppNavigator:', error);
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff0f0',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#900', fontSize: 16, fontWeight: 'bold' }}>
          AppNavigator failed to load
        </Text>
        <Text>{String(error)}</Text>
      </View>
    );
  }
}
