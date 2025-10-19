import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';
import sampleCars from '../data/sampleCars';
import CarCard from '../components/CarCard';
import { colors } from '../utils/colors';

export default function CarsScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const filtered = sampleCars.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={styles.container}>
      <Searchbar placeholder="Search cars or model" value={query} onChangeText={setQuery} style={styles.search} />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CarCard item={item} onPress={() => navigation.navigate('CarDetails', { car: item })} />
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  search: { margin: 12, backgroundColor: '#222', color: colors.text }
});
