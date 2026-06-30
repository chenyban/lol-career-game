import { create } from 'zustand';
import type { PlayerProfile, PlayerStats, MatchEvent, TeamOffer, Message, RankTier, MatchResult, MatchKDA, KDADelta, SummonerSpell, RunePage, MatchDetailedStats, ObjectiveEvent, Achievement, SeasonModifier, MatchItemBuild, Tournament, DailyQuest, Sponsorship, TeamContract, LootBox, SeasonReward, ChampionAbility, CareerStats, Clan, Coach, Cosmetic, SaveSlot } from '../types';
import { allChampions } from '../data/champions';
import { rankedTiers, xpToLevel, calculatePlacementRank, getDivisionForLp, getTierIndex } from '../data/ranks';
import { availableJobs } from '../data/jobs';
import { shopItems } from '../data/items';

const initialStats: PlayerStats = { mekanik: 20, oyunBilgisi: 15, takimUyumu: 10, mentalGuc: 25 };

function generateInitialChampions() {
  const lanes = ['Üst Koridor', 'Orman', 'Orta Koridor', 'Alt Koridor', 'Destek'];
  const perLane = 5;
  const selected = new Set<string>();
  for (const lane of lanes) {
    const pool = allChampions.filter(c => c.role === lane && !selected.has(c.id));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(perLane, shuffled.length); i++) {
      selected.add(shuffled[i].id);
    }
  }
  return allChampions.map(c => ({ ...c, unlocked: selected.has(c.id) }));
}

const chatContacts = [
  { name: 'Mert', avatar: 'M' },
  { name: 'Efe', avatar: 'E' },
  { name: 'Can', avatar: 'C' },
  { name: 'Deniz', avatar: 'D' },
  { name: 'Burak', avatar: 'B' },
  { name: 'Ali', avatar: 'A' },
  { name: 'Zeynep', avatar: 'Z' },
  { name: 'Elif', avatar: 'E' },
  { name: 'Kerem', avatar: 'K' },
  { name: 'Okan', avatar: 'O' },
  { name: 'Tuna', avatar: 'T' },
  { name: 'Cem', avatar: 'C' },
];

const chatTemplates = [
  'Bugun mac var mi?',
  'Gecen oyundaki playin efsaneydi kanka!',
  'Yeni yama cok kotu olmus ya.',
  'Aksam giricek misin?',
  'Su baru acmaya calisalim mi?',
  'Ranked kasmaya basladim, sen ne durumdasin?',
  'Hangi sampiyonu mainliyorsun su ara?',
  'Takimima gelir misin?',
  'Turk sunucusunda ping cok kotu ya.',
  'Derecelide elmasa ciktim sonunda!',
  'SamPiYon haVUZuNa bAKTiN mI?',
  'Mid gidebilir misin bu sefer?',
  'Support main misin?',
  'Clash turnuvasina katilalim mi?',
  'Haftasonu turnuvasi var, takim ariyorum.',
  'Kanka soloq cok toxic ya FF atip cikiyorum.',
  'ADC olarak cok iyi oynuyorsun bu arada.',
  'Jungler olarak cok iyisin, respect.',
  'Sana build onerim var, DM\'den atayim mi?',
  'Bu aksam custom mac yapalim mi bizim ekip ile?',
];

export const summonerSpells: SummonerSpell[] = [
  { id: 'flash', name: 'Flash', emoji: '⚡', description: 'Kisa mesafe isinlanma', statBonus: { mekanik: 3 }, imageId: 'SummonerFlash' },
  { id: 'ignite', name: 'Ignite', emoji: '🔥', description: 'Rakibe gercek hasar', statBonus: { mekanik: 2 }, imageId: 'SummonerDot' },
  { id: 'teleport', name: 'Teleport', emoji: '🌀', description: 'Kuleye/Miniona isinlan', statBonus: { oyunBilgisi: 3 }, imageId: 'SummonerTeleport' },
  { id: 'smite', name: 'Smite', emoji: '⚔️', description: 'Orman canavarina hasar', statBonus: { mekanik: 2, oyunBilgisi: 1 }, imageId: 'SummonerSmite' },
  { id: 'heal', name: 'Heal', emoji: '💚', description: 'Kendini ve takimi iyilestir', statBonus: { takimUyumu: 3 }, imageId: 'SummonerHeal' },
  { id: 'barrier', name: 'Barrier', emoji: '🛡️', description: 'Kalkan olustur', statBonus: { mentalGuc: 3 }, imageId: 'SummonerBarrier' },
  { id: 'exhaust', name: 'Exhaust', emoji: '😤', description: 'Rakibi yavaslat ve zayiflat', statBonus: { takimUyumu: 2, mentalGuc: 1 }, imageId: 'SummonerExhaust' },
  { id: 'ghost', name: 'Ghost', emoji: '👻', description: 'Hizlan ve kos', statBonus: { mekanik: 1, mentalGuc: 2 }, imageId: 'SummonerHaste' },
];

export const runePages: RunePage[] = [
  // Precision
  { id: 'conqueror', name: 'Conqueror', emoji: '🗡️', description: 'Uzun savaslarda guclenen', statBonus: { mekanik: 5 }, color: '#ffd93d', imageId: 'Precision/Conqueror', tree: 'Precision' },
  { id: 'fleetFootwork', name: 'Fleet Footwork', emoji: '👣', description: 'Vur-kac iyilesme ve hiz', statBonus: { mekanik: 2, mentalGuc: 3 }, color: '#f1c40f', imageId: 'Precision/FleetFootwork', tree: 'Precision' },
  { id: 'lethalTempo', name: 'Lethal Tempo', emoji: '💢', description: 'Saldiri hizi kazandiran', statBonus: { mekanik: 4, oyunBilgisi: 1 }, color: '#ffaa00', imageId: 'Precision/LethalTempo', tree: 'Precision' },
  { id: 'pressTheAttack', name: 'Press the Attack', emoji: '👊', description: '3 vurusta bonus hasar', statBonus: { mekanik: 3, takimUyumu: 2 }, color: '#e67e22', imageId: 'Precision/PressTheAttack', tree: 'Precision' },
  // Domination
  { id: 'electrocute', name: 'Electrocute', emoji: '⚡', description: 'Anlik burst hasar', statBonus: { mekanik: 4, mentalGuc: 1 }, color: '#e74c3c', imageId: 'Domination/Electrocute', tree: 'Domination' },
  { id: 'darkHarvest', name: 'Dark Harvest', emoji: '💀', description: 'Oldurdukce guclenen', statBonus: { mekanik: 3, oyunBilgisi: 2 }, color: '#9b59b6', imageId: 'Domination/DarkHarvest', tree: 'Domination' },
  { id: 'hailOfBlades', name: 'Hail of Blades', emoji: '🌪️', description: 'Ilk 3 vurusta ultra hiz', statBonus: { mekanik: 5 }, color: '#c0392b', imageId: 'Domination/HailOfBlades', tree: 'Domination' },
  { id: 'predator', name: 'Predator', emoji: '🐺', description: 'Avlanma modu hiz kazan', statBonus: { mekanik: 3, takimUyumu: 2 }, color: '#e67e22', imageId: 'Domination/Predator', tree: 'Domination' },
  // Sorcery
  { id: 'aery', name: 'Summon Aery', emoji: '🧚', description: 'Kalkan ve bonus hasar', statBonus: { takimUyumu: 5 }, color: '#4fc3f7', imageId: 'Sorcery/SummonAery', tree: 'Sorcery' },
  { id: 'arcaneComet', name: 'Arcane Comet', emoji: '☄️', description: 'Yetenekle vurunca kuyruklu', statBonus: { oyunBilgisi: 4, mekanik: 1 }, color: '#3498db', imageId: 'Sorcery/ArcaneComet', tree: 'Sorcery' },
  { id: 'phaseRush', name: 'Phase Rush', emoji: '💨', description: 'Hizli combo bonusu', statBonus: { mekanik: 2, oyunBilgisi: 3 }, color: '#2980b9', imageId: 'Sorcery/PhaseRush', tree: 'Sorcery' },
  // Resolve
  { id: 'grasp', name: 'Grasp', emoji: '🤲', description: 'Tank ama saglik bonusu', statBonus: { mentalGuc: 3, mekanik: 2 }, color: '#2ecc71', imageId: 'Resolve/GraspOfTheUndying', tree: 'Resolve' },
  { id: 'aftershock', name: 'Aftershock', emoji: '⛰️', description: 'CC sonrasi direnc', statBonus: { mentalGuc: 4, takimUyumu: 1 }, color: '#27ae60', imageId: 'Resolve/Aftershock', tree: 'Resolve' },
  { id: 'guardian', name: 'Guardian', emoji: '🛡️', description: 'Takimina kalkan ver', statBonus: { takimUyumu: 3, mentalGuc: 2 }, color: '#1abc9c', imageId: 'Resolve/Guardian', tree: 'Resolve' },
  // Inspiration
  { id: 'firstStrike', name: 'First Strike', emoji: '💰', description: 'Ilk vurusta bonus altin', statBonus: { oyunBilgisi: 3, mentalGuc: 2 }, color: '#f39c12', imageId: 'Inspiration/FirstStrike', tree: 'Inspiration' },
  { id: 'glacialAugment', name: 'Glacial Augment', emoji: '❄️', description: 'CC ile yavaslatma alani', statBonus: { takimUyumu: 3, mentalGuc: 2 }, color: '#00bcd4', imageId: 'Inspiration/GlacialAugment', tree: 'Inspiration' },
  { id: 'unsealedSpellbook', name: 'Unsealed Spellbook', emoji: '📖', description: 'Buyuleri degistirebilme', statBonus: { oyunBilgisi: 4, mentalGuc: 1 }, color: '#607d8b', imageId: 'Inspiration/UnsealedSpellbook', tree: 'Inspiration' },
];

// === MATCH ITEM SHOP ===
export const matchComponents: { id: string; name: string; cost: number; emoji: string; statBonus: Partial<PlayerStats>; category: string; description: string }[] = [
  // AD Components
  { id: 'longSword', name: 'Long Sword', cost: 350, emoji: '⚔️', statBonus: { mekanik: 1 }, category: 'AD', description: '+1 Mekanik' },
  { id: 'pickaxe', name: 'Pickaxe', cost: 875, emoji: '⛏️', statBonus: { mekanik: 3 }, category: 'AD', description: '+3 Mekanik' },
  { id: 'bfSword', name: 'B.F. Sword', cost: 1300, emoji: '🗡️', statBonus: { mekanik: 5 }, category: 'AD', description: '+5 Mekanik' },
  { id: 'dagger', name: 'Dagger', cost: 300, emoji: '🔪', statBonus: { mekanik: 1, oyunBilgisi: -1 }, category: 'AD', description: '+1 Mekanik' },
  { id: 'recurveBow', name: 'Recurve Bow', cost: 700, emoji: '🏹', statBonus: { mekanik: 2, oyunBilgisi: 1 }, category: 'AD', description: '+2 Mekanik +1 OB' },
  { id: 'caulfield', name: "Caulfield's Warhammer", cost: 1100, emoji: '🔨', statBonus: { mekanik: 3, mentalGuc: 1 }, category: 'AD', description: '+3 Mekanik +1 Mental' },
  // AP Components
  { id: 'ampTome', name: 'Amplifying Tome', cost: 435, emoji: '📘', statBonus: { oyunBilgisi: 2 }, category: 'AP', description: '+2 Oyun Bilgisi' },
  { id: 'blastingWand', name: 'Blasting Wand', cost: 850, emoji: '🪄', statBonus: { oyunBilgisi: 4 }, category: 'AP', description: '+4 Oyun Bilgisi' },
  { id: 'needless', name: 'Needlessly Large Rod', cost: 1250, emoji: '🔮', statBonus: { oyunBilgisi: 6 }, category: 'AP', description: '+6 Oyun Bilgisi' },
  { id: 'fiendish', name: 'Fiendish Codex', cost: 900, emoji: '📕', statBonus: { oyunBilgisi: 3, takimUyumu: 1 }, category: 'AP', description: '+3 OB +1 Takim' },
  { id: 'lostChapter', name: 'Lost Chapter', cost: 1200, emoji: '📚', statBonus: { oyunBilgisi: 4, mentalGuc: 1 }, category: 'AP', description: '+4 OB +1 Mental' },
  // Tank Components
  { id: 'rubyCrystal', name: 'Ruby Crystal', cost: 400, emoji: '💎', statBonus: { mentalGuc: 2 }, category: 'Tank', description: '+2 Mental' },
  { id: 'giantsBelt', name: "Giant's Belt", cost: 900, emoji: '🎗️', statBonus: { mentalGuc: 4 }, category: 'Tank', description: '+4 Mental' },
  { id: 'clothArmor', name: 'Cloth Armor', cost: 300, emoji: '🦺', statBonus: { mentalGuc: 1, takimUyumu: 1 }, category: 'Tank', description: '+1 Mental +1 Takim' },
  { id: 'nullMantle', name: 'Null-Magic Mantle', cost: 450, emoji: '🪬', statBonus: { mentalGuc: 2, oyunBilgisi: -1 }, category: 'Tank', description: '+2 Mental' },
  { id: 'chainVest', name: 'Chain Vest', cost: 800, emoji: '⛓️', statBonus: { mentalGuc: 3, takimUyumu: 1 }, category: 'Tank', description: '+3 Mental +1 Takim' },
  { id: 'kindlegem', name: 'Kindlegem', cost: 800, emoji: '💠', statBonus: { takimUyumu: 2, mentalGuc: 2 }, category: 'Tank', description: '+2 Takim +2 Mental' },
  // Boots
  { id: 'boots', name: 'Boots of Speed', cost: 300, emoji: '👢', statBonus: { mekanik: 1 }, category: 'Boots', description: '+1 Mekanik' },
  { id: 'berserkers', name: "Berserker's Greaves", cost: 1100, emoji: '🥾', statBonus: { mekanik: 3, oyunBilgisi: 1 }, category: 'Boots', description: '+3 Mekanik +1 OB' },
  { id: 'sorcerer', name: "Sorcerer's Shoes", cost: 1100, emoji: '👞', statBonus: { oyunBilgisi: 3, mekanik: 1 }, category: 'Boots', description: '+3 OB +1 Mekanik' },
  { id: 'plated', name: 'Plated Steelcaps', cost: 1100, emoji: '🥿', statBonus: { mentalGuc: 3, mekanik: 1 }, category: 'Boots', description: '+3 Mental +1 Mekanik' },
  { id: 'mercury', name: "Mercury's Treads", cost: 1100, emoji: '👟', statBonus: { mentalGuc: 2, takimUyumu: 2 }, category: 'Boots', description: '+2 Mental +2 Takim' },
  // Utility
  { id: 'refillable', name: 'Refillable Potion', cost: 150, emoji: '🧪', statBonus: { mentalGuc: 1 }, category: 'Utility', description: 'Yeniden kullanilabilir' },
  { id: 'controlWard', name: 'Control Ward', cost: 75, emoji: '👁️', statBonus: { takimUyumu: 1 }, category: 'Utility', description: '+1 Takim Uyumu' },
  { id: 'stopwatch', name: 'Stopwatch', cost: 750, emoji: '⏱️', statBonus: { oyunBilgisi: 2, mentalGuc: 2 }, category: 'Utility', description: '+2 OB +2 Mental' },
  { id: 'doransBlade', name: "Doran's Blade", cost: 450, emoji: '🗡️', statBonus: { mekanik: 2, mentalGuc: 1 }, category: 'AD', description: '+2 Mekanik +1 Mental' },
  { id: 'doransRing', name: "Doran's Ring", cost: 400, emoji: '💍', statBonus: { oyunBilgisi: 2, mentalGuc: 1 }, category: 'AP', description: '+2 OB +1 Mental' },
  { id: 'doransShield', name: "Doran's Shield", cost: 450, emoji: '🛡️', statBonus: { mentalGuc: 2, mekanik: 1 }, category: 'Tank', description: '+2 Mental +1 Mekanik' },
];

export const matchCompletedItems: { id: string; name: string; components: string[]; cost: number; emoji: string; statBonus: Partial<PlayerStats>; description: string; category: string }[] = [
  { id: 'infinityEdge', name: 'Infinity Edge', components: ['bfSword', 'pickaxe', 'dagger'], cost: 600, emoji: '🔥', statBonus: { mekanik: 12 }, description: '+12 Mekanik CRIT', category: 'AD' },
  { id: 'bloodthirster', name: 'Bloodthirster', components: ['bfSword', 'caulfield', 'longSword'], cost: 500, emoji: '🩸', statBonus: { mekanik: 10, mentalGuc: 3 }, description: '+10 Mekanik +3 Mental', category: 'AD' },
  { id: 'krakenSlayer', name: 'Kraken Slayer', components: ['pickaxe', 'recurveBow', 'dagger'], cost: 500, emoji: '🐙', statBonus: { mekanik: 8, oyunBilgisi: 4 }, description: '+8 Mekanik +4 OB', category: 'AD' },
  { id: 'rabadon', name: "Rabadon's Deathcap", components: ['needless', 'needless', 'ampTome'], cost: 700, emoji: '🎩', statBonus: { oyunBilgisi: 18 }, description: '+18 Oyun Bilgisi', category: 'AP' },
  { id: 'luden', name: "Luden's Companion", components: ['lostChapter', 'blastingWand', 'ampTome'], cost: 500, emoji: '🌩️', statBonus: { oyunBilgisi: 12, mekanik: 3 }, description: '+12 OB +3 Mekanik', category: 'AP' },
  { id: 'zhonya', name: "Zhonya's Hourglass", components: ['needless', 'stopwatch', 'fiendish'], cost: 600, emoji: '⌛', statBonus: { oyunBilgisi: 10, mentalGuc: 4 }, description: '+10 OB +4 Mental', category: 'AP' },
  { id: 'voidStaff', name: 'Void Staff', components: ['blastingWand', 'fiendish', 'ampTome'], cost: 400, emoji: '🕳️', statBonus: { oyunBilgisi: 11, takimUyumu: 2 }, description: '+11 OB +2 Takim', category: 'AP' },
  { id: 'thornmail', name: 'Thornmail', components: ['chainVest', 'giantsBelt', 'rubyCrystal'], cost: 500, emoji: '🌵', statBonus: { mentalGuc: 10, mekanik: 2 }, description: '+10 Mental +2 Mekanik', category: 'Tank' },
  { id: 'spiritVisage', name: 'Spirit Visage', components: ['kindlegem', 'nullMantle', 'rubyCrystal'], cost: 400, emoji: '👻', statBonus: { mentalGuc: 8, takimUyumu: 4 }, description: '+8 Mental +4 Takim', category: 'Tank' },
  { id: 'deadMansPlate', name: "Dead Man's Plate", components: ['chainVest', 'giantsBelt', 'clothArmor'], cost: 500, emoji: '⚰️', statBonus: { mentalGuc: 9, mekanik: 3 }, description: '+9 Mental +3 Mekanik', category: 'Tank' },
  { id: 'warmog', name: "Warmog's Armor", components: ['giantsBelt', 'giantsBelt', 'kindlegem'], cost: 600, emoji: '❤️', statBonus: { mentalGuc: 14, takimUyumu: 2 }, description: '+14 Mental +2 Takim', category: 'Tank' },
  { id: 'guardianAngel', name: 'Guardian Angel', components: ['bfSword', 'chainVest', 'stopwatch'], cost: 500, emoji: '👼', statBonus: { mekanik: 5, mentalGuc: 5 }, description: '+5 Mekanik +5 Mental', category: 'AD' },
];

// Get all buyable items (components + boots that are upgrades)
export function getAllShopItems(bootsOwned: boolean) {
  const comps = matchComponents.filter(c => {
    if (c.id === 'berserkers' || c.id === 'sorcerer' || c.id === 'plated' || c.id === 'mercury') return bootsOwned;
    return true;
  });
  return [...comps, ...matchCompletedItems];
}

export function canCombine(items: string[]): string | null {
  for (const ci of matchCompletedItems) {
    const owned = [...items];
    let matched = true;
    for (const req of ci.components) {
      const idx = owned.indexOf(req);
      if (idx === -1) { matched = false; break; }
      owned.splice(idx, 1);
    }
    if (matched) return ci.id;
  }
  return null;
}

export function getRecommendedItems(preferredLane: string): string[] {
  if (preferredLane === 'Üst Koridor') return ['krakenSlayer', 'deadMansPlate', 'spiritVisage', 'guardianAngel', 'caulfield', 'doransBlade'];
  if (preferredLane === 'Orman') return ['krakenSlayer', 'deadMansPlate', 'infinityEdge', 'warmog', 'caulfield', 'doransBlade'];
  if (preferredLane === 'Orta Koridor') return ['rabadon', 'luden', 'zhonya', 'voidStaff', 'lostChapter', 'doransRing'];
  if (preferredLane === 'Alt Koridor') return ['infinityEdge', 'krakenSlayer', 'guardianAngel', 'bloodthirster', 'pickaxe', 'doransBlade'];
  if (preferredLane === 'Destek') return ['spiritVisage', 'warmog', 'luden', 'zhonya', 'kindlegem', 'doransShield'];
  return ['infinityEdge', 'krakenSlayer', 'rabadon', 'luden', 'bfSword', 'doransBlade'];
}

export const allAchievements: Achievement[] = [
  { id: 'firstBlood', name: 'Ilk Kan', description: 'Ilk oldurmeyi aldin!', emoji: '🩸', xpBonus: 5, beBonus: 20 },
  { id: 'pentakill', name: 'Pentakill', description: '5 kisi birden oldurdun!', emoji: '🔥', xpBonus: 20, beBonus: 100 },
  { id: 'unkillable', name: 'Olumsuz', description: 'Hic olmeden maci tamamla!', emoji: '👼', xpBonus: 10, beBonus: 50 },
  { id: 'legendary', name: 'Efsanevi', description: '8+ kill al!', emoji: '👑', xpBonus: 8, beBonus: 40 },
  { id: 'carryMachine', name: 'Tasiyici', description: '15+ kill ve asist!', emoji: '💪', xpBonus: 12, beBonus: 60 },
  { id: 'visionKing', name: 'Harita Hakimi', description: '10+ asist al!', emoji: '👁️', xpBonus: 5, beBonus: 25 },
  { id: 'objectiveMaster', name: 'Objektif Ustasi', description: 'Baron+Ejder al!', emoji: '🐉', xpBonus: 10, beBonus: 40 },
  { id: 'goldenHand', name: 'Altin El', description: '4+ item tamamla!', emoji: '🪙', xpBonus: 5, beBonus: 30 },
];

export const seasonModifiers: SeasonModifier[] = [
  { season: 'winter', name: 'Kis Sezonu', xpMultiplier: 1.2, beMultiplier: 1.1, eventDescription: 'Kis etkinligi: +%20 XP, +%10 BE!' },
  { season: 'spring', name: 'Ilkbahar Sezonu', xpMultiplier: 1.0, beMultiplier: 1.0, eventDescription: 'Yeni baslangiclar sezonu.' },
  { season: 'summer', name: 'Yaz Sezonu', xpMultiplier: 1.3, beMultiplier: 1.2, eventDescription: 'Yaz etkinligi: +%30 XP, +%20 BE!' },
];

function getSeasonMod(season: 'winter' | 'spring' | 'summer'): SeasonModifier {
  return seasonModifiers.find(m => m.season === season) || seasonModifiers[1];
}

// === DAILY QUESTS ===
const questPool = [
  { description: '3 mac oyna', type: 'playMatches' as const, count: 3, reward: { xp: 30, be: 50 } },
  { description: '2 mac kazan', type: 'winMatches' as const, count: 2, reward: { xp: 40, be: 80 } },
  { description: '10 kill al', type: 'getKills' as const, count: 10, reward: { xp: 25, be: 60 } },
  { description: '5000 altin kazan', type: 'earnGold' as const, count: 5000, reward: { xp: 20, be: 40, tl: 100 } },
  { description: 'Seviye atla', type: 'levelUp' as const, count: 1, reward: { xp: 50, be: 100 } },
  { description: '4 mac oyna', type: 'playMatches' as const, count: 4, reward: { xp: 35, be: 70 } },
  { description: '20 kill al', type: 'getKills' as const, count: 20, reward: { xp: 50, be: 120 } },
  { description: '1 ranked mac kazan', type: 'winMatches' as const, count: 1, reward: { xp: 60, be: 150 } },
];

// === SPONSORS ===
const sponsorPool: Sponsorship[] = [
  { id: 'redbull', brand: 'Red Bull', emoji: '🐂', tier: 1, incomePerDay: 50, requirement: { followers: 500 }, duration: 10, expiresDay: 0 },
  { id: 'logitech', brand: 'Logitech', emoji: '🖱️', tier: 2, incomePerDay: 150, requirement: { followers: 2000, level: 15 }, duration: 15, expiresDay: 0 },
  { id: 'razer', brand: 'Razer', emoji: '🐍', tier: 3, incomePerDay: 300, requirement: { followers: 5000, level: 25, subscribers: 50 }, duration: 20, expiresDay: 0 },
  { id: 'monster', brand: 'Monster Energy', emoji: '⚡', tier: 2, incomePerDay: 120, requirement: { followers: 1000, level: 10 }, duration: 12, expiresDay: 0 },
  { id: 'samsung', brand: 'Samsung', emoji: '📱', tier: 3, incomePerDay: 400, requirement: { followers: 10000, level: 30 }, duration: 25, expiresDay: 0 },
  { id: 'hyperx', brand: 'HyperX', emoji: '🎧', tier: 1, incomePerDay: 80, requirement: { followers: 300, level: 5 }, duration: 8, expiresDay: 0 },
  { id: 'nike', brand: 'Nike', emoji: '👟', tier: 3, incomePerDay: 500, requirement: { followers: 20000, level: 40, rankTier: 'elmas' }, duration: 30, expiresDay: 0 },
];

// === TOURNAMENTS ===
const tournamentTemplates = [
  { name: 'Mahalle Turnuvasi', tier: 'local' as const, prizePool: 500, reward: { tl: 300, be: 500, xp: 100, fame: 10 }, format: 'BO1' as const, rounds: 2 },
  { name: 'Bolgesel Sampiyona', tier: 'regional' as const, prizePool: 2000, reward: { tl: 1500, be: 2000, xp: 200, fame: 25 }, format: 'BO3' as const, rounds: 3 },
  { name: 'Ulusal Lig', tier: 'national' as const, prizePool: 10000, reward: { tl: 8000, be: 5000, xp: 500, fame: 50 }, format: 'BO3' as const, rounds: 4 },
  { name: 'International Cup', tier: 'international' as const, prizePool: 50000, reward: { tl: 40000, be: 15000, xp: 1000, fame: 100 }, format: 'BO5' as const, rounds: 5 },
];

// === SEASON REWARDS ===
export const seasonRewardsList: SeasonReward[] = [
  { tier: 'demir', emoji: '🪨', name: 'Demir Odulu', beBonus: 100, xpBonus: 50, skinId: 'demir_skin' },
  { tier: 'bronz', emoji: '🥉', name: 'Bronz Odulu', beBonus: 200, xpBonus: 100, skinId: 'bronz_skin' },
  { tier: 'gumus', emoji: '🥈', name: 'Gumus Odulu', beBonus: 500, xpBonus: 200, skinId: 'gumus_skin' },
  { tier: 'altin', emoji: '🥇', name: 'Altin Odulu', beBonus: 1000, xpBonus: 400, skinId: 'altin_skin' },
  { tier: 'platin', emoji: '💎', name: 'Platin Odulu', beBonus: 2000, xpBonus: 800, skinId: 'platin_skin' },
  { tier: 'zumrut', emoji: '🟢', name: 'Zumrut Odulu', beBonus: 3500, xpBonus: 1200, skinId: 'zumrut_skin' },
  { tier: 'elmas', emoji: '🔷', name: 'Elmas Odulu', beBonus: 5000, xpBonus: 2000, skinId: 'elmas_skin' },
  { tier: 'master', emoji: '👑', name: 'Master Odulu', beBonus: 10000, xpBonus: 5000, skinId: 'master_skin' },
  { tier: 'grandmaster', emoji: '🔥', name: 'GM Odulu', beBonus: 20000, xpBonus: 10000, skinId: 'gm_skin' },
  { tier: 'challenger', emoji: '🏆', name: 'Challenger Odulu', beBonus: 50000, xpBonus: 25000, skinId: 'chall_skin' },
];

// === CHAMPION ABILITIES ===
export function getChampionAbilities(championId: string) {
  const roleMap: Record<string, string> = {
    Akshan: 'ADC', Amumu: 'Tank', Braum: 'Support', Briar: 'Fighter', Darius: 'Fighter',
    Fiora: 'Fighter', Graves: 'ADC', Malphite: 'Tank', Maokai: 'Tank', MissFortune: 'ADC',
    Morgana: 'Mage', Naafiri: 'Assassin', Olaf: 'Fighter', RekSai: 'Fighter', Rell: 'Tank',
    Renekton: 'Fighter', Seraphine: 'Mage', Soraka: 'Support', Taric: 'Support', Vex: 'Mage',
    Varus: 'ADC', Yuumi: 'Support', default: 'Fighter',
  };
  const type = roleMap[championId] || roleMap.default;
  const abilitySets: Record<string, ChampionAbility[]> = {
    Fighter: [
      { id: 'q1', name: 'Darbeler', key: 'Q', emoji: '👊', description: '+%3 galibiyet sansi', effect: { winBonus: 0.03 }, level: 1, maxLevel: 5 },
      { id: 'w1', name: 'Dayaniklilik', key: 'W', emoji: '🛡️', description: '+%2 KDA bonusu', effect: { kdaBias: 2 }, level: 1, maxLevel: 5 },
      { id: 'e1', name: 'Atilim', key: 'E', emoji: '💨', description: '+50 altin/olay', effect: { goldBonus: 50 }, level: 1, maxLevel: 5 },
      { id: 'r1', name: 'Ofke', key: 'R', emoji: '💢', description: '+%5 mekanik carpani', effect: { statMultiplier: { mekanik: 0.05 } }, level: 1, maxLevel: 3 },
    ],
    ADC: [
      { id: 'q2', name: 'Keskin Nisan', key: 'Q', emoji: '🎯', description: '+%4 galibiyet', effect: { winBonus: 0.04 }, level: 1, maxLevel: 5 },
      { id: 'w2', name: 'Atis Hizi', key: 'W', emoji: '💢', description: '+150 altin/olay', effect: { goldBonus: 150 }, level: 1, maxLevel: 5 },
      { id: 'e2', name: 'Kaçis', key: 'E', emoji: '🏃', description: '+%3 KDA', effect: { kdaBias: 3 }, level: 1, maxLevel: 5 },
      { id: 'r2', name: 'Oldurucu Atis', key: 'R', emoji: '💥', description: '+%7 mekanik', effect: { statMultiplier: { mekanik: 0.07 } }, level: 0, maxLevel: 3 },
    ],
    Mage: [
      { id: 'q3', name: 'Buyu Atesi', key: 'Q', emoji: '🔥', description: '+%3 oyun bilgisi', effect: { statMultiplier: { oyunBilgisi: 0.03 } }, level: 1, maxLevel: 5 },
      { id: 'w3', name: 'Kalkan', key: 'W', emoji: '🔮', description: '+%2 galibiyet', effect: { winBonus: 0.02 }, level: 1, maxLevel: 5 },
      { id: 'e3', name: 'Isinlanma', key: 'E', emoji: '🌀', description: '+%2 mental', effect: { statMultiplier: { mentalGuc: 0.02 } }, level: 1, maxLevel: 5 },
      { id: 'r3', name: 'Ulti Patlamasi', key: 'R', emoji: '☄️', description: '+%10 OB carpani', effect: { statMultiplier: { oyunBilgisi: 0.10 } }, level: 0, maxLevel: 3 },
    ],
    Tank: [
      { id: 'q4', name: 'Darbe', key: 'Q', emoji: '👊', description: '+%2 mekanik', effect: { statMultiplier: { mekanik: 0.02 } }, level: 1, maxLevel: 5 },
      { id: 'w4', name: 'Kalkan Duvar', key: 'W', emoji: '🛡️', description: '+%4 mental', effect: { statMultiplier: { mentalGuc: 0.04 } }, level: 1, maxLevel: 5 },
      { id: 'e4', name: 'Sarsma', key: 'E', emoji: '💥', description: '+%3 takim', effect: { statMultiplier: { takimUyumu: 0.03 } }, level: 1, maxLevel: 5 },
      { id: 'r4', name: 'Dev Kalkan', key: 'R', emoji: '⛰️', description: '+%12 mental', effect: { statMultiplier: { mentalGuc: 0.12 } }, level: 0, maxLevel: 3 },
    ],
    Support: [
      { id: 'q5', name: 'Iyilestirme', key: 'Q', emoji: '💚', description: '+%3 takim', effect: { statMultiplier: { takimUyumu: 0.03 } }, level: 1, maxLevel: 5 },
      { id: 'w5', name: 'Kalkan', key: 'W', emoji: '🛡️', description: '+%3 mental', effect: { statMultiplier: { mentalGuc: 0.03 } }, level: 1, maxLevel: 5 },
      { id: 'e5', name: 'CC Yetenegi', key: 'E', emoji: '⛓️', description: '+%2 galibiyet', effect: { winBonus: 0.02 }, level: 1, maxLevel: 5 },
      { id: 'r5', name: 'Destek Ultisi', key: 'R', emoji: '🌟', description: '+%10 takim', effect: { statMultiplier: { takimUyumu: 0.10 } }, level: 0, maxLevel: 3 },
    ],
    Assassin: [
      { id: 'q6', name: 'Suikast', key: 'Q', emoji: '🗡️', description: '+%5 mekanik', effect: { statMultiplier: { mekanik: 0.05 } }, level: 1, maxLevel: 5 },
      { id: 'w6', name: 'Gizlenme', key: 'W', emoji: '👻', description: '+%3 KDA', effect: { kdaBias: 3 }, level: 1, maxLevel: 5 },
      { id: 'e6', name: 'Atilim', key: 'E', emoji: '⚡', description: '+200 altin/olay', effect: { goldBonus: 200 }, level: 1, maxLevel: 5 },
      { id: 'r6', name: 'Oldurucu Darbe', key: 'R', emoji: '💀', description: '+%8 mekanik', effect: { statMultiplier: { mekanik: 0.08 } }, level: 0, maxLevel: 3 },
    ],
  };
  return abilitySets[type] || abilitySets.Fighter;
}

const defaultProfile: PlayerProfile = {
  name: '',
  level: 1, xp: 0, xpToNext: 150,
  stats: initialStats,
  balance: 200, blueEssence: 0,
  rank: { tier: 'unranked', lp: 0 },
  champions: [],
  championMastery: [],
  equipment: [],
  currentTime: { hour: 9, minute: 0, day: 1 },
  energy: 100, tired: false,
  messages: [],
  twitch: { followers: 0, subscribers: 0, donations: 0, streaming: false },
  matchLog: [],
  matchActive: false, matchMode: 'normal', matchEvents: [], matchKDA: { kills: 0, deaths: 0, assists: 0 },
  matchStats: { cs: 0, visionScore: 0, goldEarned: 0, damageDealt: 0, damageTaken: 0, towersDestroyed: 0, inhibsDestroyed: 0, objectives: [] },
  matchGold: 500, matchSpells: ['flash', 'ignite'], matchRunePage: 'conqueror', matchItems: [], matchAchievements: [],
  seasonModifier: seasonModifiers[0],
  team: null,
  season: 'winter', seasonWins: 0, seasonLosses: 0, rankedGames: 0,
  leaderboard: [
    { name: 'Taylan', points: 14, tier: 'elmas' },
    { name: 'Kerem', points: 6, tier: 'altin' },
    { name: 'Efe', points: 3, tier: 'gumus' },
  ],
  lastMatchResult: null,
  duoPartner: null, activeTournament: null, tournamentHistory: [],
  dailyQuests: [], promoSeries: null, sponsorships: [],
  lootBoxes: [], seasonRewardsClaimed: [], teamContract: null,
  fame: 0,
  careerStats: { totalMatches: 0, totalWins: 0, totalKills: 0, totalDeaths: 0, totalAssists: 0, highestRank: 'unranked', mostPlayedChamp: '', mostPlayedCount: 0, pentakills: 0, totalGoldEarned: 0, totalXP: 0 },
  clan: null, coach: null, cosmetics: [], activeCosmetics: { frame: null, icon: null, background: null },
  theme: 'dark', saveSlots: [], tutorialComplete: false,
};

// === COSMETICS ===
export const cosmeticItems: Cosmetic[] = [
  { id: 'frame_gold', name: 'Altin Cerceve', type: 'frame', emoji: '🟡', cost: 5000, owned: false, equipped: false },
  { id: 'frame_elmas', name: 'Elmas Cerceve', type: 'frame', emoji: '💎', cost: 15000, owned: false, equipped: false },
  { id: 'frame_atess', name: 'Ates Cercevesi', type: 'frame', emoji: '🔥', cost: 10000, owned: false, equipped: false },
  { id: 'icon_taht', name: 'Taht Simgesi', type: 'icon', emoji: '👑', cost: 3000, owned: false, equipped: false },
  { id: 'icon_kilic', name: 'Kilic Simgesi', type: 'icon', emoji: '⚔️', cost: 3000, owned: false, equipped: false },
  { id: 'icon_yildiz', name: 'Yildiz Simgesi', type: 'icon', emoji: '⭐', cost: 5000, owned: false, equipped: false },
  { id: 'bg_uzay', name: 'Uzay Temasi', type: 'background', emoji: '🌌', cost: 8000, owned: false, equipped: false },
  { id: 'bg_yesil', name: 'Orman Temasi', type: 'background', emoji: '🌿', cost: 6000, owned: false, equipped: false },
];

// === COACHES ===
export const coachPool: Coach[] = [
  { id: 'coach1', name: 'Amatör Koç', emoji: '🎓', tier: 1, costPerDay: 50, statBonus: { oyunBilgisi: 2 }, specialty: 'Temel mekanik' },
  { id: 'coach2', name: 'Pro Koç', emoji: '🏅', tier: 2, costPerDay: 150, statBonus: { oyunBilgisi: 4, mekanik: 2 }, specialty: 'Lane yönetimi' },
  { id: 'coach3', name: 'Efsane Koç', emoji: '👑', tier: 3, costPerDay: 400, statBonus: { oyunBilgisi: 6, mekanik: 3, mentalGuc: 3 }, specialty: 'Profesyonel taktik' },
];

// === CLANS ===
const clanNames = ['Karanlik Kurtlar', 'Atesin Cocuklari', 'Firtina Kraliyet', 'Gece Muhafizlari', 'Yildiz Birligi', 'Demir Lejyon'];

function generateMatchEvents(stats: PlayerStats, level: number): MatchEvent[] {
  const events: MatchEvent[] = [];
  const r = () => Math.random();
  const g = (min: number, max: number) => min + Math.floor(r() * (max - min + 1));

  // Erken oyun (dk 2-8)
  if (r() > 0.3) {
    events.push({ minute: 3 + Math.floor(r() * 4), text: 'Rakip ormanci ust koridoru gankledi!', type: 'negative', kdaEffect: { kills: 0, deaths: 1, assists: 0 }, goldEffect: 40 });
  }
  if (r() > 0.4) {
    events.push({ minute: 6 + Math.floor(r() * 3), text: 'Minion kontrolun mukemmeldi.', type: 'positive', kdaEffect: { kills: 0, deaths: 0, assists: 1 }, goldEffect: 80 });
  }
  if (r() > 0.3) {
    events.push({ minute: 4 + Math.floor(r() * 3), text: 'Rakip hata yapti, erkene oldurme firsati!', type: 'positive', kdaEffect: { kills: 1, deaths: 0, assists: 0 }, goldEffect: 120 });
  }
  if (r() > 0.35) {
    events.push({ minute: 7, text: 'Kuleye plaka vurdun! +120 altin.', type: 'positive', kdaEffect: { kills: 0, deaths: 0, assists: 0 }, goldEffect: 120 });
  }
  if (r() > 0.5) {
    events.push({
      minute: 5 + Math.floor(r() * 5), text: 'Rakiple karsi karsiyasin!',
      type: 'interactive',
      options: [
        { id: 'trade', text: 'Trade ac (Riskli)', statCheck: 'mekanik', successChance: 0.5, outcome: { success: 'Rakibi alt ettin! +1 kill', fail: 'Fazla zorladin, olume yakin. -1 olum' }, statReward: 4, kdaSuccess: { kills: 1, deaths: 0, assists: 0 }, kdaFail: { kills: 0, deaths: 1, assists: 0 }, goldReward: 200 },
        { id: 'farm', text: 'Farm yapmaya devam et (Guvenli)', statCheck: 'oyunBilgisi', successChance: 0.8, outcome: { success: 'Minyon farki actim! +80 altin', fail: 'Rakip seni minyon altinda yakaladi.' }, statReward: 2, kdaSuccess: { kills: 0, deaths: 0, assists: 1 }, kdaFail: { kills: 0, deaths: 1, assists: 0 }, goldReward: 100 },
      ],
    });
  }
  if (r() > 0.4) {
    events.push({
      minute: 8 + Math.floor(r() * 4), text: 'Ormanci yardim istiyor!',
      type: 'interactive',
      options: [
        { id: 'help', text: 'Ormanciya yardima git', statCheck: 'takimUyumu', successChance: 0.6, outcome: { success: 'Basarili gank! Cift oldurme! +1 kill, +1 asist', fail: 'Zamanlaman kotuydu, ikiniz de oldunuz. -2 olum' }, statReward: 4, kdaSuccess: { kills: 1, deaths: 0, assists: 1 }, kdaFail: { kills: 0, deaths: 2, assists: 0 }, goldReward: 250 },
        { id: 'ignore', text: 'Kendi koridorunda kal', statCheck: 'mekanik', successChance: 0.7, outcome: { success: 'Toweri ittin, plaka aldin! +160 altin', fail: 'Rakip ormanci arkadan geldi... -1 olum' }, statReward: 2, kdaSuccess: { kills: 0, deaths: 0, assists: 0 }, kdaFail: { kills: 0, deaths: 1, assists: 0 }, goldReward: 120 },
      ],
    });
  }

  // Orta oyun (dk 10-20)
  if (r() > 0.5) {
    events.push({ minute: 10 + Math.floor(r() * 3), text: 'Haritada vizyon ustunlugu kazandin! +100 altin', type: 'positive', kdaEffect: { kills: 0, deaths: 0, assists: 1 }, goldEffect: 100 });
  }
  if (level >= 20 || r() > 0.3) {
    events.push({ minute: 12 + Math.floor(r() * 4), text: stats.mekanik > 35 ? 'Koridorunda ustun durumdasin! +1 kill, +150 altin' : 'Alt koridor zor durumda. -1 olum', type: stats.mekanik > 35 ? 'positive' : 'negative', kdaEffect: stats.mekanik > 35 ? { kills: 1, deaths: 0, assists: 0 } : { kills: 0, deaths: 1, assists: 0 }, goldEffect: stats.mekanik > 35 ? 150 : 30 });
  }
  if (r() > 0.4) {
    events.push({
      minute: 14 + Math.floor(r() * 5), text: 'Rakip takim objektif aliyor!',
      type: 'interactive',
      options: [
        { id: 'contest', text: 'Itiraz et (Riskli)', statCheck: 'mentalGuc', successChance: 0.5, outcome: { success: 'Ejderi caldin! Muhtesem! +3 kill', fail: 'Dalmak ise yaramadi, takim dagildi. -1 olum' }, statReward: 5, kdaSuccess: { kills: 3, deaths: 0, assists: 0 }, kdaFail: { kills: 0, deaths: 1, assists: 0 }, goldReward: 300 },
        { id: 'concede', text: 'Karsiligi al (Guvenli)', statCheck: 'oyunBilgisi', successChance: 0.7, outcome: { success: 'Karsi koridoru ittin, kule aldin. +1 kill', fail: 'Objektifi verdin ama rakibe de altin vermedin. -1 olum' }, statReward: 2, kdaSuccess: { kills: 1, deaths: 0, assists: 0 }, kdaFail: { kills: 0, deaths: 1, assists: 0 }, goldReward: 150 },
      ],
    });
  }
  if (r() > 0.4) {
    events.push({ minute: 16 + Math.floor(r() * 4), text: 'Koridorda minyon dalgasi temizledin! +100 altin', type: 'positive', kdaEffect: { kills: 0, deaths: 0, assists: 0 }, goldEffect: 100 });
  }
  if (r() > 0.5) {
    events.push({
      minute: 18 + Math.floor(r() * 5), text: 'Takimin moral testi!',
      type: 'interactive',
      options: [
        { id: 'shotcall', text: 'Shotcall yap (Liderlik)', statCheck: 'mentalGuc', successChance: 0.5, outcome: { success: 'Takim toparlandi, dogru karar! +1 kill, +2 asist', fail: 'Kimse seni dinlemedi, moral dustu. -1 olum' }, statReward: 4, kdaSuccess: { kills: 1, deaths: 0, assists: 2 }, kdaFail: { kills: 0, deaths: 1, assists: 0 }, goldReward: 200 },
        { id: 'focus', text: 'Kendi oyununa odaklan', statCheck: 'mekanik', successChance: 0.7, outcome: { success: 'Bireysel performansin harikaydi! +1 kill', fail: 'Takimin dagilmasini engelleyemedin. -1 olum' }, statReward: 2, kdaSuccess: { kills: 1, deaths: 0, assists: 0 }, kdaFail: { kills: 0, deaths: 1, assists: 0 }, goldReward: 120 },
      ],
    });
  }
  if (r() > 0.3) {
    events.push({ minute: 19, text: 'Rakip ormanda yakalandi! +1 kill, +1 asist, +200 altin', type: 'positive', kdaEffect: { kills: 1, deaths: 0, assists: 1 }, goldEffect: 200 });
  }

  // Gec oyun (dk 22-35)
  if (r() > 0.3) {
    events.push({
      minute: 22 + Math.floor(r() * 6), text: 'Buyuk takim savasi yaklasiyor!',
      type: 'interactive',
      options: [
        { id: 'engage', text: 'Baslat! (Riskli)', statCheck: 'mekanik', successChance: 0.5, outcome: { success: 'Yildiz oldun! Takim savasini kazandiniz! +3 kill, +1 asist', fail: 'Kotu engage, takim silindi. -3 olum' }, statReward: 5, kdaSuccess: { kills: 3, deaths: 0, assists: 1 }, kdaFail: { kills: 0, deaths: 3, assists: 0 }, goldReward: 400 },
        { id: 'wait', text: 'Bekle ve karsila (Guvenli)', statCheck: 'takimUyumu', successChance: 0.6, outcome: { success: 'Dogru zamanlamayla karsiladiniz! +2 kill', fail: 'Cok gec kaldiniz, avantaji verdiniz. -2 olum' }, statReward: 3, kdaSuccess: { kills: 2, deaths: 0, assists: 0 }, kdaFail: { kills: 0, deaths: 2, assists: 0 }, goldReward: 200 },
      ],
    });
  }
  if (r() > 0.4) {
    events.push({
      minute: 28 + Math.floor(r() * 5), text: 'Baron cikti! Ne yapacaksin?',
      type: 'interactive',
      options: [
        { id: 'baron', text: 'Baronu ac (Riskli)', statCheck: 'oyunBilgisi', successChance: 0.5, outcome: { success: 'Baronu calmayi basardin! +2 kill, +2 asist', fail: 'Rakip Baronu caldi ve takimi sildi. -2 olum' }, statReward: 6, kdaSuccess: { kills: 2, deaths: 0, assists: 2 }, kdaFail: { kills: 0, deaths: 2, assists: 0 }, goldReward: 500 },
        { id: 'split', text: 'Split push yap', statCheck: 'mekanik', successChance: 0.6, outcome: { success: 'Inhibitoru aldin! +1 kill', fail: 'Rakip seni tekledi ve Baronu da aldi. -1 olum' }, statReward: 3, kdaSuccess: { kills: 1, deaths: 0, assists: 0 }, kdaFail: { kills: 0, deaths: 1, assists: 0 }, goldReward: 180 },
      ],
    });
  }
  if (r() > 0.4) {
    events.push({ minute: 30 + Math.floor(r() * 4), text: 'Super minyon dalgasi dalgasi temizlendi! +150 altin', type: 'positive', kdaEffect: { kills: 0, deaths: 0, assists: 1 }, goldEffect: 150 });
  }
  if (r() > 0.5) {
    events.push({
      minute: 32 + Math.floor(r() * 6), text: 'Rakip elder ejderi almak uzere!',
      type: 'interactive',
      options: [
        { id: 'steal', text: 'Cal (Cok riskli)', statCheck: 'mentalGuc', successChance: 0.3, outcome: { success: 'INANILMAZ CALMA! EFSANE! +4 kill', fail: 'Daldin ve oldun, takim 4v5 kaldi. -1 olum' }, statReward: 8, kdaSuccess: { kills: 4, deaths: 0, assists: 0 }, kdaFail: { kills: 0, deaths: 1, assists: 0 }, goldReward: 600 },
        { id: 'defend', text: 'Pozisyon al ve savun', statCheck: 'takimUyumu', successChance: 0.6, outcome: { success: 'Elderi vermedin, takim savasini kazandin! +2 kill, +1 asist', fail: 'Elderi aldilar, geri donusu zor. -1 olum' }, statReward: 4, kdaSuccess: { kills: 2, deaths: 0, assists: 1 }, kdaFail: { kills: 0, deaths: 1, assists: 0 }, goldReward: 250 },
      ],
    });
  }
  if (r() > 0.6) {
    events.push({ minute: 35 + Math.floor(r() * 5), text: 'Buyuk bir altin farki olustu! +250 altin', type: 'positive', kdaEffect: { kills: 0, deaths: 0, assists: 0 }, goldEffect: 250 });
  }
  return events;
}

interface GameStore extends PlayerProfile {
  devMenu: boolean;
  startGame: (name: string) => void;
  advanceTime: (hours: number) => void;
  workJob: (jobId: string) => void;
  playMatch: (mode: 'normal' | 'ranked') => void;
  makeChoice: (eventIndex: number, choiceId: string) => void;
  updateMatchKDA: (delta: KDADelta) => void;
  finishMatch: (championId?: string) => void;
  setMatchSpells: (spells: string[]) => void;
  setMatchRune: (rune: string) => void;
  buyMatchItem: (itemId: string) => boolean;
  addMatchGold: (amount: number) => void;
  tryCombineItems: () => string | null;
  buyItem: (itemId: string) => void;
  buyChampion: (id: string) => void;
  buyBlueEssence: (tl: number, be: number) => void;
  useEnergyDrink: () => void;
  acceptOffer: (msgId: string) => void;
  rejectOffer: (msgId: string) => void;
  bluffOffer: (msgId: string) => void;
  startStream: () => void;
  endStream: () => void;
  advanceDay: () => void;
  addLog: (text: string) => void;
  sendMessage: (from: string, text: string) => void;
  markMessageRead: (msgId: string) => void;
  markChatRead: (fromName: string) => void;
  toggleDevMenu: () => void;
  devSetLevel: (lvl: number) => void;
  devAddBalance: (amt: number) => void;
  devAddBE: (amt: number) => void;
  devSetStat: (stat: keyof PlayerStats, val: number) => void;
  devSetRank: (tier: RankTier) => void;
  devAddOffer: () => void;
  devUnlockAll: () => void;
  devMaxStats: () => void;
  devReset: () => void;
  saveGame: () => void;
  loadGame: () => boolean;
  acceptDuoRequest: (msgId: string) => void;
  generateDailyQuests: () => void;
  checkQuestProgress: (type: string, amount: number) => void;
  startTournament: () => void;
  playTournamentMatch: () => void;
  advanceSeason: () => void;
  claimSeasonRewards: () => void;
  acceptSponsorship: (sponsorId: string) => void;
  openLootBox: () => void;
  abilityLevelUp: (championId: string, abilityKey: string) => void;
  hireCoach: (coachId: string) => void;
  fireCoach: () => void;
  buyCosmetic: (cosmeticId: string) => void;
  equipCosmetic: (cosmeticId: string) => void;
  createClan: (name: string, tag: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  saveToSlot: (slot: number) => void;
  loadFromSlot: (slot: number) => boolean;
  completeTutorial: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...defaultProfile,
  devMenu: false,
  champions: generateInitialChampions(),

  startGame: (name) => {
    set({
      ...defaultProfile,
      name,
      champions: generateInitialChampions(),
      messages: [
        { id: 'welcome', from: 'Sistem', text: 'LOL Kariyer Oyununa hos geldin! Masaustundeki uygulamalari kesfet.', read: false },
        { id: 'tip1', from: 'Koc', text: 'Ipucu: Is ilanlarindan para kazanip Amazon\'dan ekipman alabilirsin.', read: false },
      ],
    });
  },

  advanceTime: (hours) => {
    const s = get();
    let hour = s.currentTime.hour + hours;
    let day = s.currentTime.day;
    let energyDrop = hours * 10;
    while (hour >= 24) { hour -= 24; day += 1; }
    if (hour >= 2) energyDrop += 20;
    const newEnergy = Math.max(0, s.energy - energyDrop);
    set({ currentTime: { hour, minute: 0, day }, energy: newEnergy, tired: hour >= 2 || newEnergy <= 0 });
    // Random chat messages
    if (Math.random() < 0.4) {
      const sender = chatContacts[Math.floor(Math.random() * chatContacts.length)];
      const text = chatTemplates[Math.floor(Math.random() * chatTemplates.length)];
      get().sendMessage(sender.name, text);
    }
    // Duo request chance
    if (Math.random() < 0.15 && s.level >= 10) {
      const sender = chatContacts[Math.floor(Math.random() * chatContacts.length)];
      const tiers = ['bronz', 'gumus', 'altin', 'platin', 'zumrut', 'elmas'];
      const ti = tiers[Math.floor(Math.random() * Math.min(6, Math.floor(s.level / 5) + 2))];
      get().sendMessage(sender.name, 'Duo? ' + ti.toUpperCase() + ' eloya cikmaya calisiyorum. Gel beraber girelim!');
    }
  },

  workJob: (jobId) => {
    const job = availableJobs.find((j: any) => j.id === jobId);
    if (!job) return;
    const s = get();
    s.advanceTime(job.durationHours);
    const stats = { ...s.stats };
    if (job.statBonus.mekanik) stats.mekanik = Math.min(100, stats.mekanik + job.statBonus.mekanik);
    if (job.statBonus.oyunBilgisi) stats.oyunBilgisi = Math.min(100, stats.oyunBilgisi + job.statBonus.oyunBilgisi);
    if (job.statBonus.takimUyumu) stats.takimUyumu = Math.min(100, stats.takimUyumu + job.statBonus.takimUyumu);
    if (job.statBonus.mentalGuc) stats.mentalGuc = Math.min(100, stats.mentalGuc + job.statBonus.mentalGuc);
    set({ balance: s.balance + job.pay, stats, matchLog: [...s.matchLog, 'Calistin +' + job.pay + ' TL'] });
  },

  playMatch: (mode) => {
    const s = get();
    if (s.matchActive) return;
    s.advanceTime(1);
    const events = generateMatchEvents(s.stats, s.level);
    const label = mode === 'ranked' ? 'Dereceli' : 'Normal';
    const seasonMod = getSeasonMod(s.season);
    set({ matchActive: true, matchMode: mode, matchEvents: events, matchKDA: { kills: 0, deaths: 0, assists: 0 },
      matchStats: { cs: 0, visionScore: 0, goldEarned: 0, damageDealt: 0, damageTaken: 0, towersDestroyed: 0, inhibsDestroyed: 0, objectives: [] },
      matchGold: 500, matchItems: [], matchAchievements: [], seasonModifier: seasonMod,
      matchLog: [...s.matchLog, label + ' mac basladi! ' + seasonMod.eventDescription],
    });
  },

  makeChoice: (eventIndex, choiceId) => {
    const s = get();
    const event = s.matchEvents[eventIndex];
    if (!event || !event.options) return;
    const choice = event.options.find(o => o.id === choiceId);
    if (!choice) return;
    const success = Math.random() < (s.stats[choice.statCheck] / 100) * choice.successChance;
    const text = success ? choice.outcome.success : choice.outcome.fail;
    const newStats = { ...s.stats };
    if (success) newStats[choice.statCheck] = Math.min(100, newStats[choice.statCheck] + choice.statReward);
    const newEvents = [...s.matchEvents];
    newEvents[eventIndex] = { ...event, type: success ? 'positive' : 'negative' };
    const kda = { ...s.matchKDA };
    const kdaD = success ? choice.kdaSuccess : choice.kdaFail;
    if (kdaD) { kda.kills += kdaD.kills || 0; kda.deaths += kdaD.deaths || 0; kda.assists += kdaD.assists || 0; }
    const goldBonus = (success ? choice.goldReward || 150 : 80) + Math.floor(Math.random() * 50);
    const newGold = s.matchGold + goldBonus;
    const newMatchStats = { ...s.matchStats, goldEarned: s.matchStats.goldEarned + goldBonus };
    set({ matchEvents: newEvents, stats: newStats, matchKDA: kda, matchGold: newGold, matchStats: newMatchStats, matchLog: [...s.matchLog, text] });
  },

  updateMatchKDA: (delta) => {
    const s = get();
    set({ matchKDA: { kills: s.matchKDA.kills + (delta.kills || 0), deaths: s.matchKDA.deaths + (delta.deaths || 0), assists: s.matchKDA.assists + (delta.assists || 0) } });
  },

  setMatchSpells: (spells) => set({ matchSpells: spells }),

  setMatchRune: (rune) => set({ matchRunePage: rune }),

  buyMatchItem: (itemId) => {
    const s = get();
    const item = [...matchComponents, ...matchCompletedItems].find(x => x.id === itemId);
    if (!item || s.matchGold < item.cost || s.matchItems.includes(itemId)) return false;
    // Check components for completed items
    if ('components' in item && item.components) {
      const ci = item as typeof matchCompletedItems[0];
      for (const req of ci.components) {
        if (!s.matchItems.includes(req)) return false;
      }
      // Remove components, add completed item
      let newItems = s.matchItems.filter(i => !ci.components.includes(i));
      newItems.push(itemId);
      set({ matchGold: s.matchGold - item.cost, matchItems: newItems });
      return true;
    }
    set({ matchGold: s.matchGold - item.cost, matchItems: [...s.matchItems, itemId] });
    return true;
  },

  addMatchGold: (amount) => {
    const s = get();
    const newGold = s.matchGold + amount;
    const newStats = { ...s.matchStats, goldEarned: s.matchStats.goldEarned + amount };
    set({ matchGold: newGold, matchStats: newStats });
  },

  tryCombineItems: () => {
    const s = get();
    const combineId = canCombine(s.matchItems);
    if (!combineId) return null;
    const ci = matchCompletedItems.find(x => x.id === combineId)!;
    const newItems = s.matchItems.filter(i => !ci.components.includes(i));
    newItems.push(combineId);
    set({ matchItems: newItems });
    return combineId;
  },

  finishMatch: (championId?) => {
    const s = get();
    const kda = s.matchKDA;
    const kdaScore = kda.kills * 3 - kda.deaths * 2 + kda.assists;

    // === Counter bonus ===
    let counterBonus = 0;
    if (championId) {
      const pc = s.champions.find((c: any) => c.id === championId);
      if (pc) {
        const roles = ['Üst Koridor', 'Orman', 'Orta Koridor', 'Alt Koridor', 'Destek'];
        const myRoleIdx = roles.indexOf(pc.role);
        const enemyRoleIdx = (myRoleIdx + 2) % 5; // simple rock-paper-scissors
        counterBonus = myRoleIdx === enemyRoleIdx ? 0 : (Math.random() > 0.5 ? 0.08 : -0.04);
      }
    }

    // === Spell & Rune bonus ===
    const spellBonus = s.matchSpells.reduce((sum: number, sid: string) => {
      const sp = summonerSpells.find(x => x.id === sid);
      if (!sp) return sum;
      return sum + Object.values(sp.statBonus).reduce((a, b) => a + b, 0) * 0.005;
    }, 0);
    const runeBonus = (() => {
      const rp = runePages.find(x => x.id === s.matchRunePage);
      if (!rp) return 0;
      return Object.values(rp.statBonus).reduce((a, b) => a + b, 0) * 0.01;
    })();
    const itemBonus = s.matchItems.reduce((sum: number, iid: string) => {
      const mi = [...matchComponents, ...matchCompletedItems].find(x => x.id === iid);
      if (!mi) return sum;
      return sum + Object.values(mi.statBonus).reduce((a, b) => a + b, 0) * 0.003;
    }, 0);

    const seasonMod = s.seasonModifier;
    const winChance = 0.3 + (s.stats.mekanik / 200) + (s.stats.oyunBilgisi / 200) + (s.stats.takimUyumu / 200) + (s.stats.mentalGuc / 200) + Math.min(0.2, kdaScore / 80) + spellBonus + runeBonus + itemBonus + counterBonus - 0.2;
    const won = Math.random() < Math.min(0.88, winChance);
    let xpGain = won ? 30 + Math.floor(Math.random() * 20) : 10 + Math.floor(Math.random() * 10);

    // === Achievements ===
    const unlocked: Achievement[] = [];
    if (kda.kills >= 1) unlocked.push(allAchievements.find(a => a.id === 'firstBlood')!);
    if (kda.kills >= 5) unlocked.push(allAchievements.find(a => a.id === 'pentakill')!);
    if (kda.deaths === 0) unlocked.push(allAchievements.find(a => a.id === 'unkillable')!);
    if (kda.kills >= 8) unlocked.push(allAchievements.find(a => a.id === 'legendary')!);
    if (kda.kills + kda.assists >= 15) unlocked.push(allAchievements.find(a => a.id === 'carryMachine')!);
    if (kda.assists >= 10) unlocked.push(allAchievements.find(a => a.id === 'visionKing')!);
    if (s.matchItems.length >= 4) unlocked.push(allAchievements.find(a => a.id === 'goldenHand')!);
    const hasObj = s.matchStats.objectives.some(o => o.won);
    if (hasObj && s.matchStats.objectives.length >= 2) unlocked.push(allAchievements.find(a => a.id === 'objectiveMaster')!);
    const validAch = unlocked.filter(a => a !== undefined);
    const achXpBonus = validAch.reduce((s, a) => s + a.xpBonus, 0);
    const achBeBonus = validAch.reduce((s, a) => s + a.beBonus, 0);

    // === Season multiplier ===
    xpGain = Math.floor(xpGain * seasonMod.xpMultiplier) + achXpBonus;

    let newXp = s.xp + xpGain;
    let newLevel = s.level;
    let newXpToNext = s.xpToNext;
    let newStats = { ...s.stats };
    const statKeys: (keyof PlayerStats)[] = ['mekanik', 'oyunBilgisi', 'takimUyumu', 'mentalGuc'];
    newStats[statKeys[Math.floor(Math.random() * 4)]] = Math.min(100, newStats[statKeys[Math.floor(Math.random() * 4)]] + (won ? 2 : 1));
    while (newXp >= newXpToNext) {
      newXp -= newXpToNext;
      newLevel += 1;
      newXpToNext = xpToLevel(newLevel);
      newStats.mekanik = Math.min(100, newStats.mekanik + 2);
      newStats.oyunBilgisi = Math.min(100, newStats.oyunBilgisi + 2);
      newStats.takimUyumu = Math.min(100, newStats.takimUyumu + 1);
      newStats.mentalGuc = Math.min(100, newStats.mentalGuc + 1);
    }
    // Ranked logic
    let newRank = s.rank;
    const newRankedGames = s.matchMode === 'ranked' ? s.rankedGames + 1 : s.rankedGames;
    let lpChangeText = '';
    if (s.matchMode === 'ranked') {
      if (s.rank.tier === 'unranked') {
        const newTotal = s.rankedGames + 1;
        lpChangeText = '(Plasman ' + newTotal + '/10)';
        if (newTotal >= 10) {
          const placed = calculatePlacementRank(won ? s.seasonWins + 1 : s.seasonWins, won ? s.seasonLosses : s.seasonLosses + 1);
          newRank = placed;
          lpChangeText = 'Yerlesme: ' + placed.tier.toUpperCase();
        }
      } else {
        const isMasterPlus = getTierIndex(s.rank.tier) >= 7;
        const oldLp = s.rank.lp;
        let lpChange = won ? 15 + Math.floor(Math.random() * 10) : -(5 + Math.floor(Math.random() * 5));
        let newLp = Math.min(100, Math.max(0, oldLp + lpChange));
        let newDivision = s.rank.division;
        let newTier = s.rank.tier;
        if (newLp >= 100) {
          newLp = 0;
          const currentIdx = getTierIndex(s.rank.tier);
          if (!isMasterPlus && newDivision && newDivision > 1) {
            newDivision = (newDivision - 1) as 1 | 2 | 3 | 4;
          } else {
            if (currentIdx < rankedTiers.length - 1) {
              newTier = rankedTiers[currentIdx + 1].tier;
              newDivision = getTierIndex(newTier) >= 7 ? undefined : 4;
              lpChangeText = 'Yukseldi! ' + newTier.toUpperCase();
            } else {
              newLp = 100;
            }
          }
        } else if (newLp <= 0 && !isMasterPlus && newDivision && newDivision < 4) {
          const currentIdx = getTierIndex(s.rank.tier);
          if (currentIdx > 0) {
            newTier = rankedTiers[currentIdx - 1].tier;
            newDivision = getTierIndex(newTier) >= 7 ? undefined : 1;
            newLp = 75;
            lpChangeText = 'Dustu! ' + newTier.toUpperCase();
          } else {
            newLp = 0;
          }
        }
        if (!lpChangeText) lpChangeText = lpChange > 0 ? '+' + lpChange + ' LP' : lpChange + ' LP';
        newRank = { tier: newTier, lp: newLp, division: newDivision };
      }
    }
    let be = won ? 50 + Math.floor(Math.random() * 50) : 15 + Math.floor(Math.random() * 20);
    be = Math.floor(be * seasonMod.beMultiplier) + achBeBonus;
    const logParts = [(won ? '✅ KAZANILDI' : '❌ KAYBEDILDI'), '+' + xpGain + ' XP', '+' + be + ' BE'];
    if (lpChangeText) logParts.push(lpChangeText);
    if (validAch.length > 0) logParts.push('🏅 ' + validAch.length + ' basarim!');
    // Quest checking & loot box chance
    get().checkQuestProgress('playMatches', 1);
    if (won) get().checkQuestProgress('winMatches', 1);
    get().checkQuestProgress('getKills', kda.kills);
    get().checkQuestProgress('earnGold', s.matchStats.goldEarned);
    // Promo series
    let newPromo = s.promoSeries;
    if (s.matchMode === 'ranked' && s.rank.tier !== 'unranked' && !newPromo) {
      const tierIdx = getTierIndex(s.rank.tier);
      const isMasterPlus = tierIdx >= 7;
      if (s.rank.lp >= 100 && tierIdx < rankedTiers.length - 1 && !isMasterPlus) {
        const nextTier = rankedTiers[tierIdx + 1].tier;
        newPromo = { targetTier: nextTier, wins: won ? 1 : 0, losses: won ? 0 : 1, needed: 2 };
      }
    } else if (newPromo) {
      newPromo = { ...newPromo, wins: newPromo.wins + (won ? 1 : 0), losses: newPromo.losses + (won ? 0 : 1) };
      if (newPromo.wins >= newPromo.needed) {
        newRank = { tier: newPromo.targetTier, lp: 1, division: 4 };
        lpChangeText = 'Promosyon kazanildi! ' + newPromo.targetTier.toUpperCase();
        newPromo = null;
      } else if (newPromo.losses >= 2) {
        lpChangeText = 'Promosyon kaybedildi!';
        newPromo = null;
      } else {
        lpChangeText = 'Promosyon: ' + newPromo.wins + 'G ' + newPromo.losses + 'M';
      }
    }
    // Loot box chance after match
    const newBoxes = [...s.lootBoxes];
    if (Math.random() < 0.15) {
      newBoxes.push({ id: 'box_' + Date.now(), name: 'Hextech Sandik', emoji: '📦', description: 'Mac sonu kutusu!', rewards: [{ type: 'be', amount: 30 }, { type: 'xp', amount: 20 }, { type: 'be', amount: 100 }] });
    }
    if (won && Math.random() < 0.1) {
      newBoxes.push({ id: 'box_' + Date.now() + '_2', name: 'Zafer Sandigi', emoji: '🎁', description: 'Zafer odulu!', rewards: [{ type: 'be', amount: 150 }, { type: 'skinShard' }] });
    }
    set({
      xp: newXp, level: newLevel, xpToNext: newXpToNext, stats: newStats,
      rank: newRank, rankedGames: newRankedGames,
      blueEssence: s.blueEssence + be,
      seasonWins: won ? s.seasonWins + 1 : s.seasonWins,
      seasonLosses: won ? s.seasonLosses : s.seasonLosses + 1,
      matchActive: false, matchMode: 'normal', matchEvents: [], matchKDA: { kills: 0, deaths: 0, assists: 0 },
      matchStats: { cs: 0, visionScore: 0, goldEarned: 0, damageDealt: 0, damageTaken: 0, towersDestroyed: 0, inhibsDestroyed: 0, objectives: [] },
      matchGold: 500, matchSpells: ['flash', 'ignite'], matchRunePage: 'conqueror', matchItems: [], matchAchievements: [],
      matchLog: [...s.matchLog, logParts.join(' | ')],
      lastMatchResult: {
        won, mode: s.matchMode, xpGain, be, lpChangeText,
        championPlayed: championId || 'Bilinmiyor',
        kda: s.matchKDA, stats: s.matchStats, achievements: validAch,
        spells: s.matchSpells, runePage: s.matchRunePage, items: s.matchItems,
      } as MatchResult,
      lootBoxes: newBoxes,
      promoSeries: newPromo,
      careerStats: (() => {
        const cs = { ...s.careerStats };
        cs.totalMatches++; if (won) cs.totalWins++;
        cs.totalKills += kda.kills; cs.totalDeaths += kda.deaths; cs.totalAssists += kda.assists;
        cs.totalGoldEarned += s.matchStats.goldEarned; cs.totalXP += xpGain;
        if (kda.kills >= 5) cs.pentakills++;
        if (getTierIndex(s.rank.tier) > getTierIndex(cs.highestRank)) cs.highestRank = s.rank.tier;
        return cs;
      })(),
      leaderboard: (() => {
        const lb = s.leaderboard.map((p: any) => ({ ...p, points: p.points + Math.floor(Math.random() * 3) }));
        const pe = { name: s.name, points: s.rankedGames + s.fame, tier: s.rank.tier || 'unranked' };
        const idx = lb.findIndex((p: any) => p.name === s.name);
        if (idx >= 0) lb[idx] = pe; else lb.push(pe);
        lb.sort((a: any, b: any) => b.points - a.points);
        return lb;
      })(),
      balance: s.balance + (s.coach ? -s.coach.costPerDay : 0),
      championMastery: (() => {
        const cm = [...s.championMastery];
        if (!championId) return cm;
        const existing = cm.find(x => x.championId === championId);
        const basePoints = won ? 400 + Math.floor(Math.random() * 300) : 50 + Math.floor(Math.random() * 100);
        const kdaBonus = (s.matchKDA.kills * 20) - (s.matchKDA.deaths * 10) + (s.matchKDA.assists * 5);
        const points = Math.max(0, basePoints + kdaBonus);
        if (existing) {
          existing.points += points;
          existing.lastPlayed = s.currentTime.day;
        } else {
          cm.push({ championId, points, lastPlayed: s.currentTime.day });
        }
        return cm;
      })(),
    });
  },

  buyItem: (itemId) => {
    const s = get();
    const item = shopItems.find((i: any) => i.id === itemId);
    if (!item || s.balance < item.price) return;
    const newStats = { ...s.stats };
    if (item.statBonus.mekanik) newStats.mekanik = Math.min(100, newStats.mekanik + item.statBonus.mekanik);
    if (item.statBonus.oyunBilgisi) newStats.oyunBilgisi = Math.min(100, newStats.oyunBilgisi + item.statBonus.oyunBilgisi);
    if (item.statBonus.takimUyumu) newStats.takimUyumu = Math.min(100, newStats.takimUyumu + item.statBonus.takimUyumu);
    if (item.statBonus.mentalGuc) newStats.mentalGuc = Math.min(100, newStats.mentalGuc + item.statBonus.mentalGuc);
    if (item.category === 'enerji') { set({ energy: 100, tired: false, balance: s.balance - item.price }); return; }
    set({ balance: s.balance - item.price, stats: newStats, equipment: [...s.equipment, item.id], matchLog: [...s.matchLog, 'Satin alindi: ' + item.name] });
  },

  buyChampion: (id) => {
    const s = get();
    const c = s.champions.find(x => x.id === id);
    if (!c || c.unlocked || s.blueEssence < c.cost) return;
    set({
      blueEssence: s.blueEssence - c.cost,
      champions: s.champions.map(x => x.id === id ? { ...x, unlocked: true } : x),
      matchLog: [...s.matchLog, 'Sampiyon acildi: ' + c.name],
    });
  },

  buyBlueEssence: (tl, be) => {
    const s = get();
    if (s.balance < tl) return;
    set({
      balance: s.balance - tl,
      blueEssence: s.blueEssence + be,
      matchLog: [...s.matchLog, be + ' Mavi Oz satin alindi (' + tl + ' TL)'],
    });
  },

  useEnergyDrink: () => set({ energy: 100, tired: false }),

  acceptOffer: (msgId) => {
    const s = get();
    const msg = s.messages.find(m => m.id === msgId);
    if (!msg || !msg.offer) return;
    set({ team: msg.offer, balance: s.balance + msg.offer.salary, messages: s.messages.map(m => m.id === msgId ? { ...m, read: true } : m), matchLog: [...s.matchLog, 'Takima katildin: ' + msg.offer.teamName] });
  },

  rejectOffer: (msgId) => {
    const s = get();
    set({ messages: s.messages.map(m => m.id === msgId ? { ...m, read: true } : m) });
  },

  bluffOffer: (msgId) => {
    const s = get();
    const msg = s.messages.find(m => m.id === msgId);
    if (!msg || !msg.offer) return;
    if (Math.random() > msg.offer.bluffRisk) {
      const offer = { ...msg.offer, salary: Math.floor(msg.offer.salary * 1.3) };
      set({ messages: s.messages.map(m => m.id === msgId ? { ...m, offer, text: msg.text + ' (Zam: ' + offer.salary + ' TL)' } : m), matchLog: [...s.matchLog, 'Blof basarili! ' + offer.salary + ' TL'] });
    } else {
      set({ messages: s.messages.map(m => m.id === msgId ? { ...m, read: true, offer: undefined } : m), matchLog: [...s.matchLog, 'Blof basarisiz!'] });
    }
  },

  startStream: () => {
    const s = get();
    s.advanceTime(3);
    const f = Math.floor(Math.random() * 50) + 10;
    const d = Math.floor(Math.random() * 200);
    set({ twitch: { followers: s.twitch.followers + f, subscribers: s.twitch.subscribers + Math.floor(f * 0.1), donations: s.twitch.donations + d, streaming: true }, balance: s.balance + d, matchLog: [...s.matchLog, 'Yayin acildi! +' + f + ' takipci, +' + d + ' TL'] });
  },

  endStream: () => {
    const s = get();
    set({ twitch: { ...s.twitch, streaming: false } });
  },

  advanceDay: () => {
    const s = get();
    const newDay = s.currentTime.day + 1;
    // Team offers
    if (Math.random() > 0.7 && s.level >= 20) {
      const teamNames = ['Dark Passage', 'Galakticos', 'SuperMassive', 'Papara', 'Besiktas', 'Aurora', 'FB Esports'];
      const names = ['Mert', 'Efe', 'Ali', 'Can', 'Burak'];
      const offer: TeamOffer = { id: 'off_' + Date.now(), teamName: teamNames[Math.floor(Math.random() * teamNames.length)], tier: ([1, 2, 3])[Math.floor(Math.random() * 3)] as 1 | 2 | 3, salary: 500 + Math.floor(Math.random() * 2000), bluffRisk: Math.random() * 0.5 };
      const msg: Message = { id: 'msg_' + Date.now(), from: names[Math.floor(Math.random() * names.length)], text: offer.teamName + ' takimindan teklif! Maas: ' + offer.salary + ' TL', read: false, isOffer: true, offer };
      set({ messages: [...s.messages, msg] });
    }
    // Sponsor income
    let sponsorIncome = 0;
    const updatedSponsors = s.sponsorships.filter(sp => sp.expiresDay > newDay);
    const expiredCount = s.sponsorships.length - updatedSponsors.length;
    updatedSponsors.forEach(sp => { sponsorIncome += sp.incomePerDay; });
    // Loot box chance
    let newBoxes = [...s.lootBoxes];
    if (Math.random() < 0.3) {
      newBoxes.push({ id: 'box_' + Date.now(), name: 'Hextech Sandik', emoji: '📦', description: 'Rastgele oduller icerir!', rewards: [{ type: 'be', amount: 50 }, { type: 'xp', amount: 30 }, { type: 'be', amount: 200 }, { type: 'skinShard' }] });
    }
    set({ currentTime: { hour: 9, minute: 0, day: newDay }, energy: 100, tired: false, balance: s.balance + sponsorIncome, sponsorships: updatedSponsors, lootBoxes: newBoxes });
    if (updatedSponsors.length < s.sponsorships.length) set(s => ({ matchLog: [...s.matchLog, '⚠️ ' + expiredCount + ' sponsorluk suresi doldu!'] }));
    // Generate daily quests
    get().generateDailyQuests();
  },

  addLog: (text) => {
    const s = get();
    set({ matchLog: [...s.matchLog, text] });
  },

  sendMessage: (from, text) => {
    const s = get();
    const msg: Message = { id: 'msg_' + Date.now() + Math.random(), from, text, read: false };
    set({ messages: [...s.messages, msg] });
  },

  markMessageRead: (msgId) => {
    const s = get();
    set({ messages: s.messages.map(m => m.id === msgId ? { ...m, read: true } : m) });
  },

  markChatRead: (fromName) => {
    const s = get();
    set({ messages: s.messages.map(m => m.from === fromName ? { ...m, read: true } : m) });
  },

  toggleDevMenu: () => set({ devMenu: !get().devMenu }),

  devSetLevel: (lvl) => {
    const s = get();
    set({ level: lvl, xp: 0, xpToNext: xpToLevel(lvl), matchLog: [...s.matchLog, '[DEV] Level ' + lvl + ' yapildi'] });
  },

  devAddBalance: (amt) => {
    const s = get();
    set({ balance: Math.max(0, s.balance + amt), matchLog: [...s.matchLog, '[DEV] ' + (amt > 0 ? '+' : '') + amt + ' TL'] });
  },

  devAddBE: (amt) => {
    const s = get();
    set({ blueEssence: Math.max(0, s.blueEssence + amt), matchLog: [...s.matchLog, '[DEV] ' + (amt > 0 ? '+' : '') + amt + ' BE'] });
  },

  devSetStat: (stat, val) => {
    const s = get();
    const newStats = { ...s.stats, [stat]: Math.min(100, Math.max(0, val)) };
    set({ stats: newStats, matchLog: [...s.matchLog, '[DEV] Stat guncellendi: ' + stat + ' = ' + val] });
  },

  devSetRank: (tier) => {
    const s = get();
    const idx = getTierIndex(tier);
    const division = idx >= 7 ? undefined : 4;
    set({ rank: { tier, lp: 50, division }, matchLog: [...s.matchLog, '[DEV] Rank: ' + tier] });
  },

  devAddOffer: () => {
    const s = get();
    const teamNames = ['Dark Passage', 'Galakticos', 'SuperMassive', 'Papara', 'Besiktas', 'Aurora', 'FB Esports', 'T1', 'G2', 'JDG'];
    const names = ['Mert', 'Efe', 'Ali', 'Can', 'Burak', 'Okan', 'Deniz', 'Cem'];
    const offer: TeamOffer = {
      id: 'off_' + Date.now(),
      teamName: teamNames[Math.floor(Math.random() * teamNames.length)],
      tier: ([1, 2, 3])[Math.floor(Math.random() * 3)] as 1 | 2 | 3,
      salary: 1000 + Math.floor(Math.random() * 5000),
      bluffRisk: Math.random() * 0.5,
    };
    const msg: Message = {
      id: 'msg_' + Date.now(),
      from: names[Math.floor(Math.random() * names.length)],
      text: '[DEV] ' + offer.teamName + ' takimindan teklif! Maas: ' + offer.salary + ' TL',
      read: false, isOffer: true, offer,
    };
    set({ messages: [...s.messages, msg], matchLog: [...s.matchLog, '[DEV] Teklif gonderildi'] });
  },

  devUnlockAll: () => {
    const s = get();
    set({
      champions: s.champions.map(c => ({ ...c, unlocked: true })),
      matchLog: [...s.matchLog, '[DEV] Tum sampiyonlar acildi'],
    });
  },

  devMaxStats: () => {
    const s = get();
    set({
      stats: { mekanik: 100, oyunBilgisi: 100, takimUyumu: 100, mentalGuc: 100 },
      matchLog: [...s.matchLog, '[DEV] Tum statlar maxlandi'],
    });
  },

  devReset: () => {
    const champs = allChampions.map((c, i) => ({ ...c, unlocked: i < 10 }));
    set({
      ...defaultProfile,
      devMenu: false,
      champions: champs,
      matchLog: ['[DEV] Oyun sifirlandi'],
    });
  },

  saveGame: () => {
    const s = get();
    const data: any = {
      name: s.name, level: s.level, xp: s.xp, xpToNext: s.xpToNext,
      stats: s.stats, balance: s.balance, blueEssence: s.blueEssence,
      rank: s.rank, champions: s.champions, championMastery: s.championMastery,
      equipment: s.equipment, currentTime: s.currentTime,
      energy: s.energy, tired: s.tired,
      messages: s.messages, twitch: s.twitch,
      matchLog: s.matchLog.slice(-30), team: s.team,
      season: s.season, seasonWins: s.seasonWins, seasonLosses: s.seasonLosses,
      rankedGames: s.rankedGames, leaderboard: s.leaderboard,
      lastMatchResult: s.lastMatchResult,
      devMenu: s.devMenu,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem('lolcareergame_save', JSON.stringify(data));
      set({ matchLog: [...s.matchLog, '💾 Oyun kaydedildi!'] });
    } catch {
      set({ matchLog: [...s.matchLog, '❌ Kayit basarisiz!'] });
    }
  },

  loadGame: () => {
    const s = get();
    const raw = localStorage.getItem('lolcareergame_save');
    if (!raw) return false;
    try {
      const d = JSON.parse(raw);
      set({
        name: d.name || s.name, level: d.level || 1, xp: d.xp || 0, xpToNext: d.xpToNext || xpToLevel(1),
        stats: d.stats || s.stats, balance: d.balance || 0, blueEssence: d.blueEssence || 0,
        rank: d.rank || { tier: 'unranked', lp: 0 },
        champions: d.champions || s.champions, championMastery: d.championMastery || [],
        equipment: d.equipment || [], currentTime: d.currentTime || { hour: 9, minute: 0, day: 1 },
        energy: d.energy ?? 100, tired: d.tired ?? false,
        messages: d.messages || [], twitch: d.twitch || { followers: 0, subscribers: 0, donations: 0, streaming: false },
        matchLog: [...(d.matchLog || []), '📂 Oyun yuklendi!'],
        team: d.team || null, season: d.season || 'winter',
        seasonWins: d.seasonWins || 0, seasonLosses: d.seasonLosses || 0, rankedGames: d.rankedGames || 0,
        leaderboard: d.leaderboard || [], lastMatchResult: d.lastMatchResult || null,
        devMenu: d.devMenu || false,
      });
      return true;
    } catch {
      set({ matchLog: [...s.matchLog, '❌ Kayit dosyasi bozuk!'] });
      return false;
    }
  },

  acceptDuoRequest: (msgId) => {
    const s = get();
    const msg = s.messages.find(m => m.id === msgId);
    if (!msg) return;
    set({ duoPartner: msg.from, messages: s.messages.filter(m => m.id !== msgId), matchLog: [...s.matchLog, '🤝 Duo istegi kabul edildi: ' + msg.from] });
  },

  generateDailyQuests: () => {
    const s = get();
    if (s.dailyQuests.some(q => q.dayAssigned === s.currentTime.day)) return;
    const shuffled = [...questPool].sort(() => Math.random() - 0.5);
    const quests: DailyQuest[] = shuffled.slice(0, 3).map((q, i) => ({
      id: 'quest_' + s.currentTime.day + '_' + i,
      description: q.description,
      requirement: { type: q.type, count: q.count },
      progress: 0,
      completed: false,
      reward: { ...q.reward },
      dayAssigned: s.currentTime.day,
    }));
    set({ dailyQuests: quests, matchLog: [...s.matchLog, '📋 Gunluk gorevler yenilendi!'] });
  },

  checkQuestProgress: (type, amount) => {
    const s = get();
    const updated = s.dailyQuests.map(q => {
      if (q.completed || q.requirement.type !== type) return q;
      const newProgress = q.progress + amount;
      const completed = newProgress >= q.requirement.count;
      if (completed && !q.completed) {
        return { ...q, progress: newProgress, completed: true };
      }
      return { ...q, progress: newProgress };
    });
    const newlyCompleted = updated.filter(q => q.completed && !s.dailyQuests.find(oq => oq.id === q.id)?.completed);
    let log = s.matchLog;
    let xp = s.xp, be = s.blueEssence, tl = s.balance;
    newlyCompleted.forEach(q => {
      if (q.reward.xp) xp += q.reward.xp;
      if (q.reward.be) be += q.reward.be;
      if (q.reward.tl) tl += q.reward.tl;
      log = [...log, '✅ Gorev tamamlandi: ' + q.description + ' (+' + q.reward.xp + ' XP, +' + q.reward.be + ' BE' + (q.reward.tl ? ', +' + q.reward.tl + ' TL' : '') + ')'];
    });
    set({ dailyQuests: updated, matchLog: log, xp, blueEssence: be, balance: tl });
  },

  startTournament: () => {
    const s = get();
    if (s.activeTournament) return;
    const tpl = tournamentTemplates[Math.min(s.level / 10, tournamentTemplates.length - 1) | 0];
    const bracket: any[] = [];
    for (let r = 0; r < tpl.rounds; r++) {
      const teams = 1 << (tpl.rounds - r);
      bracket.push(Array.from({ length: teams / 2 }, (_, j) => ({
        opponent: ['T1 Academy', 'G2 Esports', 'JD Gaming', 'Fnatic', 'Cloud9', 'DRX', 'Gen.G', 'BLG'][Math.floor(Math.random() * 8)],
        opponentLevel: s.level + Math.floor(Math.random() * 10) - 3,
        opponentTier: (['demir', 'bronz', 'gumus', 'altin', 'platin', 'zumrut', 'elmas'] as RankTier[])[Math.min(6, Math.floor(s.level / 5))],
        format: r === 0 ? tpl.format : (tpl.format === 'BO1' ? 'BO1' : 'BO3'),
        ourWins: 0, enemyWins: 0, played: false, won: null,
      })));
    }
    const tournament: Tournament = {
      id: 'trn_' + Date.now(),
      name: tpl.name, tier: tpl.tier, prizePool: tpl.prizePool, reward: tpl.reward,
      bracket, currentRound: 0, active: true, won: null,
    };
    set({ activeTournament: tournament, matchLog: [...s.matchLog, '🏆 Turnuva basladi: ' + tournament.name + '! Odul: ' + tournament.prizePool + ' TL'] });
  },

  playTournamentMatch: () => {
    const s = get();
    const t = s.activeTournament;
    if (!t || !t.active) return;
    const round = t.bracket[t.currentRound];
    const match = round.find((m: any) => !m.played);
    if (!match) {
      const nextRound = t.currentRound + 1;
      if (nextRound >= t.bracket.length) {
        set({
          activeTournament: { ...t, active: false, won: true },
          tournamentHistory: [...s.tournamentHistory, { name: t.name, result: 'Kazanildi!', prize: t.reward.tl }],
          balance: s.balance + t.reward.tl, blueEssence: s.blueEssence + t.reward.be,
          fame: s.fame + t.reward.fame,
          matchLog: [...s.matchLog, '🏆 TURNUVA KAZANILDI! +' + t.reward.tl + ' TL'],
        });
      } else {
        set({ activeTournament: { ...t, currentRound: nextRound } });
      }
      return;
    }
    const winChance = 0.35 + (s.stats.mekanik + s.stats.oyunBilgisi + s.stats.takimUyumu + s.stats.mentalGuc) / 600;
    const won = Math.random() < Math.min(0.8, winChance);
    match.played = true; match.won = won;
    if (won) match.ourWins = match.format === 'BO1' ? 1 : 2;
    else match.enemyWins = match.format === 'BO1' ? 1 : 2;
    const needed = match.format === 'BO1' ? 1 : 2;
    if (match.ourWins >= needed || match.enemyWins >= needed) {
      match.won = match.ourWins >= needed;
    }
    if (!match.won) {
      set({ activeTournament: { ...t, active: false, won: false }, matchLog: [...s.matchLog, '❌ Turnuvadan elendin!'] });
      return;
    }
    set({ matchLog: [...s.matchLog, '✅ Turnuva maci kazanildi!'] });
  },

  advanceSeason: () => {
    const s = get();
    const seasons: ('winter' | 'spring' | 'summer')[] = ['winter', 'spring', 'summer'];
    const nextIdx = (seasons.indexOf(s.season) + 1) % 3;
    const newSeason = seasons[nextIdx];
    // Soft rank reset
    const tierIdx = getTierIndex(s.rank.tier);
    const newTier = tierIdx > 2 ? rankedTiers[Math.max(0, tierIdx - 2)].tier : s.rank.tier;
    const seasonMod = getSeasonMod(newSeason);
    set({
      season: newSeason, seasonModifier: seasonMod,
      seasonWins: 0, seasonLosses: 0,
      rank: { tier: newTier, lp: s.rank.tier === 'unranked' ? 0 : 50, division: 4 },
      matchLog: [...s.matchLog, '🔄 Yeni sezon: ' + seasonMod.name + '! Rank soft reset uygulandi.'],
    });
  },

  claimSeasonRewards: () => {
    const s = get();
    const reward = seasonRewardsList.find(r => r.tier === s.rank.tier);
    if (!reward || s.seasonRewardsClaimed.includes(reward.skinId)) return;
    set({
      blueEssence: s.blueEssence + reward.beBonus,
      xp: s.xp + reward.xpBonus,
      seasonRewardsClaimed: [...s.seasonRewardsClaimed, reward.skinId],
      matchLog: [...s.matchLog, '🎁 Sezon odulu alindi: ' + reward.name + ' (+' + reward.beBonus + ' BE, +' + reward.xpBonus + ' XP)'],
    });
  },

  acceptSponsorship: (sponsorId) => {
    const s = get();
    const sponsor = sponsorPool.find(sp => sp.id === sponsorId);
    if (!sponsor) return;
    const meetsReqs = (!sponsor.requirement.followers || s.twitch.followers >= sponsor.requirement.followers)
      && (!sponsor.requirement.level || s.level >= sponsor.requirement.level)
      && (!sponsor.requirement.subscribers || s.twitch.subscribers >= sponsor.requirement.subscribers)
      && (!sponsor.requirement.rankTier || getTierIndex(s.rank.tier) >= getTierIndex(sponsor.requirement.rankTier));
    if (!meetsReqs) return;
    if (s.sponsorships.some(sp => sp.brand === sponsor.brand)) return;
    const newSponsor = { ...sponsor, expiresDay: s.currentTime.day + sponsor.duration };
    set({ sponsorships: [...s.sponsorships, newSponsor], matchLog: [...s.matchLog, '🤝 Sponsorluk anlasmasi: ' + sponsor.emoji + ' ' + sponsor.brand + ' (+' + sponsor.incomePerDay + ' TL/gun)'] });
  },

  openLootBox: () => {
    const s = get();
    if (s.lootBoxes.length === 0) return;
    const box = s.lootBoxes[0];
    const reward = box.rewards[Math.floor(Math.random() * box.rewards.length)];
    let log = '🎁 Kasa acildi: ';
    if (reward.type === 'be') { set({ blueEssence: s.blueEssence + (reward.amount || 100) }); log += '+' + (reward.amount || 100) + ' BE'; }
    else if (reward.type === 'xp') { set({ xp: s.xp + (reward.amount || 50) }); log += '+' + (reward.amount || 50) + ' XP'; }
    else if (reward.type === 'skinShard') { log += 'Skin shard!'; }
    else { log += 'Sampiyon shard!'; }
    set({ lootBoxes: s.lootBoxes.slice(1), matchLog: [...s.matchLog, log] });
  },

  abilityLevelUp: (championId, abilityKey) => {
    const s = get();
    const abilities = getChampionAbilities(championId);
    const ability = abilities.find(a => a.key === abilityKey);
    if (!ability || ability.level >= ability.maxLevel) return;
    const mastery = s.championMastery.find(m => m.championId === championId);
    const masteryPoints = mastery?.points || 0;
    const cost = ability.level * 500;
    if (masteryPoints < cost) return;
    const updatedMastery = s.championMastery.map(m => m.championId === championId ? { ...m, points: m.points - cost } : m);
    set({ championMastery: updatedMastery, matchLog: [...s.matchLog, '⬆️ ' + championId + ' ' + abilityKey + ' yetenegi gelistirildi! (' + (ability.level) + '/' + ability.maxLevel + ')'] });
  },

  hireCoach: (coachId) => {
    const s = get();
    if (s.coach) return;
    const coach = coachPool.find(c => c.id === coachId);
    if (!coach) return;
    set({ coach, matchLog: [...s.matchLog, '🎓 ' + coach.name + ' ise alindi!'] });
  },

  fireCoach: () => {
    const s = get();
    if (!s.coach) return;
    set({ coach: null, matchLog: [...s.matchLog, '❌ ' + s.coach.name + ' isten cikarildi.'] });
  },

  buyCosmetic: (cosmeticId) => {
    const s = get();
    const item = cosmeticItems.find(c => c.id === cosmeticId);
    if (!item || item.owned || s.blueEssence < item.cost) return;
    set({
      blueEssence: s.blueEssence - item.cost,
      cosmetics: [...s.cosmetics, { ...item, owned: true }],
      matchLog: [...s.matchLog, '🎨 ' + item.name + ' satin alindi!'],
    });
  },

  equipCosmetic: (cosmeticId) => {
    const s = get();
    const item = [...s.cosmetics, ...cosmeticItems.filter(c => !s.cosmetics.find(x => x.id === c.id))].find(c => c.id === cosmeticId);
    if (!item || !item.owned) return;
    const ac = { ...s.activeCosmetics };
    if (item.type === 'frame') ac.frame = ac.frame === cosmeticId ? null : cosmeticId;
    else if (item.type === 'icon') ac.icon = ac.icon === cosmeticId ? null : cosmeticId;
    else if (item.type === 'background') ac.background = ac.background === cosmeticId ? null : cosmeticId;
    set({ activeCosmetics: ac });
  },

  createClan: (name, tag) => {
    const s = get();
    if (s.clan || s.fame < 50) return;
    const clan: Clan = { id: 'clan_' + Date.now(), name, tag, members: [{ name: s.name, level: s.level, tier: s.rank.tier }], level: 1 };
    set({ clan, fame: s.fame - 50, matchLog: [...s.matchLog, '🏰 Klan kuruldu: [' + tag + '] ' + name + '! (-50 Fame)'] });
  },

  setTheme: (theme) => set({ theme }),

  saveToSlot: (slot) => {
    const s = get();
    const saveInfo: SaveSlot = { slot, name: s.name + ' Lv.' + s.level, timestamp: Date.now(), level: s.level, tier: s.rank.tier };
    const key = 'lolcareergame_save_' + slot;
    const saved = [...s.saveSlots.filter(x => x.slot !== slot), saveInfo];
    // Save full state
    const data: any = { name: s.name, level: s.level, xp: s.xp, xpToNext: s.xpToNext, stats: s.stats, balance: s.balance, blueEssence: s.blueEssence, rank: s.rank, champions: s.champions, championMastery: s.championMastery, equipment: s.equipment, currentTime: s.currentTime, energy: s.energy, tired: s.tired, season: s.season, seasonWins: s.seasonWins, seasonLosses: s.seasonLosses, rankedGames: s.rankedGames, fame: s.fame, careerStats: s.careerStats, cosmetics: s.cosmetics, activeCosmetics: s.activeCosmetics, theme: s.theme, sponsorships: s.sponsorships, tournamentHistory: s.tournamentHistory, coach: s.coach, clan: s.clan, tutorialComplete: s.tutorialComplete, savedAt: Date.now() };
    try {
      localStorage.setItem(key, JSON.stringify(data));
      set({ saveSlots: saved, matchLog: [...s.matchLog, '💾 Slot ' + slot + ' kaydedildi!'] });
    } catch { /* ignore */ }
  },

  loadFromSlot: (slot) => {
    const s = get();
    const raw = localStorage.getItem('lolcareergame_save_' + slot);
    if (!raw) return false;
    try {
      const d = JSON.parse(raw);
      set({
        name: d.name || s.name, level: d.level || 1, xp: d.xp || 0, xpToNext: d.xpToNext || xpToLevel(1),
        stats: d.stats || s.stats, balance: d.balance || 0, blueEssence: d.blueEssence || 0,
        rank: d.rank || { tier: 'unranked', lp: 0 },
        champions: d.champions || s.champions, championMastery: d.championMastery || [],
        equipment: d.equipment || [], currentTime: d.currentTime || { hour: 9, minute: 0, day: 1 },
        energy: d.energy ?? 100, tired: d.tired ?? false,
        season: d.season || 'winter', seasonWins: d.seasonWins || 0, seasonLosses: d.seasonLosses || 0, rankedGames: d.rankedGames || 0,
        fame: d.fame || 0, careerStats: d.careerStats || s.careerStats,
        cosmetics: d.cosmetics || [], activeCosmetics: d.activeCosmetics || { frame: null, icon: null, background: null },
        theme: d.theme || 'dark', sponsorships: d.sponsorships || [],
        tournamentHistory: d.tournamentHistory || [], coach: d.coach || null, clan: d.clan || null,
        tutorialComplete: d.tutorialComplete || false,
        matchLog: [...(s.matchLog || []), '📂 Slot ' + slot + ' yuklendi!'],
      });
      return true;
    } catch { return false; }
  },

  completeTutorial: () => set({ tutorialComplete: true }),
}));
