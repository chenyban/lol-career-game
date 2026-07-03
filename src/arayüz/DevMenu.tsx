import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { PlayerStats, RankTier } from '../types';

const rankOptions: RankTier[] = ['unranked', 'demir', 'bronz', 'gumus', 'altin', 'platin', 'zumrut', 'elmas', 'master', 'grandmaster', 'challenger'];
const statKeys: (keyof PlayerStats)[] = ['mekanik', 'oyunBilgisi', 'takimUyumu', 'mentalGuc'];

const btnStyle: React.CSSProperties = {
  padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
  fontSize: 11, fontFamily: 'inherit', transition: 'all 0.15s',
};

export function DevMenu() {
  const { devMenu, toggleDevMenu, level, balance, blueEssence, stats, rank,
    devSetLevel, devAddBalance, devAddBE, devSetStat, devSetRank,
    devAddOffer, devUnlockAll, devMaxStats, devReset, advanceDay, addLog } = useGameStore();
  const [lvlInput, setLvlInput] = useState(String(level));
  const [balanceInput, setBalanceInput] = useState(String(balance));
  const [beInput, setBEInput] = useState(String(blueEssence));

  if (!devMenu) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, width: 320, height: '100%',
      background: '#0d0d1a', borderLeft: '2px solid #ff6b6b',
      zIndex: 9999, overflow: 'auto', padding: 12, fontSize: 12,
      boxShadow: '-4px 0 20px rgba(0,0,0,0.5)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ color: '#ff6b6b', fontWeight: 'bold', fontSize: 14 }}>DEV MENU</span>
        <button onClick={toggleDevMenu} style={{ ...btnStyle, background: '#ff6b6b', color: '#fff' }}>Kapat (Ctrl+Shift+D)</button>
      </div>

      {/* Level */}
      <Section title="Level / XP">
        <Row>
          <input value={lvlInput} onChange={e => setLvlInput(e.target.value)}
            style={inputStyle} placeholder="Level" />
          <button onClick={() => devSetLevel(Number(lvlInput) || 1)} style={greenBtn}>Set</button>
        </Row>
      </Section>

      {/* Ekonomi */}
      <Section title="Ekonomi">
        <Row>
          <span style={{ width: 30 }}>TL:</span>
          <input value={balanceInput} onChange={e => setBalanceInput(e.target.value)}
            style={inputStyle} placeholder="TL" />
          <button onClick={() => devAddBalance(Number(balanceInput) - balance)} style={greenBtn}>Set</button>
          <button onClick={() => devAddBalance(10000)} style={blueBtn}>+10k</button>
        </Row>
        <Row>
          <span style={{ width: 30 }}>BE:</span>
          <input value={beInput} onChange={e => setBEInput(e.target.value)}
            style={inputStyle} placeholder="BE" />
          <button onClick={() => devAddBE(Number(beInput) - blueEssence)} style={greenBtn}>Set</button>
          <button onClick={() => devAddBE(10000)} style={blueBtn}>+10k</button>
        </Row>
      </Section>

      {/* Statlar */}
      <Section title="Statlar (0-100)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {statKeys.map(sk => (
            <Row key={sk}>
              <span style={{ width: 60, fontSize: 10 }}>{sk}:</span>
              <input value={stats[sk]} onChange={e => devSetStat(sk, Number(e.target.value) || 0)}
                style={{ ...inputStyle, width: 50 }} type="number" min={0} max={100} />
            </Row>
          ))}
        </div>
        <button onClick={devMaxStats} style={{ ...btnStyle, background: '#9b59b6', color: '#fff', marginTop: 4, width: '100%' }}>
          Max Stat (100)
        </button>
      </Section>

      {/* Rank */}
      <Section title="Rank">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {rankOptions.map(r => (
            <button key={r} onClick={() => devSetRank(r)}
              style={{
                ...btnStyle, background: rank.tier === r ? '#4fc3f7' : '#2a2a4a',
                color: rank.tier === r ? '#000' : '#a0a0b0', fontSize: 10,
              }}>
              {r}
            </button>
          ))}
        </div>
      </Section>

      {/* Hızlı Aksiyonlar */}
      <Section title="Hizli Aksiyonlar">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <button onClick={() => advanceDay()} style={orangeBtn}>Gunu Atla</button>
          <button onClick={() => { const store = useGameStore.getState(); store.setShowSeasonEnd(true); }} style={{ ...btnStyle, background: '#c8a85e', color: '#000' }}>Sezon Bitir</button>
          <button onClick={() => addLog('[DEV] Test log')} style={grayBtn}>Log Ekle</button>
          <button onClick={devAddOffer} style={purpleBtn}>Teklif Gonder</button>
          <button onClick={devUnlockAll} style={cyanBtn}>Tum Sam. Ac</button>
          <button onClick={devReset} style={redBtn}>Sifirla</button>
        </div>
      </Section>

      <div style={{ marginTop: 12, fontSize: 10, color: '#666' }}>
        Mevcut: Lv{level} | {balance}TL | {blueEssence}BE | {rank.tier} {rank.lp}LP
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10, padding: 8, border: '1px solid #2a2a4a', borderRadius: 6 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 6, fontSize: 11, color: '#4fc3f7' }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>{children}</div>;
}

const inputStyle: React.CSSProperties = {
  padding: '3px 6px', borderRadius: 4, border: '1px solid #2a2a4a',
  background: '#1a1a2e', color: '#e0e0e0', fontSize: 11, width: 70,
  fontFamily: 'inherit', outline: 'none',
};

const greenBtn: React.CSSProperties = { ...btnStyle, background: '#4caf50', color: '#fff' };
const blueBtn: React.CSSProperties = { ...btnStyle, background: '#2196f3', color: '#fff' };
const orangeBtn: React.CSSProperties = { ...btnStyle, background: '#ff9800', color: '#000' };
const grayBtn: React.CSSProperties = { ...btnStyle, background: '#555', color: '#fff' };
const purpleBtn: React.CSSProperties = { ...btnStyle, background: '#9b59b6', color: '#fff' };
const cyanBtn: React.CSSProperties = { ...btnStyle, background: '#00bcd4', color: '#000' };
const redBtn: React.CSSProperties = { ...btnStyle, background: '#f44336', color: '#fff' };
