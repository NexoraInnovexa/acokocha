import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { TextInput, Button, Title, Paragraph, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../utils/colors';
import { supabase } from '../utils/supabaseClient';

export default function SellCarScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [condition, setCondition] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (images.length >= 3) {
      Alert.alert('Limit Reached', 'You can upload up to 3 images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0]]);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

const submit = async () => {
  if (!name || !phone || !make || !model || !year) {
    Alert.alert('Missing Info', 'Please fill out all required fields.');
    return;
  }

  setLoading(true);

  try {
    let imageUrls = [];

    for (let i = 0; i < images.length; i++) {
      try {
        const file = images[i];
        const fileExt = file.uri.split('.').pop();
        const fileName = `${Date.now()}_${i}.${fileExt}`;

        // Fetch local file as array buffer
        const response = await fetch(file.uri);
        const arrayBuffer = await response.arrayBuffer();
        const fileBlob = new Uint8Array(arrayBuffer);

        // Upload to Supabase
        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(fileName, fileBlob, { upsert: true });

        if (error) {
          console.error('Image upload error:', error.message);
          continue; // skip failed uploads
        }

        // Get public URL
        const { data: publicData } = supabase.storage
          .from('uploads')
          .getPublicUrl(fileName);
        imageUrls.push(publicData.publicUrl);
      } catch (imgErr) {
        console.error('Error uploading image:', imgErr);
      }
    }

    // Insert into database
    const { error } = await supabase.from('sell_requests').insert([
      {
        name,
        phone,
        make,
        model,
        year,
        mileage,
        condition,
        images: imageUrls,
        user_id: null, // not required
      },
    ]);

    if (error) {
      console.error('Insert error:', error);
      Alert.alert('Error', 'Failed to submit. Please try again.');
      return;
    }

    Alert.alert(
      'Submission Received ✅',
      `Thank you, ${name}! Our team will contact you soon regarding your ${year} ${make} ${model}.`
    );

    // Reset form
    setName('');
    setPhone('');
    setMake('');
    setModel('');
    setYear('');
    setMileage('');
    setCondition('');
    setImages([]);
  } catch (err) {
    console.error('Submit error:', err);
    Alert.alert('Error', 'Something went wrong. Please try again.');
  } finally {
    setLoading(false); // stop loading in all cases
  }
};



  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#000' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
        <Title style={styles.title}>Sell Your Car</Title>
        <Paragraph style={styles.subtitle}>
          Tell us about your car and upload 1-3 images.
        </Paragraph>

        <TextInput
          label="Your Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
          textColor="#fff"
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
          label="Car Make"
          value={make}
          onChangeText={setMake}
          style={styles.input}
          mode="outlined"
          textColor="#fff"
        />
        <TextInput
          label="Car Model"
          value={model}
          onChangeText={setModel}
          style={styles.input}
          mode="outlined"
          textColor="#fff"
        />
        <TextInput
          label="Year"
          value={year}
          onChangeText={setYear}
          style={styles.input}
          keyboardType="numeric"
          mode="outlined"
          textColor="#fff"
        />
        <TextInput
          label="Mileage (km)"
          value={mileage}
          onChangeText={setMileage}
          style={styles.input}
          keyboardType="numeric"
          mode="outlined"
          textColor="#fff"
        />
        <TextInput
          label="Condition"
          value={condition}
          onChangeText={setCondition}
          style={styles.input}
          multiline
          numberOfLines={3}
          mode="outlined"
          textColor="#fff"
        />

        {/* Image upload */}
        <View style={{ flexDirection: 'row', marginVertical: 8 }}>
          {images.map((img, idx) => (
            <View key={idx} style={{ marginRight: 8 }}>
              <Image source={{ uri: img.uri }} style={{ width: 80, height: 80, borderRadius: 6 }} />
              <IconButton
                icon="close"
                size={20}
                onPress={() => removeImage(idx)}
                style={{ position: 'absolute', top: -10, right: -10 }}
              />
            </View>
          ))}
          {images.length < 3 && (
            <Button
              mode="outlined"
              onPress={pickImage}
              style={{ height: 80, justifyContent: 'center' }}
            >
              + Add Image
            </Button>
          )}
        </View>

        <Button
          mode="contained"
          onPress={submit}
          style={styles.btn}
          loading={loading}
          disabled={loading}
          textColor="#000"
        >
          Send for Evaluation
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
