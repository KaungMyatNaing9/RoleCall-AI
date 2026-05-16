// RoleCall AI — Live Video Call (hero) + Voice Call modes
/* global React, I, Logo, PersonaAvatar, ScoreRing, SkillMeter, Waveform, Frame */

// =====================================================================
// 6. LIVE WEB VIDEO CALL (THE HERO SCREEN)
// =====================================================================
function ScreenVideoCall() {
  return (
    <Frame shell={false}>
      {/* Solid dark room for call */}
      <div style={{position:'absolute',inset:0,background:'#06080F'}}/>
      {/* subtle vignette */}
      <div style={{position:'absolute',inset:0,background:'radial-gradient(120% 100% at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 100%)',pointerEvents:'none'}}/>

      {/* Top status bar */}
      <div style={{
        position:'relative', zIndex:5,
        display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'14px 22px', background:'rgba(0,0,0,0.55)', borderBottom:'1px solid var(--line)',
        backdropFilter:'blur(20px)',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <Logo size={20}/>
          <div style={{width:1,height:18,background:'var(--line)'}}/>
          <div className="rc-pill teal">
            <span style={{width:6,height:6,borderRadius:99,background:'#2DD4BF',display:'inline-block',animation:'rc-pulse 1.4s infinite'}}/>
            LIVE
          </div>
          <div style={{fontSize:13, fontWeight:500}}>Post-discharge patient · Margaret Lewis</div>
          <div style={{fontSize:12, color:'var(--ink-3)'}}>Healthcare · Medium</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {/* Scenario progress */}
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:11, color:'var(--ink-3)'}}>SCENARIO</span>
            <div style={{width:120, height:5, background:'rgba(255,255,255,0.08)', borderRadius:99, overflow:'hidden'}}>
              <div style={{width:'58%', height:'100%', background:'linear-gradient(90deg,#2DD4BF,#8B7DFB)'}}/>
            </div>
            <span style={{fontSize:11, fontWeight:500}} className="rc-mono">58%</span>
          </div>
          <div style={{width:1,height:18,background:'var(--line)'}}/>
          <div style={{display:'flex',alignItems:'center',gap:6, fontSize:13}} className="rc-mono">
            <I.clock size={12}/>
            <span style={{color:'#5EEAD4'}}>03:24</span>
            <span style={{color:'var(--ink-3)'}}>/ 05:00</span>
          </div>
        </div>
      </div>

      <div style={{flex:1, display:'grid', gridTemplateColumns:'1fr 360px', minHeight:0}}>
        {/* Main video area */}
        <div style={{position:'relative', display:'flex', flexDirection:'column'}}>
          {/* Persona main tile */}
          <div style={{position:'relative', flex:1, padding:'22px 22px 0', minHeight:0}}>
            <div style={{
              position:'relative', width:'100%', height:'100%',
              borderRadius:18, overflow:'hidden',
              background:'linear-gradient(160deg, #1A2540 0%, #0A1226 60%, #0E1A2C 100%)',
              boxShadow:'0 30px 80px -20px rgba(0,0,0,0.6)',
            }}>
              {/* Persona avatar centered */}
              <div style={{position:'absolute', inset:0, display:'grid', placeItems:'center'}}>
                <div style={{transform:'scale(2.6)'}}>
                  <PersonaAvatar persona="margaret" size={200} mood="worried" talking/>
                </div>
              </div>

              {/* Top-left persona info */}
              <div style={{position:'absolute', top:16, left:16, display:'flex', flexDirection:'column', gap:8}}>
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:10,
                  padding:'8px 14px', background:'rgba(0,0,0,0.55)',
                  border:'1px solid var(--line-2)', borderRadius:12, backdropFilter:'blur(20px)',
                }}>
                  <PersonaAvatar persona="margaret" size={34} mood="worried"/>
                  <div>
                    <div style={{fontSize:13.5, fontWeight:600}}>Margaret Lewis</div>
                    <div style={{fontSize:11, color:'var(--ink-2)'}}>Patient · 72</div>
                  </div>
                </div>
                <div style={{display:'flex', gap:6}}>
                  <div className="rc-pill warn">
                    <span style={{width:6,height:6,borderRadius:99,background:'#FCD34D',display:'inline-block'}}/>
                    Worried
                  </div>
                  <div className="rc-pill">Polite</div>
                </div>
              </div>

              {/* Speaking now indicator */}
              <div style={{
                position:'absolute', bottom:16, left:16,
                display:'inline-flex', alignItems:'center', gap:10,
                padding:'8px 14px', background:'rgba(0,0,0,0.55)',
                border:'1px solid var(--line-2)', borderRadius:12, backdropFilter:'blur(20px)',
              }}>
                <span style={{width:8,height:8,borderRadius:99,background:'#2DD4BF',animation:'rc-pulse 1s infinite'}}/>
                <span style={{fontSize:12, color:'#5EEAD4', fontWeight:500}}>Speaking</span>
                <Waveform tone="teal" bars={16} height={14} dense/>
              </div>

              {/* Current line caption */}
              <div style={{
                position:'absolute', bottom:16, left:'50%', transform:'translateX(-50%)',
                maxWidth:'70%', padding:'12px 18px',
                background:'rgba(0,0,0,0.65)', borderRadius:14,
                border:'1px solid var(--line-2)', backdropFilter:'blur(20px)',
                fontSize:14.5, lineHeight:1.5, fontStyle:'italic',
                textAlign:'center',
              }}>
                "…and after I got home I just felt this <span style={{background:'rgba(248,113,113,0.25)',padding:'1px 5px',borderRadius:4,fontStyle:'normal',color:'#FCA5A5',fontWeight:500}}>tightness in my chest</span>, but I wasn't sure if it was from the surgery or…"
              </div>

              {/* Right-side critical moment toast */}
              <div style={{
                position:'absolute', top:16, right:16, width:280,
                padding:'12px 14px', borderRadius:12,
                background:'linear-gradient(180deg, rgba(248,113,113,0.18), rgba(248,113,113,0.06))',
                border:'1px solid rgba(248,113,113,0.5)',
                boxShadow:'0 0 30px -5px rgba(248,113,113,0.4)',
                backdropFilter:'blur(20px)',
                animation:'rc-floaty 3s ease-in-out infinite',
              }}>
                <div style={{display:'flex',alignItems:'center',gap:8, marginBottom:6}}>
                  <div style={{width:22,height:22,borderRadius:6,background:'rgba(248,113,113,0.25)',display:'grid',placeItems:'center',color:'#FCA5A5'}}>
                    <I.warn size={12}/>
                  </div>
                  <div style={{fontSize:12, fontWeight:600, color:'#FCA5A5', letterSpacing:'0.02em'}}>CRITICAL MOMENT DETECTED</div>
                </div>
                <div style={{fontSize:12.5, lineHeight:1.5, color:'var(--ink-0)'}}>
                  Patient revealed a potential red flag. Consider acknowledging and escalating before continuing.
                </div>
              </div>

              {/* User self-view tile (PIP) */}
              <div style={{
                position:'absolute', bottom:14, right:14, width:200, height:140,
                borderRadius:14, overflow:'hidden', border:'1px solid var(--line-2)',
                background:'linear-gradient(160deg, #1A2540 0%, #0E1A2C 100%)',
                boxShadow:'0 12px 30px -8px rgba(0,0,0,0.5)',
              }}>
                <div style={{position:'absolute',inset:0,display:'grid',placeItems:'center'}}>
                  <div style={{transform:'scale(0.95)'}}>
                    <PersonaAvatar persona="user" size={140} mood="neutral"/>
                  </div>
                </div>
                {/* face landmark overlay (subtle) */}
                <svg viewBox="0 0 200 140" style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',opacity:0.55}}>
                  <g stroke="rgba(45,212,191,0.6)" strokeWidth="0.8" fill="none">
                    <ellipse cx="100" cy="68" rx="34" ry="42"/>
                  </g>
                  {[[88,58],[112,58],[100,75],[90,90],[110,90]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="1.5" fill="#2DD4BF"/>)}
                </svg>
                {/* you label */}
                <div style={{position:'absolute',top:8,left:8, fontSize:10, padding:'2px 7px', background:'rgba(0,0,0,0.55)', borderRadius:6}}>
                  You
                </div>
                {/* mic */}
                <div style={{position:'absolute',top:8,right:8, width:18, height:18, background:'rgba(0,0,0,0.55)', borderRadius:6, display:'grid', placeItems:'center', color:'#5EEAD4'}}>
                  <I.mic size={10}/>
                </div>
                {/* trainee live overlays */}
                <div style={{
                  position:'absolute', bottom:0, left:0, right:0,
                  padding:'6px 8px', background:'linear-gradient(0deg, rgba(0,0,0,0.8), transparent)',
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  fontSize:10,
                }}>
                  <span style={{color:'#5EEAD4'}} className="rc-mono">EYE 62%</span>
                  <span style={{color:'#FCD34D'}} className="rc-mono">PACE FAST</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom controls bar */}
          <div style={{padding:'18px 22px 22px', display:'flex', justifyContent:'center'}}>
            <div style={{
              display:'flex', alignItems:'center', gap:8,
              padding:'10px 14px', background:'rgba(0,0,0,0.6)',
              border:'1px solid var(--line-2)', borderRadius:18,
              backdropFilter:'blur(20px)',
              boxShadow:'0 14px 40px -10px rgba(0,0,0,0.7)',
            }}>
              <CtrlBtn icon={<I.mic size={18}/>} label="Mute"/>
              <CtrlBtn icon={<I.cam size={18}/>} label="Camera"/>
              <CtrlBtn icon={<I.hint size={18}/>} label="Hint" tone="violet"/>
              <CtrlBtn icon={<I.bookmark size={18}/>} label="Mark"/>
              <CtrlBtn icon={<I.pause size={18}/>} label="Pause"/>
              <div style={{width:1, height:32, background:'var(--line)'}}/>
              <CtrlBtn icon={<I.retry size={18}/>} label="Reset"/>
              <CtrlBtn icon={<I.warn size={18}/>} label="Emergency stop" tone="amber"/>
              <button className="rc-btn danger" style={{padding:'10px 16px', borderRadius:14, marginLeft:6}}>
                <I.phone size={16}/> End call
              </button>
            </div>
          </div>
        </div>

        {/* Right coaching panel */}
        <div style={{
          background:'rgba(10,14,26,0.7)', borderLeft:'1px solid var(--line)',
          display:'flex', flexDirection:'column', minHeight:0, backdropFilter:'blur(20px)',
        }}>
          {/* Tabs */}
          <div style={{padding:'14px 16px 0', borderBottom:'1px solid var(--line)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <div className="rc-label">Coaching</div>
              <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:'#5EEAD4'}}>
                <I.sparkle size={10}/> Coach Mode
                <div style={{width:28,height:16,borderRadius:99,background:'linear-gradient(90deg,#2DD4BF,#8B7DFB)',position:'relative'}}>
                  <div style={{position:'absolute',top:1,left:13,width:14,height:14,borderRadius:99,background:'#fff'}}/>
                </div>
              </div>
            </div>
            <div style={{display:'flex',gap:2}}>
              {['Live Notes','Transcript','Rubric','Signals','Hints'].map((t,i)=>(
                <div key={t} style={{
                  padding:'8px 11px', fontSize:12, fontWeight: i===0?600:500,
                  color: i===0?'var(--ink-0)':'var(--ink-2)',
                  borderBottom: i===0?'2px solid #8B7DFB':'2px solid transparent',
                  marginBottom:-1, cursor:'pointer',
                }}>{t}</div>
              ))}
            </div>
          </div>

          {/* Live notes area */}
          <div style={{flex:1, padding:'14px 16px', overflow:'hidden', display:'flex', flexDirection:'column', gap:12, minHeight:0}}>
            {/* Suggested next action (highest priority) */}
            <div style={{
              padding:'12px 14px', borderRadius:12,
              background:'linear-gradient(180deg, rgba(248,113,113,0.16), rgba(248,113,113,0.04))',
              border:'1px solid rgba(248,113,113,0.5)',
              boxShadow:'var(--sh-glow-t)', position:'relative',
            }}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <I.warn size={12}/>
                <div style={{fontSize:10.5, fontWeight:600, color:'#FCA5A5', letterSpacing:'0.05em'}}>SUGGESTED RESPONSE · NOW</div>
              </div>
              <div style={{fontSize:13, lineHeight:1.5, color:'var(--ink-0)', fontStyle:'italic'}}>
                "Because you mentioned chest tightness after surgery, I need to connect you with urgent clinical support right now."
              </div>
              <div style={{display:'flex',gap:6,marginTop:10}}>
                <button className="rc-btn sm" style={{flex:1,justifyContent:'center'}}>Dismiss</button>
                <button className="rc-btn sm primary" style={{flex:1,justifyContent:'center'}}>Use phrasing</button>
              </div>
            </div>

            {/* Live notes stream */}
            <div style={{flex:1, overflow:'hidden', display:'flex', flexDirection:'column', gap:9, minHeight:0}}>
              {[
                {t:'03:18', c:'warn', i:<I.warn size={10}/>, m:'Patient mentioned dizziness 30 seconds ago — circle back.'},
                {t:'03:01', c:'ok', i:<I.check size={10}/>, m:'Good clarifying question on medication timing.'},
                {t:'02:42', c:'violet', i:<I.sparkle size={10}/>, m:'Consider summarizing what you\'ve heard so far.'},
                {t:'02:28', c:'ok', i:<I.heart size={10}/>, m:'Strong empathy ("I hear how scary that must feel").'},
                {t:'02:05', c:'warn', i:<I.ear size={10}/>, m:'Avoid interrupting — let the patient finish.'},
                {t:'01:48', c:'info', i:<I.hint size={10}/>, m:'Try open questions: "What\'s been worrying you most?"'},
              ].map((n,i)=>(
                <div key={i} style={{display:'flex',gap:9,fontSize:12,lineHeight:1.5}}>
                  <div style={{fontSize:10, color:'var(--ink-3)', width:32, paddingTop:2}} className="rc-mono">{n.t}</div>
                  <div style={{
                    width:18,height:18,borderRadius:99,flexShrink:0,
                    background: n.c==='ok'?'rgba(52,211,153,0.18)':n.c==='warn'?'rgba(251,191,36,0.18)':n.c==='violet'?'rgba(139,125,251,0.18)':'rgba(79,124,255,0.18)',
                    color: n.c==='ok'?'#6EE7B7':n.c==='warn'?'#FCD34D':n.c==='violet'?'#B5ACFD':'#93B4FF',
                    display:'grid',placeItems:'center',
                  }}>{n.i}</div>
                  <div style={{flex:1, color:'var(--ink-1)'}}>{n.m}</div>
                </div>
              ))}
            </div>

            {/* Bottom signals strip */}
            <div style={{
              borderTop:'1px solid var(--line)', paddingTop:12, marginTop:'auto',
            }}>
              <div className="rc-label" style={{marginBottom:10, display:'flex', justifyContent:'space-between'}}>
                <span>Nonverbal signals</span>
                <span style={{fontSize:10, color:'var(--ink-3)', textTransform:'none', letterSpacing:'normal'}}>coaching estimates</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <Signal label="Eye contact" v={62} tone="warn"/>
                <Signal label="Pace" v={78} tone="warn" raw="168 wpm"/>
                <Signal label="Engagement" v={84} tone="ok"/>
                <Signal label="Turn-taking" v={71} tone="violet"/>
              </div>
              <div style={{display:'flex',gap:14,fontSize:10.5,color:'var(--ink-3)',marginTop:10}} className="rc-mono">
                <span>3 interruptions</span>
                <span>·</span>
                <span>4 clarifiers</span>
                <span>·</span>
                <span>12 fillers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating transcript dock at very bottom-left */}
      <div style={{
        position:'absolute', bottom:104, left:22, width:380,
        padding:'12px 14px', borderRadius:14,
        background:'rgba(0,0,0,0.6)', border:'1px solid var(--line-2)',
        backdropFilter:'blur(20px)', boxShadow:'0 12px 30px -10px rgba(0,0,0,0.6)',
      }}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <div className="rc-label" style={{fontSize:9.5}}>Live transcript</div>
          <div style={{display:'flex',gap:4}}>
            <div className="rc-pill" style={{fontSize:10}}><I.dot/> Auto-scroll</div>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:7,fontSize:12}}>
          {[
            {who:'Patient', t:'03:11', c:'#FCD34D', m:'I\'m not sure if I should take both pills at the same time…'},
            {who:'You', t:'03:18', c:'#5EEAD4', m:'I understand. Let me check that with you. How are you feeling otherwise?'},
            {who:'Patient', t:'03:24', c:'#FCD34D', m:'Well, after I got home I just felt this tightness in my chest…', live:true},
          ].map((l,i)=>(
            <div key={i} style={{display:'flex',gap:8, opacity: i===2 ? 1 : 0.85}}>
              <span style={{fontSize:10, color:'var(--ink-3)', width:32, flexShrink:0, paddingTop:1}} className="rc-mono">{l.t}</span>
              <span style={{color:l.c, fontWeight:500, width:54, flexShrink:0, fontSize:11.5}}>{l.who}:</span>
              <span style={{color:'var(--ink-1)', lineHeight:1.4}}>
                {l.m}
                {l.live && <span style={{display:'inline-block',width:2,height:12,background:'#5EEAD4',marginLeft:2,verticalAlign:'middle',animation:'rc-blink 1s infinite'}}/>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function CtrlBtn({icon, label, tone}) {
  const toneStyle = tone==='violet' ? {background:'rgba(139,125,251,0.18)',color:'#B5ACFD',borderColor:'rgba(139,125,251,0.4)'}
                  : tone==='amber'  ? {background:'rgba(251,191,36,0.14)',color:'#FCD34D',borderColor:'rgba(251,191,36,0.35)'}
                  : {};
  return (
    <button style={{
      display:'flex',flexDirection:'column',alignItems:'center',gap:3,
      padding:'8px 12px', minWidth:62,
      background:'rgba(255,255,255,0.04)', border:'1px solid var(--line)',
      borderRadius:12, color:'var(--ink-0)', cursor:'pointer',
      transition:'background .15s',
      ...toneStyle,
    }}>
      {icon}
      <span style={{fontSize:10}}>{label}</span>
    </button>
  );
}

function Signal({label, v, tone='violet', raw}) {
  const colors = {ok:'#6EE7B7', warn:'#FCD34D', bad:'#FCA5A5', violet:'#B5ACFD', teal:'#5EEAD4'};
  return (
    <div style={{padding:'8px 10px', background:'rgba(255,255,255,0.03)', border:'1px solid var(--line)', borderRadius:8}}>
      <div style={{fontSize:10, color:'var(--ink-3)', marginBottom:3, textTransform:'uppercase', letterSpacing:'0.04em'}}>{label}</div>
      <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between'}}>
        <span style={{fontSize:15, fontWeight:600, color:colors[tone]}} className="rc-mono">{raw || `${v}%`}</span>
        <div style={{display:'flex',gap:2}}>
          {[1,2,3,4,5].map(i=>(
            <div key={i} style={{
              width:3,height:8+i*1.5,borderRadius:1,
              background: i <= Math.round(v/20) ? colors[tone] : 'rgba(255,255,255,0.1)',
            }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 7. PHONE / VOICE CALL MODE
// =====================================================================
function ScreenVoiceCall() {
  return (
    <Frame shell={false}>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg, #0A0E1A 0%, #1A1232 100%)'}}/>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(80% 60% at 50% 30%, rgba(139,125,251,0.15), transparent 70%)'}}/>

      {/* top status bar */}
      <div style={{
        position:'relative', zIndex:5,
        display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'14px 22px', background:'rgba(0,0,0,0.4)', borderBottom:'1px solid var(--line)',
        backdropFilter:'blur(20px)',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <Logo size={20}/>
          <div className="rc-pill warn">
            <span style={{width:6,height:6,borderRadius:99,background:'#FCD34D',display:'inline-block',animation:'rc-pulse 1.4s infinite'}}/>
            VOICE CALL
          </div>
          <div style={{fontSize:13}}>Bank verification · Scam awareness drill</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <div className="rc-pill"><I.shield size={11}/>Hard difficulty</div>
          <div className="rc-pill"><I.clock size={11}/>02:18 / 04:00</div>
        </div>
      </div>

      <div style={{flex:1, display:'grid', gridTemplateColumns:'1fr 380px', minHeight:0}}>
        {/* Center voice tile */}
        <div style={{position:'relative', display:'flex',flexDirection:'column',padding:'30px 22px', minHeight:0}}>
          <div style={{flex:1, display:'grid', placeItems:'center', position:'relative', minHeight:0}}>
            {/* Animated rings around avatar */}
            <div style={{position:'relative', display:'grid', placeItems:'center'}}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  position:'absolute', width:220+i*60, height:220+i*60, borderRadius:99,
                  border:`1px solid rgba(139,125,251,${0.25/i})`,
                  animation:`rc-pulse ${1.5+i*0.4}s ease-in-out infinite ${i*0.2}s`,
                }}/>
              ))}
              {/* Avatar */}
              <div style={{
                width:220, height:220, borderRadius:99, overflow:'hidden',
                boxShadow:'0 0 0 6px rgba(139,125,251,0.18), 0 30px 60px -10px rgba(139,125,251,0.4)',
              }}>
                <PersonaAvatar persona="aanya" size={220} mood="neutral" talking/>
              </div>
            </div>

            {/* Name underneath, positioned in flow space below */}
            <div style={{position:'absolute', bottom:60, left:0, right:0, textAlign:'center'}}>
              <div style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em'}}>"Sarah from Verification Team"</div>
              <div style={{fontSize:13, color:'var(--ink-2)', marginTop:6}}>Unknown caller · Bank scam simulation</div>
              <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:10}}>
                <div className="rc-pill warn">friendly</div>
                <div className="rc-pill bad">manipulative</div>
                <div className="rc-pill">persistent</div>
              </div>
            </div>
          </div>

          {/* Waveform */}
          <div style={{
            padding:'18px 22px', background:'rgba(0,0,0,0.35)', borderRadius:16,
            border:'1px solid var(--line)', marginBottom:18, display:'flex', alignItems:'center', gap:18,
          }}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{width:8,height:8,borderRadius:99,background:'#8B7DFB',animation:'rc-pulse 1s infinite'}}/>
              <span style={{fontSize:12,color:'#B5ACFD',fontWeight:600}}>Caller speaking</span>
            </div>
            <div style={{flex:1}}>
              <Waveform tone="violet" bars={80} height={36}/>
            </div>
            <span style={{fontSize:12, color:'var(--ink-2)'}} className="rc-mono">−12 dB</span>
          </div>

          {/* Bottom controls */}
          <div style={{display:'flex', justifyContent:'center', gap:10}}>
            <CtrlBtn icon={<I.mic size={18}/>} label="Mute"/>
            <CtrlBtn icon={<I.hint size={18}/>} label="Hint" tone="violet"/>
            <CtrlBtn icon={<I.bookmark size={18}/>} label="Mark"/>
            <CtrlBtn icon={<I.flag size={18}/>} label="Escalate" tone="amber"/>
            <CtrlBtn icon={<I.retry size={18}/>} label="Restart"/>
            <button className="rc-btn danger" style={{padding:'10px 18px', borderRadius:14}}>
              <I.phone size={16}/> End call
            </button>
          </div>
        </div>

        {/* Right — coaching/transcript */}
        <div style={{
          background:'rgba(10,14,26,0.7)', borderLeft:'1px solid var(--line)',
          display:'flex', flexDirection:'column', minHeight:0,
        }}>
          {/* Rubric progress */}
          <div style={{padding:'14px 16px', borderBottom:'1px solid var(--line)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div className="rc-label">Rubric progress</div>
              <div className="rc-pill ok">3 of 5</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:7}}>
              {[
                {n:'Skepticism / questioning', s:'done'},
                {n:'Identity verification refused', s:'done'},
                {n:'OTP request refused', s:'done'},
                {n:'Bank callback offer', s:'todo'},
                {n:'Report to authority', s:'todo'},
              ].map(r => (
                <div key={r.n} style={{display:'flex',alignItems:'center',gap:8,fontSize:12}}>
                  <div style={{
                    width:16,height:16,borderRadius:99,display:'grid',placeItems:'center',flexShrink:0,
                    background: r.s==='done'?'linear-gradient(135deg,#2DD4BF,#8B7DFB)':'transparent',
                    border: r.s==='done'?'none':'1px solid var(--line-2)',
                    color:'#06241F',
                  }}>{r.s==='done' && <I.check size={10}/>}</div>
                  <span style={{color: r.s==='done'?'var(--ink-1)':'var(--ink-2)'}}>{r.n}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transcript */}
          <div style={{flex:1, padding:'14px 16px', overflow:'hidden', minHeight:0, display:'flex', flexDirection:'column'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div className="rc-label">Live transcript</div>
              <div className="rc-pill"><I.dot/>Recording</div>
            </div>
            <div style={{flex:1, overflow:'hidden', display:'flex', flexDirection:'column', gap:10}}>
              {[
                {who:'Caller', c:'#B5ACFD', t:'01:42', m:'I just need the 6-digit code your bank just texted you to verify.'},
                {who:'You', c:'#5EEAD4', t:'01:51', m:'Banks don\'t ask for those codes by phone. Can you give me a case number?', tag:'ok'},
                {who:'Caller', c:'#B5ACFD', t:'02:02', m:'I assure you we\'re calling from your bank\'s fraud department.'},
                {who:'You', c:'#5EEAD4', t:'02:10', m:'I\'ll hang up and call the number on the back of my card to verify.', tag:'ok'},
                {who:'Caller', c:'#B5ACFD', t:'02:16', m:'That\'s really not necessary, this is time-sensitive...', live:true},
              ].map((l,i)=>(
                <div key={i} style={{padding:'8px 10px', background:'rgba(255,255,255,0.02)', borderRadius:8, borderLeft: l.tag==='ok'?'2px solid #6EE7B7':'2px solid transparent'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
                    <span style={{fontSize:11, color:l.c, fontWeight:600}}>{l.who}</span>
                    <span style={{fontSize:10, color:'var(--ink-3)'}} className="rc-mono">{l.t}</span>
                  </div>
                  <div style={{fontSize:12, color:'var(--ink-1)', lineHeight:1.5}}>
                    {l.m}
                    {l.live && <span style={{display:'inline-block',width:2,height:12,background:'#B5ACFD',marginLeft:2,verticalAlign:'middle',animation:'rc-blink 1s infinite'}}/>}
                  </div>
                  {l.tag==='ok' && (
                    <div style={{fontSize:10, color:'#6EE7B7', marginTop:4, display:'flex', alignItems:'center', gap:4}}>
                      <I.check size={9}/> Strong refusal — protected verification
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* live coaching footer */}
          <div style={{
            padding:'12px 16px', borderTop:'1px solid var(--line)',
            background:'linear-gradient(180deg, rgba(139,125,251,0.10), rgba(139,125,251,0.02))',
          }}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
              <I.sparkle size={11}/>
              <div style={{fontSize:10.5, fontWeight:600, color:'#B5ACFD', letterSpacing:'0.05em'}}>COACH HINT</div>
            </div>
            <div style={{fontSize:12.5, color:'var(--ink-1)', lineHeight:1.5}}>
              Notice the urgency cue ("time-sensitive"). It's a pressure tactic — stick to your callback plan.
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

Object.assign(window, { ScreenVideoCall, ScreenVoiceCall });
