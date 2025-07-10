import { useState, useEffect } from 'react';
import { Pokemon } from '@/types/pokemon';
import { pokemonApi } from '@/utils/pokemonApi';

export function usePokemonData() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadPokemon = async (refresh: boolean = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const currentOffset = refresh ? 0 : offset;
      const response = await pokemonApi.getPokemonList(20, currentOffset);
      
      const pokemonData = await Promise.all(
        response.results.map(async (pokemon) => {
          const id = pokemonApi.getIdFromUrl(pokemon.url);
          return pokemonApi.getPokemon(id);
        })
      );

      if (refresh) {
        setPokemon(pokemonData);
        setOffset(20);
      } else {
        setPokemon(prev => [...prev, ...pokemonData]);
        setOffset(prev => prev + 20);
      }

      setHasMore(response.next !== null);
    } catch (err) {
      setError('Failed to load Pokémon data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPokemon(true);
  }, []);

  return {
    pokemon,
    loading,
    error,
    hasMore,
    loadMore: () => loadPokemon(false),
    refresh: () => loadPokemon(true),
  };
}