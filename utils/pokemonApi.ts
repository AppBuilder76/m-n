import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pokemon, PokemonSpecies, EvolutionChain, PokemonListResponse } from '@/types/pokemon';

const API_BASE_URL = 'https://pokeapi.co/api/v2';
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class PokemonAPI {
  private async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        const { data, timestamp }: CacheItem<T> = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
      }
    } catch (error) {
      console.error('Error getting cached data:', error);
    }
    return null;
  }

  private async setCachedData<T>(key: string, data: T): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error setting cached data:', error);
    }
  }

  private async fetchWithCache<T>(url: string, cacheKey: string): Promise<T> {
    const cached = await this.getCachedData<T>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    await this.setCachedData(cacheKey, data);
    return data;
  }

  async getPokemonList(limit: number = 20, offset: number = 0): Promise<PokemonListResponse> {
    const cacheKey = `pokemon-list-${limit}-${offset}`;
    return this.fetchWithCache<PokemonListResponse>(
      `${API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`,
      cacheKey
    );
  }

  async getPokemon(id: number | string): Promise<Pokemon> {
    const cacheKey = `pokemon-${id}`;
    return this.fetchWithCache<Pokemon>(
      `${API_BASE_URL}/pokemon/${id}`,
      cacheKey
    );
  }

  async getPokemonSpecies(id: number | string): Promise<PokemonSpecies> {
    const cacheKey = `pokemon-species-${id}`;
    return this.fetchWithCache<PokemonSpecies>(
      `${API_BASE_URL}/pokemon-species/${id}`,
      cacheKey
    );
  }

  async getEvolutionChain(url: string): Promise<EvolutionChain> {
    const cacheKey = `evolution-chain-${url}`;
    return this.fetchWithCache<EvolutionChain>(url, cacheKey);
  }

  async searchPokemon(query: string): Promise<Pokemon[]> {
    const cacheKey = `search-${query.toLowerCase()}`;
    const cached = await this.getCachedData<Pokemon[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // For simplicity, we'll search through the first 1000 Pokemon
    const listResponse = await this.getPokemonList(1000, 0);
    const filtered = listResponse.results.filter(pokemon =>
      pokemon.name.toLowerCase().includes(query.toLowerCase())
    );

    const pokemonData = await Promise.all(
      filtered.slice(0, 20).map(pokemon => {
        const id = pokemon.url.split('/').filter(Boolean).pop();
        return this.getPokemon(id!);
      })
    );

    await this.setCachedData(cacheKey, pokemonData);
    return pokemonData;
  }

  getIdFromUrl(url: string): string {
    return url.split('/').filter(Boolean).pop() || '';
  }
}

export const pokemonApi = new PokemonAPI();