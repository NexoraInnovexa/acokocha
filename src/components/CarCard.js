import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { colors } from '../utils/colors';

export default function CarCard({ item, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Image source={{ uri: item.images[0] }} style={styles.image} />
          <View style={styles.info}>
            <Title style={styles.title}>{item.title}</Title>
            <Paragraph style={styles.price}>{item.price}</Paragraph>
            <Paragraph style={styles.meta}>{item.year} • {item.mileage}</Paragraph>
            <Button mode="contained" onPress={onPress} style={styles.btn}>View</Button>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    marginVertical: 8,
    marginHorizontal: 12,
    borderRadius: 12
  },
  content: {
    flexDirection: 'row',
    padding: 8
  },
  image: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginRight: 12
  },
  info: {
    flex: 1,
    justifyContent: 'space-between'
  },
  title: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 4
  },
  price: {
    color: colors.accent,
    fontWeight: '700'
  },
  meta: {
    color: colors.muted,
    fontSize: 12
  },
  btn: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: colors.accent
  }
});
