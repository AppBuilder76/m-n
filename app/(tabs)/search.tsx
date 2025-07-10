import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Search as SearchIcon } from 'lucide-react-native';
import { PokemonCard } from '@/components/PokemonCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Pokemon } from '@/types/pokemon';
import { pokemonApi } from '@/utils/pokemonApi';
import { typeColors } from '@/utils/pokemonHelpers';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const pokemonTypes = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await pokemonApi.searchPokemon(query);
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search Pokémon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(selectedType === type ? null : type);
    // In a real app, you'd implement type filtering here
    // For now, we'll just update the UI
  };

  const filteredResults = selectedType
    ? searchResults.filter(pokemon =>
        pokemon.types.some(t => t.type.name === selectedType)
      )
    : searchResults;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Pokémon</Text>
        
        <View style={styles.searchContainer}>
          <SearchIcon size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch(searchQuery)}
            returnKeyType="search"
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeFilters}
      >
        {pokemonTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeFilter,
              {
                backgroundColor: selectedType === type ? typeColors[type] : '#e2e8f0',
              },
            ]}
            onPress={() => handleTypeFilter(type)}
          >
            <Text
              style={[
                styles.typeFilterText,
                {
                  color: selectedType === type ? '#fff' : '#374151',
                },
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && <LoadingSpinner />}
      
      {error && <ErrorMessage message={error} onRetry={() => handleSearch(searchQuery)} />}
      
      {!loading && !error && (
        <FlatList
          data={filteredResults}
          renderItem={({ item }) => <PokemonCard pokemon={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            searchQuery ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No Pokémon found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try searching for a different name
                </Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Start searching!</Text>
                <Text style={styles.emptyStateSubtext}>
                  Enter a Pokémon name to begin
                </Text>
              </View>
            )
          }
        />
      )}
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
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  typeFilters: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  typeFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  typeFilterText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});