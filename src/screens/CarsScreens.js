import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { TextInput, Button, Paragraph, Title, Card, Chip } from 'react-native-paper';
import { supabase } from '../utils/supabaseClient';
import CarCard from '../components/CarCard';
import { colors } from '../utils/colors';

export default function CarsScreen({ navigation }) {
  const [cars, setCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [fuel, setFuel] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [maxMileage, setMaxMileage] = useState('');
  const [sortOption, setSortOption] = useState(null);

  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (!error && data) setCategories(['All', ...data.map(c => c.name)]);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      const { data, error } = await supabase.from('cars').select('*');
      if (!error && data) {
        const carsWithImages = data.map(car => ({
          ...car,
          image_url: car.images?.[0] || car.image_url || 'https://via.placeholder.com/400x200?text=No+Image',
        }));
        setCars(carsWithImages);
        setFilteredCars(carsWithImages);
      }
    };
    fetchCars();
  }, []);

  useEffect(() => {
    let tempCars = [...cars];

    if (query) tempCars = tempCars.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));
    if (selectedCategory && selectedCategory !== 'All') tempCars = tempCars.filter(c => c.category === selectedCategory);
    if (brand) tempCars = tempCars.filter(c => c.brand?.toLowerCase().includes(brand.toLowerCase()));
    if (model) tempCars = tempCars.filter(c => c.model?.toLowerCase().includes(model.toLowerCase()));
    if (fuel && fuel !== 'All') tempCars = tempCars.filter(c => c.fuel_type === fuel);
    if (minPrice) tempCars = tempCars.filter(c => c.price >= parseFloat(minPrice));
    if (maxPrice) tempCars = tempCars.filter(c => c.price <= parseFloat(maxPrice));
    if (maxMileage) tempCars = tempCars.filter(c => c.mileage <= parseFloat(maxMileage));

    if (sortOption === 'Price Asc') tempCars.sort((a, b) => a.price - b.price);
    else if (sortOption === 'Price Desc') tempCars.sort((a, b) => b.price - a.price);
    else if (sortOption === 'Mileage') tempCars.sort((a, b) => a.mileage - b.mileage);
    else if (sortOption === 'Year') tempCars.sort((a, b) => b.year - a.year);

    setFilteredCars(tempCars);
  }, [query, selectedCategory, brand, model, fuel, minPrice, maxPrice, maxMileage, sortOption, cars]);

  const handleAIChat = () => {
    if (!userQuery) return;
    const recommended = cars
      .filter(c => c.price <= 50000 && c.category?.toLowerCase().includes('suv'))
      .map(c => c.title)
      .join(', ');
    setAiResponse(`Based on your input "${userQuery}", we suggest: ${recommended || 'No cars found in this range.'}`);
    setUserQuery('');
  };

  const renderChips = (data, selected, setSelected) => (
    <FlatList
      horizontal
      nestedScrollEnabled
      data={data}
      keyExtractor={item => item}
      showsHorizontalScrollIndicator={false}
      style={styles.filterList}
      renderItem={({ item }) => (
        <Chip
          mode={selected === item ? 'flat' : 'outlined'}
          onPress={() => setSelected(item)}
          style={[styles.chip, { backgroundColor: selected === item ? '#FFA500' : '#111' }]}
          textStyle={{ color: '#fff' }}
        >
          {item}
        </Chip>
      )}
    />
  );

  // Header component for FlatList
  const ListHeader = () => (
    <>
      <TextInput
        placeholder="Search cars..."
        value={query}
        onChangeText={setQuery}
        style={styles.search}
        mode="outlined"
        textColor="#fff"
        placeholderTextColor="#aaa"
        outlineColor="#444"
        activeOutlineColor="#FFA500"
      />

      {renderChips(categories, selectedCategory, setSelectedCategory)}

      <TextInput
        placeholder="Brand"
        value={brand}
        onChangeText={setBrand}
        style={styles.filterInput}
        mode="outlined"
        textColor="#fff"
        placeholderTextColor="#aaa"
        outlineColor="#444"
        activeOutlineColor="#FFA500"
      />
      <TextInput
        placeholder="Model"
        value={model}
        onChangeText={setModel}
        style={styles.filterInput}
        mode="outlined"
        textColor="#fff"
        placeholderTextColor="#aaa"
        outlineColor="#444"
        activeOutlineColor="#FFA500"
      />
      <TextInput
        placeholder="Fuel Type"
        value={fuel}
        onChangeText={setFuel}
        style={styles.filterInput}
        mode="outlined"
        textColor="#fff"
        placeholderTextColor="#aaa"
        outlineColor="#444"
        activeOutlineColor="#FFA500"
      />

      <View style={styles.priceRange}>
        <TextInput
          placeholder="Min Price"
          value={minPrice}
          onChangeText={setMinPrice}
          keyboardType="numeric"
          style={styles.priceInput}
          mode="outlined"
          textColor="#fff"
          placeholderTextColor="#aaa"
          outlineColor="#444"
          activeOutlineColor="#FFA500"
        />
        <TextInput
          placeholder="Max Price"
          value={maxPrice}
          onChangeText={setMaxPrice}
          keyboardType="numeric"
          style={styles.priceInput}
          mode="outlined"
          textColor="#fff"
          placeholderTextColor="#aaa"
          outlineColor="#444"
          activeOutlineColor="#FFA500"
        />
        <TextInput
          placeholder="Max Mileage"
          value={maxMileage}
          onChangeText={setMaxMileage}
          keyboardType="numeric"
          style={styles.priceInput}
          mode="outlined"
          textColor="#fff"
          placeholderTextColor="#aaa"
          outlineColor="#444"
          activeOutlineColor="#FFA500"
        />
      </View>

      <Button
        mode="contained"
        style={{ margin: 12, backgroundColor: '#FFA500' }}
        textColor="#000"
        onPress={() => {}}
      >
        Sort: {sortOption || 'Select'}
      </Button>

      {filteredCars.length === 0 && (
        <View style={{ padding: 20 }}>
          <Title style={{ color: '#fff' }}>No cars found.</Title>
        </View>
      )}

      <Card style={[styles.aiCard, { backgroundColor: '#111' }]}>
        <Card.Content>
          <Title style={{ color: '#FFA500' }}>AI Car Advisor</Title>
          <Paragraph style={{ color: '#fff', marginBottom: 8 }}>Tell our AI your preferences, model, or budget.</Paragraph>
          <TextInput
            placeholder="E.g., SUV under $30,000"
            value={userQuery}
            onChangeText={setUserQuery}
            mode="outlined"
            style={{ backgroundColor: '#111', marginBottom: 8 }}
            textColor="#fff"
            placeholderTextColor="#aaa"
            outlineColor="#444"
            activeOutlineColor="#FFA500"
          />
          <Button mode="contained" onPress={handleAIChat} style={{ backgroundColor: '#FFA500' }} textColor="#000">
            Get Suggestions
          </Button>
          {aiResponse ? <Paragraph style={{ color: '#fff', marginTop: 8 }}>{aiResponse}</Paragraph> : null}
        </Card.Content>
      </Card>
    </>
  );

  return (
    <FlatList
      style={styles.container}
      data={filteredCars}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <CarCard
          item={{
            ...item,
            title: item.title,
            price: item.price,
            category: item.category,
            description: item.description,
            image: item.image_url,
          }}
          onPress={() => navigation.navigate('CarDetails', { carId: item.id })}
          badge={item.isHotDeal ? 'Hot Deal' : item.isNew ? 'New Arrival' : null}
        />
      )}
      ListHeaderComponent={<ListHeader />}
      contentContainerStyle={{ paddingBottom: 80 }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  search: { margin: 12, backgroundColor: '#222' },
  filterList: { paddingHorizontal: 12, marginBottom: 8 },
  chip: { marginRight: 8 },
  filterInput: { marginHorizontal: 12, marginBottom: 8, backgroundColor: '#111' },
  priceRange: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 12 },
  priceInput: { flex: 1, marginRight: 8, backgroundColor: '#111' },
  aiCard: { margin: 12, padding: 12, borderRadius: 12 },
});
