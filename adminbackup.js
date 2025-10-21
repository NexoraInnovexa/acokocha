import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, Image ,ActivityIndicator } from 'react-native';
import { TextInput, Button, Title, Paragraph, Card, Chip, Text, Menu } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../utils/supabaseClient';
import { colors } from '../utils/colors';

import * as FileSystem from 'expo-file-system/legacy';
import { decode as atob } from 'base-64'; // add this line at top too

import AsyncStorage from '@react-native-async-storage/async-storage'; 




export default function AdminDashboard() {
  // Car form states
  const [cars, setCars] = useState([]);
  const [title, setTitle] = useState('');
  const [make, setMake] = useState('');
  const [description,setDescription]=useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [mileage, setMileage] = useState('');
  const [category, setCategory] = useState('');
  const [fuel, setFuel] = useState('');
  const [isHotDeal, setIsHotDeal] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [images, setImages] = useState([]); // Cloudinary URLs
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); 

  const [search, setSearch] = useState('');
  const [promoTitle, setPromoTitle] = useState('');
  const [promoBg, setPromoBg] = useState('#ff0000');
  const [isPromoActive, setIsPromoActive] = useState(true);
  const [newCategory, setNewCategory] = useState('');


  const [showDropDown, setShowDropDown] = useState(false);


  // Sell Requests
  const [sellRequests, setSellRequests] = useState([]);

  // Bookings
  const [bookings, setBookings] = useState([]);

  // AI Chats
  const [aiChats, setAiChats] = useState([]);

  // Promotions
  const [promotions, setPromotions] = useState([]);

  // Category dropdown menu
  const [categories, setCategories] = useState([]);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);

  // Fetch all data
  const fetchAllData = async () => {
  try {
    const { data: carsData, error: carsErr } = await supabase
      .from('cars')
      .select('*')
      .order('id', { ascending: false });
    if (carsErr) console.error('Error fetching cars:', carsErr);

    const { data: sellData } = await supabase.from('sell_requests').select('*').order('created_at', { ascending: false });
    const { data: bookingsData } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    const { data: aiData } = await supabase.from('ai_chats').select('*').order('created_at', { ascending: false });

    setCars(carsData || []);
    setSellRequests(sellData || []);
    setBookings(bookingsData || []);
    setAiChats(aiData || []);
  } catch (err) {
    console.error('Fetch all data error:', err);
  }
};


  const addCategory = async () => {
  if (!newCategory) return Alert.alert('Missing Info', 'Enter category name');

  try {
    const { error } = await supabase.from('categories').insert([{ name: newCategory }]);
    if (error) return Alert.alert('Error', error.message);

    Alert.alert('Success', 'Category added');
    setNewCategory('');
    fetchCategories(); // refresh the list
  } catch (err) {
    console.error('Add category error:', err);
    Alert.alert('Error', 'Failed to add category');
  }
};

  const addPromotion = async () => {
  if (!promoTitle) return Alert.alert('Missing Info', 'Enter a promotion title');

  try {
    const { error } = await supabase.from('promotions').insert([{
      title: promoTitle,
      bg: promoBg,
      is_active: isPromoActive
    }]);
    
    if (error) return Alert.alert('Error', error.message);

    Alert.alert('Success', 'Promotion added');
    setPromoTitle(''); // reset form
    fetchPromotions();  // refresh
  } catch (err) {
    console.error('Add promotion error:', err);
    Alert.alert('Error', 'Failed to add promotion');
  }
};

  // Fetch active promotions
  const fetchPromotions = async () => {
    const { data, error } = await supabase.from('promotions').select('*').eq('is_active', true);
    if (!error && data) setPromotions(data);
  };

  useEffect(() => {
    fetchAllData();
    fetchPromotions();
    fetchCategories(); 
  }, []);

  // Pick images from device
const pickImages = async () => {
  try {
    // Ask for permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please grant access to your photos.');
      return;
    }

    // Launch picker
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      selectionLimit: 5,
    });

    if (result.canceled) {
      console.log('User cancelled image picker');
      return;
    }

    const selectedAssets = result.assets || [];
    console.log('📸 Selected images:', selectedAssets);

    // Upload to Supabase
    const uploadResult = await uploadImagesToSupabase(selectedAssets);
    if (uploadResult.success) {
      setImages(uploadResult.urls.map(u => u.publicUrl || u));
    } else {
      Alert.alert('Upload failed', 'Could not upload one or more images.');
    }
  } catch (err) {
    console.error('💥 pickImages error:', err);
    Alert.alert('Error', 'Image picking failed.');
  }
};

  


const BUCKET = 'uploads';
const TABLE = 'cars';

const uploadImagesToSupabase = async (assets, carId = null) => {
  const runId = `upload-${Date.now()}`;
  console.log(`\n🟢 [${runId}] Starting uploadImagesToSupabase — ${assets?.length ?? 0} assets`);

  if (!assets || assets.length === 0) {
    Alert.alert('Error', 'No images selected.');
    return { success: false, error: 'no_assets' };
  }

  const uploadedUrls = [];

  try {
    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      console.log(`➡️ [${runId}] Uploading asset #${i}`, asset);

      try {
        // ✅ Read file as base64 using the legacy API
        const base64Data = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Convert base64 to Uint8Array for Supabase
        const binary = atob(base64Data);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let j = 0; j < len; j++) bytes[j] = binary.charCodeAt(j);

        // Generate unique filename
        const fileName = `photo_${Date.now()}_${i}.jpg`;

        // 🧩 Upload to Supabase Storage
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(fileName, bytes, {
            contentType: asset.mimeType || 'image/jpeg',
          });

        if (uploadErr) {
          console.error(`❌ Upload failed for #${i}:`, uploadErr);
          continue;
        }

        // ✅ Get public URL
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(fileName);

        const publicUrl = publicUrlData?.publicUrl;
        if (!publicUrl) {
          console.warn(`⚠️ No public URL returned for ${fileName}`);
          continue;
        }

        uploadedUrls.push(publicUrl);
        console.log(`✅ Uploaded #${i}: ${publicUrl}`);

        // ✅ Update car record’s images array if carId provided
        if (carId) {
          const { data: carData, error: fetchErr } = await supabase
            .from(TABLE)
            .select('images')
            .eq('id', carId)
            .single();

          if (!fetchErr) {
            const currentImages = carData?.images || [];
            const updatedImages = [...currentImages, publicUrl];
            const { error: updateErr } = await supabase
              .from(TABLE)
              .update({ images: updatedImages })
              .eq('id', carId);

            if (updateErr)
              console.error(`⚠️ Failed to update car ${carId}:`, updateErr);
            else console.log(`🧾 Updated car ${carId} with new image.`);
          }
        }

        setUploadProgress((i + 1) / assets.length);
      } catch (perAssetErr) {
        console.error(`💥 Error uploading asset #${i}:`, perAssetErr);
      }
    }

    setImages(uploadedUrls);
    setUploading(false);

    if (uploadedUrls.length > 0)
      Alert.alert('✅ Success', `Uploaded ${uploadedUrls.length} image(s)!`);
    else Alert.alert('Error', 'No images were uploaded.');

    console.log(`🏁 [${runId}] Upload complete — ${uploadedUrls.length} images`);
    return { success: uploadedUrls.length > 0, urls: uploadedUrls };
  } catch (err) {
    console.error(`💥 [${runId}] Top-level error:`, err);
    setUploading(false);
    Alert.alert('Error', 'Image upload failed.');
    return { success: false, error: err };
  }
};

  // ✅ Fetch all categories from Supabase
const fetchCategories = async () => {
  try {
    const { data, error } = await supabase.from('categories').select('name');
    if (error) throw error;

    if (data && Array.isArray(data)) {
      const names = data.map(c => c.name);
      setCategories(names);
      console.log('Fetched categories:', names);
    }
  } catch (err) {
    console.error('Fetch categories error:', err);
  }
};


  
  
  
  // Add a new car
  const addCar = async () => {
    if (!title || !make || !model || !year || !description || images.length === 0) {
      return Alert.alert('Missing Info', 'Please fill all fields and upload at least one image');
    }

    try {
      const { error } = await supabase.from('cars').insert([{
        title, make, model, description, year: parseInt(year), price: parseInt(price || 0),
        mileage: parseInt(mileage || 0), category, fuel, isHotDeal, isNew, sold: false,
        images
      }]);

      if (error) return Alert.alert('Error', error.message);

      Alert.alert('Success', 'Car added successfully');
      resetForm();
      fetchAllData();
    } catch (err) {
      console.error('Add car error:', err);
      Alert.alert('Error', 'Failed to add car');
    }
  };

  // Edit car
  const startEditCar = (car) => {
    setEditingCar(car);
    setTitle(car.title);
    setMake(car.make);
    setModel(car.model);
    setYear(car.year.toString());
    setPrice(car.price.toString());
    setMileage(car.mileage.toString());
    setCategory(car.category);
    setDescription(car.description);
    setFuel(car.fuel);
    setIsHotDeal(car.ishotdeal);
    setIsNew(car.isNew);
    setImages(car.images || []);
  };

  // Update car
// 🧩 Update car details + auto-delete old images if replaced
const updateCar = async (id, updatedData) => {
  try {
    console.log('🧾 Starting update for car ID:', id);

    // Fetch existing car record first
    const { data: existingCar, error: fetchErr } = await supabase
      .from('cars')
      .select('images')
      .eq('id', id)
      .single();

    if (fetchErr) {
      console.error('❌ Failed to fetch existing car before update:', fetchErr);
      return Alert.alert('Error', 'Could not fetch existing car data.');
    }

    const oldImages = existingCar?.images || [];
    const newImages = updatedData?.images || [];

    // Proceed to update car record
    const { error: updateErr } = await supabase
      .from('cars')
      .update(updatedData)
      .eq('id', id);

    if (updateErr) {
      console.error('❌ Failed to update car record:', updateErr);
      return Alert.alert('Error', 'Failed to update car.');
    }

    // Compare old vs new — delete only images that were replaced/removed
    const imagesToDelete = oldImages.filter((img) => !newImages.includes(img));

    if (imagesToDelete.length > 0) {
      console.log('🧹 Deleting replaced images:', imagesToDelete);

      const fileNames = imagesToDelete.map((url) => {
        try {
          const parts = url.split('/');
          return parts[parts.length - 1];
        } catch {
          return null;
        }
      }).filter(Boolean);

      // Delete from Supabase Storage
      const { error: storageErr } = await supabase.storage
        .from(BUCKET)
        .remove(fileNames);

      if (storageErr) console.warn('⚠️ Failed to delete replaced images:', storageErr);

      // Delete from images table too (optional)
      const { error: dbErr } = await supabase
        .from(TABLE)
        .delete()
        .in('file_name', fileNames);

      if (dbErr) console.warn('⚠️ Failed to delete from images table:', dbErr);
    }

    Alert.alert('Success', 'Car updated successfully.');
    fetchAllData();
  } catch (err) {
    console.error('💥 updateCar() error:', err);
    Alert.alert('Error', 'An unexpected error occurred while updating car.');
  }
};


  const resetForm = () => {
    setTitle(''); setMake(''); setModel(''); setYear(''); setPrice('');
    setMileage(''); setDescription(''); setCategory(''); setFuel(''); setIsHotDeal(false);
    setIsNew(false); setImages([]);
  };

  // 🧹 Delete a car + its images from Supabase
const deleteCar = async (id) => {
  try {
    // Fetch car first to get image filenames
    const { data: carData, error: fetchErr } = await supabase
      .from('cars')
      .select('images')
      .eq('id', id)
      .single();

    if (fetchErr) {
      console.error('❌ Error fetching car before delete:', fetchErr);
      return Alert.alert('Error', 'Could not fetch car details before delete');
    }

    const imageUrls = carData?.images || [];
    console.log('🧾 Images to delete:', imageUrls);

    // Extract file names from URLs
    const fileNames = imageUrls
      .map((url) => {
        try {
          const parts = url.split('/');
          return parts[parts.length - 1]; // e.g., photo_1234_0.jpg
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    // Delete car from DB
    const { error: deleteErr } = await supabase.from('cars').delete().eq('id', id);
    if (deleteErr) {
      console.error('❌ Failed to delete car record:', deleteErr);
      return Alert.alert('Error', 'Failed to delete car');
    }

    // Delete all images from Supabase Storage + images table
    if (fileNames.length > 0) {
      console.log('🧹 Deleting related images:', fileNames);
      const { error: storageErr } = await supabase.storage
        .from(BUCKET)
        .remove(fileNames);

      if (storageErr) console.error('⚠️ Failed to delete from storage:', storageErr);

      const { error: dbErr } = await supabase
        .from(TABLE)
        .delete()
        .in('file_name', fileNames);

      if (dbErr) console.error('⚠️ Failed to delete from images table:', dbErr);
    }

    Alert.alert('Success', 'Car and related images deleted successfully');
    fetchAllData();
  } catch (err) {
    console.error('💥 Delete car + images error:', err);
    Alert.alert('Error', 'Failed to delete car and its images');
  }
};


  const markSold = async (id) => {
    try {
      const { error } = await supabase.from('cars').update({ sold: true }).eq('id', id);
      if (error) return Alert.alert('Error', error.message);
      fetchAllData();
    } catch (err) {
      console.error('Mark sold error:', err);
    }
  };

  const filteredCars = cars.filter(car =>
    car.title?.toLowerCase().includes(search.toLowerCase()) ||
    car.make?.toLowerCase().includes(search.toLowerCase()) ||
    car.model?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#000' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
        <Title style={styles.title}>Admin Dashboard</Title>
        <Paragraph style={styles.subtitle}>Manage Cars, Promotions, Sell Requests, Bookings & AI Communications</Paragraph>

        {/* Promotions */}
        {promotions.length === 0 ? (
          <Paragraph style={{ color: '#aaa' }}>No active promotions</Paragraph>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
            {promotions.map(promo => (
              <Card key={promo.id} style={{ backgroundColor: promo.bg, marginRight: 12, padding: 12, borderRadius: 8 }}>
                <Paragraph style={{ color: '#fff', fontWeight: 'bold' }}>{promo.title}</Paragraph>
              </Card>
            ))}
          </ScrollView>
        )}

        {/* Search */}
        <TextInput
          label="Search Cars"
          value={search}
          onChangeText={setSearch}
          style={styles.input}
          mode="outlined"
          textColor="#fff"
        />

        {/* Add/Edit Car */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={{ color: colors.accent }}>Add New Car</Title>
            <TextInput label="Title" value={title} onChangeText={setTitle} style={styles.input} mode="outlined" textColor="#fff" />
             <TextInput label="Description" value={description} onChangeText={setDescription} style={styles.input} mode="outlined" textColor="#fff" />
            <TextInput label="Make" value={make} onChangeText={setMake} style={styles.input} mode="outlined" textColor="#fff" />
            <TextInput label="Model" value={model} onChangeText={setModel} style={styles.input} mode="outlined" textColor="#fff" />
            <TextInput label="Year" value={year} onChangeText={setYear} style={styles.input} mode="outlined" keyboardType="numeric" textColor="#fff" />
            <TextInput label="Price" value={price} onChangeText={setPrice} style={styles.input} mode="outlined" keyboardType="numeric" textColor="#fff" />
            <TextInput label="Mileage" value={mileage} onChangeText={setMileage} style={styles.input} mode="outlined" keyboardType="numeric" textColor="#fff" />

            {/* Category Dropdown */}
 <View style={{ paddingHorizontal: 12, marginVertical: 8 }}>
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    {categories.map((cat, idx) => (
      <Button
        key={idx}
        mode={category === cat ? 'contained' : 'outlined'}
        onPress={() => setCategory(cat)}
        style={{
          marginRight: 8,
          backgroundColor: category === cat ? '#FFA500' : '#111',
          borderColor: '#FFA500',
        }}
        textColor={category === cat ? '#000' : '#fff'}
      >
        {cat}
      </Button>
    ))}
  </ScrollView>
</View>



            <TextInput label="Fuel" value={fuel} onChangeText={setFuel} style={styles.input} mode="outlined" placeholder="Petrol, Diesel, Electric" textColor="#fff" />

            <View style={{ flexDirection: 'row', marginVertical: 8 }}>
              <Chip mode={isHotDeal ? 'flat' : 'outlined'} onPress={() => setIsHotDeal(!isHotDeal)} style={{ marginRight: 8 }}>
                {isHotDeal ? 'Hot Deal ✅' : 'Hot Deal'}
              </Chip>
              <Chip mode={isNew ? 'flat' : 'outlined'} onPress={() => setIsNew(!isNew)}>
                {isNew ? 'New Arrival ✅' : 'New Arrival'}
              </Chip>
            </View>

            {uploading && (
              <>
                <Text style={{ color: '#fff', marginVertical: 8 }}>
                  Uploading {uploadProgress} / {images.length + (uploading ? 0 : 0)} images...
                </Text>
                <ActivityIndicator animating={true} color={colors.accent} style={{ marginBottom: 8 }} />
              </>
            )}

            <Button mode="outlined" onPress={pickImages} style={{ marginVertical: 8 }}>Upload Images (3-5)</Button>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 }}>
              {images.map((url, i) => (
                <Image key={i} source={{ uri: url }} style={{ width: 80, height: 80, marginRight: 8, marginBottom: 8 }} />
              ))}
            </View>

            <Button mode="contained" onPress={editingCar ? updateCar : addCar} style={styles.btn} textColor="#000">
              {editingCar ? 'Update Car' : 'Add Car'}
            </Button>
          </Card.Content>
        </Card>



        <Card style={styles.card}>
          <Card.Content>
           <Title style={{ color: colors.accent }}>Add Promotion</Title>
           <TextInput
             label="Title"
             value={promoTitle}
             onChangeText={setPromoTitle}
             style={styles.input}
             mode="outlined"
             textColor="#fff"
            />
            <TextInput
             label="Background Color"
             value={promoBg}
             onChangeText={setPromoBg}
             style={styles.input}
             mode="outlined"
             placeholder="#ff0000"
             textColor="#fff"
             />
            <Button mode="contained" onPress={addPromotion} style={styles.btn}>
               Add Promotion
             </Button>
          </Card.Content>
         </Card>


         <Card style={styles.card}>
          <Card.Content>
           <Title style={{ color: colors.accent }}>Add Category</Title>
           <TextInput
            label="Category Name"
            value={newCategory}
            onChangeText={setNewCategory}
            style={styles.input}
            mode="outlined"
            textColor="#fff"
          />
          <Button mode="contained" onPress={addCategory} style={styles.btn}>
            Add Category
          </Button>
         </Card.Content>
        </Card>



        {/* --- Cars List --- */}
        <Title style={{ color: colors.accent, marginTop: 20 }}>Cars</Title>
        {filteredCars.map(car => (
          <Card key={car.id} style={styles.card}>
            <Card.Content>
              <Text style={{ color: '#fff' }}>{car.title} ({car.make} {car.model})</Text>
              <Paragraph style={{ color: '#aaa' }}>Price: ${car.price} | Year: {car.year} | Description: {car.description} | Sold: {car.sold ? '✅' : '❌'}</Paragraph>

              {/* Images */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
                {car.images?.map((url, idx) => (
                  <Image 
                    key={idx} 
                    source={{ uri: url }} 
                    style={{ width: 100, height: 80, marginRight: 8, borderRadius: 4 }} 
                  />
                ))}
              </ScrollView>

              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <Button mode="outlined" onPress={() => startEditCar(car)} style={{ marginRight: 8 }}>Edit</Button>
                <Button mode="outlined" onPress={() => deleteCar(car.id)} style={{ marginRight: 8 }}>Delete</Button>
                {!car.sold && <Button mode="outlined" onPress={() => markSold(car.id)}>Mark Sold</Button>}
              </View>
            </Card.Content>
          </Card>
        ))}

        {/* --- Sell Requests --- */}
        <Title style={{ color: colors.accent, marginTop: 20 }}>Sell Requests</Title>
        {sellRequests.map(req => (
          <Card key={req.id} style={styles.card}>
            <Card.Content>
              <Text style={{ color: '#fff' }}>User: {req.username}</Text>
              <Text style={{ color: '#aaa' }}>Car: {req.car_model} | Price: {req.price}</Text>
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <Button mode="outlined" style={{ marginRight: 8 }}>Accept</Button>
                <Button mode="outlined">Reject</Button>
              </View>
            </Card.Content>
          </Card>
        ))}

        {/* --- Bookings --- */}
        <Title style={{ color: colors.accent, marginTop: 20 }}>Bookings</Title>
        {bookings.map(b => (
          <Card key={b.id} style={styles.card}>
            <Card.Content>
              <Text style={{ color: '#fff' }}>User: {b.username}</Text>
              <Text style={{ color: '#aaa' }}>Car: {b.car_model} | Date: {b.date}</Text>
            </Card.Content>
          </Card>
        ))}

        {/* --- AI Communications --- */}
        <Title style={{ color: colors.accent, marginTop: 20 }}>AI Communications</Title>
        {aiChats.map(c => (
          <Card key={c.id} style={styles.card}>
            <Card.Content>
              <Text style={{ color: '#fff' }}>User: {c.username}</Text>
              <Text style={{ color: '#aaa' }}>Message: {c.message}</Text>
            </Card.Content>
          </Card>
        ))}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}




const styles = StyleSheet.create({
  container: { backgroundColor: '#000', padding: 12 },
  title: { color: colors.accent, fontSize: 22, marginBottom: 6 ,marginTop:40},
  subtitle: { color: colors.text, marginBottom: 12 },
  input: { marginVertical: 8, backgroundColor: '#111' },
  btn: { marginTop: 16, backgroundColor: colors.accent },
  card: { marginVertical: 6, padding: 8, backgroundColor: '#111' },
});
