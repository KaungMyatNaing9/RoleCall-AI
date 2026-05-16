// RoleCall AI — shared UI primitives and icons
// Used by every screen. Export to window so other Babel scripts pick it up.

const { useState, useEffect, useRef, useMemo, useLayoutEffect } = React;

// ---------- Icons (stroke 1.6, currentColor) ----------
const I = {
  logo: (p={}) => (
    <svg viewBox="0 0 32 32" width={p.size||22} height={p.size||22} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="rcgrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2DD4BF"/>
          <stop offset="0.5" stopColor="#4F7CFF"/>
          <stop offset="1" stopColor="#8B7DFB"/>
        </linearGradient>
      </defs>
      <path d="M5 12C5 8.13 8.13 5 12 5h8c3.87 0 7 3.13 7 7v5c0 3.87-3.13 7-7 7h-2.5l-4.2 4.2c-.5.5-1.3.5-1.7-.1l-2.8-4.1H12c-3.87 0-7-3.13-7-7v-5z" stroke="url(#rcgrad)" strokeWidth="1.8"/>
      <circle cx="12.5" cy="14.5" r="1.6" fill="url(#rcgrad)"/>
      <circle cx="19.5" cy="14.5" r="1.6" fill="url(#rcgrad)"/>
    </svg>
  ),
  phone: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M5 4l4 1 1 4-2 1c1 3 3 5 6 6l1-2 4 1 1 4c0 1-1 2-2 2C10 21 3 14 3 6c0-1 1-2 2-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  mic: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.6"/><path d="M5 11a7 7 0 0014 0M12 18v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  micOff: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M9 4.5A3 3 0 0115 6v3.5M15 13.7a3 3 0 01-6-1.7V9M5 11a7 7 0 0010.3 6.2M12 18v3M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  cam: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><rect x="3" y="6" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M16 10l5-3v10l-5-3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  camOff: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M3 6h11l3 2.5V10M21 7l-4 3v4l4 3V7zM3 3l18 18M3 6v12h11" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/></svg>,
  video: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><rect x="3" y="6" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M16 10l5-3v10l-5-3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  chat: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M4 6c0-1.1.9-2 2-2h12a2 2 0 012 2v8a2 2 0 01-2 2H9l-4 4V6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  sparkle: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M12 3l1.6 4.6L18 9l-4.4 1.4L12 15l-1.6-4.6L6 9l4.4-1.4L12 3zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  arrow: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M5 12h14m-5-5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  play: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M8 5l11 7-11 7V5z" fill="currentColor"/></svg>,
  pause: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>,
  hint: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M9 17h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.4 1 1 1.2 1.7L10 17h4l.3-1.4c.2-.7.6-1.3 1.2-1.7A6 6 0 0012 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  bookmark: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M6 4h12v17l-6-4-6 4V4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  upload: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M12 4v11M7 9l5-5 5 5M4 17v3h16v-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M4 12l5 5L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  x: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  warn: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M12 3l10 17H2L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M12 10v4M12 17v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  user: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  heart: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  ear: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M7 13c-1-6 4-9 7-8 4 1 5 7 2 9-2 1-2 2-2 4 0 2-2 3-4 3-3 0-3-3-3-3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  shield: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M12 3l8 3v5c0 5-4 9-8 10-4-1-8-5-8-10V6l8-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  briefcase: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.6"/></svg>,
  bag: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M5 8h14l-1 12H6L5 8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.6"/></svg>,
  book: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M5 4h7v16H5a1 1 0 01-1-1V5a1 1 0 011-1zM12 4h7a1 1 0 011 1v14a1 1 0 01-1 1h-7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  bank: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M3 10l9-6 9 6v1H3v-1zM5 11v8m4-8v8m6-8v8m4-8v8M3 21h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  hotel: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M3 21V8l9-4 9 4v13M9 21v-6h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  stethoscope: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M6 3v6a4 4 0 008 0V3M9 14c.5 4 3 6 6 6s5-2 5-5v-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="20" cy="9" r="2" stroke="currentColor" strokeWidth="1.6"/></svg>,
  bell: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M6 10a6 6 0 0112 0c0 6 2 7 2 7H4s2-1 2-7zM10 21h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/></svg>,
  eye: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/></svg>,
  grid: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/></svg>,
  chart: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M4 20V10m6 10V4m6 16v-6m6 6v-10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  team: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.6"/><circle cx="17" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5M14 19c0-2 1.5-4 4-4s3 1.5 3 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  cog: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/><path d="M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.5-2.4 1a7 7 0 00-2-1.2L14 3h-4l-.5 2.6a7 7 0 00-2 1.2L5 5.8l-2 3.5 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.5 2.4-1a7 7 0 002 1.2L10 21h4l.5-2.6a7 7 0 002-1.2l2.4 1 2-3.5-2-1.5c.1-.4.1-.8.1-1.2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  dot: () => <span style={{width:6,height:6,borderRadius:99,background:'currentColor',display:'inline-block'}}/>,
  signal: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M3 17v3M8 13v7M13 9v11M18 5v15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  clock: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  flag: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M5 21V4h12l-2 4 2 4H5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  download: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M12 4v12m-5-5l5 5 5-5M4 18v2h16v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  retry: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><path d="M4 12a8 8 0 0114-5l3-2v6h-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 12a8 8 0 01-14 5l-3 2v-6h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  share: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><circle cx="6" cy="12" r="2" stroke="currentColor" strokeWidth="1.6"/><circle cx="18" cy="6" r="2" stroke="currentColor" strokeWidth="1.6"/><circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="1.6"/><path d="M8 11l8-4M8 13l8 4" stroke="currentColor" strokeWidth="1.6"/></svg>,
  search: (p={}) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6"/><path d="M16 16l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
};

// ---------- Logo ----------
function Logo({size=22, showText=true}) {
  return (
    <div style={{display:'inline-flex',alignItems:'center',gap:9}}>
      <I.logo size={size}/>
      {showText && <span style={{fontWeight:700,fontSize:size*0.78,letterSpacing:'-0.02em',color:'var(--ink-0)'}}>
        Role<span className="rc-logo-grad">Call</span> <span style={{color:'var(--ink-2)',fontWeight:500,marginLeft:1}}>AI</span>
      </span>}
    </div>
  );
}

// ---------- Persona avatar ----------
// Stylized human-like illustration (not generic emoji)
function PersonaAvatar({persona='margaret', size=160, talking=false, mood='worried', halo=false}) {
  // Map presets
  const presets = {
    margaret: { hair:'#E8DDD0', skin:'#F4D7C2', shadow:'#D9A685', shirt:'#8AA9C7', accent:'#D8C7E6' },
    james:    { hair:'#2A2418', skin:'#E5C8AC', shadow:'#B98A66', shirt:'#1B2B45', accent:'#3A4F75' },
    elena:    { hair:'#3D2417', skin:'#E1B68F', shadow:'#A87752', shirt:'#9C5C3A', accent:'#C8854B' },
    david:    { hair:'#9C8B7A', skin:'#F0DCC5', shadow:'#C99E78', shirt:'#36465E', accent:'#5C7398' },
    aanya:    { hair:'#1B100A', skin:'#D8A878', shadow:'#9C6A40', shirt:'#7A2F4F', accent:'#A85275' },
    user:     { hair:'#3A2A1F', skin:'#E8C8A8', shadow:'#B2845E', shirt:'#1F4D54', accent:'#3FA6A0' },
  };
  const p = presets[persona] || presets.margaret;
  const w = size, h = size;
  // Background gradient based on mood
  const moodBg = {
    worried:  ['#0F2235','#1F3F5A'],
    angry:    ['#2A1216','#5A1F26'],
    neutral:  ['#1A1E33','#2C3454'],
    upbeat:   ['#1A2E2B','#205C52'],
    confused: ['#231833','#3D2A53'],
  }[mood] || ['#1A1E33','#2C3454'];

  return (
    <div style={{
      position:'relative', width:w, height:h, borderRadius: 'var(--r-3)',
      overflow:'hidden',
      background:`linear-gradient(160deg, ${moodBg[0]} 0%, ${moodBg[1]} 100%)`,
      boxShadow: halo ? 'var(--sh-glow-v)' : undefined,
    }}>
      {/* soft inner light */}
      <div style={{position:'absolute',inset:0,background:'radial-gradient(60% 50% at 50% 30%, rgba(255,255,255,0.12), transparent 60%)'}}/>
      <svg viewBox="0 0 200 200" width={w} height={h} style={{position:'absolute',inset:0}}>
        {/* shoulders */}
        <path d={`M10 200 C 20 160 70 145 100 145 C 130 145 180 160 190 200 Z`} fill={p.shirt}/>
        <path d={`M10 200 C 20 160 70 145 100 145 C 130 145 180 160 190 200 Z`} fill={p.accent} opacity="0.18"/>
        {/* neck */}
        <rect x="86" y="120" width="28" height="32" rx="8" fill={p.shadow}/>
        <rect x="86" y="120" width="28" height="22" rx="8" fill={p.skin}/>
        {/* head */}
        <ellipse cx="100" cy="92" rx="38" ry="44" fill={p.skin}/>
        {/* shadow on head */}
        <ellipse cx="100" cy="118" rx="38" ry="14" fill={p.shadow} opacity="0.45"/>
        {/* hair */}
        {persona === 'margaret' && (
          <g>
            <path d="M62 90 C 60 60 80 42 100 42 C 122 42 142 56 140 86 C 130 76 120 72 110 74 C 100 70 86 72 78 80 C 72 82 66 84 62 90 Z" fill={p.hair}/>
            <ellipse cx="100" cy="48" rx="36" ry="14" fill={p.hair} opacity="0.6"/>
          </g>
        )}
        {persona === 'james' && (
          <path d="M62 86 C 62 56 80 42 100 42 C 122 42 138 58 138 86 L 132 80 C 120 70 100 70 86 76 C 74 80 66 82 62 86 Z" fill={p.hair}/>
        )}
        {persona === 'elena' && (
          <g>
            <path d="M58 110 C 56 56 80 38 100 38 C 122 38 144 58 142 110 C 138 90 132 80 124 76 L 122 110 L 118 80 C 104 76 92 78 82 82 L 78 110 L 76 78 C 68 80 62 92 58 110 Z" fill={p.hair}/>
          </g>
        )}
        {persona === 'david' && (
          <path d="M64 86 C 66 64 82 50 100 52 C 116 50 134 64 136 86 C 130 78 120 76 110 76 C 96 74 80 78 64 86 Z" fill={p.hair}/>
        )}
        {persona === 'aanya' && (
          <g>
            <path d="M58 120 C 54 56 80 38 100 38 C 122 38 146 58 142 120 L 132 88 C 128 78 114 74 100 74 C 86 74 72 78 68 88 L 58 120 Z" fill={p.hair}/>
          </g>
        )}
        {persona === 'user' && (
          <path d="M64 84 C 64 60 80 46 100 46 C 120 46 136 60 136 84 C 128 76 116 72 100 72 C 84 72 72 76 64 84 Z" fill={p.hair}/>
        )}
        {/* eyes */}
        <g>
          {/* eye whites */}
          <ellipse cx="86" cy="92" rx="6" ry={mood==='worried'?2.2:2.8} fill="#fff"/>
          <ellipse cx="114" cy="92" rx="6" ry={mood==='worried'?2.2:2.8} fill="#fff"/>
          {/* iris */}
          <circle cx="86" cy="92" r="2.2" fill="#3a2a1a"/>
          <circle cx="114" cy="92" r="2.2" fill="#3a2a1a"/>
          {/* brows */}
          <path d={mood==='worried' ? "M78 82 L 92 86" : mood==='angry' ? "M78 86 L 92 82" : "M78 84 L 92 84"} stroke="#3a2a1a" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <path d={mood==='worried' ? "M122 86 L 108 82" : mood==='angry' ? "M122 82 L 108 86" : "M122 84 L 108 84"} stroke="#3a2a1a" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </g>
        {/* nose */}
        <path d="M100 96 Q 102 106 100 110 Q 98 112 98 113" stroke={p.shadow} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        {/* mouth */}
        {mood==='angry' ? (
          <path d="M88 122 Q 100 118 112 122" stroke="#5a1f1f" strokeWidth="2" fill="none" strokeLinecap="round"/>
        ) : mood==='upbeat' ? (
          <path d="M88 118 Q 100 128 112 118" stroke="#5a1f1f" strokeWidth="2" fill="none" strokeLinecap="round"/>
        ) : mood==='worried' ? (
          <path d="M90 122 Q 100 120 110 122" stroke="#5a1f1f" strokeWidth="2" fill="none" strokeLinecap="round"/>
        ) : (
          <path d="M90 121 L 110 121" stroke="#5a1f1f" strokeWidth="2" fill="none" strokeLinecap="round"/>
        )}
        {/* glasses for margaret */}
        {persona==='margaret' && (
          <g stroke="#2a2118" strokeWidth="1.4" fill="none">
            <circle cx="86" cy="92" r="10"/>
            <circle cx="114" cy="92" r="10"/>
            <path d="M96 92 L 104 92"/>
          </g>
        )}
        {/* talking indicator: subtle jaw line */}
        {talking && <ellipse cx="100" cy="125" rx="14" ry="3" fill="#5a1f1f" opacity="0.18"/>}
      </svg>
      {/* corner glow if talking */}
      {talking && (
        <div style={{
          position:'absolute', inset:-2, borderRadius:'var(--r-3)', pointerEvents:'none',
          boxShadow:'0 0 0 2px rgba(45,212,191,0.6), 0 0 24px rgba(45,212,191,0.35)',
          animation:'rc-pulse 1.6s ease-in-out infinite',
        }}/>
      )}
    </div>
  );
}

// ---------- Score ring ----------
function ScoreRing({value=78, size=120, thick=10, label, sub, color}) {
  const r = (size - thick)/2;
  const c = 2*Math.PI*r;
  const off = c - (value/100)*c;
  const grad = color || 'url(#scoregrad)';
  return (
    <div style={{position:'relative', width:size, height:size, display:'inline-block'}}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="scoregrad" x1="0" y1="0" x2={size} y2={size}>
            <stop offset="0" stopColor="#2DD4BF"/>
            <stop offset="0.6" stopColor="#4F7CFF"/>
            <stop offset="1" stopColor="#8B7DFB"/>
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={thick}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={grad} strokeWidth={thick}
                strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
                transform={`rotate(-90 ${size/2} ${size/2})`}/>
      </svg>
      <div style={{position:'absolute', inset:0, display:'grid', placeItems:'center'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize: size*0.32, fontWeight: 700, letterSpacing:'-0.03em', lineHeight: 1}}>{value}</div>
          {label && <div style={{fontSize:11, color:'var(--ink-2)', marginTop: 4, letterSpacing:'0.05em'}}>{label}</div>}
          {sub && <div style={{fontSize:10, color:'var(--ink-3)', marginTop: 2}}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

// ---------- Skill meter (horizontal bar) ----------
function SkillMeter({label, value, max=100, color, tone='violet'}) {
  const tones = {
    violet: ['#8B7DFB','#6E5BF0'],
    teal:   ['#2DD4BF','#0FB3A1'],
    blue:   ['#7BA1FF','#4F7CFF'],
    warn:   ['#FBBF24','#F59E0B'],
    bad:    ['#F87171','#DC2626'],
  };
  const [c1,c2] = tones[tone] || tones.violet;
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:6}}>
        <span style={{fontSize:12.5, color:'var(--ink-1)', fontWeight:500}}>{label}</span>
        <span style={{fontSize:13, fontWeight:600, color:'var(--ink-0)'}}>{value}</span>
      </div>
      <div style={{height:6, borderRadius:99, background:'rgba(255,255,255,0.06)', overflow:'hidden'}}>
        <div style={{
          height:'100%', width: `${(value/max)*100}%`, borderRadius:99,
          background:`linear-gradient(90deg, ${c1}, ${c2})`,
          boxShadow:`0 0 16px -2px ${c1}80`,
        }}/>
      </div>
    </div>
  );
}

// ---------- Waveform ----------
function Waveform({active=true, bars=48, tone='teal', height=44, dense=false}) {
  const colors = {
    teal:'#2DD4BF', violet:'#8B7DFB', blue:'#4F7CFF', warn:'#FBBF24',
  };
  const c = colors[tone] || colors.teal;
  return (
    <div style={{display:'flex',alignItems:'center',gap: dense?2:3, height}}>
      {Array.from({length:bars}).map((_,i)=>{
        // pseudo-random heights, stable
        const h = (Math.sin(i*0.7)*0.5 + Math.cos(i*1.3)*0.3 + 0.6) * 0.9 + 0.1;
        const delay = (i % 8) * 0.08;
        return (
          <div key={i} style={{
            width: dense?2:3, height: `${h*100}%`, minHeight: 3,
            borderRadius: 3,
            background: `linear-gradient(180deg, ${c}, ${c}aa)`,
            opacity: active ? 1 : 0.35,
            animation: active ? `rc-wave 1.${(i%9)+1}s ease-in-out ${delay}s infinite` : 'none',
            transformOrigin:'center',
          }}/>
        );
      })}
    </div>
  );
}

// ---------- Top navigation ----------
function TopNav({active='Dashboard', compact=false}) {
  const items = ['Simulations','Templates','Reports','Progress','Team','Settings'];
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding: compact ? '12px 22px' : '16px 28px',
      borderBottom:'1px solid var(--line)',
      background:'rgba(10,14,26,0.6)', backdropFilter:'blur(20px)',
      position:'relative', zIndex:5,
    }}>
      <div style={{display:'flex',alignItems:'center',gap:32}}>
        <Logo size={22}/>
        <nav style={{display:'flex',gap:4}}>
          {items.map(x => (
            <div key={x} style={{
              padding:'7px 12px', borderRadius:8, fontSize:13.5, fontWeight: x===active?600:500,
              color: x===active ? 'var(--ink-0)' : 'var(--ink-2)',
              background: x===active ? 'rgba(255,255,255,0.06)' : 'transparent',
              cursor:'pointer',
            }}>{x}</div>
          ))}
        </nav>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div className="rc-pill" style={{background:'rgba(45,212,191,0.08)',borderColor:'rgba(45,212,191,0.3)'}}>
          <span style={{width:6,height:6,borderRadius:99,background:'#2DD4BF',display:'inline-block'}}/>
          <span style={{color:'#5EEAD4'}}>Day 14 streak</span>
        </div>
        <button className="rc-btn ghost sm"><I.bell size={14}/></button>
        <button className="rc-btn ghost sm"><I.search size={14}/></button>
        <div style={{
          width:32,height:32,borderRadius:99, marginLeft:4,
          background:'linear-gradient(135deg,#2DD4BF,#8B7DFB)',
          display:'grid',placeItems:'center', color:'#06241F',
          fontSize:12, fontWeight:700,
        }}>AK</div>
      </div>
    </div>
  );
}

// ---------- Frame helper for an artboard screen ----------
function Frame({children, w=1440, h=900, shell=true}) {
  return (
    <div className="rc-root" style={{width:w, height:h, position:'relative'}}>
      {shell && <div className="rc-shell"/>}
      {shell && <div className="rc-grain"/>}
      <div style={{position:'relative', width:'100%', height:'100%', display:'flex',flexDirection:'column'}}>
        {children}
      </div>
    </div>
  );
}

// expose
Object.assign(window, {
  I, Logo, PersonaAvatar, ScoreRing, SkillMeter, Waveform, TopNav, Frame,
});
