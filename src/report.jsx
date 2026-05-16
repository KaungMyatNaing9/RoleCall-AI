// RoleCall AI — Post-call Report + Progress Analytics
/* global React, I, Logo, PersonaAvatar, ScoreRing, SkillMeter, Waveform, TopNav, Frame */

// =====================================================================
// 10. POST-CALL REPORT
// =====================================================================
function ScreenReport() {
  return (
    <Frame>
      <TopNav active="Reports" compact/>
      <div style={{flex:1, padding:'20px 28px', overflow:'hidden', display:'flex', flexDirection:'column', gap:18}}>
        {/* Header summary */}
        <div className="rc-glass-2" style={{padding:'20px 22px', position:'relative', overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,background:'radial-gradient(60% 60% at 100% 0%, rgba(139,125,251,0.2), transparent 60%)',pointerEvents:'none'}}/>
          <div style={{position:'relative', display:'grid', gridTemplateColumns:'auto 1fr auto', gap:24, alignItems:'center'}}>
            <ScoreRing value={78} size={108} thick={9} label="Overall" sub="/ 100"/>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <div className="rc-pill teal"><I.video size={10}/>Web video</div>
                <div className="rc-pill"><I.stethoscope size={10}/>Healthcare</div>
                <div className="rc-pill warn">Medium</div>
                <div className="rc-pill"><I.clock size={10}/>5:42</div>
              </div>
              <div style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em'}}>Post-discharge patient · Margaret Lewis</div>
              <div style={{fontSize:14, color:'var(--ink-1)', marginTop:8, maxWidth:720, lineHeight:1.5}}>
                <strong style={{color:'#6EE7B7'}}>Good foundation</strong>, needs stronger escalation. You showed strong empathy and a calm tone, but missed a critical escalation moment when the patient mentioned chest tightness.
              </div>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end'}}>
              <div style={{display:'flex',gap:8}}>
                <button className="rc-btn ghost"><I.share size={13}/>Share</button>
                <button className="rc-btn ghost"><I.download size={13}/>Export</button>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="rc-btn"><I.retry size={13}/>Retry same</button>
                <button className="rc-btn primary"><I.sparkle size={13}/>Practice weak skill</button>
              </div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div style={{flex:1, display:'grid', gridTemplateColumns:'1.3fr 1fr', gap:18, minHeight:0}}>
          {/* LEFT — Timeline + transcript */}
          <div style={{display:'flex', flexDirection:'column', gap:14, minHeight:0}}>
            {/* Key moments timeline */}
            <div className="rc-glass" style={{padding:18}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <div className="rc-label">Key moments · 6 markers</div>
                <div style={{display:'flex',gap:10,fontSize:11,color:'var(--ink-2)'}}>
                  <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:8,height:8,borderRadius:99,background:'#6EE7B7'}}/>Strong</span>
                  <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:8,height:8,borderRadius:99,background:'#FCD34D'}}/>Improve</span>
                  <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:8,height:8,borderRadius:99,background:'#FCA5A5'}}/>Missed risk</span>
                  <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:8,height:8,borderRadius:99,background:'#93B4FF'}}/>Good question</span>
                </div>
              </div>
              {/* Timeline */}
              <div style={{position:'relative', height:44, marginBottom:14}}>
                <div style={{position:'absolute', left:0, right:0, top:18, height:3, background:'rgba(255,255,255,0.06)', borderRadius:99}}>
                  <div style={{position:'absolute', left:0, top:0, bottom:0, width:'72%', background:'linear-gradient(90deg,#2DD4BF,#8B7DFB)', borderRadius:99, opacity:0.5}}/>
                </div>
                {[
                  {p:7, c:'#6EE7B7', t:'00:42'},
                  {p:22, c:'#FCD34D', t:'01:18'},
                  {p:36, c:'#FCA5A5', t:'02:05'},
                  {p:47, c:'#FCA5A5', t:'02:41', big:true, sel:true},
                  {p:49, c:'#FCA5A5', t:'02:45'},
                  {p:58, c:'#93B4FF', t:'03:20'},
                  {p:80, c:'#6EE7B7', t:'04:30'},
                ].map((m,i)=>(
                  <div key={i} style={{
                    position:'absolute', left:`${m.p}%`, top:m.big?12:14, transform:'translateX(-50%)',
                    width:m.big?16:12, height:m.big?16:12, borderRadius:99,
                    background:m.c, border:m.sel?'3px solid white':'2px solid #0A0E1A',
                    boxShadow:m.sel?`0 0 16px ${m.c}`:'none',
                    cursor:'pointer', transition:'transform .15s',
                  }}/>
                ))}
                {/* time labels */}
                <div style={{position:'absolute',top:30,left:0,right:0,display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--ink-3)'}} className="rc-mono">
                  <span>00:00</span><span>01:30</span><span>03:00</span><span>04:30</span><span>05:42</span>
                </div>
              </div>

              {/* Selected moment detail */}
              <div style={{
                padding:'14px 16px', borderRadius:12,
                background:'linear-gradient(180deg, rgba(248,113,113,0.10), rgba(248,113,113,0.02))',
                border:'1px solid rgba(248,113,113,0.4)',
              }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <I.warn size={14}/>
                    <span style={{fontSize:13, fontWeight:600, color:'#FCA5A5'}}>02:41 · Escalation opportunity missed</span>
                  </div>
                  <div className="rc-pill bad">High impact · −12 pts</div>
                </div>
                <div style={{padding:'10px 12px', borderRadius:8, background:'rgba(0,0,0,0.3)', fontSize:13, lineHeight:1.5, fontStyle:'italic', color:'var(--ink-1)', marginBottom:10, borderLeft:'2px solid #FCA5A5'}}>
                  <span style={{color:'#FCD34D',fontWeight:600, fontStyle:'normal', marginRight:6}}>Margaret:</span>
                  "…and I felt this tightness in my chest, but I wasn't sure if it was from the surgery."
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, fontSize:12.5, lineHeight:1.5}}>
                  <div>
                    <div style={{color:'#FCA5A5', fontWeight:600, fontSize:11, marginBottom:4, letterSpacing:'0.05em'}}>WHY IT MATTERED</div>
                    <div style={{color:'var(--ink-1)'}}>Chest tightness after surgery is a red flag for cardiac or pulmonary complications. The conversation should have shifted to immediate triage.</div>
                  </div>
                  <div>
                    <div style={{color:'#6EE7B7', fontWeight:600, fontSize:11, marginBottom:4, letterSpacing:'0.05em'}}>BETTER RESPONSE</div>
                    <div style={{color:'var(--ink-1)', fontStyle:'italic'}}>"Because you mentioned chest tightness after surgery, I need to connect you with urgent clinical support right away."</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transcript review */}
            <div className="rc-glass" style={{padding:18, flex:1, minHeight:0, display:'flex', flexDirection:'column'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <div className="rc-label">Transcript · annotated</div>
                <div style={{display:'flex',gap:6}}>
                  <div className="rc-tabs">
                    <div className="rc-tab active">All</div>
                    <div className="rc-tab">Highlights</div>
                    <div className="rc-tab">Missed</div>
                  </div>
                </div>
              </div>
              <div style={{flex:1, overflow:'hidden', display:'flex', flexDirection:'column', gap:10, minHeight:0}}>
                {[
                  {who:'You', t:'00:42', m:'I can hear this has been a worrying time. Let me help you through this step by step.', tag:'strong', tagL:'Strong empathy'},
                  {who:'Margaret', t:'01:05', m:'I just got home yesterday and they gave me so many bottles…'},
                  {who:'You', t:'01:18', m:'Got it, let me know which pill you\'re asking about.', tag:'improve', tagL:'Missed clarifying question — was she dizzy?'},
                  {who:'Margaret', t:'02:05', m:'I\'ve been a little dizzy, but I think it\'s just from the surgery.'},
                  {who:'Margaret', t:'02:41', m:'…and I felt this tightness in my chest, but I wasn\'t sure if it was from the surgery.', tag:'risk', tagL:'Critical red flag mentioned'},
                  {who:'You', t:'02:45', m:'Okay, and were you taking the white pill in the morning or evening?', tag:'risk', tagL:'Missed escalation — continued with medication question'},
                  {who:'You', t:'03:20', m:'Can you tell me where the tightness was and when it started?', tag:'question', tagL:'Good clarifying question (slightly late)'},
                ].map((l,i)=>{
                  const tagStyle = l.tag==='strong'?{bg:'rgba(52,211,153,0.10)', border:'rgba(52,211,153,0.45)', label:'#6EE7B7'}
                                : l.tag==='improve'?{bg:'rgba(251,191,36,0.10)', border:'rgba(251,191,36,0.45)', label:'#FCD34D'}
                                : l.tag==='risk'?   {bg:'rgba(248,113,113,0.10)', border:'rgba(248,113,113,0.45)', label:'#FCA5A5'}
                                : l.tag==='question'?{bg:'rgba(79,124,255,0.10)', border:'rgba(79,124,255,0.45)', label:'#93B4FF'}
                                : null;
                  return (
                    <div key={i} style={{
                      padding:'10px 12px', borderRadius:10,
                      background: tagStyle ? tagStyle.bg : 'rgba(255,255,255,0.02)',
                      border: tagStyle ? `1px solid ${tagStyle.border}` : '1px solid var(--line)',
                    }}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                        <span style={{fontSize:11, fontWeight:600, color: l.who==='You'?'#5EEAD4':'#FCD34D'}}>{l.who}</span>
                        <span style={{fontSize:10, color:'var(--ink-3)'}} className="rc-mono">{l.t}</span>
                      </div>
                      <div style={{fontSize:13, color:'var(--ink-1)', lineHeight:1.5}}>{l.m}</div>
                      {tagStyle && (
                        <div style={{fontSize:11, color:tagStyle.label, marginTop:6, display:'flex',alignItems:'center',gap:5}}>
                          <span style={{width:5,height:5,borderRadius:99,background:tagStyle.label}}/>
                          {l.tagL}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT — Scorecards + insights */}
          <div style={{display:'flex', flexDirection:'column', gap:14, minHeight:0, overflow:'hidden'}}>
            {/* Scorecards */}
            <div className="rc-glass" style={{padding:18}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <div className="rc-label">Skill scores</div>
                <div className="rc-pill ok"><I.arrow size={10}/>+6 vs last</div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <ScoreTile l="Empathy" v={86} tone="teal"/>
                <ScoreTile l="Clarity" v={80} tone="blue"/>
                <ScoreTile l="Active listening" v={74} tone="violet"/>
                <ScoreTile l="Safety / escalation" v={58} tone="bad" hot/>
                <ScoreTile l="Professionalism" v={84} tone="teal"/>
                <ScoreTile l="Turn-taking" v={76} tone="violet"/>
                <ScoreTile l="Video presence" v={71} tone="violet"/>
                <ScoreTile l="Pace control" v={68} tone="warn"/>
              </div>
            </div>

            {/* Multimodal insights */}
            <div className="rc-glass" style={{padding:18}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <div className="rc-label">Multimodal insights</div>
                <div style={{display:'flex',gap:6}}>
                  <div className="rc-pill"><I.video size={10}/>Video</div>
                  <div className="rc-pill"><I.mic size={10}/>Audio</div>
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10}}>
                {[
                  {l:'Eye-contact estimate', v:'62%', t:'steady', tone:'warn'},
                  {l:'Speaking pace', v:'164 wpm', t:'slightly fast', tone:'warn'},
                  {l:'Facial engagement', v:'consistent', tone:'ok'},
                  {l:'Camera presence', v:'centered', tone:'ok'},
                  {l:'Filler words', v:'12', t:'um, like, you know', tone:'warn'},
                  {l:'Interruptions', v:'3', tone:'warn'},
                  {l:'Avg response', v:'18s', tone:'ok'},
                  {l:'Longest pause', v:'4.2s', tone:'ok'},
                ].map(x => (
                  <div key={x.l} style={{padding:'8px 10px', background:'rgba(255,255,255,0.03)', borderRadius:8, border:'1px solid var(--line)'}}>
                    <div style={{fontSize:10, color:'var(--ink-3)', letterSpacing:'0.04em', textTransform:'uppercase'}}>{x.l}</div>
                    <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginTop:3}}>
                      <span style={{fontSize:14, fontWeight:600, color: x.tone==='ok'?'#6EE7B7':x.tone==='warn'?'#FCD34D':'#FCA5A5'}} className="rc-mono">{x.v}</span>
                      {x.t && <span style={{fontSize:10, color:'var(--ink-3)'}}>{x.t}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                padding:'8px 11px', borderRadius:8, fontSize:11, lineHeight:1.5,
                background:'rgba(79,124,255,0.06)', border:'1px solid rgba(79,124,255,0.25)', color:'var(--ink-2)',
              }}>
                These are coaching signals, not emotion or truth detection. Use them to notice patterns.
              </div>
            </div>

            {/* Coach feedback */}
            <div className="rc-glass-2" style={{padding:18, flex:1, minHeight:0, display:'flex', flexDirection:'column', position:'relative', overflow:'hidden'}}>
              <div style={{position:'absolute',inset:0,background:'radial-gradient(60% 60% at 100% 100%, rgba(45,212,191,0.15), transparent 60%)',pointerEvents:'none'}}/>
              <div style={{position:'relative', display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <div className="rc-label" style={{display:'flex',alignItems:'center',gap:6}}><I.sparkle size={11}/>Coach feedback</div>
                <div className="rc-pill teal">Coach Agent</div>
              </div>
              <div style={{position:'relative', flex:1, overflow:'hidden', display:'flex', flexDirection:'column', gap:12}}>
                <div>
                  <div style={{fontSize:11.5, color:'#6EE7B7', fontWeight:600, marginBottom:5, letterSpacing:'0.04em', textTransform:'uppercase'}}>What you did well</div>
                  <div style={{fontSize:12.5, color:'var(--ink-1)', lineHeight:1.55}}>
                    Strong empathy, calm tone throughout, and a respectful pace that suited an older patient. Your opening line ("I can hear this has been a worrying time") set a warm anchor.
                  </div>
                </div>
                <div>
                  <div style={{fontSize:11.5, color:'#FCA5A5', fontWeight:600, marginBottom:5, letterSpacing:'0.04em', textTransform:'uppercase'}}>What you missed</div>
                  <div style={{fontSize:12.5, color:'var(--ink-1)', lineHeight:1.55}}>
                    When Margaret mentioned chest tightness at 02:41, you continued with medication questions for 39 seconds instead of escalating immediately. This is the highest-impact moment of the call.
                  </div>
                </div>
                <div>
                  <div style={{fontSize:11.5, color:'#B5ACFD', fontWeight:600, marginBottom:5, letterSpacing:'0.04em', textTransform:'uppercase'}}>Try next</div>
                  <div style={{
                    padding:'10px 12px', borderRadius:10, fontSize:12.5, lineHeight:1.5,
                    background:'rgba(139,125,251,0.10)', border:'1px solid rgba(139,125,251,0.35)', color:'var(--ink-1)',
                  }}>
                    <strong style={{color:'#B5ACFD'}}>3-minute red-flag escalation drill</strong> · A harder variant where Margaret reveals symptoms earlier and tries to deflect.
                  </div>
                </div>
              </div>
              <button className="rc-btn primary" style={{marginTop:12, justifyContent:'center'}}>
                <I.sparkle size={13}/> Generate escalation drill
              </button>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function ScoreTile({l, v, tone, hot}) {
  const colors = {ok:'#6EE7B7', warn:'#FCD34D', bad:'#FCA5A5', violet:'#B5ACFD', teal:'#5EEAD4', blue:'#93B4FF'};
  const c = colors[tone] || colors.violet;
  return (
    <div style={{
      padding:'12px 13px', borderRadius:10,
      background: hot ? 'linear-gradient(180deg, rgba(248,113,113,0.10), rgba(248,113,113,0.02))' : 'rgba(255,255,255,0.03)',
      border: hot ? '1px solid rgba(248,113,113,0.45)' : '1px solid var(--line)',
      position:'relative',
    }}>
      {hot && <div style={{position:'absolute', top:8, right:8, fontSize:9, color:'#FCA5A5', fontWeight:600, letterSpacing:'0.05em'}}>FOCUS</div>}
      <div style={{fontSize:11, color:'var(--ink-3)', letterSpacing:'0.03em', textTransform:'uppercase'}}>{l}</div>
      <div style={{display:'flex', alignItems:'baseline', gap:4, marginTop:4}}>
        <span style={{fontSize:24, fontWeight:700, color:c, letterSpacing:'-0.02em'}}>{v}</span>
        <span style={{fontSize:11, color:'var(--ink-3)'}}>/100</span>
      </div>
      <div style={{height:3, marginTop:6, background:'rgba(255,255,255,0.06)', borderRadius:99, overflow:'hidden'}}>
        <div style={{height:'100%', width:`${v}%`, background:c, opacity:0.8}}/>
      </div>
    </div>
  );
}

// =====================================================================
// 11. PROGRESS ANALYTICS
// =====================================================================
function ScreenProgress() {
  return (
    <Frame>
      <TopNav active="Progress" compact/>
      <div style={{flex:1, padding:'22px 28px', overflow:'hidden', display:'flex', flexDirection:'column', gap:16}}>
        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
          <div>
            <div className="rc-label" style={{marginBottom:4}}>30-day progress</div>
            <h1 className="rc-h-1" style={{margin:0}}>Your communication is sharpening</h1>
            <div style={{fontSize:13.5, color:'var(--ink-2)', marginTop:4}}>
              <span style={{color:'#6EE7B7'}}>+8 readiness</span> · 14 sessions · 3 weak skills tracked
            </div>
          </div>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <div className="rc-tabs">
              <div className="rc-tab">7d</div>
              <div className="rc-tab active">30d</div>
              <div className="rc-tab">90d</div>
              <div className="rc-tab">All</div>
            </div>
            <button className="rc-btn ghost"><I.download size={13}/>Export</button>
          </div>
        </div>

        {/* Top KPI row */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12}}>
          {[
            {l:'Readiness', v:78, d:'+8', tone:'teal'},
            {l:'Empathy', v:82, d:'+5', tone:'teal'},
            {l:'Escalation', v:68, d:'+11', tone:'warn', hot:true},
            {l:'Confidence', v:74, d:'+4', tone:'violet'},
            {l:'Video presence', v:71, d:'+2', tone:'violet'},
          ].map(k => (
            <div key={k.l} className="rc-glass" style={{padding:14, position:'relative'}}>
              {k.hot && <div style={{position:'absolute', top:8, right:10, fontSize:9, color:'#FCD34D', fontWeight:600, letterSpacing:'0.05em'}}>BIGGEST GAIN</div>}
              <div style={{fontSize:11, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.04em'}}>{k.l}</div>
              <div style={{display:'flex',alignItems:'baseline',gap:6,marginTop:6}}>
                <span style={{fontSize:30,fontWeight:700,letterSpacing:'-0.025em'}}>{k.v}</span>
                <span style={{fontSize:11.5, color:'#6EE7B7', fontWeight:600}}>↑ {k.d}</span>
              </div>
              {/* mini sparkline */}
              <svg viewBox="0 0 100 24" width="100%" height="24" style={{marginTop:4}}>
                <path d={`M 0 20 L 12 18 L 24 16 L 36 17 L 48 12 L 60 10 L 72 8 L 84 6 L 100 4`}
                      fill="none" stroke={k.tone==='teal'?'#2DD4BF':k.tone==='warn'?'#FBBF24':'#8B7DFB'} strokeWidth="1.5"/>
              </svg>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{flex:1, display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:16, minHeight:0}}>
          {/* Score over time + radar */}
          <div style={{display:'grid', gridTemplateRows:'1.2fr 1fr', gap:14, minHeight:0}}>
            {/* Big trend chart */}
            <div className="rc-glass" style={{padding:18, position:'relative'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <div className="rc-label">Skill trends</div>
                <div style={{display:'flex',gap:14,fontSize:11}}>
                  <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:8,height:2,background:'#8B7DFB'}}/>Readiness</span>
                  <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:8,height:2,background:'#2DD4BF'}}/>Empathy</span>
                  <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:8,height:2,background:'#FBBF24'}}/>Escalation</span>
                  <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:8,height:2,background:'#4F7CFF'}}/>Clarity</span>
                </div>
              </div>
              <svg viewBox="0 0 600 220" width="100%" height="100%" preserveAspectRatio="none" style={{minHeight:200}}>
                <defs>
                  <linearGradient id="pgrad" x1="0" y1="0" x2="0" y2="220">
                    <stop offset="0" stopColor="#8B7DFB" stopOpacity="0.25"/>
                    <stop offset="1" stopColor="#8B7DFB" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {/* gridlines + y labels */}
                {[20,50,80].map((y,i) => (
                  <g key={i}>
                    <line x1="30" x2="600" y1={20+i*60} y2={20+i*60} stroke="rgba(255,255,255,0.05)"/>
                    <text x="6" y={24+i*60} fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="JetBrains Mono">{100-i*30}</text>
                  </g>
                ))}
                {/* Readiness (main) */}
                <path d="M 30 130 L 90 122 L 150 110 L 210 108 L 270 96 L 330 84 L 390 76 L 450 62 L 510 54 L 600 48 L 600 220 L 30 220 Z" fill="url(#pgrad)"/>
                <path d="M 30 130 L 90 122 L 150 110 L 210 108 L 270 96 L 330 84 L 390 76 L 450 62 L 510 54 L 600 48"
                      fill="none" stroke="#8B7DFB" strokeWidth="2.5" strokeLinejoin="round"/>
                {/* Empathy */}
                <path d="M 30 96 L 90 92 L 150 84 L 210 80 L 270 76 L 330 72 L 390 64 L 450 58 L 510 50 L 600 36"
                      fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinejoin="round"/>
                {/* Escalation */}
                <path d="M 30 160 L 90 158 L 150 154 L 210 148 L 270 142 L 330 130 L 390 122 L 450 110 L 510 96 L 600 84"
                      fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinejoin="round" strokeDasharray="4 3"/>
                {/* Clarity */}
                <path d="M 30 110 L 90 108 L 150 100 L 210 96 L 270 92 L 330 86 L 390 80 L 450 76 L 510 68 L 600 60"
                      fill="none" stroke="#4F7CFF" strokeWidth="2" strokeLinejoin="round"/>
                {/* end dots */}
                <circle cx="600" cy="48" r="4" fill="#8B7DFB"/>
                <circle cx="600" cy="36" r="3" fill="#2DD4BF"/>
                <circle cx="600" cy="84" r="3" fill="#FBBF24"/>
                <circle cx="600" cy="60" r="3" fill="#4F7CFF"/>
              </svg>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--ink-3)',marginTop:4,paddingLeft:30}} className="rc-mono">
                <span>Apr 16</span><span>Apr 23</span><span>Apr 30</span><span>May 7</span><span>May 14</span>
              </div>
            </div>

            {/* Mistake pattern + Most improved */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14, minHeight:0}}>
              <div className="rc-glass" style={{padding:16, overflow:'hidden'}}>
                <div className="rc-label" style={{marginBottom:10}}>Most common mistakes</div>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {[
                    {n:'Missed escalation', c:6, max:14, tone:'bad'},
                    {n:'Too many filler words', c:5, max:14, tone:'warn'},
                    {n:'Weak closing summary', c:4, max:14, tone:'warn'},
                    {n:'Interrupted caller', c:3, max:14, tone:'warn'},
                    {n:'Did not verify identity', c:2, max:14, tone:'warn'},
                  ].map(m => (
                    <div key={m.n} style={{display:'flex',alignItems:'center',gap:10,fontSize:12}}>
                      <span style={{flex:1, color:'var(--ink-1)'}}>{m.n}</span>
                      <div style={{width:80, height:5, background:'rgba(255,255,255,0.06)', borderRadius:99, overflow:'hidden'}}>
                        <div style={{height:'100%', width:`${(m.c/m.max)*100}%`, background: m.tone==='bad'?'#F87171':'#FBBF24'}}/>
                      </div>
                      <span style={{fontSize:11, color:'var(--ink-3)', width:34, textAlign:'right'}} className="rc-mono">{m.c} / 14</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rc-glass" style={{padding:16, overflow:'hidden'}}>
                <div className="rc-label" style={{marginBottom:10}}>Most improved</div>
                <div style={{display:'flex',flexDirection:'column',gap:9}}>
                  {[
                    {n:'Escalation', d:'+11'},
                    {n:'De-escalation phrases', d:'+9'},
                    {n:'Empathy', d:'+5'},
                    {n:'STAR specificity', d:'+5'},
                    {n:'Pace control', d:'+3'},
                  ].map(m => (
                    <div key={m.n} style={{display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:12.5}}>
                      <span style={{color:'var(--ink-1)'}}>{m.n}</span>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <I.arrow size={12}/>
                        <span style={{color:'#6EE7B7', fontWeight:600}} className="rc-mono">{m.d}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column — Radar + Recommendations */}
          <div style={{display:'flex',flexDirection:'column',gap:14, minHeight:0}}>
            {/* Skill radar */}
            <div className="rc-glass" style={{padding:18, position:'relative'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <div className="rc-label">Skill radar</div>
                <div style={{display:'flex',gap:12,fontSize:10.5}}>
                  <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:8,height:8,borderRadius:99,background:'#8B7DFB'}}/>Now</span>
                  <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:8,height:8,borderRadius:99,background:'#2DD4BF',opacity:0.5}}/>30d ago</span>
                </div>
              </div>
              <SkillRadar/>
            </div>

            {/* Recommendations */}
            <div className="rc-glass" style={{padding:18, flex:1, minHeight:0, display:'flex', flexDirection:'column', overflow:'hidden'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <div className="rc-label">Recommended next</div>
                <div className="rc-pill violet"><I.sparkle size={10}/>From Coach Agent</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:10, flex:1, overflow:'hidden'}}>
                {[
                  {p:'margaret', n:'Red-flag escalation drill', d:'Margaret reveals symptoms earlier and deflects.', why:'Lowest score: escalation 58', tone:'bad'},
                  {p:'aanya', n:'Refund · interrupting customer', d:'Customer talks over you constantly.', why:'Turn-taking has plateaued', tone:'warn'},
                  {p:'james', n:'Behavioral · STAR specificity', d:'Recruiter pushes for concrete examples.', why:'Strongest growth area', tone:'violet'},
                ].map(r => (
                  <div key={r.n} style={{
                    display:'flex',gap:11,alignItems:'flex-start',
                    padding:'10px 11px', borderRadius:10, cursor:'pointer',
                    background:'rgba(255,255,255,0.03)', border:'1px solid var(--line)',
                  }}>
                    <PersonaAvatar persona={r.p} size={44}/>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:13, fontWeight:600}}>{r.n}</div>
                      <div style={{fontSize:11.5, color:'var(--ink-2)', marginTop:2, lineHeight:1.4}}>{r.d}</div>
                      <div style={{fontSize:10.5, color: r.tone==='bad'?'#FCA5A5':r.tone==='warn'?'#FCD34D':'#B5ACFD', marginTop:5, display:'flex',alignItems:'center',gap:4}}>
                        <I.sparkle size={9}/> {r.why}
                      </div>
                    </div>
                    <button className="rc-btn sm primary" style={{flexShrink:0}}><I.arrow size={11}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function SkillRadar() {
  const axes = ['Empathy','Clarity','Listen','Escalation','Pace','Eye contact','Confidence','Pro.'];
  const cur = [82,80,74,68,72,62,74,84];
  const old = [77,72,70,57,65,55,70,80];
  const cx=140, cy=140, r=100;
  const n = axes.length;
  const pt = (val,i) => {
    const a = (Math.PI*2*i)/n - Math.PI/2;
    const rad = (val/100)*r;
    return [cx+Math.cos(a)*rad, cy+Math.sin(a)*rad];
  };
  const poly = (arr) => arr.map((v,i)=>pt(v,i).join(',')).join(' ');
  return (
    <svg viewBox="0 0 280 280" width="100%" height="220">
      {/* concentric */}
      {[0.25,0.5,0.75,1].map(s => (
        <polygon key={s} points={axes.map((_,i)=>{
          const a=(Math.PI*2*i)/n - Math.PI/2;
          return [cx+Math.cos(a)*r*s, cy+Math.sin(a)*r*s].join(',');
        }).join(' ')} fill="none" stroke="rgba(255,255,255,0.06)"/>
      ))}
      {/* axes */}
      {axes.map((_,i) => {
        const [x,y] = pt(100,i);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.06)"/>;
      })}
      {/* old */}
      <polygon points={poly(old)} fill="rgba(45,212,191,0.12)" stroke="#2DD4BF" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6"/>
      {/* current */}
      <polygon points={poly(cur)} fill="rgba(139,125,251,0.22)" stroke="#8B7DFB" strokeWidth="2"/>
      {/* dots on current */}
      {cur.map((v,i)=>{
        const [x,y] = pt(v,i);
        return <circle key={i} cx={x} cy={y} r="3" fill="#8B7DFB"/>;
      })}
      {/* labels */}
      {axes.map((l,i)=>{
        const a=(Math.PI*2*i)/n - Math.PI/2;
        const lx = cx+Math.cos(a)*(r+18);
        const ly = cy+Math.sin(a)*(r+18) + 3;
        return <text key={i} x={lx} y={ly} fontSize="10" fill="rgba(255,255,255,0.7)" textAnchor="middle">{l}</text>;
      })}
    </svg>
  );
}

Object.assign(window, { ScreenReport, ScreenProgress });
