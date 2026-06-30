import { ShopItem } from '../types';

export const shopItems: ShopItem[] = [
  // === EKIPMAN: Fare ===
  { id: 'temelFare', name: 'Temel Oyuncu Faresi', description: '+2 Mekanik', price: 150, statBonus: { mekanik: 2 }, category: 'ekipman' },
  { id: 'proFare', name: 'Pro Gaming Mouse', description: '+5 Mekanik', price: 450, statBonus: { mekanik: 5 }, category: 'ekipman' },
  { id: 'kablosuzFare', name: 'Kablosuz Ultra Fare', description: '+8 Mekanik', price: 900, statBonus: { mekanik: 8 }, category: 'ekipman' },
  // === EKIPMAN: Klavye ===
  { id: 'mekanikKlavye', name: 'Mekanik Klavye', description: '+3 Mekanik, +1 Takim Uyumu', price: 500, statBonus: { mekanik: 3, takimUyumu: 1 }, category: 'ekipman' },
  { id: 'rgbKlavye', name: 'RGB Mekanik Klavye', description: '+5 Mekanik, +2 Mental', price: 850, statBonus: { mekanik: 5, mentalGuc: 2 }, category: 'ekipman' },
  { id: 'wirelessKlavye', name: 'Kablosuz Low-Profile', description: '+7 Mekanik, +3 Oyun Bilgisi', price: 1400, statBonus: { mekanik: 7, oyunBilgisi: 3 }, category: 'ekipman' },
  // === EKIPMAN: Kulaklik ===
  { id: 'temelKulaklik', name: 'Temel Kulaklik', description: '+2 Takim Uyumu', price: 100, statBonus: { takimUyumu: 2 }, category: 'ekipman' },
  { id: 'proKulaklik', name: 'Pro Gaming Kulaklik', description: '+4 Takim Uyumu, +2 Oyun Bilgisi', price: 350, statBonus: { takimUyumu: 4, oyunBilgisi: 2 }, category: 'ekipman' },
  { id: 'surroundKulaklik', name: '7.1 Surround Kulaklik', description: '+6 Takim Uyumu, +3 Oyun Bilgisi', price: 750, statBonus: { takimUyumu: 6, oyunBilgisi: 3 }, category: 'ekipman' },
  // === EKIPMAN: Mikrofon ===
  { id: 'mikrofon', name: 'Pro Mikrofon', description: '+4 Takim Uyumu', price: 400, statBonus: { takimUyumu: 4 }, category: 'ekipman' },
  { id: 'studioMikrofon', name: 'Studio Mikrofon', description: '+6 Takim Uyumu, +2 Mental', price: 800, statBonus: { takimUyumu: 6, mentalGuc: 2 }, category: 'ekipman' },
  // === EKIPMAN: Monitor ===
  { id: '60hzMonitor', name: '60Hz Monitor', description: '+2 Oyun Bilgisi', price: 600, statBonus: { oyunBilgisi: 2 }, category: 'ekipman' },
  { id: '144hzMonitor', name: '144Hz Gaming Monitor', description: '+5 Oyun Bilgisi, +2 Mekanik', price: 1800, statBonus: { oyunBilgisi: 5, mekanik: 2 }, category: 'ekipman' },
  { id: '240hzMonitor', name: '240Hz Pro Monitor', description: '+8 Oyun Bilgisi, +3 Mekanik', price: 3500, statBonus: { oyunBilgisi: 8, mekanik: 3 }, category: 'ekipman' },
  // === EKIPMAN: Koltuk ===
  { id: 'temelKoltuk', name: 'Temel Ofis Koltuğu', description: '+1 Mental', price: 300, statBonus: { mentalGuc: 1 }, category: 'ekipman' },
  { id: 'ergonomikKoltuk', name: 'Ergonomik Koltuk', description: '+3 Mental, +1 Mekanik', price: 800, statBonus: { mentalGuc: 3, mekanik: 1 }, category: 'ekipman' },
  { id: 'racingKoltuk', name: 'Racing Oyuncu Koltuğu', description: '+5 Mental, +2 Mekanik', price: 2200, statBonus: { mentalGuc: 5, mekanik: 2 }, category: 'ekipman' },
  // === EKIPMAN: Internet ===
  { id: 'ethernetKablo', name: 'CAT8 Ethernet Kablosu', description: '+2 Mekanik, +1 Oyun Bilgisi', price: 80, statBonus: { mekanik: 2, oyunBilgisi: 1 }, category: 'ekipman' },
  { id: 'gamingRouter', name: 'Gaming Router', description: '+3 Oyun Bilgisi, +2 Takim Uyumu', price: 600, statBonus: { oyunBilgisi: 3, takimUyumu: 2 }, category: 'ekipman' },
  // === EKIPMAN: Mousepad ===
  { id: 'temelMousepad', name: 'Temel Mousepad', description: '+1 Mekanik', price: 50, statBonus: { mekanik: 1 }, category: 'ekipman' },
  { id: 'buyukMousepad', name: 'Geniş RGB Mousepad', description: '+3 Mekanik, +1 Mental', price: 200, statBonus: { mekanik: 3, mentalGuc: 1 }, category: 'ekipman' },
  // === EKIPMAN: Webcam ===
  { id: 'hdWebcam', name: 'HD Webcam', description: '+2 Takim Uyumu', price: 250, statBonus: { takimUyumu: 2 }, category: 'ekipman' },
  { id: '4kWebcam', name: '4K Pro Webcam', description: '+4 Takim Uyumu, +1 Mental', price: 700, statBonus: { takimUyumu: 4, mentalGuc: 1 }, category: 'ekipman' },
  // === ENERJI ===
  { id: 'enerjiIcesi', name: 'Enerji İçeği', description: 'Yorgunluğu giderir (+100 Enerji)', price: 50, statBonus: {}, category: 'enerji' },
  { id: 'kahve', name: 'Espresso Shot', description: 'Anlık enerji (+100 Enerji)', price: 35, statBonus: {}, category: 'enerji' },
  { id: 'enerjiBar', name: 'Protein Bar', description: 'Uzun süreli enerji (+100 Enerji)', price: 45, statBonus: {}, category: 'enerji' },
  { id: 'premiumIcecek', name: 'Gamer Fuel Pack', description: 'Max enerji + mental bonus (+100 Enerji, +1 Mental)', price: 120, statBonus: { mentalGuc: 1 }, category: 'enerji' },
  // === KOZMETIK ===
  { id: 'skinBundle', name: 'Rastgele Skin Paketi', description: '3 rastgele skin açar', price: 300, statBonus: {}, category: 'kozmetik' },
  { id: 'premiumSkin', name: 'Efsanevi Skin', description: 'Garantili efsanevi skin', price: 800, statBonus: {}, category: 'kozmetik' },
  { id: 'iconPaketi', name: 'Simge Paketi', description: '5 ozel profil simgesi', price: 150, statBonus: {}, category: 'kozmetik' },
  { id: 'emoteSet', name: 'Emote Koleksiyonu', description: '10 nadir emote', price: 200, statBonus: {}, category: 'kozmetik' },
  // === ANTRENMAN ===
  { id: 'koc1saat', name: '1 Saatlik Koçluk', description: 'Birebir koçluk seansı (+3 Oyun Bilgisi)', price: 400, statBonus: { oyunBilgisi: 3 }, category: 'ekipman' },
  { id: 'koc5saat', name: '5 Saatlik Koçluk Paketi', description: 'Profesyonel koçluk (+8 Oyun Bilgisi)', price: 1500, statBonus: { oyunBilgisi: 8 }, category: 'ekipman' },
  { id: 'stratejiRehberi', name: 'Strateji Rehberi', description: 'Detayli oyun rehberi (+4 Oyun Bilgisi)', price: 600, statBonus: { oyunBilgisi: 4 }, category: 'ekipman' },
  { id: 'mentalAntrenman', name: 'Mental Antrenman Programı', description: 'Tilt kontrolu ve odak (+5 Mental)', price: 350, statBonus: { mentalGuc: 5 }, category: 'ekipman' },
];
