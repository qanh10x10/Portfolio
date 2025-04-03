export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  status: "Completed" | "In Development" | "In Progress";
  progress: number;
  url: string;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "DIY: Paper Doll",
    description:
      "A game that user will help character choose cloth for specific event.",
    image:
      "https://play-lh.googleusercontent.com/YukvsnbY5POjW3A3rIQHreMsP0yXabemSm5KWgIhSZN0Bm_HCdzicmmZrPXIBIrZcA=w2560-h1440-rw",
    status: "Completed",
    progress: 100,
    url: "https://play.google.com/store/apps/details?id=com.gb.diy.paper.doll.dress.up.princess.makeup.makeover&hl=vi",
  },
  {
    id: 2,
    title: "Sandwich Please!",
    description: "Run your own restaurant",
    image:
      "https://play-lh.googleusercontent.com/gWT3vjgfnpKsdSrMWG1V_txe848bTxxZtw717W-EX-9GgFReffLFjcmqClTSE1NLVGc=w2560-h1440-rw",
    status: "Completed",
    progress: 100,
    url: "https://play.google.com/store/apps/details?id=com.gb.sandwichidle.burgerplease.pizza.coffee&hl=vi",
  },
  {
    id: 3,
    title: "Math Cross",
    description: "A game to match the equation",
    image:
      "https://play-lh.googleusercontent.com/xWEryCZDISnhkId7SeqUEMy6ERo9FO3QMUVuL_LeQ6ks95Pm-SoJCZ8snT5u4pcOWw=w2560-h1440-rw",
    status: "Completed",
    progress: 100,
    url: "https://drive.google.com/file/d/1MDdU6agkqOqLwAag5w_I3ToI3TDopLnO/view?usp=drive_link",
  },
  {
    id: 4,
    title: "Fish Go io",
    description: "An intense battle arena game where fish eat others.",
    image:
      "https://play-lh.googleusercontent.com/XNP3OsDCvcSNVhlSnGBMg94AyGc6vi7-p5B63R3HSArMl3cAxJeXulVQJSq58k5zryM=w2560-h1440-rw",
    status: "Completed",
    progress: 90,
    url: "https://drive.google.com/file/d/1vnV6Te6bIRBvHkO1CJC15_9FGSguWWGM/view?usp=sharing",
  },
  {
    id: 5,
    title: "Micro RPG Clone",
    description: "A turn-based game where you battle with Monsters.",
    image:
      "https://play-lh.googleusercontent.com/H8Y1C-eYYwjnCxMcsz3vYRvuBQJSnqlCpmD-YRmsLHaq4bdbI0Fh7lldgW8SRMvgAw=w2560-h1440-rw",
    status: "In Development",
    progress: 20,
    url: "https://play.google.com/store/apps/details?id=com.dhb.microrpg&hl=vi",
  },
  {
    id: 6,
    title: "Catopia",
    description: "Simple Nft farming game.",
    image: "/Catopia.jpg",
    status: "Completed",
    progress: 100,
    url: "https://t.me/catopia_game_bot",
  },
];
