import React, { useState, useEffect } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { TextInput, Button, Title, Paragraph } from 'react-native-paper';
import { colors } from '../utils/colors';
import { supabase } from '../utils/supabaseClient';

export default function BookServiceScreen({ route }) {
  const prefill = route?.params?.prefill ?? null;

  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [carModel, setCarModel] = useState(prefill?.title ?? '');
  const [problem, setProblem] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch user info
  useEffect(() => {
    const fetchUserProfile = async () => {
      const currentUser = supabase.auth.user(); // Already logged in
      if (!currentUser) return;

      setUser(currentUser);
      setEmail(currentUser.email);

      const { data, error } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('id', currentUser.id)
        .single();

      if (data) {
        setName(data.name || '');
        setPhone(data.phone || '');
      }
    };

    fetchUserProfile();
  }, []);

  // Autofill car model if prefill is provided
  useEffect(() => {
    if (prefill?.title) setCarModel(prefill.title);
  }, [prefill]);

  const submit = async () => {
    if (!name || !phone || !carModel || !date) {
      alert('Please fill out all required fields.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('bookings').insert([
      {
        name,
        phone,
        email,
        car_model: carModel,
        problem,
        date,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      alert('Failed to save booking. Please try again.');
      return;
    }

    alert(`Thanks, ${name}! Your booking for ${carModel} has been confirmed.`);

    // Reset form
    setCarModel(prefill?.title ?? '');
    setProblem('');
    setDate('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#000' }}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
        <Title style={styles.title}>Book Service</Title>
        <Paragraph style={styles.subtitle}>Schedule a repair, maintenance, or test drive.</Paragraph>

        <TextInput
          label="Your Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
          textColor="#fff"
          disabled // autofilled
        />
        <TextInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          keyboardType="phone-pad"
          mode="outlined"
          textColor="#fff"
        />
        <TextInput
          label="Email"
          value={email}
          style={styles.input}
          mode="outlined"
          textColor="#fff"
          disabled
        />
        <TextInput
          label="Car Model (auto-filled if selected)"
          value={carModel}
          onChangeText={setCarModel}
          style={styles.input}
          mode="outlined"
          textColor="#fff"
        />
        <TextInput
          label="Preferred Date & Time"
          value={date}
          onChangeText={setDate}
          style={styles.input}
          mode="outlined"
          textColor="#fff"
        />
        <TextInput
          label="Describe the Issue"
          value={problem}
          onChangeText={setProblem}
          style={styles.input}
          multiline
          numberOfLines={4}
          mode="outlined"
          textColor="#fff"
        />

        <Button
          mode="contained"
          onPress={submit}
          style={styles.btn}
          loading={loading}
          disabled={loading}
          textColor="#000"
        >
          Confirm Booking
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#000', padding: 12 },
  title: { color: colors.accent, fontSize: 22, marginBottom: 6, marginTop: 40 },
  subtitle: { color: colors.text, marginBottom: 12 },
  input: { marginVertical: 8, backgroundColor: '#111' },
  btn: { marginTop: 16, backgroundColor: colors.accent },
});
