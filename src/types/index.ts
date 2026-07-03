export interface PlayerStats {
  mekanik: number;
  oyunBilgisi: number;
  takimUyumu: number;
  mentalGuc: number;
}

export type RankTier = 'unranked' | 'demir' | 'bronz' | 'gumus' | 'altin' | 'platin' | 'zumrut' | 'elmas' | 'master' | 'grandmaster' | 'challenger';

export interface RankInfo {
  tier: RankTier;
  lp: number;
  division?: 1 | 2 | 3 | 4;
}

export interface Champion {
  id: string;
  name: string;
  difficulty: 1 | 2 | 3;
  role: string;
  unlocked: boolean;
  cost: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  statBonus: Partial<PlayerStats>;
  category: 'ekipman' | 'enerji' | 'kozmetik';
}

export interface Job {
  id: string;
  name: string;
  description: string;
  durationHours: number;
  pay: number;
  statBonus: Partial<PlayerStats>;
  requirement?: { level: number };
}

export interface KDADelta {
  kills: number;
  deaths: number;
  assists: number;
}

export interface MatchKDA {
  kills: number;
  deaths: number;
  assists: number;
}

export interface MatchEvent {
  minute: number;
  text: string;
  type: 'positive' | 'negative' | 'neutral' | 'interactive' | 'filler' | 'baseReturn' | 'shopEvent';
  options?: MatchChoice[];
  kdaEffect?: KDADelta;
  goldEffect?: number;
}

export interface MatchChoice {
  id: string;
  text: string;
  statCheck: keyof PlayerStats;
  successChance: number;
  outcome: { success: string; fail: string };
  statReward: number;
  kdaSuccess?: KDADelta;
  kdaFail?: KDADelta;
  goldReward?: number;
}

export interface ObjectiveEvent {
  type: 'dragon' | 'baron' | 'herald' | 'elder';
  contested: boolean;
  won: boolean;
}

export interface MatchDetailedStats {
  cs: number;
  visionScore: number;
  goldEarned: number;
  damageDealt: number;
  damageTaken: number;
  towersDestroyed: number;
  inhibsDestroyed: number;
  objectives: ObjectiveEvent[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  xpBonus: number;
  beBonus: number;
}

export interface SummonerSpell {
  id: string;
  name: string;
  emoji: string;
  description: string;
  statBonus: Partial<PlayerStats>;
  imageId: string;
}

export interface RunePage {
  id: string;
  name: string;
  emoji: string;
  description: string;
  statBonus: Partial<PlayerStats>;
  color: string;
  imageId: string;
  tree: string;
}

export type MatchItemBuild = string[];

export interface SeasonModifier {
  season: 'winter' | 'spring' | 'summer';
  name: string;
  xpMultiplier: number;
  beMultiplier: number;
  eventDescription: string;
}

export interface TeamOffer {
  id: string;
  teamName: string;
  tier: 1 | 2 | 3;
  salary: number;
  bluffRisk: number;
}

export interface Message {
  id: string;
  from: string;
  text: string;
  read: boolean;
  isOffer?: boolean;
  offer?: TeamOffer;
  replied?: boolean;
  replyOptions?: ReplyOption[];
}

export interface ReplyOption {
  id: string;
  text: string;
  type: 'positive' | 'negative';
  response: string;
  statEffect?: { stat: keyof PlayerStats; value: number };
}

export interface Friend {
  name: string;
  level: number;
  rank: RankTier;
  championPlayed?: string;
  kda?: MatchKDA;
  isOnline: boolean;
  addedDay: number;
}

export interface BotPlayer {
  name: string;
  level: number;
  rank: RankTier;
  championId: string;
  kda: MatchKDA;
  team: 'blue' | 'red';
  isPlayer?: boolean;
}

export interface MatchLaneChampion {
  name: string;
  championId: string;
  team: 'blue' | 'red';
  lane: 'top' | 'jungle' | 'mid' | 'bot' | 'support';
  alive: boolean;
  deaths: number;
}

export interface TwitchStats {
  followers: number;
  subscribers: number;
  donations: number;
  streaming: boolean;
}

export interface GameTime {
  hour: number;
  minute: number;
  day: number;
}

export interface ChampionMastery {
  championId: string;
  points: number;
  lastPlayed: number;
}

export interface MatchResult {
  won: boolean;
  mode: 'normal' | 'ranked';
  xpGain: number;
  be: number;
  lpChangeText: string;
  championPlayed: string;
  kda: MatchKDA;
  stats: MatchDetailedStats;
  achievements: Achievement[];
  spells: string[];
  runePage: string;
  items: MatchItemBuild;
  matchPlayers?: BotPlayer[];
}

export interface Tournament {
  id: string;
  name: string;
  tier: 'local' | 'regional' | 'national' | 'international';
  prizePool: number;
  reward: { tl: number; be: number; xp: number; fame: number };
  bracket: TournamentMatch[][];
  currentRound: number;
  active: boolean;
  won: boolean | null;
}

export interface TournamentMatch {
  opponent: string;
  opponentLevel: number;
  opponentTier: RankTier;
  format: 'BO1' | 'BO3' | 'BO5';
  ourWins: number;
  enemyWins: number;
  played: boolean;
  won: boolean | null;
}

export interface ChampionAbility {
  id: string;
  name: string;
  key: 'Q' | 'W' | 'E' | 'R';
  emoji: string;
  description: string;
  effect: { kdaBias?: number; winBonus?: number; goldBonus?: number; statMultiplier?: Partial<PlayerStats> };
  level: number;
  maxLevel: number;
}

export interface DailyQuest {
  id: string;
  description: string;
  requirement: { type: 'playMatches' | 'getKills' | 'earnGold' | 'winMatches' | 'levelUp'; count: number };
  progress: number;
  completed: boolean;
  reward: { xp: number; be: number; tl?: number };
  dayAssigned: number;
}

export interface Sponsorship {
  id: string;
  brand: string;
  emoji: string;
  tier: 1 | 2 | 3;
  incomePerDay: number;
  requirement: { followers?: number; subscribers?: number; level?: number; rankTier?: RankTier };
  duration: number;
  expiresDay: number;
}

export interface TeamContract {
  teamName: string;
  salary: number;
  startDay: number;
  durationDays: number;
  performanceBonus: number;
  buyoutCost: number;
}

export interface LootBox {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rewards: { type: 'be' | 'xp' | 'skinShard' | 'championShard'; amount?: number; championId?: string }[];
}

export interface SeasonReward {
  tier: RankTier;
  emoji: string;
  name: string;
  beBonus: number;
  xpBonus: number;
  skinId: string;
}

export interface CareerStats {
  totalMatches: number;
  totalWins: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  highestRank: RankTier;
  mostPlayedChamp: string;
  mostPlayedCount: number;
  pentakills: number;
  totalGoldEarned: number;
  totalXP: number;
}

export interface Clan {
  id: string;
  name: string;
  tag: string;
  members: { name: string; level: number; tier: RankTier }[];
  level: number;
}

export interface Coach {
  id: string;
  name: string;
  emoji: string;
  tier: 1 | 2 | 3;
  costPerDay: number;
  statBonus: Partial<PlayerStats>;
  specialty: string;
}

export interface Cosmetic {
  id: string;
  name: string;
  type: 'frame' | 'icon' | 'background';
  emoji: string;
  cost: number;
  owned: boolean;
  equipped: boolean;
}

export interface SaveSlot {
  slot: number;
  name: string;
  timestamp: number;
  level: number;
  tier: RankTier;
}

export interface SeasonHistoryEntry {
  season: 'winter' | 'spring' | 'summer';
  seasonNumber: number;
  rank: RankTier;
  lp: number;
  division?: 1 | 2 | 3 | 4;
  wins: number;
  losses: number;
}

export interface PlayerProfile {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  stats: PlayerStats;
  balance: number;
  blueEssence: number;
  rank: RankInfo;
  champions: Champion[];
  championMastery: ChampionMastery[];
  equipment: string[];
  currentTime: GameTime;
  energy: number;
  tired: boolean;
  messages: Message[];
  twitch: TwitchStats;
  matchLog: string[];
  matchActive: boolean;
  matchMode: 'normal' | 'ranked';
  matchEvents: MatchEvent[];
  matchKDA: MatchKDA;
  matchStats: MatchDetailedStats;
  matchGold: number;
  matchSpells: string[];
  matchRunePage: string;
  matchItems: MatchItemBuild;
  matchAchievements: Achievement[];
  seasonModifier: SeasonModifier;
  team: TeamOffer | null;
  season: 'winter' | 'spring' | 'summer';
  seasonWins: number;
  seasonLosses: number;
  rankedGames: number;
  leaderboard: { name: string; points: number; tier: RankTier }[];
  lastMatchResult: MatchResult | null;
  duoPartner: string | null;
  activeTournament: Tournament | null;
  tournamentHistory: { name: string; result: string; prize: number }[];
  dailyQuests: DailyQuest[];
  promoSeries: { targetTier: RankTier; wins: number; losses: number; needed: number } | null;
  sponsorships: Sponsorship[];
  lootBoxes: LootBox[];
  seasonRewardsClaimed: string[];
  teamContract: TeamContract | null;
  fame: number;
  careerStats: CareerStats;
  clan: Clan | null;
  coach: Coach | null;
  cosmetics: Cosmetic[];
  activeCosmetics: { frame: string | null; icon: string | null; background: string | null };
  theme: 'dark' | 'light';
  saveSlots: SaveSlot[];
  tutorialComplete: boolean;
  seasonDay: number;
  seasonNumber: number;
  previousSeasonRank: RankTier;
  seasonPlacementGamesPlayed: number;
  seasonPlacementWins: number;
  seasonPlacementLosses: number;
  seasonHistory: SeasonHistoryEntry[];
  friends: Friend[];
  lastMatchPlayers: BotPlayer[];
  lobbyPartner: string | null;
  lobbyPartnerLane: string | null;
  matchLaneChampions: MatchLaneChampion[];
  championPatchModifiers: Record<string, number>;
  championPlayCounts: Record<string, number>;
  patchVersion: string;
  matchSkinBonus: number;
  ownedSkins: Record<string, number[]>;
}
