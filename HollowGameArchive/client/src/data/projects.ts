export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  status: 'Completed' | 'In Development' | 'In Progress';
  progress: number;
  url: string;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "Shadow Protocol",
    description: "A tactical shooting game with high-intensity missions.",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&h=225",
    status: "In Development",
    progress: 40,
    url: "https://example.com/shadow-protocol"
  },
  {
    id: 2,
    title: "Speed Dash",
    description: "A high-speed 2D racing game with multiple game modes.",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&h=225",
    status: "Completed",
    progress: 100,
    url: "https://example.com/speed-dash"
  },
  {
    id: 3,
    title: "The Chasing Dark",
    description: "Survive as long as possible while being chased by monsters.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&h=225",
    status: "In Development",
    progress: 60,
    url: "https://example.com/chasing-dark"
  },
  {
    id: 4,
    title: "Fury Arena",
    description: "An intense battle arena game with strategic combat.",
    image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=400&h=225",
    status: "In Progress",
    progress: 80,
    url: "https://example.com/fury-arena"
  },
  {
    id: 5,
    title: "Cosmic Drift",
    description: "Space exploration game with physics-based movement.",
    image: "https://images.unsplash.com/photo-1614294149010-950b698f72c0?auto=format&fit=crop&w=400&h=225",
    status: "In Progress",
    progress: 50,
    url: "https://example.com/cosmic-drift"
  },
  {
    id: 6,
    title: "Pixel Quest",
    description: "Classic RPG adventure with turn-based combat.",
    image: "https://images.unsplash.com/photo-1605899435973-ca2d1a8431cf?auto=format&fit=crop&w=400&h=225",
    status: "Completed",
    progress: 100,
    url: "https://example.com/pixel-quest"
  },
  {
    id: 7,
    title: "Neon Defenders",
    description: "Tower defense with upgradable weapons and abilities.",
    image: "https://images.unsplash.com/photo-1591825729269-caeb344f6df2?auto=format&fit=crop&w=400&h=225",
    status: "In Development",
    progress: 25,
    url: "https://example.com/neon-defenders"
  },
  {
    id: 8,
    title: "Byte Brawlers",
    description: "Fighting game with unique characters and specials.",
    image: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&w=400&h=225",
    status: "Completed",
    progress: 100,
    url: "https://example.com/byte-brawlers"
  }
];
