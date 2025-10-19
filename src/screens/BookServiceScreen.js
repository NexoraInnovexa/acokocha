import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title, Paragraph } from 'react-native-paper';
import { colors } from '../utils/colors';

export default function BookServiceScreen({ route }) {
  // ✅ Safe prefill (prevents "undefined" crashes when opened from tab)
  const prefill = route?.params?.prefill ?? null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [carModel, setCarModel] = useState(prefill?.title ?? '');
  const [problem, setProblem] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (prefill?.title) {
      setCarModel(prefill.title);
    }
  }, [prefill]);

  const submit = () => {
    if (!name || !phone || !carModel || !date) {
      Alert.alert('Missing Info', 'Please fill out all required fields.');
      return;
    }

    // ✅ Demo alert — replace with real backend integration later
    Alert.alert(
      'Booking Confirmed ✅',
      `Thanks, ${name}! We'll contact you soon to confirm your appointment for ${carModel}.`
    );

    // Reset form
    setName('');
    setPhone('');
    setCarModel(prefill?.title ?? '');
    setProblem('');
    setDate('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <Title style={styles.title}>Book Service</Title>
        <Paragraph style={styles.subtitle}>
          Schedule a repair, maintenance, or test drive.
        </Paragraph>

        <TextInput
          label="Your Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          keyboardType="phone-pad"
          mode="outlined"
        />
        <TextInput
          label="Car Model (auto-filled if selected)"
          value={carModel}
          onChangeText={setCarModel}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Preferred Date & Time"
          value={date}
          onChangeText={setDate}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Describe the Issue"
          value={problem}
          onChangeText={setProblem}
          style={styles.input}
          multiline
          numberOfLines={4}
          mode="outlined"
        />

        <Button mode="contained" onPress={submit} style={styles.btn}>
          Confirm Booking
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#000', padding: 12, flex: 1, marginTop: 70 },
  title: { color: colors.accent, fontSize: 22, marginBottom: 6 },
  subtitle: { color: colors.text, marginBottom: 12 },
  input: { marginVertical: 8, backgroundColor: '#111' },
  btn: { marginTop: 16, backgroundColor: colors.accent },
});
