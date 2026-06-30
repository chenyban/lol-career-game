import { Job } from '../types';

export const availableJobs: Job[] = [
  // === Baslangic (Seviye 1) ===
  { id: 'kafeGarson', name: 'Kafe Garsonu', description: 'Mahalle kafesinde yari zamanli calis. Kolay is.', durationHours: 5, pay: 300, statBonus: {}, requirement: { level: 1 } },
  { id: 'inetKafe', name: 'Internet Kafe Calisani', description: 'Oyuncularin arasinda calis, oyun bilgisi kazan.', durationHours: 4, pay: 150, statBonus: { oyunBilgisi: 3 }, requirement: { level: 1 } },
  { id: 'anketor', name: 'Anketor', description: 'Sokakta anket yap, insanlarla iletisim kur.', durationHours: 3, pay: 100, statBonus: { takimUyumu: 1 }, requirement: { level: 1 } },
  { id: 'temizlikci', name: 'Temizlik Gorevlisi', description: 'Ofis temizligi yap, duzgun para.', durationHours: 6, pay: 350, statBonus: { mentalGuc: 1 }, requirement: { level: 1 } },
  // === Seviye 3 ===
  { id: 'kurye', name: 'Moto Kurye', description: 'Esnek saatler, sehirde gezerek calis.', durationHours: 4, pay: 250, statBonus: { mekanik: 1 }, requirement: { level: 3 } },
  { id: 'kutuphane', name: 'Kutuphane Asistani', description: 'Sessiz ortamda calis, kitap oku.', durationHours: 4, pay: 180, statBonus: { mentalGuc: 2 }, requirement: { level: 3 } },
  { id: 'magazaSorumlu', name: 'Magaza Elemani', description: 'Giyim magazasinda satis danismani.', durationHours: 5, pay: 280, statBonus: { takimUyumu: 1 }, requirement: { level: 3 } },
  // === Seviye 5 ===
  { id: 'streamMod', name: 'Twitch Moderatoru', description: 'Yayincilarin sohbetini yonet.', durationHours: 4, pay: 350, statBonus: { takimUyumu: 3 }, requirement: { level: 5 } },
  { id: 'barmen', name: 'Barmen', description: 'Gece vardiyasi, bahsisler iyi.', durationHours: 6, pay: 550, statBonus: { mekanik: 2 }, requirement: { level: 5 } },
  { id: 'cagriMerkezi', name: 'Cagri Merkezi Temsilcisi', description: 'Telefonla musteri destegi ver.', durationHours: 5, pay: 400, statBonus: { mentalGuc: 2 }, requirement: { level: 5 } },
  // === Seviye 10 ===
  { id: 'oyunTest', name: 'Oyun Test Uzmani', description: 'Oyun oyna, bug bul, para kazan!', durationHours: 6, pay: 500, statBonus: { oyunBilgisi: 5 }, requirement: { level: 10 } },
  { id: 'grafikTasarim', name: 'Grafik Tasarimci', description: 'Freelancer logo ve banner isleri.', durationHours: 4, pay: 450, statBonus: { oyunBilgisi: 2, mentalGuc: 2 }, requirement: { level: 10 } },
  { id: 'yazilimStajyer', name: 'Yazilim Stajyeri', description: 'Sirkette junior developer olarak basla.', durationHours: 5, pay: 600, statBonus: { oyunBilgisi: 4, mentalGuc: 2 }, requirement: { level: 10 } },
  { id: 'sporSalonu', name: 'Spor Salonu Antrenoru', description: 'Musterilere fitness programi hazirla.', durationHours: 4, pay: 400, statBonus: { mekanik: 3, mentalGuc: 2 }, requirement: { level: 10 } },
  // === Seviye 15 ===
  { id: 'kocluk', name: 'LoL Koclugu', description: 'Dusuk elo oyunculara birebir ders ver.', durationHours: 3, pay: 500, statBonus: { takimUyumu: 4, oyunBilgisi: 3 }, requirement: { level: 15 } },
  { id: 'turnuvaOrganizator', name: 'Turnuva Organizatoru', description: 'Yerel LoL turnuvalari duzenle.', durationHours: 6, pay: 800, statBonus: { takimUyumu: 5, oyunBilgisi: 3 }, requirement: { level: 15 } },
  { id: 'sosyalMedya', name: 'Sosyal Medya Yoneticisi', description: 'Markalarin Instagram ve Twitter hesaplarini yonet.', durationHours: 4, pay: 500, statBonus: { mentalGuc: 3, takimUyumu: 2 }, requirement: { level: 15 } },
  { id: 'ticariTaksi', name: 'Taksi Soforu', description: 'Gece gunduz yolcu tasi, kazanc senin.', durationHours: 7, pay: 900, statBonus: { mekanik: 3 }, requirement: { level: 15 } },
  // === Seviye 20 ===
  { id: 'proKocluk', name: 'Pro LoL Koclugu', description: 'Elmas+ oyunculara taktik koçluk.', durationHours: 4, pay: 1200, statBonus: { oyunBilgisi: 6, takimUyumu: 5 }, requirement: { level: 20 } },
  { id: 'yayinciYardimci', name: 'Yayinci Asistani', description: 'Unlu bir yayincinin gunluk islerini yonet.', durationHours: 5, pay: 800, statBonus: { mentalGuc: 4, takimUyumu: 3 }, requirement: { level: 20 } },
  { id: 'webDeveloper', name: 'Web Developer', description: 'Frontend projeleri gelistir, remote calis.', durationHours: 5, pay: 1000, statBonus: { oyunBilgisi: 5, mentalGuc: 4 }, requirement: { level: 20 } },
  { id: 'emlakDanismani', name: 'Emlak Danismani', description: 'Ev al sat komisyonlari kazan.', durationHours: 5, pay: 1100, statBonus: { mentalGuc: 3, takimUyumu: 2 }, requirement: { level: 20 } },
  // === Seviye 30 ===
  { id: 'esporMenajer', name: 'Espor Menajeri', description: 'Amatorden profesyonele gecis yapan oyunculara danismanlik ver.', durationHours: 5, pay: 1500, statBonus: { takimUyumu: 6, oyunBilgisi: 5 }, requirement: { level: 30 } },
  { id: 'yazilimMuhendis', name: 'Yazilim Muhendisi', description: 'Tam zamanli remote calisan developer.', durationHours: 5, pay: 1800, statBonus: { oyunBilgisi: 6, mentalGuc: 5 }, requirement: { level: 30 } },
  { id: 'icerikUretici', name: 'Icerik Ureticisi', description: 'YouTube ve TikTok icin oyun icerikleri uret.', durationHours: 4, pay: 1200, statBonus: { mentalGuc: 5, takimUyumu: 3 }, requirement: { level: 30 } },
  // === Seviye 40 ===
  { id: 'takimAnalisti', name: 'Takim Analisti', description: 'Profesyonel takim icin draft ve meta analizi yap.', durationHours: 5, pay: 2500, statBonus: { oyunBilgisi: 8, takimUyumu: 5 }, requirement: { level: 40 } },
  { id: 'yatirimci', name: 'Kucuk Yatirimci', description: 'Borsada al sat yaparak para kazan.', durationHours: 3, pay: 2000, statBonus: { mentalGuc: 6 }, requirement: { level: 40 } },
  { id: 'universiteHocasi', name: 'Universite Ogretim Gorevlisi', description: 'Oyun tasarimi dersi ver.', durationHours: 4, pay: 1800, statBonus: { mentalGuc: 7, oyunBilgisi: 4 }, requirement: { level: 40 } },
];
