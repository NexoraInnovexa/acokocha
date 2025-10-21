import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../utils/supabaseClient'; // Make sure you have your Supabase client

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Sign in with Supabase
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!user) throw new Error('User not found');

      // 2️⃣ Fetch user role from users table
      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (dbError) throw dbError;

      // 3️⃣ Navigate based on role
      if (userData.role === 'admin') {
        navigation.replace('Admin'); // Admin screen
      } else {
        navigation.replace('Home'); // User screen
      }

    } catch (error) {
      console.log(error);
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#111' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Title style={styles.title}>Login</Title>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          textColor="#fff"
          outlineColor="#FFA500"
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
          textColor="#fff"
          outlineColor="#FFA500"
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
          textColor="#000"
        >
          Login
        </Button>

        <Button
          onPress={() => navigation.navigate('Signup')}
          style={{ marginTop: 12 }}
          textColor="#FFA500"
        >
          Don't have an account? Sign Up
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFA500',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#111',
  },
  button: {
    backgroundColor: '#FFA500',
    paddingVertical: 8,
    borderRadius: 8,
  },
});
