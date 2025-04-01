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
    image: "https://placehold.co/400x225/111111/FFFFFF?text=Shadow+Protocol",
    status: "In Development",
    progress: 40,
    url: "https://github.com/qanh10x10/shadow-protocol"
  },
  {
    id: 2,
    title: "Speed Dash",
    description: "A high-speed 2D racing game with multiple game modes.",
    image: "https://placehold.co/400x225/111111/FFFFFF?text=Speed+Dash",
    status: "Completed",
    progress: 100,
    url: "https://github.com/qanh10x10/speed-dash"
  },
  {
    id: 3,
    title: "The Chasing Dark",
    description: "Survive as long as possible while being chased by monsters.",
    image: "https://placehold.co/400x225/111111/FFFFFF?text=The+Chasing+Dark",
    status: "In Development",
    progress: 60,
    url: "https://github.com/qanh10x10/chasing-dark"
  },
  {
    id: 4,
    title: "Fury Arena",
    description: "An intense battle arena game with strategic combat.",
    image: "https://placehold.co/400x225/111111/FFFFFF?text=Fury+Arena",
    status: "In Progress",
    progress: 80,
    url: "https://github.com/qanh10x10/fury-arena"
  },
  {
    id: 5,
    title: "Cosmic Drift",
    description: "Space exploration game with physics-based movement.",
    image: "https://placehold.co/400x225/111111/FFFFFF?text=Cosmic+Drift",
    status: "In Progress",
    progress: 50,
    url: "https://github.com/qanh10x10/cosmic-drift"
  },
  {
    id: 6,
    title: "Pixel Quest",
    description: "Classic RPG adventure with turn-based combat.",
    image: "https://placehold.co/400x225/111111/FFFFFF?text=Pixel+Quest",
    status: "Completed",
    progress: 100,
    url: "https://github.com/qanh10x10/pixel-quest"
  },
  {
    id: 7,
    title: "Neon Defenders",
    description: "Tower defense with upgradable weapons and abilities.",
    image: "https://placehold.co/400x225/111111/FFFFFF?text=Neon+Defenders",
    status: "In Development",
    progress: 25,
    url: "https://github.com/qanh10x10/neon-defenders"
  },
  {
    id: 8,
    title: "Byte Brawlers",
    description: "Fighting game with unique characters and specials.",
    image: "https://placehold.co/400x225/111111/FFFFFF?text=Byte+Brawlers",
    status: "Completed",
    progress: 100,
    url: "https://github.com/qanh10x10/byte-brawlers"
  }
];
