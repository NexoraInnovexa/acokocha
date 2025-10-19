import React from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { Title, Paragraph, Button, Card } from 'react-native-paper';
import { colors } from '../utils/colors';
import sampleCars from '../data/sampleCars';
import CarCard from '../components/CarCard';

export default function HomeScreen({ navigation }) {
  const featured = sampleCars.slice(0, 2);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.hero}>
        <Card.Content>
          <Title style={styles.title}>DriveSmart Autos</Title>
          <Paragraph style={styles.subtitle}>Buy, Sell & Service — Fast, Reliable, Local</Paragraph>
          <Button mode="contained" onPress={() => navigation.navigate('Cars')} style={styles.cta}>Explore Cars</Button>
        </Card.Content>
      </Card>

      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Featured</Title>
        {featured.map(car => (
          <CarCard key={car.id} item={car} onPress={() => navigation.navigate('CarDetails', { car })} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#000', flex: 1 },
  hero: {
    backgroundColor: colors.primary,
    margin: 12,
    borderRadius: 12,
    paddingVertical: 16
  },
  title: { color: colors.accent, fontSize: 22 },
  subtitle: { color: colors.text, marginVertical: 8 },
  cta: { marginTop: 8, backgroundColor: colors.accent },
  section: { marginTop: 8 },
  sectionTitle: { color: colors.text, marginLeft: 12 }
});
