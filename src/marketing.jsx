// RoleCall AI — Landing, Dashboard, Templates
/* global React, Logo, I, PersonaAvatar, ScoreRing, SkillMeter, Waveform, TopNav, Frame */

const { useState: useStateM } = React;

// =====================================================================
// 1. LANDING PAGE
// =====================================================================
function ScreenLanding() {
  return (
    <Frame>
      {/* Marketing nav */}
      <div style={{
        display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'20px 56px', position:'relative', zIndex:5,
      }}>
        <Logo/>
        <nav style={{display:'flex',gap:6}}>
          {['Product','Solutions','Templates','Pricing','Docs'].map(x => (
            <div key={x} style={{padding:'7px 14px',fontSize:13.5,color:'var(--ink-1)',cursor:'pointer'}}>{x}</div>
          ))}
        </nav>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <button className="rc-btn ghost sm">Sign in</button>
          <button className="rc-btn primary sm">Start free</button>
        </div>
      </div>

      {/* Hero */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, padding:'40px 56px 0', alignItems:'center', flex:1}}>
        <div>
          <div className="rc-pill violet" style={{marginBottom:24}}>
            <I.sparkle size={12}/> <span>Multi-agent communication training</span>
          </div>
          <h1 className="rc-h-display" style={{margin:0, fontSize:72}}>
            Practice the<br/>
            <span className="rc-logo-grad">conversations</span><br/>
            that matter before<br/>
            they happen.
          </h1>
          <p style={{fontSize:18, color:'var(--ink-1)', maxWidth:520, lineHeight:1.55, marginTop:24}}>
            Generate realistic AI callers, patients, customers, interviewers, and clients —
            then practice by voice or video and receive instant, structured coaching feedback.
          </p>
          <div style={{display:'flex', gap:12, marginTop:32}}>
            <button className="rc-btn primary lg"><I.video size={16}/> Start Simulation</button>
            <button className="rc-btn lg"><I.play size={12}/> View Demo Report</button>
          </div>
          <div style={{display:'flex',gap:24,marginTop:36,color:'var(--ink-2)',fontSize:12.5}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}><I.shield size={14}/> SOC 2 · HIPAA-ready</div>
            <div style={{display:'flex',alignItems:'center',gap:8}}><I.check size={14}/> No card required</div>
            <div style={{display:'flex',alignItems:'center',gap:8}}><I.team size={14}/> 1-click team setup</div>
          </div>
        </div>

        {/* Right — split mock */}
        <div style={{position:'relative', height: 480}}>
          {/* Back video call tile */}
          <div className="rc-glass-2" style={{
            position:'absolute', left:0, top:18, width:380, height:360,
            padding:14, borderRadius:18,
          }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div className="rc-pill teal">
                <span style={{width:6,height:6,borderRadius:99,background:'#2DD4BF',display:'inline-block',animation:'rc-pulse 1.4s infinite'}}/>
                LIVE · 02:14
              </div>
              <div className="rc-pill">Healthcare</div>
            </div>
            <div style={{position:'relative', borderRadius:14, overflow:'hidden', height: 230, background:'#0F1424'}}>
              <PersonaAvatar persona="margaret" size={306} talking mood="worried"/>
              <div style={{position:'absolute', top:10, left:10}} className="rc-pill">
                <I.user size={10}/> Margaret L. · Patient
              </div>
              <div style={{position:'absolute',bottom:10,left:10,right:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{background:'rgba(0,0,0,0.55)',padding:'5px 10px',borderRadius:8,fontSize:11}}>
                  <span style={{color:'var(--ink-2)'}}>Mood</span> <span style={{color:'#FCD34D'}}>· worried</span>
                </div>
                <Waveform tone="teal" bars={20} height={20} dense/>
              </div>
            </div>
            <div style={{marginTop:10, display:'flex', alignItems:'center', gap:8}}>
              <div className="rc-pill"><I.mic size={11}/> Trainee</div>
              <Waveform tone="violet" bars={26} height={18} dense/>
              <span style={{fontSize:11,color:'var(--ink-3)'}} className="rc-mono">62%</span>
            </div>
          </div>

          {/* Front coaching dashboard */}
          <div className="rc-glass-2" style={{
            position:'absolute', right:0, bottom:0, width:380, height:380,
            padding:18, borderRadius:18,
          }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div>
                <div className="rc-label">Live coaching · session</div>
                <div style={{fontSize:15,fontWeight:600,marginTop:2}}>Post-discharge call</div>
              </div>
              <ScoreRing value={78} size={64} thick={6} label="LIVE"/>
            </div>
            <div style={{display:'grid',gap:10}}>
              <SkillMeter label="Empathy" value={86} tone="teal"/>
              <SkillMeter label="Clarity" value={80} tone="blue"/>
              <SkillMeter label="Active listening" value={74} tone="violet"/>
              <SkillMeter label="Safety / escalation" value={58} tone="warn"/>
            </div>
            <div style={{
              marginTop:14, padding:'10px 12px',
              background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.3)',
              borderRadius:10, display:'flex', alignItems:'flex-start', gap:10,
            }}>
              <div style={{color:'#FCD34D',marginTop:1}}><I.warn size={14}/></div>
              <div style={{fontSize:12, lineHeight:1.4}}>
                <div style={{fontWeight:600,color:'#FCD34D',marginBottom:2}}>Critical moment</div>
                <div style={{color:'var(--ink-1)'}}>Patient mentioned chest tightness. Consider escalating before continuing.</div>
              </div>
            </div>
            <div style={{marginTop:10,fontSize:11.5,color:'var(--ink-2)',display:'flex',gap:14}} className="rc-mono">
              <span>168 wpm</span><span>3 interruptions</span><span>4 clarifiers</span><span>62% eye</span>
            </div>
          </div>

          {/* Decorative floaters */}
          <div style={{position:'absolute',top:0,right:120,fontSize:11,color:'var(--ink-3)',fontFamily:'var(--font-mono)'}}>
            <div className="rc-pill violet" style={{boxShadow:'var(--sh-glow-v)'}}>
              <I.sparkle size={10}/> Coach Agent · suggested next line
            </div>
          </div>
        </div>
      </div>

      {/* Feature row */}
      <div style={{padding:'40px 56px 28px', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14}}>
        {[
          {icon:<I.user size={18}/>, t:'Generate Personas', d:'Create patients, customers, interviewers, clients, or scammers from a prompt or document.', tone:'violet'},
          {icon:<I.video size={18}/>, t:'Practice by Voice or Video', d:'Phone-style calls, browser voice calls, or full video call simulations.', tone:'teal'},
          {icon:<I.signal size={18}/>, t:'Multimodal Feedback', d:'Review transcript, tone, pace, interruptions, eye-contact estimate, and nonverbal cues.', tone:'blue'},
          {icon:<I.chart size={18}/>, t:'Improve Over Time', d:'Track readiness, weak areas, and progress across repeated practice sessions.', tone:'violet'},
        ].map((f,i) => (
          <div key={i} className="rc-glass" style={{padding:'18px 18px 20px'}}>
            <div style={{
              width:36,height:36,borderRadius:10,display:'grid',placeItems:'center',
              background: f.tone==='teal' ? 'rgba(45,212,191,0.12)' : f.tone==='blue' ? 'rgba(79,124,255,0.14)' : 'rgba(139,125,251,0.14)',
              color: f.tone==='teal' ? '#5EEAD4' : f.tone==='blue' ? '#93B4FF' : '#B5ACFD',
              marginBottom:14,
            }}>{f.icon}</div>
            <div style={{fontSize:15, fontWeight:600, marginBottom:6}}>{f.t}</div>
            <div style={{fontSize:13, color:'var(--ink-2)', lineHeight:1.5}}>{f.d}</div>
          </div>
        ))}
      </div>

      {/* Industry strip */}
      <div style={{padding:'0 56px 28px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <div className="rc-label">Built for every conversation</div>
          <div style={{fontSize:12,color:'var(--ink-3)'}}>7 industries · 80+ template scenarios</div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:10}}>
          {[
            {n:'Healthcare', i:<I.stethoscope size={16}/>, c:'rgba(45,212,191,0.18)', tc:'#5EEAD4'},
            {n:'Customer Service', i:<I.heart size={16}/>, c:'rgba(248,113,113,0.18)', tc:'#FCA5A5'},
            {n:'Sales', i:<I.chart size={16}/>, c:'rgba(79,124,255,0.18)', tc:'#93B4FF'},
            {n:'Interviews', i:<I.briefcase size={16}/>, c:'rgba(139,125,251,0.18)', tc:'#B5ACFD'},
            {n:'Education', i:<I.book size={16}/>, c:'rgba(251,191,36,0.18)', tc:'#FCD34D'},
            {n:'Finance', i:<I.bank size={16}/>, c:'rgba(110,231,183,0.18)', tc:'#A7F3D0'},
            {n:'Hospitality', i:<I.hotel size={16}/>, c:'rgba(244,114,182,0.18)', tc:'#F9A8D4'},
          ].map(x => (
            <div key={x.n} className="rc-glass" style={{padding:'14px', textAlign:'center'}}>
              <div style={{width:30,height:30,borderRadius:8,margin:'0 auto 8px',background:x.c,color:x.tc,display:'grid',placeItems:'center'}}>{x.i}</div>
              <div style={{fontSize:12.5, fontWeight:500}}>{x.n}</div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

// =====================================================================
// 2. DASHBOARD
// =====================================================================
function ScreenDashboard() {
  return (
    <Frame>
      <TopNav active="Simulations"/>
      <div style={{flex:1, padding:'28px 28px 0', display:'grid', gridTemplateColumns: '1fr 360px', gap:24, overflow:'hidden'}}>
        {/* LEFT */}
        <div style={{display:'flex',flexDirection:'column',gap:20, minWidth:0}}>
          {/* Header */}
          <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
            <div>
              <div className="rc-label" style={{marginBottom:6}}>Welcome back, Alex</div>
              <h1 className="rc-h-1" style={{margin:0}}>Ready for your next conversation?</h1>
              <div style={{fontSize:13.5,color:'var(--ink-2)',marginTop:6}}>
                You're 2 sessions away from completing the post-discharge escalation track.
              </div>
            </div>
            <button className="rc-btn primary lg"><I.sparkle size={14}/> Start a new simulation</button>
          </div>

          {/* Quick start row */}
          <div>
            <div className="rc-label" style={{marginBottom:10}}>Quick start</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:10}}>
              {[
                {n:'Healthcare patient', i:<I.stethoscope size={16}/>, c:'rgba(45,212,191,0.14)', tc:'#5EEAD4'},
                {n:'Angry customer', i:<I.heart size={16}/>, c:'rgba(248,113,113,0.14)', tc:'#FCA5A5'},
                {n:'HR interview', i:<I.briefcase size={16}/>, c:'rgba(139,125,251,0.14)', tc:'#B5ACFD'},
                {n:'Sales objection', i:<I.chart size={16}/>, c:'rgba(79,124,255,0.14)', tc:'#93B4FF'},
                {n:'Scam defense', i:<I.shield size={16}/>, c:'rgba(251,191,36,0.14)', tc:'#FCD34D'},
                {n:'Custom persona', i:<I.sparkle size={16}/>, c:'rgba(139,125,251,0.14)', tc:'#B5ACFD', dashed:true},
              ].map(x => (
                <div key={x.n} className="rc-glass" style={{
                  padding:'14px 12px', cursor:'pointer',
                  ...(x.dashed ? {borderStyle:'dashed', borderColor:'rgba(139,125,251,0.4)'}:{})
                }}>
                  <div style={{width:32,height:32,borderRadius:8,marginBottom:10,background:x.c,color:x.tc,display:'grid',placeItems:'center'}}>{x.i}</div>
                  <div style={{fontSize:12.5,fontWeight:500}}>{x.n}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Readiness + Recent sessions row */}
          <div style={{display:'grid', gridTemplateColumns:'320px 1fr', gap:16, minHeight:0}}>
            {/* Readiness */}
            <div className="rc-glass" style={{padding:18}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <div className="rc-label">Communication readiness</div>
                <div style={{fontSize:11,color:'var(--ok)'}}>↑ 4 this week</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:18}}>
                <ScoreRing value={76} size={90} thick={8} label="Overall"/>
                <div style={{flex:1,fontSize:12,color:'var(--ink-2)',lineHeight:1.5}}>
                  Strongest in <span style={{color:'#5EEAD4'}}>empathy</span>. Practice <span style={{color:'#FCD34D'}}>escalation</span> to break 80.
                </div>
              </div>
              <div style={{display:'grid',gap:10}}>
                <SkillMeter label="Clarity" value={82} tone="blue"/>
                <SkillMeter label="Empathy" value={76} tone="teal"/>
                <SkillMeter label="Escalation" value={68} tone="warn"/>
                <SkillMeter label="Confidence" value={74} tone="violet"/>
                <SkillMeter label="Video presence" value={71} tone="violet"/>
              </div>
            </div>

            {/* Recent sessions */}
            <div className="rc-glass" style={{padding:18, display:'flex', flexDirection:'column', minHeight:0}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <div className="rc-label">Recent sessions</div>
                <div style={{fontSize:12,color:'var(--ink-2)',cursor:'pointer'}}>View all →</div>
              </div>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead>
                  <tr style={{color:'var(--ink-3)',fontSize:11,textAlign:'left',letterSpacing:'0.05em'}}>
                    <th style={{padding:'6px 0',fontWeight:500}}>SCENARIO</th>
                    <th style={{padding:'6px 0',fontWeight:500}}>MODE</th>
                    <th style={{padding:'6px 0',fontWeight:500}}>SCORE</th>
                    <th style={{padding:'6px 0',fontWeight:500}}>IMPROVEMENT AREA</th>
                    <th style={{padding:'6px 0',fontWeight:500,textAlign:'right'}}>WHEN</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {s:'Post-discharge patient (Margaret)', m:'video', mc:'#5EEAD4', mi:<I.video size={11}/>, sc:78, area:'Escalation timing', when:'Just now', live:true},
                    {s:'Refund-demanding customer', m:'voice', mc:'#B5ACFD', mi:<I.mic size={11}/>, sc:71, area:'De-escalation phrases', when:'Yesterday'},
                    {s:'SWE intern recruiter mock', m:'video', mc:'#5EEAD4', mi:<I.video size={11}/>, sc:84, area:'STAR specificity', when:'2d ago'},
                    {s:'Bank verification scam', m:'phone', mc:'#FCD34D', mi:<I.phone size={11}/>, sc:92, area:'—', when:'3d ago'},
                    {s:'Parent-teacher · low grade', m:'video', mc:'#5EEAD4', mi:<I.video size={11}/>, sc:69, area:'Active listening', when:'5d ago'},
                  ].map((r,i)=>(
                    <tr key={i} style={{borderTop:'1px solid var(--line)'}}>
                      <td style={{padding:'11px 0'}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          {r.live && <span style={{width:6,height:6,borderRadius:99,background:'#2DD4BF',animation:'rc-pulse 1.4s infinite'}}/>}
                          <span style={{fontWeight: r.live ? 600 : 500}}>{r.s}</span>
                        </div>
                      </td>
                      <td style={{padding:'11px 0'}}>
                        <div className="rc-pill" style={{color:r.mc, borderColor:r.mc+'55'}}>{r.mi} {r.m}</div>
                      </td>
                      <td style={{padding:'11px 0'}}>
                        <span style={{
                          fontWeight:600, color: r.sc>=80?'#6EE7B7':r.sc>=70?'#FCD34D':'#FCA5A5',
                        }}>{r.sc}</span>
                        <span style={{color:'var(--ink-3)',marginLeft:2}}>/100</span>
                      </td>
                      <td style={{padding:'11px 0', color:'var(--ink-1)'}}>{r.area}</td>
                      <td style={{padding:'11px 0', color:'var(--ink-3)', textAlign:'right'}}>{r.when}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{display:'flex',flexDirection:'column',gap:16, minHeight:0}}>
          {/* Continue training plan */}
          <div className="rc-glass-2" style={{padding:18, position:'relative', overflow:'hidden'}}>
            <div style={{position:'absolute',inset:0,background:'radial-gradient(60% 80% at 100% 0%, rgba(139,125,251,0.25), transparent 60%)',pointerEvents:'none'}}/>
            <div style={{position:'relative'}}>
              <div className="rc-label" style={{marginBottom:8}}>Continue training plan</div>
              <div style={{fontSize:16,fontWeight:600,marginBottom:4}}>Post-discharge escalation track</div>
              <div style={{fontSize:12.5,color:'var(--ink-2)',marginBottom:14}}>Module 3 of 5 · 8 min remaining</div>
              <div style={{display:'flex',gap:3,marginBottom:14}}>
                {[1,1,1,0,0].map((d,i)=>(
                  <div key={i} style={{
                    flex:1,height:5,borderRadius:99,
                    background: d ? 'linear-gradient(90deg,#2DD4BF,#8B7DFB)' : 'rgba(255,255,255,0.1)'
                  }}/>
                ))}
              </div>
              <button className="rc-btn primary" style={{width:'100%'}}>
                <I.play size={12}/> Continue with Module 3
              </button>
            </div>
          </div>

          {/* Recommended next */}
          <div className="rc-glass" style={{padding:18}}>
            <div className="rc-label" style={{marginBottom:10}}>Recommended next practice</div>
            <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:12}}>
              <div style={{flexShrink:0}}>
                <PersonaAvatar persona="aanya" size={56} mood="angry"/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14, fontWeight:600}}>Difficult customer · refund</div>
                <div style={{fontSize:11.5, color:'var(--ink-2)', marginTop:4, lineHeight:1.5}}>
                  Aanya P. · Hard difficulty · 6 min
                </div>
              </div>
              <div className="rc-pill warn">Suggested</div>
            </div>
            <div style={{
              padding:'10px 12px', borderRadius:10, fontSize:12, lineHeight:1.5,
              background:'rgba(139,125,251,0.08)', border:'1px solid rgba(139,125,251,0.25)',
            }}>
              <div style={{color:'#B5ACFD', fontWeight:600, marginBottom:4, display:'flex',alignItems:'center',gap:6}}>
                <I.sparkle size={11}/> Why this one
              </div>
              <div style={{color:'var(--ink-1)'}}>Your de-escalation and interruption control scored lowest this week. This scenario targets both.</div>
            </div>
            <button className="rc-btn" style={{width:'100%',marginTop:12}}>
              Start practice <I.arrow size={14}/>
            </button>
          </div>

          {/* Skill progress mini */}
          <div className="rc-glass" style={{padding:18, flex:1, minHeight:0, display:'flex', flexDirection:'column'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div className="rc-label">Skill trend · 30 days</div>
              <div className="rc-pill ok"><I.arrow size={10}/> +8</div>
            </div>
            <svg viewBox="0 0 320 130" width="100%" height="130" preserveAspectRatio="none">
              <defs>
                <linearGradient id="trendgrad" x1="0" y1="0" x2="0" y2="130">
                  <stop offset="0" stopColor="#8B7DFB" stopOpacity="0.35"/>
                  <stop offset="1" stopColor="#8B7DFB" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* gridlines */}
              {[0,1,2,3].map(i=>(
                <line key={i} x1="0" x2="320" y1={20+i*30} y2={20+i*30} stroke="rgba(255,255,255,0.05)"/>
              ))}
              <path d="M0 100 L 30 92 L 60 88 L 90 76 L 120 84 L 150 70 L 180 60 L 210 64 L 240 48 L 270 42 L 300 36 L 320 30 L 320 130 L 0 130 Z" fill="url(#trendgrad)"/>
              <path d="M0 100 L 30 92 L 60 88 L 90 76 L 120 84 L 150 70 L 180 60 L 210 64 L 240 48 L 270 42 L 300 36 L 320 30" fill="none" stroke="#8B7DFB" strokeWidth="2"/>
              <circle cx="320" cy="30" r="3.5" fill="#8B7DFB"/>
              <circle cx="320" cy="30" r="6" fill="#8B7DFB" opacity="0.3"/>
            </svg>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:10.5,color:'var(--ink-3)',marginTop:4}} className="rc-mono">
              <span>Apr 16</span><span>Apr 23</span><span>Apr 30</span><span>May 7</span><span>Today</span>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

// =====================================================================
// 12. TEMPLATES LIBRARY
// =====================================================================
function ScreenTemplates() {
  const cats = [
    {n:'All', c:124, active:true},
    {n:'Healthcare', c:22, i:<I.stethoscope size={12}/>},
    {n:'Customer Service', c:28, i:<I.heart size={12}/>},
    {n:'Sales', c:18, i:<I.chart size={12}/>},
    {n:'Interviews', c:16, i:<I.briefcase size={12}/>},
    {n:'Education', c:12, i:<I.book size={12}/>},
    {n:'Finance', c:10, i:<I.bank size={12}/>},
    {n:'Hospitality', c:9, i:<I.hotel size={12}/>},
    {n:'Safety & Scam', c:9, i:<I.shield size={12}/>},
  ];
  const templates = [
    {persona:'margaret', name:'Confused elderly patient', cat:'Healthcare', diff:'Medium', dur:'5 min', skills:['Empathy','Escalation','Active listening'], modes:['phone','voice','video'], desc:'Post-discharge follow-up with hidden red flags.', mood:'worried', featured:true},
    {persona:'aanya', name:'Angry refund customer', cat:'Customer Service', diff:'Hard', dur:'6 min', skills:['De-escalation','Policy','Tone'], modes:['voice','video'], desc:'Customer demands refund for delayed order. Tests boundary-setting.', mood:'angry'},
    {persona:'james', name:'SWE intern recruiter mock', cat:'Interviews', diff:'Medium', dur:'15 min', skills:['STAR','Specificity','Confidence'], modes:['video'], desc:'Behavioral interview for software engineering internship.', mood:'neutral'},
    {persona:'elena', name:'Sales prospect comparing competitor', cat:'Sales', diff:'Hard', dur:'8 min', skills:['Discovery','Objection handling'], modes:['voice','video'], desc:'Prospect mentions a competitor mid-discovery call.', mood:'neutral'},
    {persona:'david', name:'Parent-teacher · low grade', cat:'Education', diff:'Medium', dur:'7 min', skills:['Empathy','Clarity','Active listening'], modes:['video'], desc:'Parent upset about child\'s recent math grade.', mood:'angry'},
    {persona:'aanya', name:'Bank verification scam', cat:'Safety & Scam', diff:'Expert', dur:'4 min', skills:['Skepticism','Verification','Refusal'], modes:['phone'], desc:'Scammer attempts to extract OTP from an older adult.', mood:'neutral'},
    {persona:'elena', name:'Hotel guest complaint · noise', cat:'Hospitality', diff:'Easy', dur:'5 min', skills:['Empathy','Recovery','Compensation'], modes:['voice','video'], desc:'Returning guest complaining about loud room neighbors.', mood:'angry'},
    {persona:'james', name:'Tier-2 technical escalation', cat:'Customer Service', diff:'Hard', dur:'9 min', skills:['Clarity','Patience','Resolution'], modes:['voice','video'], desc:'Frustrated power user with a long thread of failed fixes.', mood:'neutral'},
  ];
  const modeIcon = {phone:<I.phone size={10}/>, voice:<I.mic size={10}/>, video:<I.video size={10}/>};
  return (
    <Frame>
      <TopNav active="Templates"/>
      <div style={{flex:1, padding:'24px 28px', display:'grid', gridTemplateColumns:'220px 1fr', gap:24, overflow:'hidden'}}>
        {/* Sidebar */}
        <div>
          <div style={{position:'relative', marginBottom:18}}>
            <input className="rc-input" placeholder="Search templates" style={{paddingLeft:34}}/>
            <div style={{position:'absolute',left:11,top:13,color:'var(--ink-3)'}}><I.search size={14}/></div>
          </div>
          <div className="rc-label" style={{marginBottom:10}}>Category</div>
          <div style={{display:'flex',flexDirection:'column',gap:2}}>
            {cats.map(c => (
              <div key={c.n} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'8px 10px', borderRadius:8, cursor:'pointer',
                background: c.active ? 'rgba(139,125,251,0.10)' : 'transparent',
                color: c.active ? 'var(--ink-0)' : 'var(--ink-1)',
                fontSize:13.5, fontWeight: c.active ? 600 : 500,
              }}>
                <span style={{display:'flex',alignItems:'center',gap:8}}>{c.i || <I.grid size={12}/>}{c.n}</span>
                <span style={{fontSize:11,color:'var(--ink-3)'}}>{c.c}</span>
              </div>
            ))}
          </div>
          <div className="rc-label" style={{margin:'22px 0 10px'}}>Difficulty</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {['Easy','Medium','Hard','Expert'].map(d => <div key={d} className="rc-pill" style={{cursor:'pointer'}}>{d}</div>)}
          </div>
          <div className="rc-label" style={{margin:'22px 0 10px'}}>Mode</div>
          <div style={{display:'flex',gap:6}}>
            <div className="rc-pill"><I.phone size={11}/> Phone</div>
            <div className="rc-pill teal"><I.mic size={11}/> Voice</div>
            <div className="rc-pill violet"><I.video size={11}/> Video</div>
          </div>
        </div>

        {/* Grid */}
        <div style={{minWidth:0, overflow:'hidden'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
            <div>
              <h1 className="rc-h-2" style={{margin:0}}>Template library</h1>
              <div style={{fontSize:13,color:'var(--ink-2)',marginTop:4}}>{templates.length} templates · curated by RoleCall</div>
            </div>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <div className="rc-tabs">
                <div className="rc-tab active">Curated</div>
                <div className="rc-tab">My templates</div>
                <div className="rc-tab">Team</div>
              </div>
              <button className="rc-btn primary"><I.sparkle size={13}/> Create template</button>
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14}}>
            {templates.map((t,i) => (
              <div key={i} className={t.featured ? 'rc-glass-2' : 'rc-glass'} style={{
                padding:14, display:'flex', flexDirection:'column', gap:10,
                ...(t.featured ? {boxShadow:'var(--sh-glow-v)'} : {}),
                cursor:'pointer',
              }}>
                <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                  <PersonaAvatar persona={t.persona} size={64} mood={t.mood}/>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start', gap:8}}>
                      <div style={{fontSize:14, fontWeight:600, lineHeight:1.3}}>{t.name}</div>
                      {t.featured && <div className="rc-pill violet"><I.sparkle size={9}/>Featured</div>}
                    </div>
                    <div style={{fontSize:11.5,color:'var(--ink-2)',marginTop:4}}>{t.cat}</div>
                    <div style={{display:'flex',gap:6,marginTop:8}}>
                      <div className="rc-pill" style={{
                        background: t.diff==='Easy'?'rgba(110,231,183,0.1)':t.diff==='Medium'?'rgba(251,191,36,0.1)':t.diff==='Hard'?'rgba(248,113,113,0.1)':'rgba(139,125,251,0.15)',
                        borderColor: t.diff==='Easy'?'rgba(110,231,183,0.4)':t.diff==='Medium'?'rgba(251,191,36,0.4)':t.diff==='Hard'?'rgba(248,113,113,0.4)':'rgba(139,125,251,0.5)',
                        color: t.diff==='Easy'?'#A7F3D0':t.diff==='Medium'?'#FCD34D':t.diff==='Hard'?'#FCA5A5':'#B5ACFD',
                      }}>{t.diff}</div>
                      <div className="rc-pill"><I.clock size={10}/>{t.dur}</div>
                    </div>
                  </div>
                </div>
                <div style={{fontSize:12.5,color:'var(--ink-1)',lineHeight:1.5}}>{t.desc}</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                  {t.skills.map(s => <div key={s} style={{
                    fontSize:10.5, padding:'2px 7px', borderRadius:99,
                    background:'rgba(255,255,255,0.04)', color:'var(--ink-2)', border:'1px solid var(--line)',
                  }}>{s}</div>)}
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'auto',paddingTop:4}}>
                  <div style={{display:'flex',gap:5}}>
                    {t.modes.map(m => (
                      <div key={m} style={{
                        width:22,height:22,borderRadius:6,display:'grid',placeItems:'center',
                        background:'rgba(255,255,255,0.05)', color:'var(--ink-1)',
                      }}>{modeIcon[m]}</div>
                    ))}
                  </div>
                  <button className="rc-btn sm primary">Start <I.arrow size={11}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

Object.assign(window, { ScreenLanding, ScreenDashboard, ScreenTemplates });
