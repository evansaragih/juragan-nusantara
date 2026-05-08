export const BOARD_SPACES = [
  // Bottom row (left to right = index 0-9)
  { id: 0,  type: 'go',       name: 'Mulai',            icon: '🏁' },
  { id: 1,  type: 'property', name: 'Merauke',          color: 'brown',      price: 60,  rent: [2,10,30,90,160,250],   houseCost: 50 },
  { id: 2,  type: 'chest',    name: 'Gotong Royong',    icon: '🤝' },
  { id: 3,  type: 'property', name: 'Jayapura',         color: 'brown',      price: 60,  rent: [4,20,60,180,320,450],  houseCost: 50 },
  { id: 4,  type: 'tax',      name: 'Pajak Penghasilan',icon: '📋',          amount: 200 },
  { id: 5,  type: 'station',  name: 'Pelabuhan Tanjung Priok', icon: '⚓' },
  { id: 6,  type: 'property', name: 'Kupang',           color: 'lightblue',  price: 100, rent: [6,30,90,270,400,550],  houseCost: 50 },
  { id: 7,  type: 'chance',   name: 'Kartu Nasib',      icon: '🎴' },
  { id: 8,  type: 'property', name: 'Mataram',          color: 'lightblue',  price: 100, rent: [6,30,90,270,400,550],  houseCost: 50 },
  { id: 9,  type: 'property', name: 'Ambon',            color: 'lightblue',  price: 120, rent: [8,40,100,300,450,600], houseCost: 50 },
  // Right column bottom to top = index 10-19
  { id: 10, type: 'jail',     name: 'Macet Parah',      icon: '🚦' },
  { id: 11, type: 'property', name: 'Palu',             color: 'pink',       price: 140, rent: [10,50,150,450,625,750],houseCost: 100 },
  { id: 12, type: 'utility',  name: 'PLN',              icon: '⚡' },
  { id: 13, type: 'property', name: 'Manado',           color: 'pink',       price: 140, rent: [10,50,150,450,625,750],houseCost: 100 },
  { id: 14, type: 'property', name: 'Makassar',         color: 'pink',       price: 160, rent: [12,60,180,500,700,900],houseCost: 100 },
  { id: 15, type: 'station',  name: 'Stasiun Gambir',   icon: '🚂' },
  { id: 16, type: 'property', name: 'Pontianak',        color: 'orange',     price: 180, rent: [14,70,200,550,750,950],houseCost: 100 },
  { id: 17, type: 'chest',    name: 'Gotong Royong',    icon: '🤝' },
  { id: 18, type: 'property', name: 'Samarinda',        color: 'orange',     price: 180, rent: [14,70,200,550,750,950],houseCost: 100 },
  { id: 19, type: 'property', name: 'Balikpapan',       color: 'orange',     price: 200, rent: [16,80,220,600,800,1000],houseCost: 100 },
  // Top row (right to left = index 20-29)
  { id: 20, type: 'parking',  name: 'Alun-Alun',        icon: '🌳' },
  { id: 21, type: 'property', name: 'Padang',           color: 'red',        price: 220, rent: [18,90,250,700,875,1050],houseCost: 150 },
  { id: 22, type: 'chance',   name: 'Kartu Nasib',      icon: '🎴' },
  { id: 23, type: 'property', name: 'Palembang',        color: 'red',        price: 220, rent: [18,90,250,700,875,1050],houseCost: 150 },
  { id: 24, type: 'property', name: 'Medan',            color: 'red',        price: 240, rent: [20,100,300,750,925,1100],houseCost: 150 },
  { id: 25, type: 'station',  name: 'Terminal Bungurasih',icon: '🚌' },
  { id: 26, type: 'property', name: 'Solo',             color: 'yellow',     price: 260, rent: [22,110,330,800,975,1150],houseCost: 150 },
  { id: 27, type: 'property', name: 'Yogyakarta',       color: 'yellow',     price: 260, rent: [22,110,330,800,975,1150],houseCost: 150 },
  { id: 28, type: 'utility',  name: 'Pertamina',        icon: '⛽' },
  { id: 29, type: 'property', name: 'Semarang',         color: 'yellow',     price: 280, rent: [24,120,360,850,1025,1200],houseCost: 150 },
  // Left column top to bottom = index 30-39
  { id: 30, type: 'gotojail', name: 'Ganjil-Genap',     icon: '🚔' },
  { id: 31, type: 'property', name: 'Bandung',          color: 'green',      price: 300, rent: [26,130,390,900,1100,1275],houseCost: 200 },
  { id: 32, type: 'property', name: 'Surabaya',         color: 'green',      price: 300, rent: [26,130,390,900,1100,1275],houseCost: 200 },
  { id: 33, type: 'chest',    name: 'Gotong Royong',    icon: '🤝' },
  { id: 34, type: 'property', name: 'Denpasar',         color: 'green',      price: 320, rent: [28,150,450,1000,1200,1400],houseCost: 200 },
  { id: 35, type: 'station',  name: 'Bandara Soekarno-Hatta',icon: '✈️' },
  { id: 36, type: 'chance',   name: 'Kartu Nasib',      icon: '🎴' },
  { id: 37, type: 'property', name: 'IKN Nusantara',    color: 'darkblue',   price: 350, rent: [35,175,500,1100,1300,1500],houseCost: 200 },
  { id: 38, type: 'tax',      name: 'Pajak Mewah',      icon: '💸',          amount: 100 },
  { id: 39, type: 'property', name: 'Jakarta',          color: 'darkblue',   price: 400, rent: [50,200,600,1400,1700,2000],houseCost: 200 },
];

export const COLOR_GROUPS = {
  brown:     { name: 'Papua',           count: 2, hex: '#8B4513' },
  lightblue: { name: 'Nusa Tenggara',   count: 3, hex: '#87CEEB' },
  pink:      { name: 'Sulawesi',        count: 3, hex: '#FF69B4' },
  orange:    { name: 'Kalimantan',      count: 3, hex: '#FFA500' },
  red:       { name: 'Sumatra',         count: 3, hex: '#DC143C' },
  yellow:    { name: 'Jawa Tengah',     count: 3, hex: '#FFD700' },
  green:     { name: 'Bali & Jabar',    count: 3, hex: '#228B22' },
  darkblue:  { name: 'Megacities',      count: 2, hex: '#00008B' },
};

export const TOKENS = [
  { id: 'angkot',   name: 'Angkot',        emoji: '🚐' },
  { id: 'komodo',   name: 'Komodo',        emoji: '🦎' },
  { id: 'wayang',   name: 'Wayang Kulit',  emoji: '🎭' },
  { id: 'becak',    name: 'Becak',         emoji: '🛺' },
  { id: 'tumpeng',  name: 'Nasi Tumpeng',  emoji: '🍚' },
  { id: 'phinisi',  name: 'Phinisi',       emoji: '⛵' },
  { id: 'candi',    name: 'Candi',         emoji: '🏛️' },
  { id: 'barong',   name: 'Barong',        emoji: '🎪' },
];

export const CHEST_CARDS = [
  { id: 'c1', text: 'Menang Arisan! Koleksi Rp 250.000 dari bank.', action: 'collect', amount: 100 },
  { id: 'c2', text: 'Sumbangan Hajatan tetangga. Bayar Rp 125.000.', action: 'pay', amount: 50 },
  { id: 'c3', text: 'Bayar THR! Bayar Rp 25.000 ke setiap pemain.', action: 'payall', amount: 10 },
  { id: 'c4', text: 'Proyek Desain UI/UX tembus! Koleksi Rp 375.000.', action: 'collect', amount: 150 },
  { id: 'c5', text: 'Traktir teman naik jabatan! Bayar Rp 50.000.', action: 'pay', amount: 20 },
  { id: 'c6', text: 'BPJS cair! Koleksi Rp 125.000.', action: 'collect', amount: 50 },
  { id: 'c7', text: 'Uang kembalian permen minimarket. Koleksi Rp 25.000.', action: 'collect', amount: 10 },
  { id: 'c8', text: 'Gotong Royong bersih desa. Bayar Rp 100.000.', action: 'pay', amount: 40 },
  { id: 'c9', text: 'Panen raya berhasil! Koleksi Rp 250.000.', action: 'collect', amount: 100 },
  { id: 'c10', text: 'Bebas Macet! Simpan kartu ini untuk keluar dari Macet Parah gratis.', action: 'jailcard', amount: 0 },
];

export const CHANCE_CARDS = [
  { id: 'n1', text: 'Kena E-Tilang di tol! Bayar Rp 125.000.', action: 'pay', amount: 50 },
  { id: 'n2', text: 'Ramalan Shio Cuan! Maju ke Mulai dan koleksi Rp 500.000.', action: 'goto', target: 0, amount: 0 },
  { id: 'n3', text: 'Ketinggalan KRL! Mundur 3 petak.', action: 'moveback', amount: 3 },
  { id: 'n4', text: 'Diskon Harbolnas! Bayar Rp 125.000 ke bank.', action: 'pay', amount: 50 },
  { id: 'n5', text: 'Salah naik Angkot! Maju ke stasiun terdekat. Sewa double jika sudah dimiliki!', action: 'neareststation', amount: 0 },
  { id: 'n6', text: 'Viral di TikTok! Koleksi Rp 250.000 dari bank.', action: 'collect', amount: 100 },
  { id: 'n7', text: 'Jalan Tol ditutup VIP! Langsung ke Macet Parah.', action: 'gotojail', amount: 0 },
  { id: 'n8', text: 'Pajak Bumi dan Bangunan! Bayar Rp 62.500 per Warung, Rp 250.000 per Resort.', action: 'propertytax', amount: 0 },
  { id: 'n9', text: 'Urusan bisnis ke Jakarta! Maju ke Jakarta.', action: 'goto', target: 39, amount: 0 },
  { id: 'n10', text: 'Bocor Ban! Bayar Rp 37.500 untuk tambal ban.', action: 'pay', amount: 15 },
];

export const PLAYER_COLORS = ['#E63946', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4', '#FF5722', '#607D8B'];

export const STARTING_MONEY = 1500;
export const CARD_DISPLAY_MS = 1800; // ms to show card modal for robot turns
export const GO_MONEY = 200;
export const JAIL_FINE = 50;
export const JAIL_SPACE = 10;
export const GOTO_JAIL_SPACE = 30;
export const MAX_JAIL_TURNS = 3;
