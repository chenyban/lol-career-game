import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const s: Record<string, React.CSSProperties> = {
  wrap: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' },
  glow1: { position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,195,247,0.08) 0%, transparent 70%)', top: -100, right: -100, pointerEvents: 'none' },
  glow2: { position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,107,0.08) 0%, transparent 70%)', bottom: -80, left: -80, pointerEvents: 'none' },
  card: { background: 'var(--bg-window)', border: '1px solid var(--border)', borderRadius: 16, padding: 40, width: 440, maxWidth: '90vw', textAlign: 'center' as const, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', position: 'relative' as const, zIndex: 1 },
  logo: { fontSize: 64, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: 800, marginBottom: 4, background: 'linear-gradient(135deg, #4fc3f7, #ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: 1 },
  sub: { fontSize: 12, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 },
  features: { display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' as const },
  feat: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-secondary)' },
  featIcon: { fontSize: 22 },
};

export function MainMenu() {
  const { startGame } = useGameStore();
  const [name, setName] = useState('');

  const handleStart = () => { if (name.trim()) startGame(name.trim()); };

  return (
    <div style={s.wrap}>
      <div style={s.glow1} /><div style={s.glow2} />
      <div style={s.card}>
        <div style={s.logo}>{'>_'}</div>
        <h1 style={s.title}>LoL Kariyer Oyunu</h1>
        <p style={s.sub}>Sanal masaustunde League of Legends kariyerini yonet.<br />Mac yap, para kazan, e-spor dunyasinda zirveye cik!</p>
        <div style={s.features}>
          {[{i:'💼',t:'Is Bul'},{i:'⚔️',t:'Mac Yap'},{i:'🏆',t:'Rank Atla'},{i:'📺',t:'Yayin Ac'},{i:'💰',t:'Transfer'}].map(f => (
            <div key={f.t} style={s.feat}><span style={s.featIcon}>{f.i}</span><span>{f.t}</span></div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          <input type="text" placeholder="Oyuncu adini gir..." value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleStart()}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid ' + (name.trim() ? 'var(--accent)' : 'var(--border)'), background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }} />
          <button onClick={handleStart} disabled={!name.trim()}
            style={name.trim() ? { width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #4fc3f7, #2196f3)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-mono)' } : { width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', background: 'var(--bg-hover)', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 700, cursor: 'not-allowed', fontFamily: 'var(--font-mono)' }}>
            Oyuna Basla
          </button>
        </div>
        <p style={{ marginTop: 20, fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.5 }}>Ipucu: Is bulup para kazan, Amazon'dan ekipman al, mac yaparak seviye atla ve rank yukselt!</p>
      </div>
    </div>
  );
}
