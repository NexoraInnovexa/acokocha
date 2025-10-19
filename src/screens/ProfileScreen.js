import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Paragraph, Button, Avatar } from 'react-native-paper';
import { colors } from '../utils/colors';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Avatar.Text size={80} label="DS" style={{ backgroundColor: colors.accent }} />
      <Title style={styles.name}>DriveSmart Autos</Title>
      <Paragraph style={styles.info}>Contact: +234 800 000 0000</Paragraph>
      <Paragraph style={styles.info}>Address: 123 Auto Lane, Lagos</Paragraph>

      <Button mode="contained" style={styles.btn} onPress={() => alert('Open messages')}>
        Messages
      </Button>
      <Button mode="outlined" style={[styles.btn, { marginTop: 8 }]} onPress={() => alert('Admin login')}>
        Admin Login
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', paddingTop: 40 },
  name: { color: colors.text, marginTop: 12 },
  info: { color: colors.muted, marginTop: 6 },
  btn: { marginTop: 16, backgroundColor: colors.accent, width: '60%' }
});
