import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title, Paragraph } from 'react-native-paper';
import { colors } from '../utils/colors';

export default function SellCarScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [condition, setCondition] = useState('');

  const submit = () => {
    if (!name || !phone || !make || !model || !year) {
      Alert.alert('Missing Info', 'Please fill out all required fields.');
      return;
    }

    Alert.alert(
      'Submission Received ✅',
      `Thank you, ${name}! Our team will contact you soon with a quote for your ${year} ${make} ${model}.`
    );

    setName('');
    setPhone('');
    setMake('');
    setModel('');
    setYear('');
    setMileage('');
    setCondition('');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Title style={styles.title}>Sell Your Car</Title>
      <Paragraph style={styles.subtitle}>
        Tell us about your car, and we’ll get back to you with a quote.
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
        label="Car Make"
        value={make}
        onChangeText={setMake}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Car Model"
        value={model}
        onChangeText={setModel}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Year"
        value={year}
        onChangeText={setYear}
        style={styles.input}
        keyboardType="numeric"
        mode="outlined"
      />
      <TextInput
        label="Mileage (km)"
        value={mileage}
        onChangeText={setMileage}
        style={styles.input}
        keyboardType="numeric"
        mode="outlined"
      />
      <TextInput
        label="Condition"
        value={condition}
        onChangeText={setCondition}
        style={styles.input}
        multiline
        numberOfLines={3}
        mode="outlined"
      />

      <Button mode="contained" onPress={submit} style={styles.btn}>
        Send for Evaluation
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#000', padding: 12, flex: 1, marginTop: 50 },
  title: { color: colors.accent, fontSize: 22, marginBottom: 6 },
  subtitle: { color: colors.text, marginBottom: 12 },
  input: { marginVertical: 8, backgroundColor: '#111' },
  btn: { marginTop: 16, backgroundColor: colors.accent },
});
