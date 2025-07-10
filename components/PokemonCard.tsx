import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Pokemon } from '@/types/pokemon';
import { formatPokemonName, formatPokemonId, typeColors, typeIcons } from '@/utils/pokemonHelpers';

interface PokemonCardProps {
  pokemon: Pokemon;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const primaryType = pokemon.types[0].type.name;
  const backgroundColor = typeColors[primaryType] || '#68d391';

  const handlePress = () => {
    router.push(`/pokemon/${pokemon.id}`);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={[styles.card, { backgroundColor }]}>
        <View style={styles.header}>
          <Text style={styles.name}>{formatPokemonName(pokemon.name)}</Text>
          <Text style={styles.id}>{formatPokemonId(pokemon.id)}</Text>
        </View>
        
        <View style={styles.types}>
          {pokemon.types.map((type, index) => (
            <View key={index} style={styles.type}>
              <Text style={styles.typeIcon}>{typeIcons[type.type.name]}</Text>
              <Text style={styles.typeName}>{type.type.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: pokemon.sprites.other['official-artwork'].front_default }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.overlay} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    position: 'relative',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  id: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    fontWeight: '600',
  },
  types: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  type: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  typeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  typeName: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  imageContainer: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 80,
    height: 80,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomRightRadius: 16,
    borderTopLeftRadius: 50,
  },
});