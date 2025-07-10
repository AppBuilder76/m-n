import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Audio } from 'expo-av';
import { ArrowLeft, Heart, Play, Pause } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pokemon, PokemonSpecies } from '@/types/pokemon';
import { pokemonApi } from '@/utils/pokemonApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import {
  formatPokemonName,
  formatPokemonId,
  typeColors,
  typeIcons,
  formatStatName,
  getStatColor,
  calculateStatPercentage,
} from '@/utils/pokemonHelpers';

const { width } = Dimensions.get('window');

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadPokemonData();
    checkFavoriteStatus();
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [id]);

  const loadPokemonData = async () => {
    try {
      setLoading(true);
      const [pokemonData, speciesData] = await Promise.all([
        pokemonApi.getPokemon(id as string),
        pokemonApi.getPokemonSpecies(id as string),
      ]);
      
      setPokemon(pokemonData);
      setSpecies(speciesData);
    } catch (err) {
      setError('Failed to load Pokémon data');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      if (favorites) {
        const favoriteIds = JSON.parse(favorites);
        setIsFavorite(favoriteIds.includes(Number(id)));
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      const favoriteIds = favorites ? JSON.parse(favorites) : [];
      const pokemonId = Number(id);
      
      if (isFavorite) {
        const newFavorites = favoriteIds.filter((fId: number) => fId !== pokemonId);
        await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
        setIsFavorite(false);
      } else {
        favoriteIds.push(pokemonId);
        await AsyncStorage.setItem('favorites', JSON.stringify(favoriteIds));
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const playPokemonCry = async () => {
    if (!pokemon?.cries?.latest) return;

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: pokemon.cries.latest },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlaying(true);
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const pauseSound = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !pokemon) {
    return <ErrorMessage message={error || 'Pokémon not found'} onRetry={loadPokemonData} />;
  }

  const primaryType = pokemon.types[0].type.name;
  const backgroundColor = typeColors[primaryType];
  const description = species?.flavor_text_entries?.find(
    entry => entry.language.name === 'en'
  )?.flavor_text.replace(/\f/g, ' ') || 'No description available.';

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
          <Heart size={24} color={isFavorite ? "#ff6b6b" : "#fff"} fill={isFavorite ? "#ff6b6b" : "none"} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.pokemonName}>{formatPokemonName(pokemon.name)}</Text>
          <Text style={styles.pokemonId}>{formatPokemonId(pokemon.id)}</Text>
        </View>
        
        <Image
          source={{ uri: pokemon.sprites.other['official-artwork'].front_default }}
          style={styles.pokemonImage}
          resizeMode="contain"
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.types}>
            {pokemon.types.map((type, index) => (
              <View
                key={index}
                style={[styles.type, { backgroundColor: typeColors[type.type.name] }]}
              >
                <Text style={styles.typeIcon}>{typeIcons[type.type.name]}</Text>
                <Text style={styles.typeName}>{type.type.name}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.soundSection}>
            <TouchableOpacity
              style={styles.soundButton}
              onPress={isPlaying ? pauseSound : playPokemonCry}
              disabled={!pokemon.cries?.latest}
            >
              {isPlaying ? (
                <Pause size={20} color="#fff" />
              ) : (
                <Play size={20} color="#fff" />
              )}
              <Text style={styles.soundButtonText}>
                {isPlaying ? 'Pause' : 'Play'} Cry
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{description}</Text>
          
          <View style={styles.basicInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Height</Text>
              <Text style={styles.infoValue}>{pokemon.height / 10} m</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>{pokemon.weight / 10} kg</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Base Experience</Text>
              <Text style={styles.infoValue}>{pokemon.base_experience}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stats</Text>
          {pokemon.stats.map((stat, index) => (
            <View key={index} style={styles.statRow}>
              <Text style={styles.statName}>{formatStatName(stat.stat.name)}</Text>
              <Text style={styles.statValue}>{stat.base_stat}</Text>
              <View style={styles.statBar}>
                <View
                  style={[
                    styles.statFill,
                    {
                      width: `${calculateStatPercentage(stat.base_stat)}%`,
                      backgroundColor: getStatColor(stat.base_stat),
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abilities</Text>
          <View style={styles.abilities}>
            {pokemon.abilities.map((ability, index) => (
              <View key={index} style={styles.ability}>
                <Text style={styles.abilityName}>
                  {ability.ability.name.replace('-', ' ')}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Moves</Text>
          <View style={styles.moves}>
            {pokemon.moves.slice(0, 8).map((move, index) => (
              <View key={index} style={styles.move}>
                <Text style={styles.moveName}>
                  {move.move.name.replace('-', ' ')}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    minHeight: 240,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 1,
  },
  favoriteButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 1,
  },
  headerContent: {
    marginTop: 40,
  },
  pokemonName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pokemonId: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    fontWeight: '600',
  },
  pokemonImage: {
    position: 'absolute',
    right: 24,
    bottom: -40,
    width: 120,
    height: 120,
  },
  content: {
    flex: 1,
    marginTop: 40,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  types: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  type: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  typeName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  soundSection: {
    alignItems: 'center',
  },
  soundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  soundButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 16,
  },
  basicInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statName: {
    fontSize: 14,
    color: '#6b7280',
    width: 100,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    width: 40,
    textAlign: 'right',
  },
  statBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginLeft: 12,
  },
  statFill: {
    height: '100%',
    borderRadius: 3,
  },
  abilities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ability: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  abilityName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  moves: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  move: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  moveName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});