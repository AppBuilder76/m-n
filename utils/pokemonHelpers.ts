export const typeColors: Record<string, string> = {
  normal: '#A8A878',
  fighting: '#C03028',
  flying: '#A890F0',
  poison: '#A040A0',
  ground: '#E0C068',
  rock: '#B8A038',
  bug: '#A8B820',
  ghost: '#705898',
  steel: '#B8B8D0',
  fire: '#F08030',
  water: '#6890F0',
  grass: '#78C850',
  electric: '#F8D030',
  psychic: '#F85888',
  ice: '#98D8D8',
  dragon: '#7038F8',
  dark: '#705848',
  fairy: '#EE99AC',
};

export const typeIcons: Record<string, string> = {
  normal: '🐾',
  fighting: '👊',
  flying: '🦅',
  poison: '☠️',
  ground: '🌍',
  rock: '🗿',
  bug: '🐛',
  ghost: '👻',
  steel: '⚔️',
  fire: '🔥',
  water: '💧',
  grass: '🌿',
  electric: '⚡',
  psychic: '🔮',
  ice: '❄️',
  dragon: '🐉',
  dark: '🌙',
  fairy: '🧚',
};

export const formatPokemonName = (name: string): string => {
  return name.charAt(0).toUpperCase() + name.slice(1);
};

export const formatPokemonId = (id: number): string => {
  return `#${id.toString().padStart(3, '0')}`;
};

export const formatStatName = (statName: string): string => {
  const statMap: Record<string, string> = {
    hp: 'HP',
    attack: 'Attack',
    defense: 'Defense',
    'special-attack': 'Sp. Attack',
    'special-defense': 'Sp. Defense',
    speed: 'Speed',
  };
  return statMap[statName] || statName;
};

export const getStatColor = (statValue: number): string => {
  if (statValue >= 100) return '#22c55e';
  if (statValue >= 80) return '#eab308';
  if (statValue >= 60) return '#f97316';
  if (statValue >= 40) return '#ef4444';
  return '#6b7280';
};

export const calculateStatPercentage = (statValue: number): number => {
  return Math.min((statValue / 200) * 100, 100);
};