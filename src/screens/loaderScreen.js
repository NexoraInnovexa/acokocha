import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function LoaderScreen() {
  const navigation = useNavigation();
  const fullText = 'Welcome to AC OKOCHA Motors';
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    // Typing animation
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      setTypedText(fullText.slice(0, currentIndex + 1));
      currentIndex++;
      if (currentIndex === fullText.length) clearInterval(typingInterval);
    }, 100); // adjust speed (ms) per letter

    // Navigate after animation + text finish
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 4000); // adjust to match your animation length

    return () => {
      clearInterval(typingInterval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Car Animation */}
      <LottieView
        source={require('../assets/car-moving.json')} // your downloaded car animation
        autoPlay
        loop // subtle looping so car moves continuously
        style={styles.animation}
      />

      {/* Typing Text */}
      <Text style={styles.welcomeText}>{typedText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Black background
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: width * 0.8,   // Bigger car
    height: width * 0.5,
  },
  welcomeText: {
    marginTop: 30,
    color: '#FFA500',      // Orange text
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
});
