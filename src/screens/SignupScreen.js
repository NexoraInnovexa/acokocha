import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../utils/supabaseClient'; // Make sure you have your Supabase client set up

export default function SignupScreen() {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Sign up with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // 2️⃣ Insert additional info in users table
      const { error: dbError } = await supabase.from('users').insert([
        {
          id: authData.user.id, // use the auth user id
          email,
          name,
          role: 'user', // default role
        },
      ]);

      if (dbError) throw dbError;

      Alert.alert('Success', 'Account created successfully!');
      navigation.replace('Login');
    } catch (error) {
      console.log(error);
      Alert.alert('Signup Failed', error.message);
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
        <Title style={styles.title}>Create Account</Title>

        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          textColor="#fff"
          outlineColor="#FFA500"
        />

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
          onPress={handleSignup}
          loading={loading}
          style={styles.button}
          textColor="#000"
        >
          Sign Up
        </Button>

        <Button
          onPress={() => navigation.navigate('Login')}
          style={{ marginTop: 12 }}
          textColor="#FFA500"
        >
          Already have an account? Login
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
