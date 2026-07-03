import { useState, useMemo, useEffect } from 'react';
import { useGameStore, summonerSpells, runePages, matchComponents, matchCompletedItems, getAllShopItems, canCombine, getRecommendedItems, getChampionAbilities, getRuneSynergy } from '../store/gameStore';
import { getSkinsForChampion, getSkinImageUrl } from '../data/skins';
import type { MatchEvent } from '../types';

const rankColors: Record<string, string> = { unranked: '#666', demir: '#8c8c8c', bronz: '#cd7f32', gumus: '#c0c0c0', altin: '#ffd700', platin: '#e5e4e2', zumrut: '#2ecc71', elmas: '#b9f2ff', master: '#9b59b6', grandmaster: '#e74c3c', challenger: '#f1c40f' };
const rankEmoji: Record<string, string> = { unranked: '❓', demir: '🪨', bronz: '🥉', gumus: '🥈', altin: '🥇', platin: '💎', zumrut: '🟢', elmas: '🔷', master: '👑', grandmaster: '🔥', challenger: '🏆' };
const DD = 'https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion';
const DD_SPELL = 'https://ddragon.leagueoflegends.com/cdn/14.10.1/img/spell';
const DD_RUNE = 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles';

function spellUrl(sp: any) { return DD_SPELL + '/' + sp.imageId + '.png'; }
function runeUrl(rp: any) { return DD_RUNE + '/' + rp.imageId + '/' + rp.imageId.split('/')[1] + '.png'; }

type LoLPage = 'home' | 'lobby' | 'champselect' | 'skinselect' | 'match' | 'postmatch' | 'store' | 'leaderboard' | 'profile' | 'tournament';

export function LoLClientUI() {
  const s = useGameStore();
  const [page, setPage] = useState<LoLPage>('home');
  const [showQueue, setShowQueue] = useState(false);
  const [matchMode, setMatchMode] = useState<'normal' | 'ranked'>('normal');
  const [preferredLane, setPreferredLane] = useState('Üst Koridor');
  const [lastChampionId, setLastChampionId] = useState('');
  const [skinChampionId, setSkinChampionId] = useState('');
  const [skinSpells, setSkinSpells] = useState<string[]>(['flash', 'ignite']);
  const [skinRune, setSkinRune] = useState('conqueror');
  const [showFriends, setShowFriends] = useState(true);

  const startMatch = (mode: 'normal' | 'ranked') => {
    if (mode === 'ranked' && s.level < 20) return;
    setMatchMode(mode);
    setShowQueue(false);
    setPage('lobby');
  };

  const pickLane = (lane: string) => {
    setPreferredLane(lane);
  };

  const startFromLobby = (lane: string) => {
    setPreferredLane(lane);
    setPage('champselect');
  };

  const beginGame = (championId: string, spells: string[], rune: string) => {
    setLastChampionId(championId);
    setSkinChampionId(championId);
    setSkinSpells(spells);
    setSkinRune(rune);
    setPage('skinselect');
  };

  const startFromSkinSelect = () => {
    s.setMatchSpells(skinSpells);
    s.setMatchRune(skinRune);
    s.playMatch(matchMode);
    setPage('match');
  };

  const navTo = (p: LoLPage) => {
    if (p === 'match') {
      if (!s.matchActive) setShowQueue(true);
      else setPage('match');
    } else {
      setPage(p);
    }
  };

  const handleFinishMatch = () => {
    s.finishMatch(lastChampionId);
    setPage('postmatch');
  };

  const tabBtn = (id: LoLPage, icon: string, label: string, disabled = false, gold = false) => (
    <button onClick={() => navTo(id)} disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 16px', borderRadius: 4, border: 'none',
        background: page === id && !gold ? 'rgba(200,168,94,0.15)' : gold
          ? (disabled ? '#2a2a4a' : 'linear-gradient(135deg, #c8a85e, #a8862e)')
          : 'transparent',
        color: gold ? (disabled ? '#666' : '#0a0a1a') : (page === id ? '#c8a85e' : 'var(--text-secondary)'),
        fontSize: gold ? 14 : 12, fontWeight: gold ? 700 : 400,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', letterSpacing: gold ? 1 : 0,
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { if (!disabled && gold) { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(200,168,94,0.4)'; } else if (!disabled && !gold) { e.currentTarget.style.background = 'rgba(200,168,94,0.08)'; }}}
      onMouseLeave={e => { if (!disabled && gold) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; } else if (!disabled && !gold) { e.currentTarget.style.background = page === id ? 'rgba(200,168,94,0.15)' : 'transparent'; }}}
    >
      {icon} {label}
    </button>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', position: 'relative' }}>
      {/* Top Bar */}
      <div style={{ background: 'linear-gradient(180deg, #0d1025 0%, #1a1a2e 100%)', borderBottom: '1px solid var(--border)', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div onClick={() => setPage('home')} style={{ fontSize: 20, fontWeight: 900, background: 'linear-gradient(135deg, #c8a85e, #f0d68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: 1, marginRight: 12, cursor: 'pointer' }}>
          LoL
        </div>
        {tabBtn('match', '▶', 'OYNA', s.matchActive, true)}
        {tabBtn('store', '🛒', 'Magaza')}
        {tabBtn('leaderboard', '🏆', 'Liderlik')}
        {tabBtn('tournament', '🏟️', 'Turnuva')}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 4, background: 'rgba(79,195,247,0.08)', border: '1px solid rgba(79,195,247,0.15)', fontSize: 11, fontWeight: 600, color: '#4fc3f7' }}>
          <span>🔷</span> {s.blueEssence}
        </div>
        <button onClick={() => navTo('profile')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '4px 12px 4px 4px', borderRadius: 6,
            border: '1px solid ' + (page === 'profile' ? '#4fc3f7' : 'transparent'),
            background: page === 'profile' ? 'rgba(79,195,247,0.08)' : 'transparent',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #4fc3f7, #ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold', color: '#fff' }}>
            {s.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
            <div style={{ fontSize: 10, color: s.rank.tier === 'unranked' ? 'var(--text-secondary)' : rankColors[s.rank.tier] }}>
              {s.rank.tier === 'unranked' ? 'Unranked' : rankEmoji[s.rank.tier] + ' ' + s.rank.tier.charAt(0).toUpperCase() + s.rank.tier.slice(1)}
            </div>
          </div>
        </button>
        <button onClick={() => setShowFriends(!showFriends)}
          style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid ' + (showFriends ? '#4fc3f7' : 'var(--border)'), background: showFriends ? 'rgba(79,195,247,0.1)' : 'transparent', color: showFriends ? '#4fc3f7' : 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
          👥 Arkadaslar
        </button>
      </div>

      {/* Friends Dropdown */}
      {showFriends && <FriendsPanel s={s} onClose={() => setShowFriends(false)} />}

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: page === 'home' && !s.matchActive ? 0 : 20 }}>
        {page === 'home' && !s.matchActive && <HomeView s={s} onPlay={() => setShowQueue(true)} />}
        {page === 'lobby' && !s.matchActive && <LobbyView s={s} mode={matchMode} preferredLane={preferredLane} onLanePick={pickLane} onStart={(lane: string) => startFromLobby(lane)} onBack={() => setPage('home')} />}
        {page === 'champselect' && !s.matchActive && <ChampSelectView s={s} mode={matchMode} preferredLane={preferredLane} onReady={beginGame} onBack={() => setPage('home')} />}
        {page === 'skinselect' && !s.matchActive && <SkinSelectView championId={skinChampionId} onStart={startFromSkinSelect} onBack={() => setPage('champselect')} />}
        {(page === 'match' || s.matchActive) && <MatchView s={s} onFinish={handleFinishMatch} onBack={() => setPage('home')} />}
        {page === 'postmatch' && <PostMatchView s={s} onBack={() => setPage('home')} onPlayAgain={() => setShowQueue(true)} />}
        {page === 'store' && !s.matchActive && <StoreView s={s} />}
        {page === 'leaderboard' && !s.matchActive && <LeaderboardView s={s} />}
        {page === 'profile' && !s.matchActive && <ProfileView s={s} />}
        {page === 'tournament' && !s.matchActive && <TournamentView s={s} />}
      </div>

      {/* Queue Popup */}
      {showQueue && (
        <div onClick={() => setShowQueue(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0d1025', border: '1px solid #c8a85e', borderRadius: 12, padding: 32, width: 380, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>Kuyruk</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>Bir oyun modu sec</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => startMatch('normal')}
                style={{ padding: '14px 0', borderRadius: 8, border: '1px solid var(--border)', background: '#1a1a2e', color: '#4fc3f7', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                🌿 NORMAL OYUN
              </button>
              <button onClick={() => startMatch('ranked')} disabled={s.level < 20}
                style={{ padding: '14px 0', borderRadius: 8, border: 'none', background: s.level < 20 ? '#2a2a4a' : 'linear-gradient(135deg, #c8a85e, #a8862e)', color: s.level < 20 ? '#666' : '#0a0a1a', fontSize: 14, fontWeight: 700, cursor: s.level < 20 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                ⚔️ DERECELI OYUN {s.level < 20 ? '(Seviye 20 gerekli)' : (s.rank.tier === 'unranked' && s.previousSeasonRank !== 'unranked' ? '(Sezon Yerlesme)' : '')}
              </button>
            </div>
            <button onClick={() => setShowQueue(false)} style={{ marginTop: 14, padding: '8px 24px', borderRadius: 4, border: 'none', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
              Iptal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const friendPool: any[] = [];

function FriendsPanel({ s, onClose }: { s: any; onClose: () => void }) {
  const { friends, inviteToDuo } = useGameStore();
  const allFriends = friends.length > 0 ? [...friends] : [];
  allFriends.sort((a: any, b: any) => {
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    return 0;
  });

  const statusDot = (online: boolean) => {
    const c = online ? '#2ecc71' : '#666';
    return <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, display: 'inline-block', marginRight: 6, flexShrink: 0 }} />;
  };

  return (
    <div style={{ position: 'absolute', top: 56, right: 20, width: 260, maxHeight: 420, background: '#0d1025', border: '1px solid #4fc3f7', borderRadius: 8, overflow: 'hidden', zIndex: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'rgba(79,195,247,0.05)' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#4fc3f7' }}>
          👥 Arkadaslar ({allFriends.length})
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>✕</button>
      </div>
      <div style={{ overflow: 'auto', maxHeight: 370 }}>
        {allFriends.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#666', fontSize: 11 }}>
            Henuz arkadasin yok. Mac sonunda oyunculari ekleyebilirsin.
          </div>
        ) : (
          allFriends.map((f: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'default', transition: 'all 0.1s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, ' + (rankColors[f.rank] || '#666') + ', #1a1a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {f.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#e0e0e0' }}>{f.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: 10 }}>
                  {statusDot(f.isOnline)}
                  <span style={{ color: f.isOnline ? '#2ecc71' : '#666' }}>{f.isOnline ? 'Cevrimici' : 'Cevrimdisi'}</span>
                </div>
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-secondary)', textAlign: 'right' }}>
                <div>Lv.{f.level}</div>
                <div style={{ color: rankColors[f.rank] || '#666' }}>{f.rank.toUpperCase()}</div>
              </div>
              {f.isOnline && (
                <button onClick={() => inviteToDuo(f.name)}
                  style={{
                    padding: '3px 8px', borderRadius: 4, border: '1px solid #c8a85e',
                    background: 'rgba(200,168,94,0.1)', color: '#c8a85e',
                    fontSize: 8, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                  }}>
                  Duo
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const newsPool = [
  { icon: '🏆', title: 'Dunya Sampiyonasi', desc: 'Yaz sezonu sampiyonlari Worlds\'te karsilasiyor! Buyuk final bu hafta sonu.', tag: 'Turnuva', tagColor: '#ff6b6b' },
  { icon: '🔄', title: '14.11 Yama Notlari', desc: 'Yeni sampiyon buff\'lari, item degisiklikleri ve meta analizi.', tag: 'Yama', tagColor: '#4fc3f7' },
  { icon: '🇹🇷', title: 'TCL Ligi', desc: 'Turkiye Sampiyonluk Ligi\'nde playoff heyecani basliyor.', tag: 'Lig', tagColor: '#6bcb77' },
  { icon: '🤝', title: 'Transfer Sezonu', desc: 'Yildiz oyuncular yeni takimlariyla anlasti. Detaylar haberimizde.', tag: 'Transfer', tagColor: '#ffd93d' },
  { icon: '📊', title: 'Meta Raporu', desc: 'Bu ayin en cok oynanan sampiyonlari ve win rate istatistikleri.', tag: 'Meta', tagColor: '#9b59b6' },
  { icon: '🎤', title: 'Roportaj', desc: '"Hedefimiz Worlds\'te ilk 4" - Takim kaptani acidan aciklamalarda bulundu.', tag: 'Roportaj', tagColor: '#e67e22' },
  { icon: '🆕', title: 'Yeni Sampiyon Geliyor', desc: 'Riot Games yeni sampiyonun tanitim fragmanini yayinladi. Topluluk cok heyecanli.', tag: 'Duyuru', tagColor: '#1abc9c' },
  { icon: '🎮', title: 'Ucretsiz Sampiyonlar', desc: 'Bu hafta ucretsiz sampiyon rotasyonu aciklandi.', tag: 'Haftalik', tagColor: '#e74c3c' },
  { icon: '⚔️', title: 'MSI 2026', desc: 'Mid-Season Invitational kapida! En iyi takimlar kozlarini paylasacak.', tag: 'Turnuva', tagColor: '#ff6b6b' },
  { icon: '🔥', title: 'Solo Queue Meta', desc: 'Su ara solo queue\'de en cok banlanan sampiyonlar ve counter stratejiler.', tag: 'Meta', tagColor: '#9b59b6' },
  { icon: '💎', title: 'Yeni Kostum Serisi', desc: 'Riot, yepyeni "Kozmik Savasci" kostum serisini duyurdu.', tag: 'Duyuru', tagColor: '#1abc9c' },
  { icon: '📈', title: 'Lig Puanlari', desc: 'Sezon ortasi siralamalari aciklandi. Lider durumdaki takimlara goz atin.', tag: 'Lig', tagColor: '#6bcb77' },
  { icon: '🎯', title: 'ADC Meta Degisimi', desc: 'Alt koridor ekolojisi tamamen degisti! Hangi nişancılar yukseliste?', tag: 'Meta', tagColor: '#9b59b6' },
  { icon: '🗺️', title: 'Harita Guncellemesi', desc: 'Summoner\'s Rift\'e gelen mevsimsel degisiklikler.', tag: 'Yama', tagColor: '#4fc3f7' },
  { icon: '👑', title: 'Faker Rekoru', desc: 'Efsane oyuncu Faker yeni bir rekor kirdi. Topluluk ayakta!', tag: 'Roportaj', tagColor: '#e67e22' },
  { icon: '🎪', title: 'All-Star Etkinligi', desc: 'Bu yilki All-Star etkinliginde oyuncular icin ozel gorevler.', tag: 'Etkinlik', tagColor: '#f39c12' },
  { icon: '🧪', title: 'Deneysel Mod', desc: 'PBE sunucusunda yeni oyun modu test ediliyor.', tag: 'Duyuru', tagColor: '#1abc9c' },
  { icon: '📚', title: 'Lore Guncellemesi', desc: 'Runeterra evreninde yasanan son gelismeler ve yeni hikayeler.', tag: 'Hikaye', tagColor: '#8e44ad' },
  { icon: '🎁', title: 'Hediyeler Basladi', desc: 'Sezon sonu hediyeleri dagitiliyor! Kacinci seviyedesin?.', tag: 'Etkinlik', tagColor: '#f39c12' },
  { icon: '🛡️', title: 'Yeni Anti-Cheat', desc: 'Riot Vanguard guvenlik sistemi tum bolgelere geldi.', tag: 'Duyuru', tagColor: '#1abc9c' },
  { icon: '🌍', title: 'Dunya Siralamasi', desc: 'Guncel dunya siralamasinda Turk oyuncular ilk 100\'de.', tag: 'Siralama', tagColor: '#ffd93d' },
  { icon: '💬', title: 'Topluluk Anketi', desc: 'Reddit ve Twitter anketlerine gore en sevilen sampiyonlar.', tag: 'Topluluk', tagColor: '#3498db' },
  { icon: '🏟️', title: 'Vadi Gorseli', desc: 'Summoner\'s Rift yepyeni bir arayuz ve ses efektleriyle geliyor.', tag: 'Yama', tagColor: '#4fc3f7' },
  { icon: '⚡', title: 'Flash Degisiyor', desc: 'Yeni yamada Flash spell\'i uzerinde buyuk degisiklikler geliyor.', tag: 'Yama', tagColor: '#4fc3f7' },
  { icon: '👻', title: 'Korkunc Orman', desc: 'Orman meta\'si kokten degisiyor! Hangi ormancilar meta?', tag: 'Meta', tagColor: '#9b59b6' },
  { icon: '🤖', title: 'AI Turnuvasi', desc: 'Yapay zeka destekli ilk LoL turnuvasi duzenleniyor.', tag: 'Etkinlik', tagColor: '#f39c12' },
  { icon: '🧙', title: 'Buyucu Gucu', desc: 'AP itemleri yeniden dengeleniyor! Yeni patch detaylari.', tag: 'Yama', tagColor: '#4fc3f7' },
  { icon: '⏰', title: 'Sezon 15 Geliyor', desc: 'Yeni sezonda neler degisecek? On inceleme notlarimiz yayinda.', tag: 'Sezon', tagColor: '#c8a85e' },
  { icon: '🎬', title: 'Arcane 2. Sezon', desc: 'Netflix\'in fenomen dizisi Arcane\'in 2. sezonu icin fragman yayinlandi.', tag: 'Duyuru', tagColor: '#1abc9c' },
  { icon: '📱', title: 'Wild Rift Guncellemesi', desc: 'Mobil surumde gelen yeni modlar ve sampiyon listesi aciklandi.', tag: 'Duyuru', tagColor: '#1abc9c' },
  { icon: '🎵', title: 'Yeni Muzik Albümü', desc: 'Riot Games Music yeni "Warriors" albumunu Spotify\'da yayinladi.', tag: 'Kultur', tagColor: '#e91e63' },
  { icon: '🏅', title: 'Sezon Odulleri', desc: 'Bu sezon hangi rütbede bitirirsen hangi odulleri alacaksin?', tag: 'Sezon', tagColor: '#c8a85e' },
  { icon: '🕹️', title: 'Yeni Mod: Arena', desc: 'Arena modu kalici olarak oyuna ekleniyor! Tum detaylar iceride.', tag: 'Duyuru', tagColor: '#1abc9c' },
  { icon: '🌙', title: 'Gece Nöbetçileri', desc: 'Riot\'un yeni MMO oyunu hakkinda sizintilar yayildi.', tag: 'Söylenti', tagColor: '#607d8b' },
  { icon: '🔮', title: 'Gelecek Tahminleri', desc: 'Analistlere gore onumuzdeki yamanin en cok etkilenecek sampiyonlari.', tag: 'Analiz', tagColor: '#00bcd4' },
  { icon: '🏠', title: 'Base Yarisi', desc: 'Taraftarlar arasinda en hizli base kosusu yarismasi sosyal medyayi sardi.', tag: 'Topluluk', tagColor: '#3498db' },
];

function HomeView({ s, onPlay }: { s: any; onPlay: () => void }) {
  const news = useMemo(() => [...newsPool].sort(() => Math.random() - 0.5).slice(0, 8), []);
  const seasonNames: Record<string, string> = { winter: 'KIS SEZONU', spring: 'ILKBAHAR SEZONU', summer: 'YAZ SEZONU' };
  const isPlacement = s.rank.tier === 'unranked' && s.previousSeasonRank !== 'unranked';
  const placementInfo = isPlacement ? `(Sezon Yerlesme ${s.seasonPlacementGamesPlayed}/3)` : '';
  const seasonBannerText = seasonNames[s.season] || 'SEZON';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Hero banner */}
      <div style={{ background: 'linear-gradient(135deg, #0d1025 0%, #1a0a2e 50%, #0d1025 100%)', borderBottom: '1px solid rgba(200,168,94,0.15)', padding: '28px 32px', display: 'flex', alignItems: 'center', gap: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 25% 50%, rgba(200,168,94,0.06) 0%, transparent 50%), radial-gradient(ellipse at 75% 50%, rgba(79,195,247,0.04) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 52, filter: 'drop-shadow(0 4px 8px rgba(200,168,94,0.2))', zIndex: 1 }}>🏆</div>
        <div style={{ flex: 1, zIndex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#c8a85e', marginBottom: 4, letterSpacing: 2, textTransform: 'uppercase' }}>{seasonBannerText} Aktif</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: '#fff' }}>Sezon {s.seasonNumber} <span style={{ color: '#888', fontSize: 13, fontWeight: 400 }}>• Gun {s.seasonDay}/30</span></div>
          {isPlacement && (
            <div style={{ fontSize: 11, color: '#ffd93d', fontWeight: 600, marginBottom: 2, padding: '2px 10px', borderRadius: 4, background: 'rgba(255,217,61,0.08)', display: 'inline-block' }}>⚡ Sezon Yerlesmesi: {s.seasonPlacementGamesPlayed}/3 mac</div>
          )}
          <div style={{ fontSize: 11, color: '#888' }}>{s.seasonWins}G - {s.seasonLosses}M | {s.rank.tier === 'unranked' ? (isPlacement ? placementInfo : 'UNRANKED') : s.rank.tier.toUpperCase()} {s.rank.tier !== 'unranked' ? s.rank.lp + 'LP' : ''} {s.rank.division ? '• ' + 'I II III IV'.split(' ')[4 - s.rank.division] : ''}</div>
        </div>
        <button onClick={onPlay}
          style={{ padding: '14px 36px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #c8a85e, #a8862e)', color: '#0a0a1a', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 1, boxShadow: '0 4px 20px rgba(200,168,94,0.25)', transition: 'all 0.2s', zIndex: 1 }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(200,168,94,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(200,168,94,0.25)'; }}>
          ▶ OYNA
        </button>
      </div>

      {/* Daily Quests */}
      {s.dailyQuests.length > 0 && (
        <div style={{ padding: '10px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', gap: 10, overflow: 'auto' }}>
            {s.dailyQuests.map((q: any) => (
              <div key={q.id} style={{
                flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 8,
                background: q.completed ? 'rgba(46,204,113,0.06)' : 'rgba(255,255,255,0.02)',
                border: '1px solid ' + (q.completed ? 'rgba(46,204,113,0.2)' : 'var(--border)'),
                opacity: q.completed ? 0.7 : 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: q.completed ? '#2ecc71' : '#ffd93d' }}>{q.completed ? '✅' : '📋'} {q.description}</span>
                  <span style={{ fontSize: 9, color: 'var(--text-secondary)' }}>{q.reward.xp}XP {q.reward.be > 0 ? '+' + q.reward.be + 'BE' : ''}{q.reward.tl ? ' +' + q.reward.tl + 'TL' : ''}</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.05)' }}>
                  <div style={{ height: '100%', borderRadius: 2, background: q.completed ? '#2ecc71' : '#c8a85e', width: Math.min(100, (q.progress / q.requirement.count) * 100) + '%', transition: 'width 0.5s' }} />
                </div>
                <div style={{ fontSize: 8, color: 'var(--text-secondary)', marginTop: 3 }}>{q.progress}/{q.requirement.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* News Grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 14, color: '#c8a85e' }}>LOLE ILISKIN HABERLER</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10 }}>
          {news.map((n, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: 14, background: '#0d1025', border: '1px solid var(--border)', borderRadius: 8, transition: 'all 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8a85e'; e.currentTarget.style.transform = 'translateX(3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
              <span style={{ fontSize: 26, flexShrink: 0 }}>{n.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 'bold' }}>{n.title}</span>
                  <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 3, background: n.tagColor, color: '#000', fontWeight: 600 }}>{n.tag}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ========== CHAMP SELECT ========== */
function ChampSelectView({ s, mode, preferredLane, onReady, onBack }: { s: any; mode: 'normal' | 'ranked'; preferredLane: string; onReady: (champId: string, spells: string[], rune: string) => void; onBack: () => void }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [bans, setBans] = useState<{ our: string[]; enemy: string[] }>({ our: [], enemy: [] });
  const [banReveal, setBanReveal] = useState(0);
  const [playerBan, setPlayerBan] = useState<string | null>(null);
  const [pickOrder, setPickOrder] = useState<Array<{ team: 'blue' | 'red'; slot: number; name: string; level: number; tier: string; lane: string; champion: string | null; stats: any }>>([]);
  const [playerPickIndex, setPlayerPickIndex] = useState(-1);
  const [turnIndex, setTurnIndex] = useState(-1);
  const [phase, setPhase] = useState<'ban' | 'pick' | 'done'>('ban');
  const [mySpells, setMySpells] = useState<string[]>(['flash', 'ignite']);
  const [myRune, setMyRune] = useState('conqueror');

  const lanes = ['Üst Koridor', 'Orman', 'Orta Koridor', 'Alt Koridor', 'Destek'];
  const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
  const allChampions: any[] = s.champions;
  const unlockedChampions: any[] = s.champions.filter((c: any) => c.unlocked);

  // Mount: generate pick order + player assignment
  useEffect(() => {
    const names = [
      'xXShadowXx', 'ProGamer99', 'YasuoMain', 'DarkPhoenix', 'OneTapKing', 'NightWolfTR', 'ZedGod', 'FuryMaster', 'DiamondSoul', 'BladeStorm',
      'RivenOnly', 'SoloCarry', 'ThreshPrince', 'VayneMain34', 'MidOrFeed', 'IronToChall', 'NoSmurfBTW', 'LastHopeGG', 'EzrealPenta', 'KatarinaGod',
      'RageQuitKing', 'FakerFanboy', 'JungleDiff', 'TopGap', 'ADCin2026', 'SuppGoddess', 'FlashOnD', 'IgniteBot', 'SmiteSteal', 'PentakillDream',
      'DragonSlayer', 'BaronThief', 'TowerDive', 'MinionKing', 'BlueBuff', 'RedBuffSteal', 'WardLord', 'PinkWardPro', 'ControlMage', 'AssassinMain',
      'TankTop', 'BruiserBoy', 'EnchanterE girl', 'HookGod', 'LeeSinMain', 'InsecKick', 'MadlifeHook', 'FakerWhatWasThat', 'Pawned', 'DeftlyDone',
      'AmbitionRise', 'CrownJewel', 'RulerOfBot', 'CoreJJSupport', 'TheShyTop', 'NingJungle', 'RookieMid', 'JackeyLove', 'BaolanSup', 'TianCarry',
      'DoinbMid', 'CrispSup', 'CanyonKing', 'ShowMaker', 'GhostADC', 'BeryLGenius', 'ScoutMid', 'ViperBot', 'MeikoSup', 'KingenTop',
      'PyosikJungle', 'ZekaMid', 'DeftAD', 'KeriaGod', 'ZeusTop', 'OnerJungle', 'FakerGOAT', 'Gumayusi', 'SmurfAccount', 'TiltProof',
      'MentalBoom', 'AFKWarning', 'ReportJungle', 'OpenMid', 'FFat15', 'GGWP', 'L9Member', 'RatIRL', 'PornstarZilean', 'Tyler1Fan',
      'HashinshinTop', 'YassuoMid', 'Trick2g', 'Imaqtpie', 'Shiphtur', 'DyrusTop', 'ScarraMid', 'VoyboyTop', 'HotshotGG', 'ReginaldMid',
      'DoubleliftAD', 'BjergsenMid', 'WildTurtle', 'SneakyADC', 'AphromooSup', 'MeteosJungle', 'HaiMid', 'LemonNation', 'BallsTop', 'Incarnati0n',
      'XmithieKing', 'Pobelter', 'HuniTop', 'Reignover', 'FebivenMid', 'RekklesAD', 'YellowStar', 'sOAZTop', 'AmazingJung', 'Odoamne',
      'JankosKing', 'PerkzMid', 'CapsClaps', 'MikyxGod', 'WunderTop', 'BrokenBlade', 'HansSama', 'CarzzyAD', 'KaiserSup', 'ElyoyaKing',
      'InspiredJg', 'LarssenMid', 'TrymbiSup', 'CompADC', 'AlphariTop', 'NisqyMid', 'ZvenAD', 'MithySup', 'ExpectTop', 'TrickJungle',
      'KobbeAD', 'MikyxGod2', 'Selfmade', 'Nemesis', 'BwipoTop', 'Hylissang', 'UpsetAD', 'RazorkKing', 'HumanoidMid', 'VetheoPro',
      'Nukeduck', 'Cabochard', 'SakenMid', 'EikaGod', 'Targamas', 'FinnTop', 'MarkoonJng', 'NeonADC', 'LimitSup', 'KireiCarry',
      'Zanzarah', 'BlueGod', 'DajorMid', 'JeongHoon', 'Szygenda', 'HaruJung', 'RubyMid', 'BAOadc', 'ExecuteSup', 'DestroyTop',
      'PhoenixRise', 'EagleEye', 'WolfPack', 'ShadowBlade', 'StormBreaker', 'ThunderGod', 'FireMage', 'IceQueen', 'WindWalker', 'EarthShaker',
      'SoulEater', 'DemonHunter', 'AngelSlayer', 'GhostRider', 'VampireLord', 'WerewolfTop', 'DragonBorn', 'PhoenixKing', 'GriffinRise', 'TitanFall',
      'OdysseyGod', 'ValkyrieSup', 'RagnarokJG', 'AsgardKing', 'MidgardWar', 'HelheimDG', 'Jotunheim', 'Muspelheim', 'Niflheim', 'Yggdrasil',
      'KebabMaster', 'DonerKebab', 'LahmacunPro', 'BaklavaKing', 'RakiBalik', 'CayDemle', 'SimitciBaba', 'KofteciYusuf', 'PideDiyari', 'MantiQueen',
    ];
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    const tierPool = ['demir', 'bronz', 'gumus', 'altin', 'platin'];

    const order: any[] = [];
    for (let i = 0; i < 5; i++) {
      [0, 1].forEach(blue => {
        const isBlue = blue === 0;
        order.push({
          team: isBlue ? 'blue' : 'red', slot: i,
          name: shuffled[order.length % shuffled.length],
          level: rand(1, Math.max(3, s.level)),
          lane: lanes[i],
          tier: tierPool[Math.min(tierPool.length - 1, Math.floor(rand(1, s.level) / 5))],
          champion: null,
          stats: { mekanik: rand(10, 90), oyunBilgisi: rand(10, 90), takimUyumu: rand(10, 90), mentalGuc: rand(10, 90) },
        });
      });
    }
    // Shuffle pick order
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    // Assign player to the blue slot whose lane matches preferredLane
    const targetSlot = order.find((o: any) => o.team === 'blue' && o.lane === preferredLane);
    const pIdx = targetSlot ? order.indexOf(targetSlot) : order.findIndex((o: any) => o.team === 'blue');
    order[pIdx] = { ...order[pIdx], name: 'Sen', level: s.level, tier: s.rank.tier, lane: preferredLane };
    setPlayerPickIndex(pIdx);
    setPickOrder(order);
    setTurnIndex(0);
    setPhase('ban');
  }, []);

  // Player bans a champion
  const handleBan = (champId: string) => {
    if (phase !== 'ban') return;
    setPlayerBan(champId);
    // Generate remaining 9 bans (4 more for blue, 5 for red)
    const rest = allChampions.filter((c: any) => c.id !== champId).sort(() => Math.random() - 0.5);
    setBans({
      our: [champId, ...rest.slice(0, 4).map((c: any) => c.id)],
      enemy: rest.slice(4, 9).map((c: any) => c.id),
    });
    setBanReveal(0);
  };

  // Ban reveal animation
  useEffect(() => {
    if (phase !== 'ban') return;
    if (banReveal >= 10) { setPhase('pick'); return; }
    // Don't animate until player has banned
    if (playerBan === null) return;
    const timer = setTimeout(() => setBanReveal(prev => prev + 1), 250 + Math.random() * 150);
    return () => clearTimeout(timer);
  }, [phase, banReveal, playerBan]);

  // Auto-pick for bots
  useEffect(() => {
    if (phase !== 'pick') return;
    if (pickOrder.length === 0) return;
    if (turnIndex >= pickOrder.length) {
      if (pickOrder.every(p => p.champion !== null)) setPhase('done');
      return;
    }
    if (turnIndex === playerPickIndex) return;

    const bannedAll = [...bans.our, ...bans.enemy];
    const picked = pickOrder.filter(p => p.champion).map(p => p.champion);
    const slot = pickOrder[turnIndex];
    const avail = allChampions.filter((c: any) =>
      !bannedAll.includes(c.id) && !picked.includes(c.id) &&
      (c.role === slot.lane || Math.random() < 0.15)
    );
    if (avail.length === 0) return;
    const champ = avail[Math.floor(Math.random() * avail.length)].id;

    const timer = setTimeout(() => {
      setPickOrder(prev => {
        const next = [...prev];
        next[turnIndex] = { ...next[turnIndex], champion: champ };
        return next;
      });
      setTurnIndex(prev => prev + 1);
    }, 500 + Math.random() * 500);
    return () => clearTimeout(timer);
  }, [turnIndex, phase, playerPickIndex, pickOrder, bans, allChampions]);

  // Player picks champion
  const handlePick = (champId: string) => {
    if (turnIndex !== playerPickIndex) return;
    setPickOrder(prev => {
      const next = [...prev];
      next[playerPickIndex] = { ...next[playerPickIndex], champion: champId };
      return next;
    });
    setTurnIndex(prev => prev + 1);
  };

  // Derived state
  const mySlot = playerPickIndex >= 0 ? pickOrder[playerPickIndex] : null;
  const myPick = mySlot?.champion || null;
  const myChampion = myPick ? s.champions.find((c: any) => c.id === myPick) : null;
  const isPlayerTurn = turnIndex === playerPickIndex && phase === 'pick';
  const currentPicker = turnIndex >= 0 && turnIndex < pickOrder.length ? pickOrder[turnIndex] : null;
  const ourTeam = pickOrder.filter(p => p.team === 'blue');
  const enemyTeam = pickOrder.filter(p => p.team === 'red');

  // Available for picking (during pick phase)
  const availablePicks = allChampions.filter((c: any) => {
    const bannedAll = [...bans.our, ...bans.enemy];
    const pickedAll = pickOrder.filter(p => p.champion).map(p => p.champion);
    return c.unlocked && !bannedAll.includes(c.id) && !pickedAll.includes(c.id) &&
      (!roleFilter || c.role === roleFilter) &&
      (search ? c.name.toLowerCase().includes(search.toLowerCase()) : true);
  });

  // Available for banning (during ban phase)
  const availableBans = allChampions.filter((c: any) =>
    c.unlocked && c.id !== playerBan &&
    (!roleFilter || c.role === roleFilter) &&
    (search ? c.name.toLowerCase().includes(search.toLowerCase()) : true)
  );

  // Auto proceed
  useEffect(() => {
    if (phase === 'done') {
      const timer = setTimeout(() => onReady(myPick || '', mySpells, myRune), 400);
      return () => clearTimeout(timer);
    }
  }, [phase, onReady, myPick, mySpells, myRune]);

  const PlayerSlot = ({ p, isMe, isEnemy }: { p: any; isMe?: boolean; isEnemy?: boolean }) => {
    const champ = p.champion ? s.champions.find((c: any) => c.id === p.champion) : null;
    const avgStat = Math.round((p.stats.mekanik + p.stats.oyunBilgisi + p.stats.takimUyumu + p.stats.mentalGuc) / 4);
    const slotBg = isMe ? 'rgba(200,168,94,0.1)' : isEnemy ? 'rgba(244,67,54,0.05)' : 'rgba(255,255,255,0.02)';
    const slotBorder = isMe ? 'rgba(200,168,94,0.3)' : 'transparent';
    const imgBorder = champ ? (isMe ? '#c8a85e' : isEnemy ? '#f44336' : '#4fc3f7') : 'var(--border)';
    return (
      <div style={{
        display: 'flex', flexDirection: isEnemy ? 'row-reverse' : 'row', alignItems: 'center', gap: 10,
        width: '100%', padding: '8px 10px', borderRadius: 6, background: slotBg, border: '1px solid ' + slotBorder,
        position: 'relative', minHeight: 48,
      }}>
        <div style={{ width: 42, height: 42, borderRadius: 6, overflow: 'hidden', border: '2px solid ' + imgBorder, background: '#0a0a1a', flexShrink: 0 }}>
          {champ && <img src={DD + '/' + champ.id + '.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div style={{ textAlign: isEnemy ? 'right' : 'left', flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: isMe ? 700 : 500, color: isMe ? '#c8a85e' : isEnemy ? '#ff8a80' : '#e0e0e0' }}>{p.name}</div>
          <div style={{ fontSize: 9, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: isEnemy ? '#ff8a80' : '#4fc3f7', fontWeight: 600 }}>{p.lane}</span>
            <span>{champ ? champ.name : 'Secilmedi'}</span>
          </div>
        </div>
        {!isMe && (
          <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 30 }}>
            <div style={{ fontSize: 10, fontWeight: 'bold', color: isEnemy ? '#ff8a80' : '#4fc3f7' }}>{avgStat}</div>
            <div style={{ fontSize: 7, color: 'var(--text-secondary)' }}>ORT</div>
        </div>
      )}
    </div>
  );
}

  const pickNum = (p: any) => pickOrder.indexOf(p) + 1;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #060c1a 0%, #0d1025 50%, #0a0e1f 100%)' }}>
      {/* TOP BAR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 24px', borderBottom: '1px solid rgba(200,168,94,0.15)', background: 'rgba(0,0,0,0.4)' }}>
        <button onClick={onBack} style={{ padding: '5px 12px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#888', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>← Geri</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: mode === 'ranked' ? '#c8a85e' : '#4fc3f7', background: mode === 'ranked' ? 'rgba(200,168,94,0.1)' : 'rgba(79,195,247,0.1)', padding: '3px 10px', borderRadius: 3 }}>{mode === 'ranked' ? 'DERECELI' : 'NORMAL'}</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#e0e0e0' }}>
            {phase === 'ban' ? 'YASAKLAMA ASAMASI' : phase === 'done' ? 'SECIM TAMAMLANDI' : 'SAMPIYON SECIMI'}
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 10, color: isPlayerTurn ? '#ffd93d' : phase === 'ban' && playerBan === null ? '#f44336' : 'var(--text-secondary)', fontWeight: 600 }}>
          {phase === 'done' ? '✓ Hazir'
            : phase === 'ban' && playerBan === null ? '⚠ Bir sampiyon yasakla'
            : phase === 'ban' ? `Yasaklaniyor ${banReveal}/10`
            : isPlayerTurn ? '🔔 SENIN SIRAN!'
            : currentPicker ? `${currentPicker.name} seciyor...`
            : ''}
        </div>
      </div>

      {/* === BAN AREA === */}
      {bans.our.length > 0 && (
        <div style={{ display: 'flex', gap: 0, justifyContent: 'center', padding: '10px 24px', background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          {/* Blue bans */}
          {[0, 1, 2, 3, 4].map(i => {
            const id = bans.our[i];
            const c = id ? s.champions.find((ch: any) => ch.id === id) : null;
            return (
              <div key={'bo' + i} style={{ width: 44, height: 44, margin: '0 2px', borderRadius: 4, overflow: 'hidden', background: '#0a0a1a', border: '1px solid rgba(244,67,54,0.3)', position: 'relative', opacity: i < banReveal ? 1 : 0.25 }}>
                {c && <img src={DD + '/' + c.id + '.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: i < banReveal ? 'grayscale(0.8) brightness(0.5)' : 'none' }} />}
                {i < banReveal && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f44336', fontSize: 20, fontWeight: 900, textShadow: '0 0 8px rgba(0,0,0,0.8)' }}>✕</div>}
              </div>
            );
          })}
          <div style={{ width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#555', fontWeight: 700 }}>VS</div>
          {/* Red bans */}
          {[0, 1, 2, 3, 4].map(i => {
            const id = bans.enemy[i];
            const c = id ? s.champions.find((ch: any) => ch.id === id) : null;
            return (
              <div key={'br' + i} style={{ width: 44, height: 44, margin: '0 2px', borderRadius: 4, overflow: 'hidden', background: '#0a0a1a', border: '1px solid rgba(79,195,247,0.3)', position: 'relative', opacity: i + 5 < banReveal ? 1 : 0.25 }}>
                {c && <img src={DD + '/' + c.id + '.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: i + 5 < banReveal ? 'grayscale(0.8) brightness(0.5)' : 'none' }} />}
                {i + 5 < banReveal && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4fc3f7', fontSize: 20, fontWeight: 900, textShadow: '0 0 8px rgba(0,0,0,0.8)' }}>✕</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* === TEAMS AREA === */}
      <div style={{ flex: 1, display: 'flex', gap: 0, overflow: 'auto', minHeight: 0 }}>
        {/* Blue Team */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, padding: '12px 16px', background: 'linear-gradient(90deg, rgba(79,195,247,0.03) 0%, transparent 100%)' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#4fc3f7', textAlign: 'center', marginBottom: 4, letterSpacing: 2 }}>MAVI TAKIM</div>
          {ourTeam.map((p, i) => (
            <div key={p.slot + '-' + i} style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
              <div style={{ width: 20, textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: pickNum(p) <= 10 ? (pickNum(p) <= turnIndex + 1 ? '#4fc3f7' : '#555') : '#555' }}>P{pickNum(p)}</div>
              </div>
              <div style={{ flex: 1 }}><PlayerSlot p={p} isMe={p.name === 'Sen'} /></div>
              {pickNum(p) === turnIndex + 1 && phase === 'pick' && (
                <div style={{ position: 'absolute', right: -6, top: -4, width: 8, height: 8, borderRadius: '50%', background: '#ffd93d', boxShadow: '0 0 8px #ffd93d' }} />
              )}
            </div>
          ))}
        </div>

        {/* Center */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 56, flexShrink: 0, gap: 8 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(200,168,94,0.08)', border: '2px solid rgba(200,168,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#c8a85e' }}>VS</span>
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-secondary)', textAlign: 'center' }}>
            {phase === 'ban' ? 'BAN' : phase === 'done' ? 'HAZIR' : pickOrder.length > 0 ? `${turnIndex + 1}/${pickOrder.length}` : ''}
          </div>
        </div>

        {/* Red Team */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, padding: '12px 16px', background: 'linear-gradient(270deg, rgba(244,67,54,0.03) 0%, transparent 100%)' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#f44336', textAlign: 'center', marginBottom: 4, letterSpacing: 2 }}>KIRMIZI TAKIM</div>
          {enemyTeam.map((p, i) => (
            <div key={'e' + p.slot + '-' + i} style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'row-reverse', position: 'relative' }}>
              <div style={{ width: 20, textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: pickNum(p) <= 10 ? (pickNum(p) <= turnIndex + 1 ? '#f44336' : '#555') : '#555' }}>P{pickNum(p)}</div>
              </div>
              <div style={{ flex: 1 }}><PlayerSlot p={p} isEnemy /></div>
              {pickNum(p) === turnIndex + 1 && phase === 'pick' && (
                <div style={{ position: 'absolute', left: -6, top: -4, width: 8, height: 8, borderRadius: '50%', background: '#ffd93d', boxShadow: '0 0 8px #ffd93d' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* === SPELLS + RUNES === */}
      <div style={{ padding: '6px 24px', borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.3)', fontSize: 10 }}>
        {/* Summoner Spells */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ color: '#4fc3f7', fontWeight: 700, fontSize: 9, minWidth: 50 }}>BUYULER</span>
          {summonerSpells.map((sp: any) => {
            const sel = mySpells.includes(sp.id);
            return (
              <div key={sp.id} onClick={() => { if (sel) setMySpells(mySpells.filter(s => s !== sp.id)); else if (mySpells.length < 2) setMySpells([...mySpells, sp.id]); }}
                title={sp.name + ': ' + sp.description}
                style={{ padding: '2px', borderRadius: 5, border: '2px solid ' + (sel ? '#4fc3f7' : 'rgba(255,255,255,0.08)'), background: sel ? 'rgba(79,195,247,0.15)' : 'transparent', cursor: 'pointer', position: 'relative', width: 32, height: 32, overflow: 'hidden' }}>
                <img src={spellUrl(sp)} alt={sp.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 3 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                {sel && <span style={{ position: 'absolute', bottom: -2, right: -2, background: '#4fc3f7', color: '#000', borderRadius: '50%', width: 12, height: 12, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>✓</span>}
              </div>
            );
          })}
        </div>
        {/* Runes */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
          <span style={{ color: '#c8a85e', fontWeight: 700, fontSize: 9, minWidth: 50 }}>RUN</span>
          {runePages.map((rp: any) => {
            const sel = myRune === rp.id;
            const playerChamp = mySlot?.champion || '';
            const synergy = getRuneSynergy(playerChamp, rp.id);
            const isRec = synergy > 0;
            const isAnti = synergy < 0;
            return (
              <div key={rp.id} onClick={() => setMyRune(rp.id)} title={rp.name + ': ' + rp.description + (isRec ? ' (Onerilen ✓)' : isAnti ? ' (Onerilmez ✗)' : '')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '3px 7px 3px 3px', borderRadius: 5, cursor: 'pointer',
                  border: '2px solid ' + (sel ? rp.color : isRec ? '#2ecc71' : isAnti ? '#f44336' : 'rgba(255,255,255,0.08)'),
                  background: sel ? (rp.color + '22') : (isRec ? 'rgba(46,204,113,0.08)' : 'transparent'),
                  fontWeight: sel ? 700 : 400, fontSize: 10, position: 'relative',
                }}>
                <div style={{ width: 24, height: 24, borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
                  <img src={runeUrl(rp)} alt={rp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <span style={{ color: sel ? rp.color : '#666' }}>{rp.name}</span>
                {isRec && <span style={{ fontSize: 8, color: '#2ecc71', fontWeight: 700 }}>✓</span>}
                {isAnti && <span style={{ fontSize: 8, color: '#f44336', fontWeight: 700 }}>✗</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* === BOTTOM PANEL === */}
      <div style={{ borderTop: '1px solid rgba(200,168,94,0.1)', background: 'rgba(0,0,0,0.5)' }}>
        {/* Filters */}
        <div style={{ padding: '8px 24px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#c8a85e', whiteSpace: 'nowrap' }}>
            {phase === 'ban' && playerBan === null ? '🚫 YASAKLA' : '✅ SEC'}
          </span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Sampiyon ara..."
            style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', background: '#0a0c15', color: '#e0e0e0', fontSize: 11, fontFamily: 'inherit', width: 160, outline: 'none' }} />
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 3 }}>
            {['Üst Koridor', 'Orman', 'Orta Koridor', 'Alt Koridor', 'Destek'].map(r => (
              <button key={r} onClick={() => setRoleFilter(roleFilter === r ? '' : r)}
                style={{ padding: '3px 8px', borderRadius: 3, border: '1px solid ' + (roleFilter === r ? '#c8a85e' : 'rgba(255,255,255,0.06)'), background: roleFilter === r ? 'rgba(200,168,94,0.12)' : 'transparent', color: roleFilter === r ? '#c8a85e' : '#777', fontSize: 9, cursor: 'pointer', fontFamily: 'inherit', fontWeight: roleFilter === r ? 700 : 400 }}>
                {r === 'Üst Koridor' ? '🏰' : r === 'Orman' ? '🌲' : r === 'Orta Koridor' ? '⚡' : r === 'Alt Koridor' ? '🎯' : '🛡️'}
              </button>
            ))}
          </div>
        </div>

        {/* Champion Grid */}
        <div style={{ height: 152, overflow: 'auto', padding: '8px 24px' }}>
          {phase === 'ban' && playerBan === null ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 52px)', gap: 4, justifyContent: 'center' }}>
              {availableBans.map((c: any) => (
                <div key={c.id} onClick={() => handleBan(c.id)}
                  style={{ position: 'relative', cursor: 'pointer', textAlign: 'center' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ width: 48, height: 48, margin: '0 auto', borderRadius: 4, overflow: 'hidden', border: '2px solid rgba(244,67,54,0.3)', background: '#0a0a1a', transition: 'all 0.15s' }}>
                    <img src={DD + '/' + c.id + '.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ fontSize: 8, color: '#888', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                </div>
              ))}
            </div>
          ) : isPlayerTurn ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 52px)', gap: 4, justifyContent: 'center' }}>
              {availablePicks.map((c: any) => (
                <div key={c.id} onClick={() => handlePick(c.id)}
                  style={{ position: 'relative', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ width: 48, height: 48, margin: '0 auto', borderRadius: 4, overflow: 'hidden', border: '2px solid rgba(200,168,94,0.3)', background: '#0a0a1a' }}>
                    <img src={DD + '/' + c.id + '.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ fontSize: 8, color: '#aaa', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: 12 }}>
              {phase === 'done' ? '🎮 Tum secimler tamamlandi, mac basliyor...'
                : phase === 'ban' ? `⏳ Yasaklamalar yapiliyor... (${banReveal}/10)`
                : currentPicker ? `⏳ ${currentPicker.name} sampiyon seciyor...`
                : ''}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 24px', borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.3)' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          {myChampion && (
            <>
              <img src={DD + '/' + myChampion.id + '.png'} alt="" style={{ width: 28, height: 28, borderRadius: 4, border: '2px solid #c8a85e' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#e0e0e0' }}>{myChampion.name}</span>
              <span style={{ fontSize: 9, color: '#888' }}>{preferredLane}</span>
            </>
          )}
        </div>
        <div style={{ fontSize: 9, color: '#555' }}>
          {phase === 'ban' && playerBan === null ? 'Yasak secilmedi'
            : phase === 'ban' ? `Yasak ${banReveal}/10`
            : `Pick ${Math.min(turnIndex + 1, pickOrder.length)}/${pickOrder.length}`}
        </div>
      </div>
    </div>
  );
}

/* ========== SHOP PANEL ========== */
function ShopPanel({ s, gold, items, onClose }: { s: any; gold: number; items: string[]; onClose: () => void }) {
  const [shopTab, setShopTab] = useState<string>(s.matchShopTab || 'Recommended');
  const allItems = getAllShopItems(items.includes('boots'));

  const recs = getRecommendedItems(s.matchShopLane || 'Orta Koridor');
  const recommended = [...matchComponents.filter(c => recs.includes(c.id)), ...matchCompletedItems.filter(c => recs.includes(c.id))];

  const tabs: { key: string; label: string; emoji: string }[] = [
    { key: 'Recommended', label: 'Onerilen', emoji: '⭐' },
    { key: 'AD', label: 'Saldiri', emoji: '⚔️' },
    { key: 'AP', label: 'Buyu', emoji: '🪄' },
    { key: 'Tank', label: 'Savunma', emoji: '🛡️' },
    { key: 'Support', label: 'Destek', emoji: '🤝' },
    { key: 'Boots', label: 'Botlar', emoji: '👢' },
    { key: 'Utility', label: 'Yardimci', emoji: '🧪' },
  ];

  const displayItems = shopTab === 'Recommended' ? recommended
    : shopTab === 'Boots' ? allItems.filter((i: any) => i.category === 'Boots')
    : allItems.filter((i: any) => i.category === shopTab);

  const handleBuy = (itemId: string) => {
    s.buyMatchItem(itemId);
    s.tryCombineItems();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid rgba(255,153,0,0.2)', background: 'rgba(255,153,0,0.06)' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#f90' }}>🛒 Esya Dukkani</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#ffd93d' }}>🪙 {gold}</span>
          <span style={{ fontSize: 10, color: '#888' }}>{items.length}/6 slot</span>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#888', borderRadius: 4, padding: '3px 10px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>✕ Kapat</button>
        </div>
      </div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, padding: '6px 10px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setShopTab(t.key)}
            style={{ padding: '4px 10px', borderRadius: 4, border: 'none', background: shopTab === t.key ? 'rgba(255,153,0,0.2)' : 'transparent', color: shopTab === t.key ? '#f90' : '#888', fontSize: 10, fontWeight: shopTab === t.key ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>
      {/* Items Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 6, padding: 10, maxHeight: 250, overflow: 'auto' }}>
        {displayItems.map((mi: any) => {
          const owned = items.includes(mi.id);
          const hasAllComps = mi.components ? mi.components.every((c: string) => items.includes(c)) : false;
          const canBuy = mi.components
            ? hasAllComps && gold >= mi.cost && !owned
            : gold >= mi.cost && !owned && items.length < 6;
          return (
            <div key={mi.id} onClick={() => canBuy && handleBuy(mi.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6,
                background: owned ? 'rgba(46,204,113,0.06)' : hasAllComps && mi.components ? 'rgba(255,153,0,0.06)' : 'rgba(255,255,255,0.01)',
                border: '1px solid ' + (owned ? 'rgba(46,204,113,0.2)' : hasAllComps && mi.components ? 'rgba(255,153,0,0.2)' : 'rgba(255,255,255,0.04)'),
                opacity: canBuy ? 1 : 0.4, cursor: canBuy ? 'pointer' : 'default', fontSize: 10,
              }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{mi.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: '#e0e0e0', fontSize: 10 }}>{mi.name}</div>
                {mi.components ? (
                  <div style={{ color: '#888', fontSize: 8 }}>
                    {mi.components.map((c: string, i: number) => {
                      const comp = matchComponents.find(x => x.id === c);
                      return <span key={c} style={{ color: items.includes(c) ? '#2ecc71' : '#f90' }}>{comp?.emoji || c}{i < mi.components.length - 1 ? ' + ' : ''}</span>;
                    })}
                  </div>
                ) : (
                  <div style={{ color: '#888' }}>{mi.description}</div>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, color: canBuy ? '#ffd93d' : '#666' }}>{mi.cost}💰</div>
                {owned && <span style={{ color: '#2ecc71', fontWeight: 700, fontSize: 9 }}>✓</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ========== MATCH VIEW ========== */
function SkinSelectView({ championId, onStart, onBack }: { championId: string; onStart: () => void; onBack: () => void }) {
  const { champions, ownedSkins } = useGameStore();
  const champion = champions.find((c: any) => c.id === championId);
  const [countdown, setCountdown] = useState(10);
  const [selectedSkin, setSelectedSkin] = useState<string | null>(null);

  const allSkins = getSkinsForChampion(championId);
  const ownedSkinNums = ownedSkins[championId] || [];
  const skins = allSkins.filter(s => s.num === 0 || ownedSkinNums.includes(s.num));

  const handleStart = () => {
    onStart();
  };

  useEffect(() => {
    if (countdown <= 0) { handleStart(); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const selectedSkinData = selectedSkin ? skins.find(s => s.name === selectedSkin) : null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 10px', textAlign: 'center' }}>
      {/* Countdown */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: countdown <= 3 ? '#f44336' : '#c8a85e', transition: 'color 0.5s', lineHeight: 1 }}>
          {countdown}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Mac baslamadan once kostum sec</div>
      </div>

      {/* Skin Preview - Large */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          width: 260, height: 380, borderRadius: 12, overflow: 'hidden',
          border: '3px solid ' + (selectedSkinData ? '#c8a85e' : 'var(--border)'),
          margin: '0 auto', background: '#0a0a1a',
          position: 'relative',
        }}>
          {selectedSkinData ? (
            <img
              src={getSkinImageUrl(championId, selectedSkinData.num)}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 16, color: '#666' }}>Kostum secmek icin<br/>asagidan bir kostume tikla</div>
            </div>
          )}
          {selectedSkinData && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 14px',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
              textAlign: 'left',
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#c8a85e' }}>{selectedSkinData.name}</div>
            </div>
          )}
        </div>
        <div style={{ marginTop: 8, fontSize: 16, fontWeight: 800, color: '#e0e0e0' }}>
          {champion?.name}
        </div>
      </div>

      {/* Skin Options */}
      {skins.length <= 1 ? (
        <div style={{ marginBottom: 24, padding: '16px', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(200,168,94,0.05)', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#c8a85e', marginBottom: 6 }}>Bu sampiyonun sadece klasik kostumu var.</div>
          <div style={{ fontSize: 10, color: '#888' }}>Magazadan yeni kostumler satin alabilirsin.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(skins.length, 6)}, 1fr)`, gap: 8, marginBottom: 20 }}>
          {skins.map(skin => (
          <button key={skin.num} onClick={() => setSelectedSkin(skin.name)}
            style={{
              borderRadius: 10, border: '2px solid ' + (selectedSkin === skin.name ? '#c8a85e' : 'var(--border)'),
              background: selectedSkin === skin.name ? 'rgba(200,168,94,0.15)' : '#0d1025',
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
              padding: 0, overflow: 'hidden', transition: 'all 0.15s',
              transform: selectedSkin === skin.name ? 'translateY(-3px)' : 'none',
              boxShadow: selectedSkin === skin.name ? '0 6px 20px rgba(200,168,94,0.3)' : 'none',
            }}
            onMouseEnter={e => { if (selectedSkin !== skin.name) e.currentTarget.style.borderColor = '#c8a85e'; }}
            onMouseLeave={e => { if (selectedSkin !== skin.name) e.currentTarget.style.borderColor = 'var(--border)'; }}>
            <div style={{
              width: '100%', aspectRatio: '0.7', overflow: 'hidden',
              background: '#0a0a1a',
            }}>
              <img
                src={getSkinImageUrl(championId, skin.num)}
                alt={skin.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => {
                  (e.target as HTMLImageElement).src = DD + '/' + championId + '.png';
                }}
              />
            </div>
            <div style={{ padding: '6px 4px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: selectedSkin === skin.name ? '#c8a85e' : '#e0e0e0' }}>{skin.name}</div>
            </div>
          </button>
        ))}
      </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack}
          style={{ flex: 1, padding: '14px 0', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Geri
        </button>
        <button onClick={handleStart}
          style={{ flex: 2, padding: '14px 0', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #c8a85e, #a8862e)', color: '#0a0a1a', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 1 }}>
          ⚡ MACA BASLA ({countdown > 0 ? countdown + 's' : 'Simdi!'})
        </button>
      </div>
    </div>
  );
}

function MatchMinimap({ laneChamps, events, currentStep }: { laneChamps: any[]; events: any[]; currentStep: number }) {
  const DD = 'https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion';
  const processedEvents = events.slice(0, currentStep + 1);
  
  // Track player deaths from events
  const totalPlayerDeaths = processedEvents.reduce((sum, ev) => sum + (ev.kdaEffect?.deaths || 0), 0);
  let botDeathPool = 0;
  processedEvents.forEach(ev => {
    if (ev.type === 'negative' || (ev.kdaEffect && ev.kdaEffect.deaths > 0)) botDeathPool += 1;
  });

  const laneChampsWithStatus = laneChamps.map((ch: any) => {
    const isPlayer = ch.name === (laneChamps[0]?.name);
    const deaths = isPlayer ? totalPlayerDeaths : (botDeathPool > 0 ? Math.floor(Math.random() * Math.min(2, botDeathPool + 1)) : 0);
    return { ...ch, alive: deaths === 0, isPlayer };
  });

  const getChamp = (lane: string, team: 'blue' | 'red') => {
    return laneChampsWithStatus.find((c: any) => c.lane === lane && c.team === team);
  };

  // Position map for the actual Summoner's Rift layout
  // Blue = bottom-left, Red = top-right
  const lanePos: { lane: string; blueTop: string; blueLeft: string; redTop: string; redLeft: string }[] = [
    { lane: 'top',    blueTop: '20%', blueLeft: '30%', redTop: '16%', redLeft: '62%' },
    { lane: 'jungle', blueTop: '38%', blueLeft: '42%', redTop: '32%', redLeft: '56%' },
    { lane: 'mid',    blueTop: '50%', blueLeft: '38%', redTop: '44%', redLeft: '58%' },
    { lane: 'bot',    blueTop: '66%', blueLeft: '40%', redTop: '60%', redLeft: '56%' },
    { lane: 'support',blueTop: '70%', blueLeft: '46%', redTop: '56%', redLeft: '52%' },
  ];

  const deadBlue: any[] = [];
  const deadRed: any[] = [];
  laneChampsWithStatus.filter(c => !c.alive).forEach(c => {
    if (c.team === 'blue') deadBlue.push(c);
    else deadRed.push(c);
  });

  return (
    <div style={{
      width: '100%', height: 300, borderRadius: 12, overflow: 'hidden',
      position: 'relative', marginBottom: 8, border: '2px solid #1a3a1a',
      background: '#061006',
    }}>
      {/* Summoner's Rift background image */}
      <img src="/sihirdar-vadisi.webp" alt=""
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          position: 'absolute', inset: 0,
        }}
      />

      {/* Champion Icons on lanes */}
      {lanePos.map(lp => {
        const blue = getChamp(lp.lane, 'blue');
        const red = getChamp(lp.lane, 'red');
        return (
          <div key={lp.lane}>
            {blue && blue.alive && (
              <div style={{
                position: 'absolute', top: lp.blueTop, left: lp.blueLeft, transform: 'translate(-50%,-50%)',
                width: 28, height: 28, borderRadius: '50%', border: '2px solid ' + (blue.isPlayer ? '#c8a85e' : '#4fc3f7'),
                overflow: 'hidden', background: '#0d0d1a', transition: 'all 0.3s',
                boxShadow: blue.isPlayer ? '0 0 8px rgba(200,168,94,0.5)' : '0 0 4px rgba(79,195,247,0.3)',
                zIndex: 10,
              }}>
                <img src={`${DD}/${blue.championId}.png`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            {red && red.alive && (
              <div style={{
                position: 'absolute', top: lp.redTop, left: lp.redLeft, transform: 'translate(-50%,-50%)',
                width: 28, height: 28, borderRadius: '50%', border: '2px solid #f44336',
                overflow: 'hidden', background: '#0d0d1a', transition: 'all 0.3s',
                boxShadow: '0 0 4px rgba(244,67,54,0.3)',
                zIndex: 10,
              }}>
                <img src={`${DD}/${red.championId}.png`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>
        );
      })}

      {/* Dead champions at their base */}
      {deadBlue.length > 0 && (
        <div style={{
          position: 'absolute', bottom: '6%', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 2, zIndex: 5,
        }}>
          {deadBlue.map((ch: any, i: number) => (
            <div key={`db_${i}`} style={{
              width: 20, height: 20, borderRadius: '50%', border: '1px solid #662222',
              opacity: 0.4, overflow: 'hidden', background: '#0d0d1a',
            }}>
              <img src={`${DD}/${ch.championId}.png`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)' }} />
            </div>
          ))}
        </div>
      )}
      {deadRed.length > 0 && (
        <div style={{
          position: 'absolute', top: '3%', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 2, zIndex: 5,
        }}>
          {deadRed.map((ch: any, i: number) => (
            <div key={`dr_${i}`} style={{
              width: 20, height: 20, borderRadius: '50%', border: '1px solid #662222',
              opacity: 0.4, overflow: 'hidden', background: '#0d0d1a',
            }}>
              <img src={`${DD}/${ch.championId}.png`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MatchView({ s, onFinish, onBack }: { s: any; onFinish: () => void; onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [showShop, setShowShop] = useState(false);

  const ev = s.matchEvents;
  const isDone = ev.length > 0 && step >= ev.length;
  const current = ev[step];
  const kda = s.matchKDA;
  const gold = s.matchGold || 500;
  const items = s.matchItems || [];
  const spells = s.matchSpells || ['flash', 'ignite'];
  const runePage = s.matchRunePage || 'conqueror';
  const seasonMod = s.seasonModifier || { name: '', eventDescription: '' };
  const stats = s.matchStats || { cs: 0, visionScore: 0, damageDealt: 0, damageTaken: 0, objectives: [] };

  const rune = runePages.find((r: any) => r.id === runePage);
  const spell1 = summonerSpells.find((sp: any) => sp.id === spells[0]);
  const spell2 = summonerSpells.find((sp: any) => sp.id === spells[1]);

  // Auto-advance non-interactive events
  useEffect(() => {
    if (!s.matchActive || !current) return;
    if (current.type === 'interactive') return;
    if (current.type === 'baseReturn') {
      if (!showShop) setShowShop(true);
      return;
    }
    const isFiller = current.type === 'filler';
    const delay = isFiller ? 200 + Math.random() * 150 : 1000 + Math.random() * 500;
    const timer = setTimeout(() => {
      if (current.kdaEffect && (current.kdaEffect.kills || current.kdaEffect.deaths || current.kdaEffect.assists)) {
        s.updateMatchKDA(current.kdaEffect);
      }
      if (current.goldEffect && current.goldEffect > 0) {
        s.addMatchGold(current.goldEffect);
      }
      setStep(prev => prev + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [s.matchActive, step, ev, current, s, showShop]);

  if (ev.length === 0) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
        <div style={{ background: '#0d1025', border: '1px solid var(--border)', borderRadius: 8, padding: 16, textAlign: 'center' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Mac yukleniyor...</div>
        </div>
      </div>
    );
  }

  const shown = ev.slice(0, Math.min(step + 1, ev.length));
  const isObjective = (e: any) => e.text.includes('Baron') || e.text.includes('Ejder') || e.text.includes('elder');

  return (
    <div style={{ maxWidth: 750, margin: '0 auto', padding: 20 }}>
      <div style={{ background: '#0d1025', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ color: '#ff6b6b', fontWeight: 'bold', fontSize: 14 }}>CANLI MAC</span>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f44336' }} />
          <div style={{ flex: 1 }} />
          {seasonMod.name && <span style={{ fontSize: 9, color: '#f39c12', fontWeight: 600 }}>{seasonMod.name}</span>}
          <span style={{ fontSize: 10, color: 'var(--text-secondary)', marginLeft: 8 }}>{Math.min(step + 1, ev.length)}/{ev.length}</span>
          <button className="btn btn-sm" onClick={onBack}>Ana Menu</button>
        </div>

        {/* Minimap */}
        <MatchMinimap laneChamps={s.matchLaneChampions || []} events={ev} currentStep={step} />

        {/* Match Status Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, padding: '6px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: 6, fontSize: 10, flexWrap: 'wrap' }}>
          {/* Spells */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {spell1 && <span title={spell1.description} style={{ padding: '1px', borderRadius: 3, background: 'rgba(79,195,247,0.1)', width: 22, height: 22, display: 'inline-block', overflow: 'hidden' }}><img src={spellUrl(spell1)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></span>}
              {spell2 && <span title={spell2.description} style={{ padding: '1px', borderRadius: 3, background: 'rgba(79,195,247,0.1)', width: 22, height: 22, display: 'inline-block', overflow: 'hidden' }}><img src={spellUrl(spell2)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></span>}
          </div>
          {/* Rune */}
          {rune && <span title={rune.description} style={{ padding: '2px 6px', borderRadius: 3, background: rune.color + '22', color: rune.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 16, height: 16, borderRadius: 2, overflow: 'hidden', display: 'inline-block' }}><img src={runeUrl(rune)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></span>
            {rune.name}</span>}
          {/* KDA */}
          <span style={{ color: '#4fc3f7', fontWeight: 700 }}>{kda.kills}</span>
          <span style={{ color: '#666' }}>/</span>
          <span style={{ color: '#f44336', fontWeight: 700 }}>{kda.deaths}</span>
          <span style={{ color: '#666' }}>/</span>
          <span style={{ color: '#c8a85e', fontWeight: 700 }}>{kda.assists}</span>
          {/* Gold */}
          <span style={{ marginLeft: 'auto', color: '#ffd93d', fontWeight: 700 }}>🪙 {gold}</span>
          {/* Shop */}
          <button onClick={() => setShowShop(!showShop)}
            style={{ padding: '3px 10px', borderRadius: 4, border: '1px solid ' + (showShop ? '#ffd93d' : gold >= 800 ? '#f39c12' : 'var(--border)'), background: showShop ? 'rgba(255,217,61,0.1)' : gold >= 800 ? 'rgba(243,156,18,0.1)' : 'transparent', color: showShop ? '#ffd93d' : gold >= 800 ? '#f39c12' : 'var(--text-secondary)', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', animation: gold >= 800 && !showShop ? 'none' : 'none' }}>
            🛒 Dukkan {gold >= 800 && !showShop && '🔔'}
          </button>
        </div>

        {/* Item Shop Popup - Full LoL Style */}
        {showShop && (
          <div style={{ marginBottom: 8, border: '2px solid #f90', borderRadius: 10, background: 'rgba(8,10,20,0.97)', overflow: 'hidden' }}>
            <ShopPanel s={s} gold={gold} items={items} onClose={() => setShowShop(false)} />
          </div>
        )}

        {/* Items Bar */}
        {items.length > 0 && (
          <div style={{ display: 'flex', gap: 3, marginBottom: 6, padding: '4px 0' }}>
            {items.map((iid: string) => {
              const mi = [...matchComponents, ...matchCompletedItems].find((x: any) => x.id === iid);
              return mi ? <span key={iid} title={mi.name} style={{ padding: '2px 5px', borderRadius: 3, background: 'rgba(200,168,94,0.1)', fontSize: 14 }}>{mi.emoji}</span> : null;
            })}
          </div>
        )}

        {/* Events */}
        <div style={{ background: '#0a0a1a', borderRadius: 6, padding: 12, maxHeight: 350, overflow: 'auto' }}>
          {shown.map((e: MatchEvent, i: number) => {
            const isActive = i === step && !isDone;
            const isObj = isObjective(e);
            const isFiller = e.type === 'filler';
            const isBase = e.type === 'baseReturn';
            if (isActive && isBase && !showShop) {
              return (
                <div key={i} style={{ padding: 14, border: '1px solid #2ecc71', borderRadius: 8, margin: '4px 0', background: 'rgba(46,204,113,0.06)' }}>
                  <div style={{ fontWeight: 'bold', color: '#2ecc71', marginBottom: 6, fontSize: 13 }}>🟢 DK {e.minute}: {e.text}</div>
                  <button onClick={() => { setShowShop(true); }}
                    style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #2ecc71, #27ae60)', color: '#000', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    🛒 Dukkani Ac
                  </button>
                </div>
              );
            }
            if (isActive && e.type === 'interactive' && e.options) {
              return (
                <div key={i} style={{ padding: 14, border: '1px solid #4fc3f7', borderRadius: 8, margin: '4px 0', background: isObj ? 'rgba(255,153,0,0.06)' : 'rgba(79,195,247,0.06)', borderColor: isObj ? '#f90' : '#4fc3f7' }}>
                  <div style={{ fontWeight: 'bold', color: isObj ? '#f90' : '#ffd93d', marginBottom: 4, fontSize: 13 }}>
                    {isObj ? '🐉 ' : '⚠️ '}DK {e.minute}: {e.text}
                  </div>
                  {/* Team comms */}
                  <div style={{ display: 'flex', gap: 3, marginBottom: 8, fontSize: 9 }}>
                    {['Girelim!', 'Dikkat!', 'Bekle', 'Geri cekil'].map(ping => (
                      <span key={ping} style={{ padding: '1px 6px', borderRadius: 3, background: 'rgba(255,255,255,0.05)', color: '#888', cursor: 'default' }}>{ping}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {e.options.map(o => (
                      <button key={o.id} className="btn btn-sm" onClick={() => { s.makeChoice(i, o.id); setStep(prev => prev + 1); }}>{o.text}</button>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <div key={i} style={{ fontSize: 11, padding: e.type === 'filler' ? '1px 0' : '4px 0', borderBottom: e.type === 'filler' ? 'none' : '1px solid rgba(255,255,255,0.03)', color: isObj ? '#f90' : isFiller ? '#444' : e.type === 'positive' ? '#4caf50' : e.type === 'negative' ? '#f44336' : 'var(--text-secondary)', opacity: isActive ? 1 : 0.6 }}>
                <span style={{ color: 'var(--text-secondary)', marginRight: 6, fontSize: isFiller ? 9 : 11 }}>DK {e.minute}</span>
                {isObj && '🐉 '}{e.text}
              </div>
            );
          })}
          {isDone && (
            <div style={{ marginTop: 12, padding: 8, background: 'rgba(200,168,94,0.1)', borderRadius: 6, textAlign: 'center', fontSize: 11, color: '#c8a85e' }}>
              Mac olaylari tamamlandi!
            </div>
          )}
        </div>
        <button className="btn btn-warning" onClick={onFinish} disabled={!isDone}
          style={{ marginTop: 12, width: '100%', padding: '8px 0', opacity: isDone ? 1 : 0.5 }}>
          MACI BITIR
        </button>
      </div>
    </div>
  );
}

/* ========== POST-MATCH ========== */
function LobbyView({ s, mode, preferredLane, onLanePick, onStart, onBack }: { s: any; mode: string; preferredLane: string; onLanePick: (lane: string) => void; onStart: (lane: string) => void; onBack: () => void }) {
  const { friends, lobbyPartner, lobbyPartnerLane, setLobbyPartner, inviteToDuo } = useGameStore();
  const [showFriendPicker, setShowFriendPicker] = useState(false);

  const lanes = [
    { lane: 'Üst Koridor', icon: '🏰', desc: 'Tek basina ust bolge' },
    { lane: 'Orman', icon: '🌲', desc: 'Haritada gezerek takima yardim et' },
    { lane: 'Orta Koridor', icon: '⚡', desc: 'Oyunun merkezinde mucadele' },
    { lane: 'Alt Koridor', icon: '🎯', desc: 'Minisporcu ile alt bolge' },
    { lane: 'Destek', icon: '🛡️', desc: 'Takimini koru ve avantaj sagla' },
  ];

  const modeLabel = mode === 'ranked' ? 'DERECELI' : 'NORMAL';
  const modeColor = mode === 'ranked' ? '#c8a85e' : '#4fc3f7';

  const inviteFriend = (friend: any) => {
    const otherLanes = lanes.filter(l => l.lane !== preferredLane);
    const partnerLane = otherLanes[Math.floor(Math.random() * otherLanes.length)].lane;
    setLobbyPartner(friend.name, partnerLane);
    setShowFriendPicker(false);
  };

  const removePartner = () => {
    setLobbyPartner(null, null);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 10px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: modeColor, letterSpacing: 2 }}>{modeLabel} OYUN</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Rolunu sec, duo partnerini davet et ve maca basla!</div>
      </div>

      {/* Your Lane Selection */}
      <div style={{ background: '#0d1025', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#e0e0e0', marginBottom: 12 }}>🎯 Senin Rolun</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {lanes.map(l => (
            <button key={l.lane} onClick={() => onLanePick(l.lane)}
              style={{
                flex: '1 1 auto', minWidth: 120, padding: '10px 12px', borderRadius: 8,
                border: '2px solid ' + (preferredLane === l.lane ? modeColor : 'var(--border)'),
                background: preferredLane === l.lane ? 'rgba(200,168,94,0.08)' : 'transparent',
                color: preferredLane === l.lane ? modeColor : 'var(--text-secondary)',
                fontSize: 12, fontWeight: preferredLane === l.lane ? 700 : 400,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (preferredLane !== l.lane) { e.currentTarget.style.borderColor = modeColor; e.currentTarget.style.color = modeColor; }}}
              onMouseLeave={e => { if (preferredLane !== l.lane) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}>
              <span style={{ fontSize: 18 }}>{l.icon}</span>
              <span>{l.lane}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Duo Partner Slot */}
      <div style={{ background: '#0d1025', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#e0e0e0', marginBottom: 12 }}>
          🤝 Duo Partneri
          {lobbyPartner && <span style={{ fontSize: 10, color: '#2ecc71', marginLeft: 8 }}>✓ Bulundu</span>}
        </div>

        {lobbyPartner ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 8, background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.2)' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #4fc3f7, #2980b9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {lobbyPartner.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e0e0e0' }}>{lobbyPartner}</div>
              <div style={{ fontSize: 10, color: '#4fc3f7' }}>
                {lanes.find(l => l.lane === lobbyPartnerLane)?.icon} {lobbyPartnerLane}
              </div>
            </div>
            <button onClick={removePartner}
              style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #f44336', background: 'rgba(244,67,54,0.1)', color: '#f44336', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Cikar
            </button>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#666', fontSize: 11 }}>
              Henuz bir duo partnerin yok.
            </div>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowFriendPicker(!showFriendPicker)}
                style={{
                  width: '100%', padding: '12px 0', borderRadius: 8,
                  border: '1px dashed rgba(200,168,94,0.3)',
                  background: 'transparent', color: '#c8a85e',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}>
                + Duo'ya Çağır
              </button>

              {showFriendPicker && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, marginTop: 4, background: '#0d1025', border: '1px solid #4fc3f7', borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                  {friends.filter((f: any) => f.isOnline).length === 0 ? (
                    <div style={{ padding: 16, textAlign: 'center', color: '#666', fontSize: 11 }}>
                      Cevrimici arkadasin yok. Mac sonunda oyunculari ekleyip davet edebilirsin.
                    </div>
                  ) : (
                    friends.filter((f: any) => f.isOnline).map((f: any, i: number) => (
                      <div key={i} onClick={() => inviteFriend(f)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'all 0.1s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,195,247,0.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #4fc3f7, #2980b9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {f.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#e0e0e0' }}>{f.name}</div>
                          <div style={{ fontSize: 9, color: '#888' }}>Lv.{f.level} • {f.rank.toUpperCase()}</div>
                        </div>
                        <span style={{ fontSize: 9, color: '#2ecc71', fontWeight: 600 }}>Cevrimici</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Start Match Button */}
      <button onClick={() => onStart(preferredLane)}
        style={{
          width: '100%', padding: '16px 0', borderRadius: 10, border: 'none',
          background: 'linear-gradient(135deg, #c8a85e, #a8862e)',
          color: '#0a0a1a', fontSize: 16, fontWeight: 800,
          cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 1,
          boxShadow: '0 4px 20px rgba(200,168,94,0.3)',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 30px rgba(200,168,94,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(200,168,94,0.3)'; }}>
        ⚡ MACA BASLA
      </button>

      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <button onClick={onBack}
          style={{ padding: '8px 24px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
          Iptal
        </button>
      </div>
    </div>
  );
}

function AllPlayersSection({ r, s }: { r: any; s: any }) {
  const { addFriend, friends } = useGameStore();
  const players = r.matchPlayers || [];

  return (
    <div style={{ marginBottom: 12, background: '#0d1025', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 700, color: '#c8a85e' }}>
        👥 Mac Oyunculari (10)
      </div>
      <div style={{ overflow: 'auto', maxHeight: 300 }}>
        {players.map((p: any, i: number) => {
          const champ = s.champions?.find((c: any) => c.id === p.championId);
          const champImg = champ ? DD + '/' + champ.id + '.png' : '';
          const isAdded = friends.some((f: any) => f.name === p.name);
          const isPlayer = p.isPlayer;
          const kdaRatio = p.kda.deaths === 0 ? '∞' : ((p.kda.kills + p.kda.assists) / p.kda.deaths).toFixed(2);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.02)',
              background: isPlayer ? 'rgba(200,168,94,0.06)' : (p.team === 'blue' ? 'rgba(79,195,247,0.03)' : 'rgba(244,67,54,0.03)'),
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', border: '2px solid ' + (p.team === 'blue' ? '#4fc3f7' : '#f44336'), background: '#0a0a1a', flexShrink: 0 }}>
                <img src={champImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isPlayer ? '#c8a85e' : '#e0e0e0' }}>
                    {p.name}
                    {isPlayer && <span style={{ fontSize: 9, color: '#ffd93d', marginLeft: 4 }}>(Sen)</span>}
                  </span>
                  <span style={{ fontSize: 9, color: '#888' }}>Lv.{p.level}</span>
                  <span style={{ fontSize: 9, color: '#888' }}>{champ?.name || p.championId}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, marginTop: 2 }}>
                  <span style={{ color: '#4fc3f7', fontWeight: 600 }}>{p.kda.kills}</span>
                  <span style={{ color: '#666' }}>/</span>
                  <span style={{ color: '#f44336', fontWeight: 600 }}>{p.kda.deaths}</span>
                  <span style={{ color: '#666' }}>/</span>
                  <span style={{ color: '#c8a85e', fontWeight: 600 }}>{p.kda.assists}</span>
                  <span style={{
                    padding: '1px 6px', borderRadius: 3, fontSize: 9, fontWeight: 700,
                    background: kdaRatio > '4' ? 'rgba(46,204,113,0.15)' : kdaRatio > '2' ? 'rgba(255,217,61,0.15)' : 'rgba(244,67,54,0.1)',
                    color: kdaRatio > '4' ? '#2ecc71' : kdaRatio > '2' ? '#ffd93d' : '#f44336',
                  }}>
                    {kdaRatio} KDA
                  </span>
                </div>
              </div>
              {!isPlayer && !isAdded && (
                <button onClick={() => addFriend(p.name, p.level, p.rank, p.championId, p.kda)}
                  style={{
                    padding: '5px 12px', borderRadius: 6, border: 'none',
                    background: 'linear-gradient(135deg, #4fc3f7, #2980b9)',
                    color: '#fff', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                  }}>
                  + Ekle
                </button>
              )}
              {isAdded && (
                <span style={{ fontSize: 10, color: '#2ecc71', fontWeight: 600, flexShrink: 0 }}>✓ Arkadas</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PostMatchView({ s, onBack, onPlayAgain }: { s: any; onBack: () => void; onPlayAgain: () => void }) {
  const r = s.lastMatchResult;
  if (!r) return <div style={{ padding: 20, color: 'var(--text-secondary)' }}>Sonuc yukleniyor...</div>;

  const champ = s.champions.find((c: any) => c.id === r.championPlayed);
  const kda = r.kda;
  const kdaRatio = kda.deaths === 0 ? '∞' : ((kda.kills + kda.assists) / kda.deaths).toFixed(2);
  const mastery = s.championMastery.find((m: any) => m.championId === r.championPlayed);
  const masteryLevel = mastery ? Math.min(7, 1 + Math.floor(mastery.points / 5000)) : 1;
  const items = r.items || [];
  const achievements = r.achievements || [];
  const runeInfo = runePages.find((rp: any) => rp.id === r.runePage);
  const spells = (r.spells || ['flash', 'ignite']).map((sid: string) => summonerSpells.find((sp: any) => sp.id === sid)).filter(Boolean);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 10px' }}>
      {/* Victory / Defeat Banner */}
      <div style={{
        background: r.won
          ? 'linear-gradient(135deg, #0a3d0a 0%, #0d1025 40%, #0d1025 60%, #0a3d0a 100%)'
          : 'linear-gradient(135deg, #3d0a0a 0%, #0d1025 40%, #0d1025 60%, #3d0a0a 100%)',
        border: '1px solid ' + (r.won ? 'rgba(46,204,113,0.4)' : 'rgba(244,67,54,0.4)'),
        borderRadius: 12, overflow: 'hidden', marginBottom: 12,
      }}>
        <div style={{ padding: '20px 28px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: r.won ? '#2ecc71' : '#f44336', letterSpacing: 3, marginBottom: 2 }}>
            {r.won ? 'ZAFER' : 'MAGLUBIYET'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {r.mode === 'ranked' ? 'Dereceli Oyun' : 'Normal Oyun'} · Sezon {s.season === 'winter' ? 'Kis' : s.season === 'spring' ? 'İlkbahar' : 'Yaz'}
          </div>
        </div>

        {/* Champion + KDA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '12px 28px 20px' }}>
          {/* Champion */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', border: '3px solid ' + (r.won ? '#2ecc71' : '#f44336'), margin: '0 auto', background: '#0a0a1a' }}>
              {champ && <img src={DD + '/' + champ.id + '.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: '#c8a85e' }}>{champ?.name}</div>
            <div style={{ fontSize: 9, color: 'var(--text-secondary)' }}>Ustalik {masteryLevel}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginTop: 3 }}>
              {spells.map((sp: any, i: number) => sp && <span key={i} title={sp.description} style={{ padding: '1px 3px', borderRadius: 3, background: 'rgba(79,195,247,0.1)', fontSize: 11 }}>{sp.emoji}</span>)}
              {runeInfo && <span title={runeInfo.description} style={{ padding: '1px 3px', borderRadius: 3, background: runeInfo.color + '22', fontSize: 10, fontWeight: 600, color: runeInfo.color }}>{runeInfo.emoji}</span>}
            </div>
          </div>

          {/* KDA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#4fc3f7', lineHeight: 1 }}>{kda.kills}</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Kill</div>
            </div>
            <span style={{ fontSize: 28, color: '#444', fontWeight: 300, margin: '0 4px' }}>/</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#f44336', lineHeight: 1 }}>{kda.deaths}</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Olum</div>
            </div>
            <span style={{ fontSize: 28, color: '#444', fontWeight: 300, margin: '0 4px' }}>/</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#c8a85e', lineHeight: 1 }}>{kda.assists}</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Asist</div>
            </div>
          </div>

          {/* KDA Ratio */}
          <div style={{ textAlign: 'center', padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: kda.deaths === 0 ? '#2ecc71' : kdaRatio > '4' ? '#2ecc71' : kdaRatio > '2' ? '#ffd93d' : '#f44336', lineHeight: 1 }}>
              {kdaRatio}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-secondary)' }}>KDA</div>
          </div>
        </div>
      </div>

      {/* Items */}
      {items.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 10 }}>
          {items.map((iid: string) => {
            const mi = [...matchComponents, ...matchCompletedItems].find((x: any) => x.id === iid);
            return mi ? <span key={iid} title={mi.name} style={{ padding: '3px 8px', borderRadius: 4, background: 'rgba(200,168,94,0.1)', border: '1px solid rgba(200,168,94,0.2)', fontSize: 16 }}>{mi.emoji}</span> : null;
          })}
        </div>
      )}

      {/* Rewards Row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, background: '#0d1025', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>⭐</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ffd93d' }}>+{r.xpGain} XP</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Seviye {s.level} · {s.xp}/{s.xpToNext}</div>
          </div>
        </div>
        <div style={{ flex: 1, background: '#0d1025', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🔷</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#4fc3f7' }}>+{r.be} Mavi Oz</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Toplam: {s.blueEssence}</div>
          </div>
        </div>
        <div style={{ flex: 1, background: '#0d1025', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>{r.won ? '🔼' : '🔽'}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: r.lpChangeText.includes('Yu') ? '#2ecc71' : r.lpChangeText.includes('Du') ? '#f44336' : '#e0e0e0' }}>
              {r.lpChangeText || '-'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
              {s.rank.tier === 'unranked' ? 'Unranked' : rankEmoji[s.rank.tier] + ' ' + s.rank.tier.toUpperCase() + ' ' + s.rank.lp + 'LP'}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div style={{ marginBottom: 10, padding: '10px 16px', background: '#0d1025', border: '1px solid var(--border)', borderRadius: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#c8a85e', marginBottom: 6 }}>🏅 Basarimlar</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {achievements.map((a: any) => (
              <div key={a.id} style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(200,168,94,0.08)', border: '1px solid rgba(200,168,94,0.2)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
                <span style={{ fontSize: 16 }}>{a.emoji}</span>
                <div><div style={{ fontWeight: 700, color: '#c8a85e' }}>{a.name}</div><div style={{ color: 'var(--text-secondary)' }}>+{a.xpBonus} XP, +{a.beBonus} BE</div></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Players */}
      {r.matchPlayers && r.matchPlayers.length > 0 && <AllPlayersSection r={r} s={s} />}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onPlayAgain}
          style={{ flex: 1, padding: '14px 0', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #c8a85e, #a8862e)', color: '#0a0a1a', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 1 }}>
          ▶ TEKRAR OYNA
        </button>
        <button onClick={onBack}
          style={{ flex: 1, padding: '14px 0', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          🏠 Ana Menu
        </button>
      </div>
    </div>
  );
}

/* ========== SKIN STORE ========== */
function SkinStoreView({ s, buySkin }: { s: any; buySkin: (championId: string, skinNum: number, skinName: string, cost: number) => void }) {
  const [skinSearch, setSkinSearch] = useState('');
  const [selectedChamp, setSelectedChamp] = useState<string | null>(null);
  const DD = 'https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion';

  const filtered = s.champions.filter((c: any) => {
    if (!c.unlocked) return false;
    if (skinSearch && !c.name.toLowerCase().includes(skinSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <input value={skinSearch} onChange={e => setSkinSearch(e.target.value)} placeholder="Sampiyon ara..."
        style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid var(--border)', background: '#0d1025', color: '#e0e0e0', fontSize: 12, fontFamily: 'inherit', width: 200, outline: 'none', marginBottom: 12 }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
        {filtered.map((c: any) => {
          const skins = getSkinsForChampion(c.id);
          return (
            <button key={c.id} onClick={() => setSelectedChamp(selectedChamp === c.id ? null : c.id)}
              style={{
                padding: '8px 6px', borderRadius: 8, border: '2px solid ' + (selectedChamp === c.id ? '#c8a85e' : 'var(--border)'),
                background: selectedChamp === c.id ? 'rgba(200,168,94,0.1)' : '#0d1025',
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
                transition: 'all 0.15s',
              }}>
              <div style={{
                width: 48, height: 48, borderRadius: 8, overflow: 'hidden', border: '2px solid var(--border)',
                margin: '0 auto 4px', background: '#0a0a1a',
              }}>
                <img src={DD + '/' + c.id + '.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#e0e0e0' }}>{c.name}</div>
              <div style={{ fontSize: 8, color: '#888' }}>{skins.length} kostum</div>
            </button>
          );
        })}
      </div>

      {selectedChamp && (
        <div style={{ marginTop: 16, background: '#0d1025', border: '1px solid #c8a85e', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#c8a85e', marginBottom: 12 }}>
            {s.champions.find((c: any) => c.id === selectedChamp)?.name} Kostumleri
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {getSkinsForChampion(selectedChamp).map(skin => {
              const owned = (s.ownedSkins[selectedChamp] || []).includes(skin.num) || skin.num === 0;
              const cost = skin.num === 0 ? 0 : (skin.num <= 5 ? 3000 : 5000);
              const canBuy = !owned && s.blueEssence >= cost && cost > 0;
              return (
                <div key={skin.num} style={{
                  borderRadius: 10, border: '1px solid ' + (owned ? '#2ecc71' : canBuy ? '#c8a85e' : 'var(--border)'),
                  background: owned ? 'rgba(46,204,113,0.05)' : '#0a0d1a',
                  overflow: 'hidden', opacity: owned ? 0.9 : 0.7,
                }}>
                  <div style={{ width: '100%', aspectRatio: '0.65', overflow: 'hidden', background: '#0a0a1a' }}>
                    <img src={getSkinImageUrl(selectedChamp, skin.num)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { (e.target as HTMLImageElement).src = DD + '/' + selectedChamp + '.png'; }} />
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#e0e0e0' }}>{skin.name}</div>
                    {owned ? (
                      <div style={{ marginTop: 6, fontSize: 9, color: '#2ecc71', fontWeight: 700 }}>✓ Sahip</div>
                    ) : cost === 0 ? (
                      <div style={{ marginTop: 6, fontSize: 9, color: '#888' }}>Ucretsiz</div>
                    ) : (
                      <button onClick={() => buySkin(selectedChamp, skin.num, skin.name, cost)} disabled={!canBuy}
                        style={{
                          marginTop: 6, width: '100%', padding: '4px 0', borderRadius: 4, border: 'none',
                          background: canBuy ? 'linear-gradient(135deg, #c8a85e, #a8862e)' : '#1a1a2e',
                          color: canBuy ? '#000' : '#666', fontSize: 9, fontWeight: 600,
                          cursor: canBuy ? 'pointer' : 'default', fontFamily: 'inherit',
                        }}>
                        {canBuy ? `🔵 ${cost}` : `🔒 ${cost}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ========== STORE ========== */
function StoreView({ s }: { s: any }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'locked' | 'owned'>('all');
  const [storeTab, setStoreTab] = useState<'champions' | 'kozmetik' | 'kostum' | 'be'>('champions');
  const { buyCosmetic, equipCosmetic, buySkin } = useGameStore();
  const cosmeticItems = [
    { id: 'frame_gold', name: 'Altin Cerceve', type: 'frame', emoji: '🟡', cost: 5000, desc: 'Profiline altin cerceve' },
    { id: 'frame_elmas', name: 'Elmas Cerceve', type: 'frame', emoji: '💎', cost: 15000, desc: 'Profiline elmas cerceve' },
    { id: 'frame_atess', name: 'Ates Cercevesi', type: 'frame', emoji: '🔥', cost: 10000, desc: 'Profiline ates cercevesi' },
    { id: 'icon_taht', name: 'Taht Simgesi', type: 'icon', emoji: '👑', cost: 3000, desc: 'Kraliyet simgesi' },
    { id: 'icon_kilic', name: 'Kilic Simgesi', type: 'icon', emoji: '⚔️', cost: 3000, desc: 'Savasci simgesi' },
    { id: 'icon_yildiz', name: 'Yildiz Simgesi', type: 'icon', emoji: '⭐', cost: 5000, desc: 'Parlayan yildiz simgesi' },
    { id: 'bg_uzay', name: 'Uzay Temasi', type: 'background', emoji: '🌌', cost: 8000, desc: 'Uzay arka plani' },
    { id: 'bg_yesil', name: 'Orman Temasi', type: 'background', emoji: '🌿', cost: 6000, desc: 'Orman arka plani' },
  ];

  const bePackages = [
    { tl: 50, be: 650, label: 'Kucuk Paket' },
    { tl: 100, be: 1380, label: 'Standart Paket' },
    { tl: 200, be: 3000, label: 'Buyuk Paket' },
    { tl: 500, be: 7800, label: 'Mega Paket' },
  ];

  const storeTabBtn = (id: typeof storeTab, label: string) => (
    <button onClick={() => setStoreTab(id)}
      style={{ padding: '4px 14px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', background: storeTab === id ? '#c8a85e' : '#2a2a4a', color: storeTab === id ? '#0a0a1a' : '#a0a0b0' }}>
      {label}
    </button>
  );

  const filtered = s.champions.filter((c: any) => {
    if (filter === 'owned' && !c.unlocked) return false;
    if (filter === 'locked' && c.unlocked) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 22 }}>🛒</div>
        <div style={{ fontSize: 18, fontWeight: 'bold' }}>Istemci Magazasi</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 12, color: '#4fc3f7' }}>🔵 {s.blueEssence} Mavi Oz</div>
        <div style={{ fontSize: 12, color: '#ffd93d' }}>💰 {s.balance} TL</div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {storeTabBtn('champions', 'Sampiyonlar')}
        {storeTabBtn('kostum', 'Kostumler')}
        {storeTabBtn('kozmetik', 'Kozmetik')}
        {storeTabBtn('be', 'Mavi Oz')}
      </div>

      {storeTab === 'champions' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Sampiyon ara..."
              style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid var(--border)', background: '#0d1025', color: '#e0e0e0', fontSize: 12, fontFamily: 'inherit', width: 200, outline: 'none' }} />
            {(['all','locked','owned'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', background: filter === f ? '#c8a85e' : '#2a2a4a', color: filter === f ? '#0a0a1a' : '#a0a0b0' }}>
                {f === 'all' ? 'Tumu' : f === 'locked' ? 'Kilitli' : 'Sahip Olunan'}
              </button>
            ))}
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 8 }}>{s.champions.filter((c: any) => c.unlocked).length}/{s.champions.length} acik</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 130px)', gap: 10 }}>
            {filtered.map((c: any) => {
              const owned = c.unlocked;
              const canBuy = !owned && s.blueEssence >= c.cost;
              return (
                <div key={c.id} onClick={() => canBuy && s.buyChampion(c.id)}
                  style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '2px solid ' + (owned ? 'rgba(79,195,247,0.3)' : canBuy ? '#c8a85e' : 'var(--border)'), cursor: canBuy ? 'pointer' : 'default', opacity: owned || canBuy ? 1 : 0.5, transition: 'all 0.2s', background: '#0d1025' }}
                  onMouseEnter={e => { if (canBuy) { e.currentTarget.style.borderColor = '#ffd93d'; e.currentTarget.style.transform = 'translateY(-2px)'; }}}
                  onMouseLeave={e => { if (canBuy) { e.currentTarget.style.borderColor = '#c8a85e'; e.currentTarget.style.transform = 'none'; }}}>
                  <div style={{ width: '100%', aspectRatio: '1', background: '#0a0a1a', overflow: 'hidden' }}>
                    <img src={DD + '/' + c.id + '.png'} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: owned ? 'none' : 'grayscale(0.5)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <div style={{ padding: '5px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: owned ? '#fff' : 'var(--text-secondary)' }}>{c.name}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 1 }}>{c.role} · {'⭐'.repeat(c.difficulty)}</div>
                  </div>
                  {owned ? (
                    <div style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(79,195,247,0.8)', borderRadius: 4, padding: '1px 6px', fontSize: 9, color: '#000', fontWeight: 'bold' }}>✓</div>
                  ) : (
                    <div style={{ position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', padding: '2px 0', background: 'rgba(0,0,0,0.7)', fontSize: 10, color: '#ffd93d', fontWeight: 'bold' }}>{c.cost} 🔵</div>
                  )}
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)', fontSize: 12 }}>Sampiyon bulunamadi.</div>}
        </>
      )}

      {storeTab === 'kostum' && <SkinStoreView s={s} buySkin={buySkin} />}

      {storeTab === 'be' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 500 }}>
          {bePackages.map(pkg => {
            const canBuy = s.balance >= pkg.tl;
            return (
              <div key={pkg.tl} onClick={() => canBuy && s.buyBlueEssence(pkg.tl, pkg.be)}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18', borderRadius: 8, border: '2px solid ' + (canBuy ? '#c8a85e' : 'var(--border)'), cursor: canBuy ? 'pointer' : 'not-allowed', opacity: canBuy ? 1 : 0.5, transition: 'all 0.2s', background: '#0d1025' }}
                onMouseEnter={e => { if (canBuy) { e.currentTarget.style.borderColor = '#ffd93d'; e.currentTarget.style.transform = 'translateX(4px)'; }}}
                onMouseLeave={e => { if (canBuy) { e.currentTarget.style.borderColor = '#c8a85e'; e.currentTarget.style.transform = 'none'; }}}>
                <div style={{ fontSize: 28 }}>🔵</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 'bold' }}>{pkg.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#4fc3f7' }}>{pkg.be.toLocaleString()} 🔵</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 'bold', color: canBuy ? '#ffd93d' : 'var(--text-secondary)' }}>
                  {pkg.tl} TL
                </div>
              </div>
            );
          })}
        </div>
      )}

      {storeTab === 'kozmetik' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {cosmeticItems.map((item: any) => {
            const owned = s.cosmetics.some((c: any) => c.id === item.id && c.owned);
            const equipped = owned && s.cosmetics.find((c: any) => c.id === item.id)?.equipped;
            const canBuy = !owned && s.blueEssence >= item.cost;
            const typeLab = item.type === 'frame' ? '🖼️ Cerceve' : item.type === 'icon' ? '🪪 Simge' : '🎨 Arkaplan';
            return (
              <div key={item.id} style={{
                padding: 14, borderRadius: 10, border: '2px solid ' + (equipped ? '#2ecc71' : owned ? '#4fc3f7' : 'var(--border)'),
                background: equipped ? 'rgba(46,204,113,0.06)' : owned ? 'rgba(79,195,247,0.04)' : '#0d1025',
                opacity: owned && !canBuy ? 0.7 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 28 }}>{item.emoji}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#e0e0e0' }}>{item.name}</div>
                    <div style={{ fontSize: 9, color: '#888' }}>{typeLab}</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 10 }}>{item.desc}</div>
                {equipped ? (
                  <button onClick={() => equipCosmetic(item.id)}
                    style={{ width: '100%', padding: '6px 0', borderRadius: 6, border: '1px solid #2ecc71', background: 'rgba(46,204,113,0.1)', color: '#2ecc71', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    ✓ Kusanildi (Cikar)
                  </button>
                ) : owned ? (
                  <button onClick={() => equipCosmetic(item.id)}
                    style={{ width: '100%', padding: '6px 0', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #4fc3f7, #2980b9)', color: '#fff', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    🎯 Kusan
                  </button>
                ) : (
                  <button onClick={() => canBuy && buyCosmetic(item.id)} disabled={!canBuy}
                    style={{ width: '100%', padding: '6px 0', borderRadius: 6, border: 'none', background: canBuy ? 'linear-gradient(135deg, #c8a85e, #a8862e)' : '#2a2a4a', color: canBuy ? '#000' : '#666', fontSize: 10, fontWeight: 600, cursor: canBuy ? 'pointer' : 'default', fontFamily: 'inherit' }}>
                    {canBuy ? `🔵 ${item.cost} BE` : `🔒 ${item.cost} BE`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ========== LEADERBOARD ========== */
function LeaderboardView({ s }: { s: any }) {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
      <div style={{ background: '#0d1025', border: '1px solid var(--border)', borderRadius: 8, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 22 }}>🏆</span>
          <span style={{ fontSize: 18, fontWeight: 'bold' }}>Liderlik Tablosu</span>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderBottom: '2px solid var(--border)', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
          <span style={{ width: 30, textAlign: 'center' }}>#</span>
          <span style={{ flex: 1 }}>Oyuncu</span>
          <span style={{ width: 100, textAlign: 'center' }}>Lig</span>
          <span style={{ width: 80, textAlign: 'right' }}>Puan</span>
        </div>

        {s.leaderboard.map((p: any, i: number) => (
          <div key={p.name} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6, marginBottom: 4,
            background: p.name === s.name ? 'rgba(79,195,247,0.1)' : i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
            border: p.name === s.name ? '1px solid rgba(79,195,247,0.3)' : '1px solid transparent',
          }}>
            <span style={{ width: 30, textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: i < 3 ? '#c8a85e' : 'var(--text-secondary)' }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + (i + 1)}
            </span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: p.name === s.name ? 700 : 400 }}>{p.name}</span>
            <span style={{ width: 100, textAlign: 'center', fontSize: 12, color: rankColors[p.tier], fontWeight: 'bold' }}>
              {rankEmoji[p.tier]} {p.tier.toUpperCase()}
            </span>
            <span style={{ width: 80, textAlign: 'right', fontSize: 14, fontWeight: 'bold', color: '#c8a85e' }}>{p.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========== PROFILE ========== */
function ProfileView({ s }: { s: any }) {
  const [profileTab, setProfileTab] = useState<'matches' | 'season' | 'mastery' | 'career'>('matches');
  const [selectedChamp, setSelectedChamp] = useState<string | null>(null);

  const profileTabBtn = (id: typeof profileTab, label: string) => (
    <button onClick={() => setProfileTab(id)}
      style={{
        padding: '8px 20px', borderRadius: 4, border: 'none',
        background: profileTab === id ? '#c8a85e' : 'transparent',
        color: profileTab === id ? '#0a0a1a' : 'var(--text-secondary)',
        fontSize: 12, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all 0.2s',
      }}>
      {label}
    </button>
  );

  const masteries = [...s.championMastery].sort((a: any, b: any) => b.points - a.points);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 20, gap: 20, overflow: 'auto' }}>
      {/* Top section: Avatar + Name + Rank */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #4fc3f7, #ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 'bold', color: '#fff', flexShrink: 0, border: '3px solid #c8a85e' }}>
          {s.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 26, fontWeight: 800 }}>{s.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 20 }}>{rankEmoji[s.rank.tier] || '❓'}</span>
            <span style={{ fontSize: 16, fontWeight: 'bold', color: s.rank.tier === 'unranked' ? 'var(--text-secondary)' : rankColors[s.rank.tier] || '#fff' }}>
              {s.rank.tier === 'unranked' ? 'UNRANKED' : s.rank.tier.toUpperCase()}
            </span>
            {s.rank.division && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{'I II III IV'.split(' ')[4 - s.rank.division]}</span>}
            {s.rank.tier !== 'unranked' && <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>· {s.rank.lp} LP</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#c8a85e' }}>Seviye {s.level}</span>
            <div style={{ width: 120, height: 4, background: 'var(--bg-primary)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: (s.xp / s.xpToNext) * 100 + '%', background: 'linear-gradient(90deg, #4fc3f7, #ff6b6b)', borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{s.xp}/{s.xpToNext}</span>
            {s.fame > 0 && <span style={{ fontSize: 11, color: '#f39c12', fontWeight: 700, marginLeft: 8 }}>⭐ {s.fame} Fame</span>}
            {s.lootBoxes.length > 0 && (
              <button onClick={() => s.openLootBox()} style={{ marginLeft: 8, padding: '4px 10px', borderRadius: 4, border: '1px solid #c8a85e', background: 'rgba(200,168,94,0.1)', color: '#c8a85e', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                🎁 Sandiklar ({s.lootBoxes.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub navigation */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {profileTabBtn('matches', 'Son Maclar')}
        {profileTabBtn('season', 'Sezon')}
        {profileTabBtn('mastery', 'Sampiyon Ustaligi')}
        {profileTabBtn('career', 'Kariyer')}
      </div>

      {/* Tab content */}
      {profileTab === 'matches' && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, fontWeight: 600 }}>SON 20 MAC</div>
          {s.matchLog.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', padding: 40 }}>Henuz mac yapilmadi. Ana sayfadan "OYNA" butonuna basarak baslayabilirsin!</div>
          ) : (
            s.matchLog.filter((e: string) => e.startsWith('✅') || e.startsWith('❌')).slice(-20).reverse().map((e: string, i: number) => {
              const isWin = e.startsWith('✅');
              const isLoss = e.startsWith('❌');
              const isDev = e.startsWith('[DEV]');
              const isMatch = isWin || isLoss;
              const parts = e.split(' | ');
              const hasLp = isMatch && parts.length >= 4;
              const lpText = hasLp ? parts[3].trim() : '';
              const bg = isWin ? 'rgba(76,175,80,0.08)' : isLoss ? 'rgba(244,67,54,0.08)' : 'transparent';
              const border = isWin ? 'rgba(76,175,80,0.3)' : isLoss ? 'rgba(244,67,54,0.3)' : 'rgba(255,255,255,0.05)';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14', borderLeft: `3px solid ${border}`, background: bg, borderRadius: 4, marginBottom: 4, fontSize: 12 }}>
                  {isWin ? <span style={{ fontSize: 14 }}>✅</span> : <span style={{ fontSize: 14 }}>❌</span>}
                  <span style={{ color: isWin ? '#4caf50' : isLoss ? '#f44336' : 'var(--text-secondary)', flex: 1 }}>
                    {isMatch ? 'MAC ' + parts[0] : e}
                  </span>
                  {isMatch && parts[1] && <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{parts[1]}</span>}
                  {isMatch && parts[2] && <span style={{ color: '#4fc3f7', fontSize: 11 }}>{parts[2]}</span>}
                  {lpText && <span style={{ color: lpText.startsWith('+') ? '#ffd93d' : '#ff6b6b', fontSize: 11, fontWeight: 700 }}>{lpText}</span>}
                </div>
              );
            })
          )}
        </div>
      )}

      {profileTab === 'season' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Season stats */}
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, background: '#0d1025', border: '1px solid var(--border)', borderRadius: 8, padding: 18 }}>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4 }}>SEZON PERFORMANSI</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#6bcb77' }}>{s.seasonWins}G - {s.seasonLosses}M</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>%{s.seasonWins + s.seasonLosses > 0 ? Math.round(s.seasonWins / (s.seasonWins + s.seasonLosses) * 100) : 0} Win Rate</div>
            </div>
            {s.team && (
              <div style={{ flex: 1, background: '#0d1025', border: '1px solid #4fc3f7', borderRadius: 8, padding: 18 }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4 }}>TAKIM</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#4fc3f7' }}>{s.team.teamName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.team.salary} TL/maas</div>
              </div>
            )}
          </div>
          {/* Season summary */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, background: '#0d1025', border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 8 }}>SEZON OZETI</div>
              <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
                <div><span style={{ color: '#888' }}>Mac: </span><span style={{ fontWeight: 700 }}>{s.seasonWins + s.seasonLosses}</span></div>
                <div><span style={{ color: '#888' }}>Rank: </span><span style={{ fontWeight: 700, color: rankColors[s.rank.tier] }}>{s.rank.tier.toUpperCase()}</span></div>
                <div><span style={{ color: '#888' }}>Fame: </span><span style={{ fontWeight: 700, color: '#f39c12' }}>⭐{s.fame}</span></div>
              </div>
            </div>
            {s.rank.tier !== 'unranked' && !(s.seasonRewardsClaimed || []).includes(s.rank.tier + '_skin') && (
              <button onClick={() => s.claimSeasonRewards()}
                style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #c8a85e, #a8862e)', color: '#000', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                🎁 Sezon Odulunu Al
              </button>
            )}
          </div>
          {/* Stats */}
          <div style={{ background: '#0d1025', border: '1px solid var(--border)', borderRadius: 8, padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 'bold', color: '#c8a85e', marginBottom: 12 }}>STATLAR</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[{k:'mekanik',l:'MEKANIK',c:'#ff6b6b'},{k:'oyunBilgisi',l:'OYUN BILGISI',c:'#4fc3f7'},{k:'takimUyumu',l:'TAKIM UYUMU',c:'#6bcb77'},{k:'mentalGuc',l:'MENTAL GUC',c:'#ffd93d'}].map((x: any) => (
                <div key={x.k}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    <span>{x.l}</span>
                    <span style={{ color: x.c, fontWeight: 'bold' }}>{s.stats[x.k]}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-primary)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: s.stats[x.k] + '%', background: x.c, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Equipment */}
          {s.equipment.length > 0 && (
            <div style={{ background: '#0d1025', border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 6 }}>EKIPMANLAR</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{s.equipment.map((item: string) => (
                <span key={item} style={{ padding: '3px 8px', background: '#2a2a4a', borderRadius: 4, fontSize: 10, border: '1px solid rgba(255,255,255,0.06)' }}>{item}</span>
              ))}</div>
            </div>
          )}
        </div>
      )}

      {profileTab === 'career' && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ background: '#0d1025', border: '1px solid var(--border)', borderRadius: 8, padding: 18, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#c8a85e', marginBottom: 12 }}>📊 KARIYER ISTATISTIKLERI</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
              {[
                { l: 'Toplam Mac', v: s.careerStats.totalMatches },
                { l: 'Galibiyet', v: s.careerStats.totalWins },
                { l: 'Win Rate', v: s.careerStats.totalMatches > 0 ? '%' + Math.round(s.careerStats.totalWins / s.careerStats.totalMatches * 100) : '-', c: '#6bcb77' },
                { l: 'Toplam Kill', v: s.careerStats.totalKills, c: '#4fc3f7' },
                { l: 'Toplam Olum', v: s.careerStats.totalDeaths, c: '#f44336' },
                { l: 'Toplam Asist', v: s.careerStats.totalAssists, c: '#c8a85e' },
                { l: 'Ort. KDA', v: s.careerStats.totalDeaths > 0 ? ((s.careerStats.totalKills + s.careerStats.totalAssists) / s.careerStats.totalDeaths).toFixed(1) : '∞', c: '#ffd93d' },
                { l: 'Pentakill', v: s.careerStats.pentakills, c: '#e74c3c' },
                { l: 'En Yuksek Rank', v: s.careerStats.highestRank !== 'unranked' ? s.careerStats.highestRank.toUpperCase() : '-', c: rankColors[s.careerStats.highestRank] || '#888' },
                { l: 'Toplam Altin', v: s.careerStats.totalGoldEarned.toLocaleString(), c: '#ffd93d' },
                { l: 'Toplam XP', v: s.careerStats.totalXP.toLocaleString(), c: '#2ecc71' },
                { l: 'Fame', v: s.fame, c: '#f39c12' },
              ].map((x: any, i: number) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 6, padding: '8px 10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: x.c || '#e0e0e0' }}>{x.v}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-secondary)' }}>{x.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {profileTab === 'mastery' && (
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, fontWeight: 600 }}>TUM SAMPIYONLAR ({masteries.length})</div>
            {masteries.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', padding: 40 }}>Henuz sampiyon oynanmadi.</div>
            ) : (
              masteries.map((m: any) => {
                const champ = s.champions.find((c: any) => c.id === m.championId);
                const lvl = m.points >= 24000 ? 7 : m.points >= 15000 ? 6 : m.points >= 9000 ? 5 : m.points >= 4800 ? 4 : m.points >= 1800 ? 3 : m.points >= 300 ? 2 : 1;
                const lvlColors = ['#8c8c8c','#4fc3f7','#6bcb77','#ffd93d','#ff6b6b','#9b59b6','#f1c40f'];
                const progress = lvl < 7 ? (m.points % (lvl >= 6 ? 24000 : lvl >= 5 ? 15000 : lvl >= 4 ? 9000 : lvl >= 3 ? 4800 : lvl >= 2 ? 1800 : 300)) / (lvl >= 6 ? 24000 : lvl >= 5 ? 15000 : lvl >= 4 ? 9000 : lvl >= 3 ? 4800 : lvl >= 2 ? 1800 : 300) * 100 : 100;
                return (
                  <div key={m.championId} onClick={() => setSelectedChamp(m.championId)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: selectedChamp === m.championId ? 'rgba(200,168,94,0.06)' : 'transparent' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${lvlColors[lvl - 1]}, ${lvlColors[lvl - 1]}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 'bold', color: '#000' }}>{lvl}</div>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{champ?.name || m.championId}</span>
                    <div style={{ width: 120, height: 5, background: 'var(--bg-primary)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: Math.min(100, progress) + '%', background: lvlColors[lvl - 1], borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-secondary)', width: 50, textAlign: 'right' }}>{m.points.toLocaleString()}p</span>
                  </div>
                );
              })
            )}
          </div>
          {/* Ability Tree */}
          {selectedChamp && (
            <div style={{ width: 280, borderLeft: '1px solid var(--border)', paddingLeft: 16, flexShrink: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#c8a85e', marginBottom: 10 }}>
                {s.champions.find((c: any) => c.id === selectedChamp)?.name || selectedChamp} Yetenekleri
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {getChampionAbilities(selectedChamp).map((a: any) => {
                  const mastery = s.championMastery.find((m: any) => m.championId === selectedChamp);
                  const canBuy = mastery && mastery.points >= a.level * 500 && a.level < a.maxLevel;
                  return (
                    <div key={a.key} style={{ padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{a.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#e0e0e0' }}>[{a.key}] {a.name}</div>
                          <div style={{ fontSize: 8, color: 'var(--text-secondary)' }}>{a.description} • Lv.{a.level}/{a.maxLevel}</div>
                        </div>
                        <button onClick={() => s.abilityLevelUp(selectedChamp, a.key)} disabled={!canBuy}
                          style={{ padding: '3px 8px', borderRadius: 4, border: 'none', background: canBuy ? 'linear-gradient(135deg, #c8a85e, #a8862e)' : '#2a2a4a', color: canBuy ? '#000' : '#555', fontSize: 9, fontWeight: 700, cursor: canBuy ? 'pointer' : 'default', fontFamily: 'inherit' }}>
                          {a.level >= a.maxLevel ? 'MAX' : `${a.level * 500}p`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ========== TOURNAMENT VIEW ========== */
function TournamentView({ s }: { s: any }) {
  const t = s.activeTournament;
  const history = s.tournamentHistory || [];
  if (typeof s.startTournament !== 'function') return <div style={{ padding: 20, color: '#888' }}>Turnuva yukleniyor...</div>;

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: '#c8a85e', marginBottom: 16 }}>🏟️ Turnuva</div>
      {t && t.active ? (
        <div style={{ background: '#0d1025', border: '2px solid #f39c12', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 28 }}>🏟️</span>
            <div><div style={{ fontSize: 16, fontWeight: 800, color: '#e0e0e0' }}>{t.name}</div><div style={{ fontSize: 11, color: '#f39c12' }}>{t.tier.toUpperCase()} • Odul: {t.prizePool} TL</div></div>
            <div style={{ flex: 1 }} /><div style={{ fontSize: 10 }}>Tur {t.currentRound + 1}/{t.bracket.length}</div>
          </div>
          {t.bracket.map((round: any[], ri: number) => (
            <div key={ri} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, color: '#888', fontWeight: 600, marginBottom: 4 }}>Tur {ri + 1}</div>
              {round.map((m: any, mi: number) => (
                <div key={mi} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderRadius: 6, background: m.played ? (m.won ? 'rgba(46,204,113,0.06)' : 'rgba(244,67,54,0.06)') : 'rgba(255,255,255,0.02)', border: '1px solid ' + (m.played ? (m.won ? 'rgba(46,204,113,0.2)' : 'rgba(244,67,54,0.2)') : 'var(--border)'), marginBottom: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#e0e0e0' }}>{m.opponent}</span>
                  <span style={{ fontSize: 9, color: '#888' }}>{m.format}</span>
                  {m.played ? <span style={{ fontSize: 10, fontWeight: 700, color: m.won ? '#2ecc71' : '#f44336' }}>{m.won ? '✅' : '❌'} ({m.ourWins}-{m.enemyWins})</span>
                    : <button onClick={() => s.playTournamentMatch()} style={{ marginLeft: 'auto', padding: '4px 14px', borderRadius: 4, border: 'none', background: 'linear-gradient(135deg, #f39c12, #e67e22)', color: '#000', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Mac Yap</button>}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#0d1025', border: '1px solid var(--border)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏟️</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e0e0e0', marginBottom: 4 }}>Aktif turnuva yok</div>
          <button onClick={() => s.startTournament()} style={{ marginTop: 12, padding: '10px 28px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #f39c12, #e67e22)', color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🏆 Turnuvaya Katil</button>
        </div>
      )}
      {history.length > 0 && (
        <div style={{ background: '#0d1025', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 10 }}>📜 Turnuva Gecmisi</div>
          {history.map((h: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.02)', fontSize: 11 }}>
              <span style={{ color: '#e0e0e0' }}>{h.name}</span><span style={{ color: '#2ecc71' }}>{h.result} (+{h.prize} TL)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
