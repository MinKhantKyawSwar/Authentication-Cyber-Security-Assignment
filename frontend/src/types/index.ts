export interface Game {
  id: string;
  title: string;
  description: string;
  image: string;
  genre: string;
  players: {
    current: number;
    max: number;
  };
  status: 'waiting' | 'in-progress' | 'finished';
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Friend {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: number;
  currentGame?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  currency: 'coins' | 'gems';
  category: 'avatar' | 'theme' | 'boost' | 'badge';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  owned: boolean;
}

export interface GameLobby {
  id: string;
  gameTitle: string;
  hostId: string;
  players: {
    id: string;
    username: string;
    avatar: string;
    isReady: boolean;
    isHost: boolean;
  }[];
  maxPlayers: number;
  isPrivate: boolean;
  settings: {
    difficulty: string;
    gameMode: string;
    duration: string;
  };
  status: 'waiting' | 'starting' | 'in-progress';
}

export interface Notification {
  id: string;
  type: 'friend_request' | 'game_invite' | 'achievement' | 'system';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: any;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
