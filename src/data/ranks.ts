import type { RankTier, RankInfo } from '../types';

type RankedTier = Exclude<RankTier, 'unranked'>;

export const rankedTiers: { tier: RankedTier; label: string; color: string }[] = [
  { tier: 'demir', label: 'Demir', color: '#8c8c8c' },
  { tier: 'bronz', label: 'Bronz', color: '#cd7f32' },
  { tier: 'gumus', label: 'Gümüs', color: '#c0c0c0' },
  { tier: 'altin', label: 'Altin', color: '#ffd700' },
  { tier: 'platin', label: 'Platin', color: '#e5e4e2' },
  { tier: 'zumrut', label: 'Zümrüt', color: '#2ecc71' },
  { tier: 'elmas', label: 'Elmas', color: '#b9f2ff' },
  { tier: 'master', label: 'Master', color: '#9b59b6' },
  { tier: 'grandmaster', label: 'Grandmaster', color: '#e74c3c' },
  { tier: 'challenger', label: 'Challenger', color: '#f1c40f' },
];

export const xpToLevel = (level: number): number => level * 100 + 50;

export function getDivisionForLp(lp: number): 1 | 2 | 3 | 4 {
  if (lp >= 75) return 1;
  if (lp >= 50) return 2;
  if (lp >= 25) return 3;
  return 4;
}

export function getTierIndex(tier: RankTier): number {
  if (tier === 'unranked') return -1;
  return rankedTiers.findIndex(r => r.tier === tier);
}

export function calculatePlacementRank(wins: number, losses: number): RankInfo {
  const total = wins + losses;
  if (total < 10) return { tier: 'unranked', lp: 0 };
  const ratio = wins / total;
  const idx = Math.min(rankedTiers.length - 1, Math.floor(ratio * (rankedTiers.length - 1)));
  const division = idx <= 6 ? getDivisionForLp(50) : undefined;
  return { tier: rankedTiers[idx].tier, lp: 50, division };
}
