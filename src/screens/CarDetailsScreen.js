import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ScrollView, FlatList } from 'react-native';
import { Title, Paragraph, Button, Chip } from 'react-native-paper';
import { colors } from '../utils/colors';
import { supabase } from '../utils/supabaseClient';

export default function CarDetailsScreen({ route, navigation }) {
  const carId = route?.params?.carId; // Expecting only the car ID from previous screen
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the car details from Supabase
  useEffect(() => {
    const fetchCar = async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .single();

      if (!error && data) {
        // Ensure images array exists
        const images = data.images?.length ? data.images : [data.image_url || 'https://via.placeholder.com/400x200?text=No+Image'];
        setCar({ ...data, images });
      }
      setLoading(false);
    };

    if (carId) fetchCar();
  }, [carId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Paragraph style={{ color: '#fff' }}>Loading car details...</Paragraph>
      </View>
    );
  }

  if (!car) {
    return (
      <View style={styles.center}>
        <Paragraph style={{ color: '#fff' }}>Car not found.</Paragraph>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Car Images */}
      <FlatList
        data={car.images}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.image} />
        )}
      />

      <View style={styles.content}>
        <Title style={styles.title}>{car.title}</Title>
        <Paragraph style={styles.price}>${car.price?.toLocaleString()}</Paragraph>

        {/* Car Attributes */}
        <View style={styles.chipRow}>
          <Chip icon="calendar" style={styles.chip}>{car.year || '—'}</Chip>
          <Chip icon="speedometer" style={styles.chip}>{car.mileage || '—'} km</Chip>
          <Chip icon="shield" style={styles.chip}>{car.condition || '—'}</Chip>
          <Chip icon="car" style={styles.chip}>{car.category || '—'}</Chip>
          <Chip icon={car.fuel?.toLowerCase() === 'electric' ? 'battery' : 'fuel'} style={styles.chip}>{car.fuel || '—'}</Chip>

        </View>

        <Paragraph style={styles.desc}>{car.description || 'No description available.'}</Paragraph>

        {/* Actions */}
        <Button
           mode="contained"
           onPress={() =>
             navigation.navigate('MainTabs', {
               screen: 'Book', // tab name for BookServiceScreen
               params: { prefill: car }, // pass your car data
            })
          }
          style={styles.btn}
        >
        Book Service / Test Drive
      </Button>

        <Button
  mode="outlined"
  onPress={() =>
    navigation.navigate('MainTabs', {
      screen: 'Sell', // tab name
    })
  }
  style={[styles.btn, { marginTop: 8, color: colors.text }]}
>
  Sell Your Car
</Button>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#000', flex: 1 },
  image: { width: 300, height: 220, marginHorizontal: 6, borderRadius: 8 },
  content: { padding: 12 },
  title: { color: colors.text, fontSize: 22, fontWeight: 'bold' },
  price: { color: colors.accent, fontSize: 18, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
  chip: { backgroundColor: '#f8f8f8ff', color: colors.text },
  desc: { color: colors.text, marginTop: 10, lineHeight: 20 },
  btn: { backgroundColor: colors.accent, marginTop: 16,color: colors.text },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
});
