import React from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Title, Paragraph, Button, Chip } from 'react-native-paper';
import { colors } from '../utils/colors';

export default function CarDetailsScreen({ route, navigation }) {
  // ✅ Safely access the car object or use fallback
  const car = route?.params?.car ?? {
    title: 'Unknown Car',
    price: 'N/A',
    images: ['https://via.placeholder.com/400x200?text=No+Car+Selected'],
    year: '—',
    mileage: '—',
    condition: '—',
    description: 'Car details are not available.',
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: car.images[0] }} style={styles.image} />
      <View style={styles.content}>
        <Title style={styles.title}>{car.title}</Title>
        <Paragraph style={styles.price}>{car.price}</Paragraph>

        <View style={styles.chipRow}>
          <Chip icon="calendar" style={styles.chip}>{car.year}</Chip>
          <Chip icon="speedometer" style={styles.chip}>{car.mileage}</Chip>
          <Chip icon="shield" style={styles.chip}>{car.condition}</Chip>
        </View>

        <Paragraph style={styles.desc}>{car.description}</Paragraph>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('Book', { prefill: car })}
          style={styles.btn}
        >
          Book Service / Test Drive
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Sell')}
          style={[styles.btn, { marginTop: 8 }]}
        >
          Sell Your Car
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#000' },
  image: { width: '100%', height: 220 },
  content: { padding: 12 },
  title: { color: colors.text },
  price: { color: colors.accent, fontSize: 18, marginTop: 4 },
  chipRow: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  chip: { backgroundColor: '#111', color: colors.text },
  desc: { color: colors.muted, marginTop: 10 },
  btn: { backgroundColor: colors.accent, marginTop: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
});
