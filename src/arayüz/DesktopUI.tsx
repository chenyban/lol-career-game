import { useState, useEffect, useMemo } from 'react';
import { useGameStore, coachPool } from '../store/gameStore';
import { LoLClientUI } from './LoLClientUI';
import { DevMenu } from './DevMenu';
import { availableJobs } from '../data/jobs';
import { shopItems } from '../data/items';

const iconMap: Record<string, string> = { lol: '\u{1F3AE}', amazon: '\u{1F6D2}', whatsapp: '\u{1F4AC}', jobs: '\u{1F4CB}', twitch: '\u{1F4FA}', browser: '\u{1F310}', profile: '\u{1F464}', settings: '\u2699\uFE0F' };
const labelMap: Record<string, string> = { lol: 'LoL Istemcisi', amazon: 'Amazon', whatsapp: 'WhatsApp', jobs: 'Is Ilanlari', twitch: 'Kick Yayin', browser: 'Haberler', profile: 'Profil', settings: 'Ayarlar' };

export function DesktopUI() {
  const { name, currentTime, balance, rank, messages, energy, tired, fame, matchLog, advanceDay, toggleDevMenu } = useGameStore();
  const [page, setPage] = useState<string>('desktop');
  const [sleeping, setSleeping] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Notification toast system
  useEffect(() => {
    const last = matchLog[matchLog.length - 1];
    if (!last) return;
    const triggers = ['✅', '🏅', 'Seviye', 'Yukseldi', '🏆', '📋', '🎁', '⭐'];
    if (triggers.some(t => last.includes(t))) {
      setToast(last);
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [matchLog.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleDevMenu();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleDevMenu]);

  // Auto advance day when energy depleted
  useEffect(() => {
    if (energy <= 0 && !sleeping) {
      setSleeping(true);
      const t = setTimeout(() => { useGameStore.getState().advanceDay(); setSleeping(false); }, 2200);
      return () => clearTimeout(t);
    }
  }, [energy]);

  const energyColor = energy > 60 ? '#2ecc71' : energy > 30 ? '#f1c40f' : energy > 10 ? '#e67e22' : '#f44336';
  const energyBar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 4, background: 'rgba(0,0,0,0.3)' }}>
      <span style={{ fontSize: 12 }}>{tired ? '😴' : '⚡'}</span>
      <div style={{ width: 60, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        <div style={{ width: energy + '%', height: '100%', borderRadius: 3, background: energyColor, transition: 'width 0.5s' }} />
      </div>
      <span style={{ fontSize: 10, color: energyColor, fontWeight: 600, minWidth: 24 }}>{energy}%</span>
    </div>
  );

  const openApp = (id: string) => { setPage(id); };
  const goBack = () => { setPage('desktop'); };

  const apps = ['lol', 'amazon', 'whatsapp', 'jobs', 'twitch', 'browser', 'profile', 'settings'];
  const rankLabel = rank.tier === 'unranked' ? 'Unranked' : rank.tier.charAt(0).toUpperCase() + rank.tier.slice(1);

  const renderAppContent = () => {
    switch (page) {
      case 'lol': return <LoLClientUI />;
      case 'jobs': return <JobsUI />;
      case 'amazon': return <AmazonUI />;
      case 'whatsapp': return <WhatsAppUI />;
      case 'twitch': return <TwitchUI />;
      case 'browser': return <BrowserUI />;
      case 'profile': return <ProfileUI />;
      case 'settings': return <SettingsUI />;
      default: return null;
    }
  };

  if (page !== 'desktop') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'var(--bg-taskbar)', borderBottom: '1px solid var(--border)', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button className="btn btn-sm" onClick={goBack}>← Geri</button>
          <span style={{ fontSize: 14 }}>{iconMap[page]}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{labelMap[page]}</span>
          <div style={{ flex: 1 }} />
          {energyBar}
          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{name} | {String(currentTime.hour).padStart(2,'0')}:{String(currentTime.minute).padStart(2,'0')}</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-primary)' }}>
          {renderAppContent()}
        </div>
        {sleeping && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999, transition: 'opacity 0.5s' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>😴</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#c8a85e' }}>Enerjin tukendi...</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>Yeni gune geciliyor.</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, background: `url('/ana-menu-bg.png') center / cover no-repeat`, padding: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 90px)', gridAutoRows: 90, gap: 12, alignContent: 'start', justifyContent: 'start' }}>
          {apps.map(id => (
            <button key={id} onClick={() => openApp(id)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 10, border: '2px solid transparent', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', cursor: 'pointer', transition: 'all 0.15s', color: '#fff', fontSize: 11, position: 'relative', width: 90, height: 90 }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.3)'; e.currentTarget.style.borderColor = 'transparent'; }}>
              <span style={{ fontSize: 28, lineHeight: 1 }}>{iconMap[id]}</span>
              <span style={{ lineHeight: 1.2, textAlign: 'center' }}>{labelMap[id]}</span>
              {id === 'whatsapp' && messages.filter(m => !m.read).length > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 4, width: 10, height: 10, borderRadius: '50%', background: '#ff6b6b', border: '2px solid rgba(0,0,0,0.3)' }} />
              )}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: 44, background: 'var(--bg-taskbar)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 12px', flexShrink: 0 }}>
        <div style={{ flex: 1 }} />
        {energyBar}
        <div style={{ width: 12 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--accent)' }}>{name}</span>
          <span>{rankLabel}</span>
          {fame > 0 && <span style={{ color: '#f39c12', fontWeight: 700 }}>⭐{fame}</span>}
          <span>{balance} TL</span>
          <span>{String(currentTime.hour).padStart(2,'0')}:{String(currentTime.minute).padStart(2,'0')} | Gun {currentTime.day}</span>
        </div>
      </div>
      {sleeping && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😴</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#c8a85e' }}>Enerjin tukendi...</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>Yeni gune geciliyor.</div>
        </div>
      )}
      <DevMenu />
      {toast && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 10000, background: 'rgba(13,16,37,0.95)', border: '1px solid #c8a85e', borderRadius: 8, padding: '10px 20px', fontSize: 12, color: '#e0e0e0', maxWidth: 320, boxShadow: '0 4px 20px rgba(200,168,94,0.2)', animation: 'none' }}>
          {toast}
          </div>
        )}
        {toast && (
          <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 10000, background: 'rgba(13,16,37,0.95)', border: '1px solid #c8a85e', borderRadius: 8, padding: '10px 20px', fontSize: 12, color: '#e0e0e0', maxWidth: 320, boxShadow: '0 4px 20px rgba(200,168,94,0.2)' }}>
            {toast}
          </div>
        )}
      </div>
  );
}

/* === Individual App UIs === */

const jobCategories = [
  { key: 'all', label: 'Tumu', emoji: '📋' },
  { key: 'hizmet', label: 'Hizmet', emoji: '🍽️' },
  { key: 'teknoloji', label: 'Teknoloji', emoji: '💻' },
  { key: 'gaming', label: 'Oyun', emoji: '🎮' },
  { key: 'ulasim', label: 'Ulasim', emoji: '🏍️' },
  { key: 'egitim', label: 'Egitim', emoji: '📚' },
];

function getJobCategory(job: any): string {
  if (job.name.includes('Kafe') || job.name.includes('Garson') || job.name.includes('Barmen') || job.name.includes('Temizlik') || job.name.includes('Magaza') || job.name.includes('Emlak') || job.name.includes('Cagri')) return 'hizmet';
  if (job.name.includes('Yazilim') || job.name.includes('Developer') || job.name.includes('Grafik') || job.name.includes('Web') || job.name.includes('Sosyal Medya') || job.name.includes('Icerik') || job.name.includes('Moderator')) return 'teknoloji';
  if (job.name.includes('Kocluk') || job.name.includes('Turnuva') || job.name.includes('Oyun') || job.name.includes('Yayinci') || job.name.includes('Espor') || job.name.includes('Analist') || job.name.includes('Internet')) return 'gaming';
  if (job.name.includes('Kurye') || job.name.includes('Taksi')) return 'ulasim';
  if (job.name.includes('Kutuphane') || job.name.includes('Universite') || job.name.includes('Anketor')) return 'egitim';
  return 'hizmet';
}

function JobsUI() {
  const { level, workJob } = useGameStore();
  const [jobFilter, setJobFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'pay' | 'level'>('pay');

  const filtered = availableJobs
    .filter(job => jobFilter === 'all' || getJobCategory(job) === jobFilter)
    .sort((a, b) => sortBy === 'pay' ? b.pay - a.pay : (a.requirement?.level || 1) - (b.requirement?.level || 1));

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0d1a' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0d1525 0%, #1a1a2e 100%)', padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: '#4fc3f7' }}>💼 Is Ilanlari</span>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Seviye {level}</div>
        <button onClick={() => setSortBy(sortBy === 'pay' ? 'level' : 'pay')}
          style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
          Siralama: {sortBy === 'pay' ? '💰 Ucret' : '📈 Seviye'}
        </button>
      </div>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: 4, padding: '8px 20px', background: '#0d1025', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        {jobCategories.map(cat => (
          <button key={cat.key} onClick={() => setJobFilter(cat.key)}
            style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid ' + (jobFilter === cat.key ? '#4fc3f7' : 'var(--border)'), background: jobFilter === cat.key ? 'rgba(79,195,247,0.1)' : 'transparent', color: jobFilter === cat.key ? '#4fc3f7' : 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: jobFilter === cat.key ? 700 : 400 }}>
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Job Cards */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 10 }}>
          {filtered.map(job => {
            const ok = level >= (job.requirement?.level || 1);
            const reqLvl = job.requirement?.level || 1;
            const ctg = getJobCategory(job);
            const ctgIcon = jobCategories.find(c => c.key === ctg)?.emoji || '📋';
            return (
              <div key={job.id} style={{
                background: ok ? '#0d1025' : '#0a0c18', border: '1px solid ' + (ok ? 'var(--border)' : '#1a1a2e'), borderRadius: 10, padding: 16,
                opacity: ok ? 1 : 0.55, transition: 'all 0.15s', position: 'relative',
              }}>
                {/* Category badge */}
                <div style={{ position: 'absolute', top: 12, right: 12, padding: '2px 8px', borderRadius: 4, background: ok ? 'rgba(79,195,247,0.1)' : 'rgba(255,255,255,0.03)', color: ok ? '#4fc3f7' : '#444', fontSize: 9 }}>
                  {ctgIcon} {jobCategories.find(c => c.key === ctg)?.label}
                </div>

                {/* Title & Company */}
                <div style={{ marginBottom: 10, paddingRight: 60 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: ok ? '#e0e0e0' : '#666' }}>{job.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>{job.description}</div>
                </div>

                {/* Details row */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ffd93d' }}>
                    <span>💰</span> <span style={{ fontWeight: 700 }}>{job.pay} TL</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}>
                    <span>⏱️</span> {job.durationHours} saat
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: ok ? '#2ecc71' : '#f44336' }}>
                    <span>📊</span> Seviye {reqLvl}
                  </div>
                </div>

                {/* Stat bonuses */}
                {Object.keys(job.statBonus).length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
                    {Object.entries(job.statBonus).map(([stat, val]) => (
                      <span key={stat} style={{ padding: '2px 6px', borderRadius: 3, background: 'rgba(46,204,113,0.1)', color: '#2ecc71', fontSize: 9, fontWeight: 600 }}>
                        +{val} {stat === 'mekanik' ? '⚔️ Mekanik' : stat === 'oyunBilgisi' ? '📖 Oyun Bilgisi' : stat === 'takimUyumu' ? '🤝 Takim Uyumu' : '🧠 Mental'}
                      </span>
                    ))}
                  </div>
                )}

                {/* Apply button */}
                <button onClick={() => ok && workJob(job.id)} disabled={!ok}
                  style={{
                    width: '100%', padding: '8px 0', borderRadius: 6, border: 'none',
                    background: ok ? 'linear-gradient(135deg, #4fc3f7, #2980b9)' : '#1a1a2e',
                    color: ok ? '#fff' : '#666', fontSize: 12, fontWeight: 700,
                    cursor: ok ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                  }}>
                  {ok ? '✅ Basvur' : `🔒 Seviye ${reqLvl} Gerekli`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const categoryEmojis: Record<string, string> = { ekipman: '🎮', enerji: '⚡', kozmetik: '✨' };
const categoryLabels: Record<string, string> = { ekipman: 'Ekipman', enerji: 'Enerji', kozmetik: 'Kozmetik' };
const subCategoryMap: Record<string, { label: string; emoji: string }> = {
  Fare: { label: 'Fare', emoji: '🖱️' }, Klavye: { label: 'Klavye', emoji: '⌨️' }, 'Kulaklık / Mikrofon': { label: 'Ses', emoji: '🎧' },
  Monitor: { label: 'Monitör', emoji: '🖥️' }, Koltuk: { label: 'Koltuk', emoji: '🪑' }, 'İnternet / Ağ': { label: 'Ağ', emoji: '🌐' },
  Mousepad: { label: 'Pad', emoji: '🟫' }, Kamera: { label: 'Kamera', emoji: '📷' }, Antrenman: { label: 'Koçluk', emoji: '🎓' },
};

function getSubCategory(item: any): string {
  if (item.name.includes('Fare') || item.name.includes('Mouse')) return 'Fare';
  if (item.name.includes('Klavye')) return 'Klavye';
  if (item.name.includes('Kulaklık') || item.name.includes('Mikrofon')) return 'Kulaklık / Mikrofon';
  if (item.name.includes('Monitor') || item.name.includes('Ekran')) return 'Monitor';
  if (item.name.includes('Koltuk') || item.name.includes('Sandaly')) return 'Koltuk';
  if (item.name.includes('Ethernet') || item.name.includes('Router') || item.name.includes('İnternet')) return 'İnternet / Ağ';
  if (item.name.includes('Mousepad') || item.name.includes('Pad')) return 'Mousepad';
  if (item.name.includes('Webcam') || item.name.includes('Kamera')) return 'Kamera';
  if (item.name.includes('Koç') || item.name.includes('Rehber') || item.name.includes('Antrenman')) return 'Antrenman';
  return '';
}

function AmazonUI() {
  const { balance, equipment, buyItem, tired } = useGameStore();
  const [selCat, setSelCat] = useState<string>('all');
  const [selSub, setSelSub] = useState<string>('');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);

  const filtered = shopItems.filter(item => {
    if (selCat !== 'all' && item.category !== selCat) return false;
    if (selSub && getSubCategory(item) !== selSub) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const owned = (id: string) => equipment.includes(id);
  const canBuy = (price: number) => balance >= price;
  const cartTotal = cart.reduce((sum, id) => sum + (shopItems.find(i => i.id === id)?.price || 0), 0);

  const addToCart = (id: string) => { if (!cart.includes(id)) setCart(prev => [...prev, id]); };
  const removeFromCart = (id: string) => { setCart(prev => prev.filter(x => x !== id)); };

  const checkout = () => {
    cart.forEach(id => buyItem(id));
    setCart([]);
    setShowCart(false);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0d1a' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #131921 0%, #232f3e 100%)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '2px solid #f90' }}>
        <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>amazon</span>
        <span style={{ fontSize: 11, color: '#ccc' }}>.com.tr</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 6, background: 'rgba(255,255,255,0.1)', color: '#ffd93d', fontSize: 13, fontWeight: 700 }}>
          <span>💰</span> {balance} TL
        </div>
        <button onClick={() => setShowCart(!showCart)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 6, background: showCart ? 'rgba(255,153,0,0.2)' : 'rgba(255,255,255,0.08)', border: '1px solid ' + (showCart ? '#f90' : 'transparent'), color: showCart ? '#f90' : '#ccc', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
          🛒 Sepet {cart.length > 0 && <span style={{ background: '#f90', color: '#000', borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>{cart.length}</span>}
          {cart.length > 0 && <span style={{ color: '#ffd93d', fontSize: 11 }}>{cartTotal} TL</span>}
        </button>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', gap: 4, padding: '8px 20px', background: '#1a2236', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => { setSelCat('all'); setSelSub(''); }} style={{ padding: '5px 14px', borderRadius: 6, border: 'none', background: selCat === 'all' ? '#f90' : 'transparent', color: selCat === 'all' ? '#000' : '#ccc', fontSize: 11, fontWeight: selCat === 'all' ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>
          🏪 Tümü
        </button>
        {(['ekipman', 'enerji', 'kozmetik'] as const).map(cat => (
          <button key={cat} onClick={() => { setSelCat(cat); setSelSub(''); }}
            style={{ padding: '5px 14px', borderRadius: 6, border: 'none', background: selCat === cat ? '#f90' : 'transparent', color: selCat === cat ? '#000' : '#ccc', fontSize: 11, fontWeight: selCat === cat ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>
            {categoryEmojis[cat]} {categoryLabels[cat]}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Ürün ara..."
          style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)', background: '#0d1025', color: '#e0e0e0', fontSize: 11, fontFamily: 'inherit', width: 180, outline: 'none' }} />
      </div>

      {/* Sub categories for ekipman */}
      {selCat === 'ekipman' && (
        <div style={{ display: 'flex', gap: 4, padding: '4px 20px', background: '#151d30', borderBottom: '1px solid rgba(255,255,255,0.03)', flexWrap: 'wrap' }}>
          <button onClick={() => setSelSub('')} style={{ padding: '3px 10px', borderRadius: 4, border: 'none', background: selSub === '' ? 'rgba(255,153,0,0.2)' : 'transparent', color: selSub === '' ? '#f90' : '#888', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
            Hepsi
          </button>
          {Object.entries(subCategoryMap).map(([key, val]) => (
            <button key={key} onClick={() => setSelSub(key)}
              style={{ padding: '3px 10px', borderRadius: 4, border: 'none', background: selSub === key ? 'rgba(255,153,0,0.2)' : 'transparent', color: selSub === key ? '#f90' : '#888', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
              {val.emoji} {val.label}
            </button>
          ))}
        </div>
      )}

      {/* Tired warning */}
      {tired && (
        <div style={{ margin: '8px 20px', padding: '10px 16px', border: '1px solid #ff9800', borderRadius: 8, background: 'rgba(255,152,0,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>😴</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#ff9800' }}>Yorgunsun!</div>
            <div style={{ fontSize: 10, color: '#ccc' }}>Enerji içeceği alarak devam edebilirsin.</div>
          </div>
          <button className="btn btn-warning" onClick={() => buyItem('enerjiIcesi')} disabled={!canBuy(50)}>⚡ 50 TL</button>
        </div>
      )}

      {/* Product Grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12, marginTop: 40 }}>Bu kategoride ürün bulunamadi.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {filtered.map(item => {
              const o = owned(item.id);
              return (
                <div key={item.id} style={{
                  background: 'linear-gradient(135deg, #131f30 0%, #0d1525 100%)', border: '1px solid var(--border)', borderRadius: 10, padding: 14,
                  opacity: o ? 0.5 : 1, transition: 'all 0.15s', position: 'relative', overflow: 'hidden',
                }}>
                  {/* Category badge */}
                  <div style={{ position: 'absolute', top: 10, right: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,153,0,0.15)', color: '#f90', fontSize: 9, fontWeight: 600 }}>
                    {categoryEmojis[item.category]} {categoryLabels[item.category]}
                  </div>
                  {/* Product icon */}
                  <div style={{ fontSize: 32, marginBottom: 8 }}>
                    {item.name.includes('Fare') ? '🖱️' : item.name.includes('Klavye') ? '⌨️'
                    : item.name.includes('Kulaklık') ? '🎧' : item.name.includes('Mikrofon') ? '🎤'
                    : item.name.includes('Monitor') ? '🖥️' : item.name.includes('Koltuk') ? '🪑'
                    : item.name.includes('Mousepad') ? '🟫' : item.name.includes('Webcam') ? '📷'
                    : item.name.includes('Router') || item.name.includes('Ethernet') ? '🌐'
                    : item.name.includes('Enerji') || item.name.includes('Kahve') || item.name.includes('Protein') || item.name.includes('Fuel') ? '⚡'
                    : item.name.includes('Skin') ? '🎨' : item.name.includes('Simge') ? '🖼️' : item.name.includes('Emote') ? '😎'
                    : item.name.includes('Koç') ? '🎓' : item.name.includes('Rehber') ? '📖' : item.name.includes('Antrenman') ? '🧠'
                    : '📦'}
                  </div>
                  {/* Name */}
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e0e0e0', marginBottom: 4 }}>{item.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.3 }}>{item.description}</div>
                  {/* Stat bonuses */}
                  {Object.keys(item.statBonus).length > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                      {Object.entries(item.statBonus).map(([stat, val]) => (
                        <span key={stat} style={{ padding: '2px 7px', borderRadius: 3, background: 'rgba(79,195,247,0.1)', color: '#4fc3f7', fontSize: 10, fontWeight: 600 }}>
                          +{val} {stat === 'mekanik' ? '⚔️' : stat === 'oyunBilgisi' ? '📖' : stat === 'takimUyumu' ? '🤝' : '🧠'}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Price & Buy */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#ffd93d' }}>{item.price} TL</div>
                    {o ? (
                      <span style={{ padding: '6px 18px', borderRadius: 6, border: '1px solid #2ecc71', color: '#2ecc71', fontSize: 11, fontWeight: 700 }}>✓ Sahip</span>
                    ) : cart.includes(item.id) ? (
                      <button onClick={() => removeFromCart(item.id)}
                        style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #f44336', background: 'rgba(244,67,54,0.1)', color: '#f44336', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        ✕ Cikar
                      </button>
                    ) : (
                      <button onClick={() => addToCart(item.id)}
                        style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: canBuy(item.price) ? 'linear-gradient(135deg, #f90, #e68a00)' : '#2a2a4a', color: canBuy(item.price) ? '#000' : '#666', fontSize: 11, fontWeight: 700, cursor: canBuy(item.price) ? 'pointer' : 'default', fontFamily: 'inherit' }}>
                        🛒 Sepete Ekle
                      </button>
        )}
      </div>

      {/* Cart Slide Panel */}
      {showCart && (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 360, background: '#0d1025', borderLeft: '2px solid #f90', zIndex: 100, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'rgba(255,153,0,0.08)' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#f90' }}>🛒 Sepet ({cart.length})</span>
            <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16, fontFamily: 'inherit' }}>✕</button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 10 }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12, marginTop: 40 }}>Sepetin bos.</div>
            ) : (
              cart.map(id => {
                const item = shopItems.find(i => i.id === id);
                if (!item) return null;
                return (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <div style={{ fontSize: 22, width: 32, textAlign: 'center', flexShrink: 0 }}>
                      {item.name.includes('Fare') ? '🖱️' : item.name.includes('Klavye') ? '⌨️'
                      : item.name.includes('Kulaklık') ? '🎧' : item.name.includes('Mikrofon') ? '🎤'
                      : item.name.includes('Monitor') ? '🖥️' : item.name.includes('Koltuk') ? '🪑'
                      : item.name.includes('Mousepad') ? '🟫' : item.name.includes('Webcam') ? '📷'
                      : item.name.includes('Router') || item.name.includes('Ethernet') ? '🌐'
                      : item.name.includes('Enerji') || item.name.includes('Kahve') || item.name.includes('Protein') || item.name.includes('Fuel') ? '⚡'
                      : item.name.includes('Skin') ? '🎨' : item.name.includes('Simge') ? '🖼️' : item.name.includes('Emote') ? '😎'
                      : item.name.includes('Koç') ? '🎓' : item.name.includes('Rehber') ? '📖' : item.name.includes('Antrenman') ? '🧠'
                      : '📦'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#e0e0e0' }}>{item.name}</div>
                      <div style={{ fontSize: 10, color: '#ffd93d' }}>{item.price} TL</div>
                    </div>
                    <button onClick={() => removeFromCart(id)}
                      style={{ padding: '4px 10px', borderRadius: 4, border: 'none', background: 'rgba(244,67,54,0.1)', color: '#f44336', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
                      ✕
                    </button>
                  </div>
                );
              })
            )}
          </div>
          {cart.length > 0 && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Toplam</span>
                <span style={{ fontWeight: 700, color: '#ffd93d' }}>{cartTotal} TL</span>
              </div>
              <button onClick={checkout} disabled={cartTotal > balance}
                style={{ width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', background: cartTotal > balance ? '#2a2a4a' : 'linear-gradient(135deg, #f90, #e68a00)', color: cartTotal > balance ? '#666' : '#000', fontSize: 13, fontWeight: 700, cursor: cartTotal > balance ? 'default' : 'pointer', fontFamily: 'inherit' }}>
                {cartTotal > balance ? `🔒 Yetersiz Bakiye (${cartTotal} TL)` : '🛍️ Satin Al'}
              </button>
            </div>
          )}
        </div>
      )}
      {showCart && <div onClick={() => setShowCart(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />}
    </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function WhatsAppUI() {
  const { messages, acceptOffer, rejectOffer, bluffOffer, markChatRead } = useGameStore();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Group messages by sender
  const contacts = useMemo(() => {
    const map = new Map<string, { from: string; lastText: string; unread: number; lastTime: number }>();
    [...messages].forEach(msg => {
      const existing = map.get(msg.from);
      if (!existing || msg.id > existing.lastTime.toString()) {
        map.set(msg.from, {
          from: msg.from,
          lastText: msg.text,
          unread: (existing?.unread || 0) + (msg.read ? 0 : 1),
          lastTime: Date.now(),
        });
      } else if (!msg.read) {
        existing.unread += 1;
      }
    });
    return Array.from(map.values());
  }, [messages]);

  const chatMessages = selectedChat ? messages.filter(m => m.from === selectedChat) : [];

  const handleSend = () => {
    if (!replyText.trim()) return;
    setReplyText('');
  };

  const colors = ['#e74c3c', '#2ecc71', '#3498db', '#9b59b6', '#f39c12', '#1abc9c', '#e67e22', '#e91e63'];
  const getAvatarColor = (name: string) => colors[name.charCodeAt(0) % colors.length];

  return (
    <div style={{ height: '100%', display: 'flex', background: '#0a0a0a' }}>
      {/* Contact List Sidebar */}
      <div style={{ width: 300, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, background: '#0d1025' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#e0e0e0' }}>💬 WhatsApp</span>
          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{contacts.length} sohbet</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {contacts.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12 }}>
              Henuz mesaj yok. Zaman ilerledikce arkadaslarindan mesajlar gelecek.
            </div>
          ) : (
            contacts.map((ct, i) => (
              <div key={i}
                onClick={() => { setSelectedChat(ct.from); ct.unread > 0 && markChatRead(ct.from); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.02)', background: selectedChat === ct.from ? 'rgba(79,195,247,0.06)' : 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = selectedChat === ct.from ? 'rgba(79,195,247,0.06)' : 'transparent'; }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: getAvatarColor(ct.from), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {ct.from.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#e0e0e0' }}>{ct.from}</span>
                    <span style={{ fontSize: 9, color: 'var(--text-secondary)' }}>
                      {ct.unread > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', background: '#25d366', color: '#fff', fontSize: 10, fontWeight: 700 }}>{ct.unread}</span>}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ct.lastText}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat View */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0d1a' }}>
        {selectedChat ? (
          <>
            {/* Chat header */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, background: '#0d1025' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: getAvatarColor(selectedChat), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {selectedChat.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0' }}>{selectedChat}</div>
              <div style={{ flex: 1 }} />
              <button onClick={() => setSelectedChat(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16, fontFamily: 'inherit' }}>✕</button>
            </div>
            {/* Messages */}
            <div style={{ flex: 1, overflow: 'auto', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 11, marginTop: 40 }}>
                  Henuz bu kisiden mesaj yok.
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '75%' }}>
                    <div style={{
                      padding: '7px 12px', borderRadius: 8, fontSize: 12, lineHeight: 1.4,
                      background: '#1a3a2a', color: '#e0e0e0',
                      borderBottomLeftRadius: 2,
                    }}>
                      {msg.text}
                    </div>
                    {msg.isOffer && msg.offer && (
                      <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="btn btn-success btn-sm" onClick={() => acceptOffer(msg.id)}>Kabul ({msg.offer.salary} TL)</button>
                        <button className="btn btn-warning btn-sm" onClick={() => bluffOffer(msg.id)}>Blof Yap</button>
                        <button className="btn btn-danger btn-sm" onClick={() => rejectOffer(msg.id)}>Reddet</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            {/* Reply box */}
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, background: '#0d1025' }}>
              <input value={replyText} onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Mesaj yaz..."
                style={{ flex: 1, padding: '8px 12px', borderRadius: 20, border: '1px solid var(--border)', background: '#0a0a1a', color: '#e0e0e0', fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
              <button onClick={handleSend}
                style={{ padding: '8px 14px', borderRadius: 20, border: 'none', background: '#25d366', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Gonder
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 12 }}>
            Bir sohbet secmek icin soldaki listeden birine tikla.
          </div>
        )}
      </div>
    </div>
  );
}

function TwitchUI() {
  const { twitch, balance, startStream, endStream } = useGameStore();
  const streamTitle = 'SoloQ Grind - Challenger Yolunda! 🔥';
  const streamGame = 'League of Legends';
  const viewers = twitch.streaming ? Math.floor(twitch.followers * 0.03 + twitch.subscribers * 2 + Math.random() * 20) : 0;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid rgba(83,255,0,0.15)', background: 'linear-gradient(90deg, #0d1025 0%, #0a1a0a 100%)' }}>
        <span style={{ fontSize: 16, fontWeight: 900, color: '#53ff00', letterSpacing: 1 }}>KICK</span>
        <div style={{ flex: 1 }} />
        {twitch.streaming ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f44336', boxShadow: '0 0 8px #f44336' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#f44336' }}>CANLI</span>
            <span style={{ fontSize: 10, color: '#888' }}>{viewers} izleyici</span>
            <button className="btn btn-danger btn-sm" onClick={endStream}>Yayini Kapat</button>
          </div>
        ) : (
          <span style={{ fontSize: 10, color: '#888' }}>Cevrimdisi</span>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Stream Preview / Offline */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0d15', position: 'relative' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: twitch.streaming ? 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)' : '#060810' }}>
            {twitch.streaming ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎮</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e0e0e0' }}>{streamTitle}</div>
                <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>{streamGame}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16, fontSize: 10 }}>
                  <span style={{ color: '#f44336' }}>👁️ {viewers}</span>
                  <span style={{ color: '#9146ff' }}>💬 {Math.floor(viewers * 0.06)}</span>
                  <span style={{ color: '#ffd93d' }}>⏱️ 3s kaldi</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>📺</div>
                <div style={{ fontSize: 14, color: '#888' }}>Yayin kapali</div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>Yayina baslamak icin asagidaki butona tikla</div>
                <button className="btn btn-success" onClick={startStream}
                  style={{ marginTop: 16, padding: '10px 28px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #53ff00, #2ecc71)', color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  ▶ Yayini Baslat (3 saat)
                </button>
              </div>
            )}
          </div>
          {/* Stream controls bar */}
          {twitch.streaming && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', background: '#0d1025', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#e0e0e0' }}>{streamTitle}</span>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 10, color: '#9146ff' }}>⚙️ 1080p60</span>
              <span style={{ fontSize: 10, color: '#888' }}>📊 {twitch.followers} Takipci</span>
            </div>
          )}
        </div>

        {/* Right Panel - Stats & Chat */}
        <div style={{ width: 280, borderLeft: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', background: '#0d1025', flexShrink: 0 }}>
          {/* Stats */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 10 }}>📊 KANAL ISTATISTIKLERI</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ background: 'rgba(79,195,247,0.05)', borderRadius: 6, padding: '10px 8px', textAlign: 'center', border: '1px solid rgba(79,195,247,0.1)' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#4fc3f7' }}>{twitch.followers}</div>
                <div style={{ fontSize: 9, color: '#888' }}>Takipci</div>
              </div>
              <div style={{ background: 'rgba(145,70,255,0.05)', borderRadius: 6, padding: '10px 8px', textAlign: 'center', border: '1px solid rgba(145,70,255,0.1)' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#9146ff' }}>{twitch.subscribers}</div>
                <div style={{ fontSize: 9, color: '#888' }}>Abone</div>
              </div>
            </div>
            <div style={{ marginTop: 8, background: 'rgba(255,217,61,0.05)', borderRadius: 6, padding: '10px 8px', textAlign: 'center', border: '1px solid rgba(255,217,61,0.1)' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#ffd93d' }}>{twitch.donations} TL</div>
              <div style={{ fontSize: 9, color: '#888' }}>Toplam Bagis</div>
            </div>
          </div>

          {/* Chat simulasyonu */}
          <div style={{ flex: 1, overflow: 'auto', padding: '10px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#888', marginBottom: 8 }}>💬 SOHBET</div>
            {twitch.streaming ? (
              <>
                {[
                  { user: 'xXShadowXx', color: '#4fc3f7', text: 'kral yayin acmissin POGGERS' },
                  { user: 'YasuoMain', color: '#f44336', text: 'hangi eloda kasiyorsun kral?' },
                  { user: 'NightWolfTR', color: '#ffd93d', text: 'sub atalim mi la' },
                  { user: 'ZedGod', color: '#2ecc71', text: 'yayinciyi ozlemisiz be' },
                  { user: 'KebabMaster', color: '#e91e63', text: 'bugun kac mac var' },
                  { user: 'ProGamer99', color: '#9146ff', text: 'gecen oyundaki playin efsaneydi' },
                ].map((msg, i) => (
                  <div key={i} style={{ marginBottom: 6, fontSize: 10, lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 700, color: msg.color }}>{msg.user}: </span>
                    <span style={{ color: '#ccc' }}>{msg.text}</span>
                  </div>
                ))}
              </>
            ) : (
              <div style={{ color: '#666', fontSize: 10, textAlign: 'center', marginTop: 20 }}>
                Yayin kapaliyken sohbet bos.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BrowserUI() {
  const { matchLog } = useGameStore();
  const news = [
    { i: '\u{1F3C6}', t: 'Dunya Sampiyonasi', d: 'Buyuk final bu hafta sonu!' },
    { i: '\u{1F500}', t: 'Transfer Dedikodulari', d: 'Yildiz oyuncular takim degistirebilir.' },
    { i: '\u{1F4C8}', t: 'Meta Degisimi', d: 'Yeni yama ile orman metasi degisti.' },
    { i: '\u{1F1F9}\u{1F1F7}', t: 'TCL Ligi', d: 'Turkiye Sampiyonluk Ligi devam ediyor.' },
    { i: '\u{1F916}', t: 'Yeni Sampiyon', d: 'Riot yeni sampiyonu tanitti.' },
  ];
  return (
    <div style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 12 }}>E-Spor Haberleri</h2>
      {news.map((n, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, border: '1px solid var(--border)', borderRadius: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 24 }}>{n.i}</span>
          <div><div style={{ fontWeight: 'bold' }}>{n.t}</div><div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{n.d}</div></div>
        </div>
      ))}
      <div style={{ marginTop: 16 }}><h3>Gecmis</h3><div className="match-log">{matchLog.slice(-8).map((e,i) => <div key={i}>{e}</div>)}</div></div>
    </div>
  );
}

function ProfileUI() {
  const p = useGameStore();
  const rankColors: Record<string, string> = { unranked: '#666', demir: '#8c8c8c', bronz: '#cd7f32', gumus: '#c0c0c0', altin: '#ffd700', platin: '#e5e4e2', zumrut: '#2ecc71', elmas: '#b9f2ff', master: '#9b59b6', grandmaster: '#e74c3c', challenger: '#f1c40f' };
  return (
    <div style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #4fc3f7, #ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#fff' }}>{p.name[0]}</div>
        <div><div style={{ fontSize: 18, fontWeight: 'bold' }}>{p.name}</div><div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Seviye {p.level} | {p.xp}/{p.xpToNext} XP</div><div style={{ color: rankColors[p.rank.tier], fontWeight: 'bold' }}>{p.rank.tier === 'unranked' ? 'Unranked' : p.rank.tier.toUpperCase() + ' ' + p.rank.lp + ' LP'}{p.rank.division ? ' ' + ['IV','III','II','I'][4 - p.rank.division] : ''}</div></div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        {[{k:'mekanik',l:'MEKANIK',c:'#ff6b6b'},{k:'oyunBilgisi',l:'OYUN BILGISI',c:'#4fc3f7'},{k:'takimUyumu',l:'TAKIM UYUMU',c:'#6bcb77'},{k:'mentalGuc',l:'MENTAL GUC',c:'#ffd93d'}].map(s => (
          <div key={s.k} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{s.l}</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: s.c }}>{(p.stats as any)[s.k]}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1, textAlign: 'center' }}><div style={{ fontSize: 20, color: '#ffd93d' }}>{p.balance} TL</div><div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Bakiye</div></div>
        <div style={{ flex: 1, textAlign: 'center' }}><div style={{ fontSize: 20, color: '#4fc3f7' }}>{p.blueEssence}</div><div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Mavi Oz</div></div>
        <div style={{ flex: 1, textAlign: 'center' }}><div style={{ fontSize: 20, color: p.tired ? '#ff9800' : '#4caf50' }}>{p.energy}%</div><div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Enerji</div></div>
      </div>
      {p.team && <div style={{ padding: 10, border: '1px solid #4fc3f7', borderRadius: 6, marginBottom: 8 }}>Takim: {p.team.teamName} ({p.team.salary} TL)</div>}
      {p.equipment.length > 0 && <div style={{ padding: 10, border: '1px solid var(--border)', borderRadius: 6 }}>{p.equipment.map(e => <div key={e}>{e}</div>)}</div>}
    </div>
  );
}

function SettingsUI() {
  const { devMenu, toggleDevMenu, saveGame, loadGame, theme, setTheme, saveToSlot, loadFromSlot, saveSlots, coach, hireCoach, fireCoach, fame, createClan, clan } = useGameStore();
  const [status, setStatus] = useState('');
  const hasSave = useMemo(() => !!localStorage.getItem('lolcareergame_save'), []);

  return (
    <div style={{ padding: 16, maxWidth: 500, margin: '0 auto' }}>
      <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>⚙️ Ayarlar</div>

      {/* Theme */}
      <div style={{ background: '#0d1025', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><div style={{ fontSize: 14, fontWeight: 600 }}>Tema</div><div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{theme === 'dark' ? 'Koyu' : 'Aydinlik'} mod</div></div>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{ padding: '6px 16px', borderRadius: 4, border: '1px solid var(--border)', background: theme === 'dark' ? '#1a1a2e' : '#fff', color: theme === 'dark' ? '#e0e0e0' : '#000', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
            {theme === 'dark' ? '🌙 Koyu' : '☀️ Aydinlik'}
          </button>
        </div>
      </div>

      {/* Debug Mode */}
      <div style={{ background: '#0d1025', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><div style={{ fontSize: 14, fontWeight: 600 }}>Debug Modu</div><div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Gelistirici menusu (Ctrl+Shift+D)</div></div>
          <button onClick={toggleDevMenu} style={{ position: 'relative', width: 48, height: 26, borderRadius: 13, border: 'none', background: devMenu ? '#4fc3f7' : '#2a2a4a', cursor: 'pointer', padding: 0 }}>
            <div style={{ position: 'absolute', top: 3, left: devMenu ? 24 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'all 0.2s' }} />
          </button>
        </div>
      </div>

      {/* Save Slots */}
      <div style={{ background: '#0d1025', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>💾 Kayit Slotlari (3)</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3].map(slot => {
            const saved = saveSlots.find((s: any) => s.slot === slot);
            return (
              <div key={slot} style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid var(--border)', background: saved ? 'rgba(46,204,113,0.05)' : 'rgba(255,255,255,0.01)', textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: saved ? '#2ecc71' : '#888' }}>Slot {slot}</div>
                {saved ? (
                  <div>
                    <div style={{ fontSize: 8, color: '#888' }}>{saved.name}</div>
                    <button onClick={() => { const ok = loadFromSlot(slot); setStatus(ok ? '✅ Yuklendi!' : '❌ Hata!'); setTimeout(() => setStatus(''), 2000); }} style={{ marginTop: 4, padding: '2px 10px', borderRadius: 3, border: 'none', background: '#4fc3f7', color: '#000', fontSize: 8, cursor: 'pointer', fontFamily: 'inherit' }}>Yukle</button>
                  </div>
                ) : (
                  <button onClick={() => { saveToSlot(slot); setStatus('✅ Kaydedildi!'); setTimeout(() => setStatus(''), 2000); }} style={{ marginTop: 2, padding: '2px 10px', borderRadius: 3, border: 'none', background: '#2ecc71', color: '#000', fontSize: 8, cursor: 'pointer', fontFamily: 'inherit' }}>Kaydet</button>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button onClick={() => { saveGame(); setStatus('✅ Kaydedildi!'); setTimeout(() => setStatus(''), 2000); }} style={{ flex: 1, padding: '8px 0', borderRadius: 4, border: 'none', background: 'linear-gradient(135deg, #2ecc71, #27ae60)', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>💾 Hizli Kaydet</button>
          <button onClick={() => { const ok = loadGame(); setStatus(ok ? '✅ Yuklendi!' : '❌ Bulunamadi!'); setTimeout(() => setStatus(''), 2000); }} disabled={!hasSave} style={{ flex: 1, padding: '8px 0', borderRadius: 4, border: 'none', background: hasSave ? 'linear-gradient(135deg, #4fc3f7, #2980b9)' : '#2a2a4a', color: hasSave ? '#fff' : '#666', fontSize: 11, fontWeight: 700, cursor: hasSave ? 'pointer' : 'default', fontFamily: 'inherit' }}>📂 Hizli Yukle</button>
        </div>
        {status && <div style={{ marginTop: 6, fontSize: 11, textAlign: 'center', color: status.includes('✅') ? '#2ecc71' : '#f44336' }}>{status}</div>}
      </div>

      {/* Coach / Clan */}
      <div style={{ background: '#0d1025', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>🎓 Koc & 🏰 Klan</div>
        {coach ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11 }}>{coach.emoji} {coach.name} - {coach.specialty}</span>
            <button onClick={fireCoach} style={{ padding: '3px 10px', borderRadius: 3, border: 'none', background: '#f44336', color: '#fff', fontSize: 9, cursor: 'pointer', fontFamily: 'inherit' }}>Iptal</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {coachPool.map((c: any) => (
              <button key={c.id} onClick={() => hireCoach(c.id)} style={{ flex: 1, padding: '6px 4px', borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', color: '#e0e0e0', fontSize: 9, cursor: 'pointer', fontFamily: 'inherit' }}>
                {c.emoji} {c.name}<br/><span style={{ color: '#ffd93d' }}>{c.costPerDay}TL/g</span>
              </button>
            ))}
          </div>
        )}
        {clan ? (
          <div style={{ fontSize: 10, color: '#2ecc71' }}>🏰 [{clan.tag}] {clan.name} - Lv.{clan.level} ({clan.members.length} uye)</div>
        ) : (
          <button onClick={() => createClan('Klanim', 'KLN')} disabled={fame < 50} style={{ padding: '5px 14px', borderRadius: 4, border: 'none', background: fame >= 50 ? '#c8a85e' : '#2a2a4a', color: '#000', fontSize: 10, fontWeight: 700, cursor: fame >= 50 ? 'pointer' : 'default', fontFamily: 'inherit' }}>
            🏰 Klan Kur (50 Fame) - Mevcut: {fame}⭐
          </button>
        )}
      </div>
    </div>
  );
}
