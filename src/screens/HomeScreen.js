import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, FlatList, Image } from 'react-native';
import { Title, Paragraph, Button, Card, Chip, TextInput } from 'react-native-paper';
import { colors } from '../utils/colors';
import CarCard from '../components/CarCard';
import * as Animatable from 'react-native-animatable';
import { supabase } from '../utils/supabaseClient';

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [maxMileage, setMaxMileage] = useState('');
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [aiDescriptions, setAiDescriptions] = useState({});
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [user, setUser] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch user
  useEffect(() => {
  const fetchUser = async () => {
    const { data: { user: currentUser }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error fetching user:', error);
      return;
    }
    setUser(currentUser);

    // Check if user is admin
    // For example, assuming you store a 'role' field in the user metadata
    const role = currentUser?.user_metadata?.role; // or wherever your role is
    setIsAdmin(role === 'admin');
  };
  fetchUser();
}, []);

  // Fetch promotions
  useEffect(() => {
    const fetchPromotions = async () => {
      let { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true);
      if (!error && data) setPromotions(data);
    };
    fetchPromotions();
  }, []);

  // Fetch cars
  useEffect(() => {
    const fetchCars = async () => {
      let { data: carsData, error } = await supabase.from('cars').select('*');
      if (!error && carsData) {
        setCars(carsData);
        setFilteredCars(carsData);
        const uniqueCategories = [...new Set(carsData.map(c => c.category))];
        setCategories(uniqueCategories);
      }
    };
    fetchCars();
  }, []);

  // Filter cars
  useEffect(() => {
    let tempCars = [...cars];

    if (searchQuery) {
      tempCars = tempCars.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory) tempCars = tempCars.filter(c => c.category === selectedCategory);
    if (brand) tempCars = tempCars.filter(c => c.brand.toLowerCase().includes(brand.toLowerCase()));
    if (model) tempCars = tempCars.filter(c => c.model.toLowerCase().includes(model.toLowerCase()));
    if (minPrice) tempCars = tempCars.filter(c => c.price >= parseFloat(minPrice));
    if (maxPrice) tempCars = tempCars.filter(c => c.price <= parseFloat(maxPrice));
    if (maxMileage) tempCars = tempCars.filter(c => c.mileage <= parseFloat(maxMileage));

    setFilteredCars(tempCars);

    // AI descriptions
    tempCars.forEach(car => {
      if (!aiDescriptions[car.id]) {
        setAiDescriptions(prev => ({
          ...prev,
          [car.id]: `Experience the amazing ${car.title} with top-notch features and unbeatable value!`,
        }));
      }
    });
  }, [searchQuery, selectedCategory, brand, model, minPrice, maxPrice, maxMileage, cars]);

  const handleChat = () => {
    if (!userQuery) return;
    setAiResponse(`Based on your input: "${userQuery}", we suggest the following cars: ${cars
      .filter(c => c.price <= 50000)
      .map(c => c.title)
      .join(', ')}`);
    setUserQuery('');
  };


  const getBadgeStyle = (badge) => {
    switch (badge) {
      case 'Sold':
        return { backgroundColor: '#E74C3C' }; // red
      case 'Hot Deal':
        return { backgroundColor: '#E67E22' }; // orange
      case 'New Arrival':
        return { backgroundColor: '#27AE60' }; // green
      default:
        return { display: 'none' };
    }
  };

  const featuredCars = [...cars].sort(() => 0.5 - Math.random()).slice(0, 10);

  return (
    <ScrollView style={styles.container}>
      {/* Hero */}
      <Card style={styles.hero}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title style={styles.title}>A.C.OKOCHA MOTORS</Title>
            {!user && (
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Button mode="outlined" compact onPress={() => navigation.navigate('Login')} style={{ borderColor: colors.accent }} textColor={colors.accent}>Login</Button>
                <Button mode="contained" compact onPress={() => navigation.navigate('SignUp')} style={{ backgroundColor: colors.accent }}>Sign Up</Button>
              </View>
            )}
          </View>
          {user && <Paragraph style={styles.subtitle}>Welcome, {user?.user_metadata?.role === 'admin' ? 'Admin' : user.user_metadata?.name || 'User'}!</Paragraph>}
          {!user && <Paragraph style={styles.subtitle}>Buy, Sell & Service — Fast, Reliable, Local</Paragraph>}

          {/* Search & Filter Inputs */}
          <TextInput placeholder="Search cars..." value={searchQuery} onChangeText={setSearchQuery} style={styles.searchBarHero} mode="outlined" textColor="#fff" />
          <View style={styles.filterRow}>
            <TextInput placeholder="Brand" value={brand} onChangeText={setBrand} style={styles.filterInput} mode="outlined" textColor="#fff" />
            <TextInput placeholder="Model" value={model} onChangeText={setModel} style={styles.filterInput} mode="outlined" textColor="#fff" />
            <TextInput placeholder="Min Price" value={minPrice} onChangeText={setMinPrice} style={styles.filterInput} keyboardType="numeric" mode="outlined"  textColor="#fff"/>
            <TextInput placeholder="Max Price" value={maxPrice} onChangeText={setMaxPrice} style={styles.filterInput} keyboardType="numeric" mode="outlined" textColor="#fff" />
            <TextInput placeholder="Max Mileage" value={maxMileage} onChangeText={setMaxMileage} style={styles.filterInput} keyboardType="numeric" mode="outlined"  textColor="#fff"/>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Button mode="contained" onPress={() => navigation.navigate('Cars')} style={styles.quickBtn}>Explore Cars</Button>
            <Button mode="contained" onPress={() => navigation.navigate('Sell')} style={styles.quickBtn}>Sell Your Car</Button>
            <Button mode="contained" onPress={() => navigation.navigate('Book')} style={styles.quickBtn}>Book Service</Button>
          </View>

          {isAdmin && (
           <Button
            mode="contained"
            style={{ margin: 12 }}
            onPress={() => navigation.navigate('Admin')}
           >
            Go Back to Admin
          </Button>
          )}

        </Card.Content>
      </Card>



      {/* Categories */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={item => item}
        style={styles.categoryList}
        renderItem={({ item }) => (
          <Chip
            mode={selectedCategory === item ? 'flat' : 'outlined'}
            onPress={() => setSelectedCategory(item === selectedCategory ? null : item)}
            style={{ marginRight: 8 }}
          >
            {item}
          </Chip>
        )}
      />

      {/* Promotions */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={promotions}
        keyExtractor={item => item.id.toString()}
        style={{ marginVertical: 12 }}
        renderItem={({ item }) => (
          <Card style={{ backgroundColor: item.bg || colors.accent, marginRight: 12, padding: 12, borderRadius: 8 }}>
            <Paragraph style={{ color: '#fff', fontWeight: 'bold' }}>{item.title || 'Promotion'}</Paragraph>
          </Card>
        )}
        ListEmptyComponent={<Paragraph style={{ color: '#fff', marginLeft: 12 }}>No active promotions</Paragraph>}
      />

      {/* Featured Cars */}
      <Title style={styles.sectionTitle}>Featured Cars</Title>
<View style={{ paddingHorizontal: 12 }}>
  {featuredCars.map(car => {
    const badgeText = car.sold
      ? 'Sold'
      : car.isHotDeal
      ? 'Hot Deal'
      : car.isNew
      ? 'New Arrival'
      : null;

    const imageUrl =
      car.images && car.images.length > 0
        ? car.images[0]
        : 'https://via.placeholder.com/240x180';

    return (
      <Animatable.View
        animation="fadeInUp"
        duration={800}
        key={car.id}
        style={{ marginBottom: 16 }}
      >
        <Card
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: '#111',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {/* Image */}
          <View style={{ width: 290, height: 180 }}>
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%', borderRadius: 12 }}
              resizeMode="cover"
            />

            {/* Badge */}
            {badgeText && (
              <View
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  backgroundColor:
                    badgeText === 'Sold'
                      ? '#E74C3C'
                      : badgeText === 'Hot Deal'
                      ? '#E67E22'
                      : '#27AE60',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
              >
                <Paragraph
                  style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}
                >
                  {badgeText}
                </Paragraph>
              </View>
            )}
          </View>

          {/* Info Section */}
          <View style={{ flex: 1, padding: 16, justifyContent: 'space-between' }}>
            <View>
              <Title style={{ color: '#fff', fontSize: 19,fontWeight: '700', marginBottom: 6 }}>
                {car.title}
              </Title>
              <Paragraph style={{ color: '#fff', fontSize: 16 }}>
                Brand: {car.brand || 'N/A'}
              </Paragraph>
              <Paragraph style={{ color: '#fff', fontSize: 16 }}>
                Model: {car.model || 'N/A'}
              </Paragraph>
              <Paragraph style={{ color: '#fff', fontSize: 16 }}>
                Year: {car.year || 'N/A'}
              </Paragraph>
              <Paragraph style={{ color: '#fff', fontSize: 16}}>
                Price: ${car.price || 'N/A'}
              </Paragraph>
              <Paragraph style={{ color: '#fff', fontSize: 16 }}>
                Status: {car.sold ? 'Sold' : 'Available'}
              </Paragraph>
              <Paragraph style={{ color: '#fff', fontSize: 16, marginTop: 6 }}>
                {car.description?.trim() ? car.description : aiDescriptions[car.id] || 'No description'}
              </Paragraph>
            </View>

            {/* View Button */}
            <Button
              mode="contained"
              onPress={() => navigation.navigate('CarDetails', { carId: car.id })}
              style={{
                marginTop: 12,
                backgroundColor: '#f87509f5',
                borderRadius: 8,
                paddingVertical: 8,
                alignSelf: 'flex-start',
              }}
              textColor="#000"
            >
              View
            </Button>
          </View>
        </Card>
      </Animatable.View>
    );
  })}
</View>


      {/* AI Chat */}
      <Card style={styles.aiCard}>
        <Card.Content>
          <Title style={{ color: colors.accent, fontSize: 18 }}>Chat with AI</Title>
          <Paragraph style={{ color: colors.text, marginBottom: 8 }}>Not sure which car to buy? Tell our AI your preference or budget.</Paragraph>
          <TextInput placeholder="E.g., I want a SUV under $30,000" value={userQuery} onChangeText={setUserQuery} mode="outlined" textColor={colors.text} style={{ backgroundColor: '#111', marginBottom: 8, color: colors.text }} />
          <Button mode="contained" onPress={handleChat} style={{ backgroundColor: colors.accent }}>Get Suggestions</Button>
          {aiResponse ? <Paragraph style={{ color: colors.text, marginTop: 8 }}>{aiResponse}</Paragraph> : null}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingBottom: 50 },
  searchBarHero: { marginVertical: 12, backgroundColor: '#111', color: colors.text },
  hero: { backgroundColor: colors.primary, margin: 12, borderRadius: 12, paddingVertical: 16 },
  title: { color: colors.accent, fontSize: 22 , marginTop:40},
  subtitle: { color: colors.text, marginVertical: 8 },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  quickBtn: { marginRight: 8, marginTop: 6, backgroundColor: colors.accent },
  categoryList: { paddingLeft: 12, marginTop: 12 },
  sectionTitle: { color: colors.text, marginLeft: 12, marginTop: 16, fontSize: 18 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, marginBottom: 12, paddingHorizontal: 12 },
  filterInput: { flex: 1, marginRight: 8, marginBottom: 8, backgroundColor: '#111', color: colors.text },
  aiCard: { margin: 12, padding: 12, borderRadius: 12, backgroundColor: '#111', color: colors.text },
});
