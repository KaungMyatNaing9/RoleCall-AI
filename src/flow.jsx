// RoleCall AI — Create, Preview, Pre-call, Analyzing
/* global React, I, Logo, PersonaAvatar, ScoreRing, SkillMeter, Waveform, TopNav, Frame */

// =====================================================================
// 3. CREATE SIMULATION
// =====================================================================
function ScreenCreate() {
  const steps = [
    {n:1, t:'Training type'},
    {n:2, t:'Industry'},
    {n:3, t:'Persona'},
    {n:4, t:'Difficulty'},
    {n:5, t:'Evaluation'},
  ];

  return (
    <Frame>
      <TopNav active="Simulations" compact/>
      <div style={{flex:1, padding:'24px 28px 0', display:'grid', gridTemplateColumns: '260px 1fr 360px', gap:24, overflow:'hidden'}}>
        {/* LEFT — Stepper */}
        <div>
          <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--ink-2)',marginBottom:24}}>
            <span style={{cursor:'pointer'}}>← Simulations</span>
          </div>
          <div className="rc-label" style={{marginBottom:16}}>Create simulation</div>
          <div style={{display:'flex',flexDirection:'column',gap:2,position:'relative'}}>
            {steps.map((s, i) => {
              const isActive = s.n === 3;
              const isDone = s.n < 3;
              return (
                <div key={s.n} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',position:'relative'}}>
                  {/* vertical line */}
                  {i < steps.length-1 && (
                    <div style={{
                      position:'absolute', left:14, top:34, bottom:-8, width:1,
                      background: isDone ? 'linear-gradient(180deg, #8B7DFB, rgba(139,125,251,0.2))' : 'var(--line)',
                    }}/>
                  )}
                  <div style={{
                    width:28, height:28, borderRadius:99, display:'grid', placeItems:'center',
                    fontSize:12, fontWeight:600, flexShrink:0,
                    background: isActive ? 'linear-gradient(135deg,#2DD4BF,#8B7DFB)' :
                               isDone ? 'rgba(139,125,251,0.18)' : 'rgba(255,255,255,0.05)',
                    color: isActive ? '#06241F' : isDone ? '#B5ACFD' : 'var(--ink-2)',
                    border: isActive ? 'none' : '1px solid var(--line-2)',
                    boxShadow: isActive ? 'var(--sh-glow-v)' : 'none',
                  }}>{isDone ? <I.check size={13}/> : s.n}</div>
                  <div>
                    <div style={{fontSize:13.5, fontWeight: isActive?600:500, color: isActive?'var(--ink-0)':isDone?'var(--ink-1)':'var(--ink-2)'}}>{s.t}</div>
                    {isActive && <div style={{fontSize:11,color:'var(--ink-3)'}}>Describe who you'll practice with</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Agent indicator */}
          <div className="rc-glass" style={{padding:14, marginTop:32}}>
            <div className="rc-label" style={{marginBottom:8}}>Active agents</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {[
                {n:'Persona Generator', s:'working', i:<I.user size={11}/>},
                {n:'Scenario Builder', s:'queued', i:<I.flag size={11}/>},
                {n:'Rubric Agent', s:'queued', i:<I.check size={11}/>},
              ].map(a => (
                <div key={a.n} style={{display:'flex',alignItems:'center',gap:8,fontSize:12}}>
                  <div style={{
                    width:22,height:22,borderRadius:6,display:'grid',placeItems:'center',
                    background: a.s==='working' ? 'rgba(45,212,191,0.15)':'rgba(255,255,255,0.05)',
                    color: a.s==='working' ? '#5EEAD4':'var(--ink-3)',
                  }}>{a.i}</div>
                  <span style={{flex:1, color:a.s==='working'?'var(--ink-0)':'var(--ink-2)'}}>{a.n}</span>
                  {a.s==='working' && <span style={{width:6,height:6,borderRadius:99,background:'#2DD4BF',animation:'rc-pulse 1.4s infinite'}}/>}
                  {a.s==='queued' && <span style={{fontSize:10,color:'var(--ink-3)'}}>queued</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER — Working area for steps 1-3 combined view */}
        <div style={{overflow:'hidden', display:'flex', flexDirection:'column'}}>
          {/* Step 1 cards */}
          <div style={{marginBottom:22}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <div className="rc-label">Step 1 · Training type</div>
              <div className="rc-pill ok"><I.check size={10}/>Video selected</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
              {[
                {n:'Phone Call', d:'Audio only · authentic phone UI', i:<I.phone size={14}/>, sel:false},
                {n:'Web Voice', d:'Browser mic + transcript', i:<I.mic size={14}/>, sel:false},
                {n:'Web Video', d:'Camera + nonverbal signals', i:<I.video size={14}/>, sel:true, premium:true},
                {n:'Text / Chat', d:'For reading speed practice', i:<I.chat size={14}/>, sel:false},
              ].map(c => (
                <div key={c.n} style={{
                  padding:'12px 12px', borderRadius:12, cursor:'pointer',
                  border: c.sel ? '1px solid rgba(139,125,251,0.6)' : '1px solid var(--line)',
                  background: c.sel ? 'linear-gradient(180deg, rgba(139,125,251,0.18), rgba(45,212,191,0.04))' : 'rgba(255,255,255,0.03)',
                  boxShadow: c.sel ? 'var(--sh-glow-v)' : 'none',
                  position:'relative',
                }}>
                  {c.premium && <div className="rc-pill teal" style={{position:'absolute',top:8,right:8,fontSize:9.5}}>PREMIUM</div>}
                  <div style={{
                    width:30,height:30,borderRadius:8,display:'grid',placeItems:'center',
                    background: c.sel ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.05)',
                    color: c.sel ? '#B5ACFD' : 'var(--ink-1)', marginBottom:10,
                  }}>{c.i}</div>
                  <div style={{fontSize:13,fontWeight:600}}>{c.n}</div>
                  <div style={{fontSize:11,color:'var(--ink-2)',marginTop:3,lineHeight:1.4}}>{c.d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2 — industry */}
          <div style={{marginBottom:22}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <div className="rc-label">Step 2 · Industry</div>
              <div className="rc-pill ok"><I.check size={10}/>Healthcare</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:8}}>
              {[
                {n:'Healthcare', i:<I.stethoscope size={14}/>, sel:true},
                {n:'Customer Service', i:<I.heart size={14}/>},
                {n:'Sales', i:<I.chart size={14}/>},
                {n:'HR Interview', i:<I.briefcase size={14}/>},
                {n:'Education', i:<I.book size={14}/>},
                {n:'Finance', i:<I.bank size={14}/>},
                {n:'Hospitality', i:<I.hotel size={14}/>},
                {n:'Custom', i:<I.sparkle size={14}/>, dash:true},
              ].map(c => (
                <div key={c.n} style={{
                  padding:'10px 8px', borderRadius:10, textAlign:'center', cursor:'pointer',
                  border: c.sel ? '1px solid rgba(45,212,191,0.6)' : c.dash ? '1px dashed var(--line-3)' : '1px solid var(--line)',
                  background: c.sel ? 'rgba(45,212,191,0.10)' : 'rgba(255,255,255,0.03)',
                }}>
                  <div style={{
                    width:26,height:26,borderRadius:7,margin:'0 auto 6px',display:'grid',placeItems:'center',
                    background:c.sel?'rgba(45,212,191,0.18)':'rgba(255,255,255,0.04)',
                    color: c.sel?'#5EEAD4':'var(--ink-2)',
                  }}>{c.i}</div>
                  <div style={{fontSize:11.5,fontWeight: c.sel?600:500, color: c.sel?'var(--ink-0)':'var(--ink-1)'}}>{c.n}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3 — persona prompt */}
          <div style={{flex:1, minHeight:0, display:'flex', flexDirection:'column'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <div className="rc-label">Step 3 · Generate persona</div>
              <div style={{display:'flex',gap:6}}>
                <div className="rc-pill"><I.upload size={11}/>Document</div>
                <div className="rc-pill"><I.upload size={11}/>Patient scenario</div>
                <div className="rc-pill"><I.upload size={11}/>Policy / rubric</div>
              </div>
            </div>
            <div className="rc-glass-2" style={{padding:16, position:'relative'}}>
              <div style={{fontSize:13, fontWeight:600, color:'var(--ink-0)', marginBottom:8, display:'flex',alignItems:'center',gap:8}}>
                <I.sparkle size={14}/> Describe the person you want to practice with
              </div>
              <div style={{
                minHeight:96, padding:'10px 0', fontSize:15, lineHeight:1.55, color:'var(--ink-0)',
              }}>
                An elderly post-discharge patient who is <span style={{background:'rgba(139,125,251,0.18)',padding:'1px 4px',borderRadius:4,color:'#B5ACFD'}}>confused about medication</span> and later mentions <span style={{background:'rgba(248,113,113,0.18)',padding:'1px 4px',borderRadius:4,color:'#FCA5A5'}}>chest tightness</span> if asked about symptoms.
                <span style={{display:'inline-block',width:2,height:18,background:'#8B7DFB',marginLeft:2,verticalAlign:'middle',animation:'rc-blink 1s infinite'}}/>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8,paddingTop:8,borderTop:'1px solid var(--line)'}}>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  <span style={{fontSize:11,color:'var(--ink-3)'}}>Suggestions:</span>
                  {['Angry customer demanding refund','Bank scammer targeting older adult','Recruiter for SWE intern','Parent upset about grades'].map(s => (
                    <span key={s} className="rc-pill" style={{fontSize:10.5,cursor:'pointer'}}>{s}</span>
                  ))}
                </div>
                <div style={{fontSize:11,color:'var(--ink-3)'}} className="rc-mono">142 / 600</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Steps 4 + 5 + CTA */}
        <div style={{overflow:'hidden', display:'flex', flexDirection:'column', gap:14}}>
          {/* Step 4 — Difficulty */}
          <div className="rc-glass" style={{padding:16}}>
            <div className="rc-label" style={{marginBottom:12}}>Step 4 · Difficulty & behavior</div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,color:'var(--ink-2)',marginBottom:6}}>Difficulty</div>
              <div style={{display:'flex',background:'rgba(255,255,255,0.04)',padding:3,borderRadius:8,border:'1px solid var(--line)'}}>
                {['Easy','Medium','Hard','Expert'].map(d => (
                  <div key={d} style={{
                    flex:1, padding:'6px 0', textAlign:'center', fontSize:11.5, fontWeight:500,
                    borderRadius:6, cursor:'pointer',
                    background: d==='Medium' ? 'rgba(139,125,251,0.25)' : 'transparent',
                    color: d==='Medium' ? '#B5ACFD' : 'var(--ink-2)',
                    fontWeight: d==='Medium' ? 600 : 500,
                  }}>{d}</div>
                ))}
              </div>
            </div>
            {[
              {l:'Emotional intensity', v:0.4, mark:'mid'},
              {l:'Interruptions', v:0.25},
              {l:'Hidden agenda', v:0.6},
              {l:'Patience level', v:0.7},
              {l:'Escalation risk', v:0.55, tone:'warn'},
            ].map(s => (
              <div key={s.l} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:11.5,color:'var(--ink-2)',marginBottom:5}}>
                  <span>{s.l}</span>
                </div>
                <div style={{height:6,background:'rgba(255,255,255,0.05)',borderRadius:99,position:'relative'}}>
                  <div style={{
                    height:'100%',width:`${s.v*100}%`,borderRadius:99,
                    background: s.tone==='warn' ? 'linear-gradient(90deg,#FBBF24,#F59E0B)' : 'linear-gradient(90deg,#2DD4BF,#8B7DFB)',
                  }}/>
                  <div style={{
                    position:'absolute', left:`calc(${s.v*100}% - 6px)`, top:-3, width:12,height:12,borderRadius:99,
                    background:'#fff',boxShadow:'0 2px 4px rgba(0,0,0,0.4)',
                  }}/>
                </div>
              </div>
            ))}
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:8}}>
              {[
                {n:'Hidden red flag', on:true},
                {n:'Random surprise', on:true},
                {n:'Light accent', on:false},
              ].map(t => (
                <div key={t.n} style={{
                  display:'inline-flex',alignItems:'center',gap:6,fontSize:11,
                  padding:'5px 9px',borderRadius:99,
                  background: t.on?'rgba(45,212,191,0.10)':'rgba(255,255,255,0.04)',
                  border:`1px solid ${t.on?'rgba(45,212,191,0.4)':'var(--line)'}`,
                  color: t.on?'#5EEAD4':'var(--ink-2)', cursor:'pointer',
                }}>
                  <div style={{width:22,height:12,borderRadius:99,background:t.on?'#2DD4BF':'rgba(255,255,255,0.1)',position:'relative'}}>
                    <div style={{position:'absolute',top:1,left:t.on?11:1,width:10,height:10,borderRadius:99,background:'#fff',transition:'left .15s'}}/>
                  </div>
                  {t.n}
                </div>
              ))}
            </div>
          </div>

          {/* Step 5 — Evaluation focus */}
          <div className="rc-glass" style={{padding:16, flex:1, minHeight:0}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div className="rc-label">Step 5 · Evaluation focus</div>
              <div style={{fontSize:11,color:'var(--ink-3)'}}>6 of 16</div>
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {[
                {n:'Empathy', on:true},
                {n:'Clarity', on:true},
                {n:'Professionalism', on:false},
                {n:'Active listening', on:true},
                {n:'Escalation', on:true},
                {n:'Compliance', on:false},
                {n:'Customer sat.', on:false},
                {n:'STAR', on:false},
                {n:'Discovery', on:false},
                {n:'De-escalation', on:false},
                {n:'Nonverbal presence', on:true},
                {n:'Eye-contact estimate', on:true},
                {n:'Speaking pace', on:false},
                {n:'Filler words', on:false},
                {n:'Interruptions', on:false},
                {n:'Turn-taking', on:false},
              ].map(c => (
                <div key={c.n} style={{
                  display:'inline-flex',alignItems:'center',gap:6,fontSize:11.5,
                  padding:'5px 10px',borderRadius:99,cursor:'pointer',
                  background: c.on?'rgba(139,125,251,0.15)':'rgba(255,255,255,0.04)',
                  border:`1px solid ${c.on?'rgba(139,125,251,0.45)':'var(--line)'}`,
                  color: c.on?'#B5ACFD':'var(--ink-2)',
                }}>
                  {c.on && <I.check size={10}/>}
                  {c.n}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button className="rc-btn primary lg" style={{justifyContent:'center'}}>
            <I.sparkle size={14}/> Generate Simulation
          </button>
        </div>
      </div>
    </Frame>
  );
}

// =====================================================================
// 4. GENERATED SIMULATION PREVIEW
// =====================================================================
function ScreenPreview() {
  return (
    <Frame>
      <TopNav active="Simulations" compact/>
      <div style={{flex:1, padding:'24px 28px', overflow:'hidden', display:'flex',flexDirection:'column'}}>
        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
              <div className="rc-pill ok"><I.check size={10}/>Generated by 3 agents · 4.2s</div>
              <div className="rc-pill violet"><I.sparkle size={10}/>Custom scenario</div>
            </div>
            <h1 className="rc-h-1" style={{margin:0}}>Simulation ready</h1>
            <div style={{fontSize:13.5, color:'var(--ink-2)', marginTop:4}}>
              Review the persona, scenario, and rubric. Edit anything that looks off, then start practice.
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button className="rc-btn"><I.bookmark size={13}/> Save as template</button>
            <button className="rc-btn"><I.retry size={13}/> Regenerate</button>
            <button className="rc-btn primary lg"><I.video size={14}/> Start practice</button>
          </div>
        </div>

        {/* 4-up grid */}
        <div style={{display:'grid', gridTemplateColumns:'1.15fr 1fr 1fr', gap:16, flex:1, minHeight:0}}>
          {/* Persona */}
          <div className="rc-glass-2" style={{padding:18, display:'flex',flexDirection:'column',gap:14, position:'relative', overflow:'hidden'}}>
            <div style={{position:'absolute',inset:0,background:'radial-gradient(60% 60% at 100% 0%, rgba(139,125,251,0.18), transparent 60%)',pointerEvents:'none'}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',position:'relative'}}>
              <div className="rc-label">Persona</div>
              <button style={{fontSize:11,color:'var(--ink-2)',background:'none',border:'none',cursor:'pointer'}}>Edit ↗</button>
            </div>
            <div style={{display:'flex',gap:14,alignItems:'flex-start',position:'relative'}}>
              <PersonaAvatar persona="margaret" size={104} mood="worried"/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:20,fontWeight:700,letterSpacing:'-0.02em'}}>Margaret Lewis</div>
                <div style={{fontSize:13,color:'var(--ink-2)',marginTop:2}}>72 · Post-discharge patient</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:10}}>
                  <div className="rc-pill warn">worried</div>
                  <div className="rc-pill">polite</div>
                  <div className="rc-pill">hesitant</div>
                </div>
              </div>
            </div>
            <div style={{position:'relative',display:'grid',gap:9,fontSize:12.5}}>
              {[
                ['Goal', 'Understand new medication instructions'],
                ['Hidden red flag', 'Chest tightness — reveals only if asked about symptoms or after ~2 min'],
                ['Behavior', 'Apologetic, asks to repeat, easily distracted'],
                ['Voice style', 'Elderly, calm, slightly anxious — light tremor'],
              ].map(([k,v],i) => (
                <div key={i} style={{display:'grid',gridTemplateColumns:'110px 1fr',gap:10}}>
                  <div style={{color:'var(--ink-3)',fontSize:11,letterSpacing:'0.05em',textTransform:'uppercase',paddingTop:2}}>{k}</div>
                  <div style={{color: k==='Hidden red flag' ? '#FCA5A5' : 'var(--ink-1)', lineHeight:1.5}}>{v}</div>
                </div>
              ))}
            </div>
            {/* Sample line */}
            <div style={{position:'relative', padding:'12px 14px', borderRadius:12, background:'rgba(0,0,0,0.3)', border:'1px solid var(--line)'}}>
              <div className="rc-label" style={{marginBottom:6,fontSize:10}}>Sample opening line</div>
              <div style={{fontSize:13, lineHeight:1.5, color:'var(--ink-0)', fontStyle:'italic'}}>
                "Hello dear, I'm sorry to bother — I just got back from the hospital and I don't know if I'm taking my pills right…"
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginTop:8}}>
                <button style={{
                  width:24,height:24,borderRadius:99,border:'none',cursor:'pointer',
                  background:'linear-gradient(135deg,#2DD4BF,#8B7DFB)',color:'#06241F',
                  display:'grid',placeItems:'center',
                }}><I.play size={10}/></button>
                <Waveform tone="teal" bars={28} height={14} dense/>
                <span style={{fontSize:10,color:'var(--ink-3)'}} className="rc-mono">0:04</span>
              </div>
            </div>
          </div>

          {/* Scenario + Rubric (stacked) */}
          <div style={{display:'grid',gridTemplateRows:'1fr 1fr',gap:16, minHeight:0}}>
            <div className="rc-glass" style={{padding:16, display:'flex',flexDirection:'column'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <div className="rc-label">Scenario</div>
                <div className="rc-pill warn">Medium</div>
              </div>
              <div style={{fontSize:15, fontWeight:600, marginBottom:6}}>Post-surgery follow-up call</div>
              <div style={{fontSize:12.5,color:'var(--ink-2)',lineHeight:1.5,marginBottom:10}}>
                Margaret was discharged 36 hours ago. She'll call confused about her medication, but her real concern (chest tightness) only surfaces if you ask the right questions.
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,fontSize:11.5,marginTop:'auto'}}>
                <div>
                  <div style={{color:'var(--ink-3)',fontSize:10,letterSpacing:'0.05em',marginBottom:2}}>YOUR ROLE</div>
                  <div>Care coordinator</div>
                </div>
                <div>
                  <div style={{color:'var(--ink-3)',fontSize:10,letterSpacing:'0.05em',marginBottom:2}}>DURATION</div>
                  <div>~5 min</div>
                </div>
                <div>
                  <div style={{color:'var(--ink-3)',fontSize:10,letterSpacing:'0.05em',marginBottom:2}}>OBJECTIVE</div>
                  <div>Verify ID, identify urgent concerns, escalate</div>
                </div>
                <div>
                  <div style={{color:'var(--ink-3)',fontSize:10,letterSpacing:'0.05em',marginBottom:2}}>SUCCESS WHEN</div>
                  <div>Patient is safely escalated</div>
                </div>
              </div>
            </div>

            <div className="rc-glass" style={{padding:16, display:'flex',flexDirection:'column'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <div className="rc-label">Evaluation rubric</div>
                <button style={{fontSize:11,color:'var(--ink-2)',background:'none',border:'none',cursor:'pointer'}}>Edit ↗</button>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:7}}>
                {[
                  {n:'Identity verification', w:10},
                  {n:'Empathy', w:18},
                  {n:'Question quality', w:14},
                  {n:'Red-flag detection', w:20, hot:true},
                  {n:'Escalation handling', w:18, hot:true},
                  {n:'Clarity of next steps', w:10},
                  {n:'Nonverbal engagement', w:10},
                ].map(r => (
                  <div key={r.n} style={{display:'flex',alignItems:'center',gap:10,fontSize:12}}>
                    <span style={{flex:1, color: r.hot?'#FCA5A5':'var(--ink-1)', fontWeight: r.hot?500:400}}>{r.n}</span>
                    <div style={{width:60, height:4, background:'rgba(255,255,255,0.06)',borderRadius:99,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${r.w*4}%`, background: r.hot?'linear-gradient(90deg,#F87171,#FBBF24)':'linear-gradient(90deg,#2DD4BF,#8B7DFB)'}}/>
                    </div>
                    <span style={{width:30,textAlign:'right',color:'var(--ink-3)',fontSize:11}} className="rc-mono">{r.w}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mode card + agent log */}
          <div style={{display:'grid', gridTemplateRows:'auto 1fr', gap:16, minHeight:0}}>
            <div className="rc-glass" style={{padding:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <div className="rc-label">Simulation mode</div>
                <div className="rc-pill teal"><I.video size={10}/>Web video</div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                {[
                  {l:'Camera', v:'Required', i:<I.cam size={12}/>},
                  {l:'Microphone', v:'Required', i:<I.mic size={12}/>},
                  {l:'Transcript', v:'Live', i:<I.chat size={12}/>},
                  {l:'Signals', v:'Audio + Video', i:<I.signal size={12}/>},
                ].map(x => (
                  <div key={x.l} style={{
                    padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,0.03)',
                    border:'1px solid var(--line)', fontSize:11.5,
                  }}>
                    <div style={{display:'flex',alignItems:'center',gap:6,color:'var(--ink-3)',fontSize:10,marginBottom:2}}>{x.i}{x.l}</div>
                    <div>{x.v}</div>
                  </div>
                ))}
              </div>
              <div style={{
                padding:'9px 11px', borderRadius:8, fontSize:11.5, lineHeight:1.5,
                background:'rgba(45,212,191,0.06)', border:'1px solid rgba(45,212,191,0.25)', color:'var(--ink-1)',
              }}>
                Video signals are coaching estimates — not emotion or truth detection. You can disable any time.
              </div>
            </div>

            <div className="rc-glass" style={{padding:16, minHeight:0, display:'flex',flexDirection:'column'}}>
              <div className="rc-label" style={{marginBottom:10}}>Agent reasoning log</div>
              <div style={{flex:1,minHeight:0,overflow:'hidden',display:'flex',flexDirection:'column',gap:9}}>
                {[
                  {a:'Persona Generator', c:'#5EEAD4', m:'Anchored on "elderly, post-discharge, medication confusion." Set politeness high, attention variable.'},
                  {a:'Scenario Builder', c:'#93B4FF', m:'Added latent red flag: chest tightness, revealed after symptom probe OR ~2 min latency.'},
                  {a:'Rubric Agent', c:'#B5ACFD', m:'Boosted weights on red-flag detection & escalation (high risk scenario).'},
                  {a:'Persona Generator', c:'#5EEAD4', m:'Voice: female, ~70-75, calm pace 130 wpm, slight tremor on first syllables.'},
                ].map((l,i)=>(
                  <div key={i} style={{display:'flex',gap:8,fontSize:11.5,lineHeight:1.4}}>
                    <div style={{width:6,height:6,borderRadius:99,background:l.c,marginTop:6,flexShrink:0}}/>
                    <div>
                      <span style={{color:l.c,fontWeight:600,marginRight:6}}>{l.a}</span>
                      <span style={{color:'var(--ink-2)'}}>{l.m}</span>
                    </div>
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

// =====================================================================
// 5. PRE-CALL SETUP
// =====================================================================
function ScreenPrecall() {
  return (
    <Frame>
      <TopNav active="Simulations" compact/>
      <div style={{flex:1, padding:'28px 28px', display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:24, overflow:'hidden'}}>
        {/* Camera preview */}
        <div style={{display:'flex',flexDirection:'column',minHeight:0}}>
          <div style={{marginBottom:16}}>
            <div className="rc-label" style={{marginBottom:6}}>Pre-call check</div>
            <h1 className="rc-h-1" style={{margin:0}}>Get ready for your simulation</h1>
            <div style={{fontSize:13.5, color:'var(--ink-2)', marginTop:6}}>
              You'll be on a call with <span style={{color:'var(--ink-0)'}}>Margaret Lewis</span>, a post-discharge patient. Take a breath.
            </div>
          </div>

          {/* Camera preview tile */}
          <div className="rc-glass-2" style={{
            position:'relative', flex:1, minHeight:0, borderRadius:18, overflow:'hidden',
            background:'#0A0E1A',
          }}>
            {/* Faux camera feed: gradient + user avatar */}
            <div style={{position:'absolute',inset:0,background:'radial-gradient(60% 70% at 50% 60%, #2C3454 0%, #0F1424 100%)'}}/>
            <div style={{position:'absolute', inset:0, display:'grid', placeItems:'center'}}>
              <PersonaAvatar persona="user" size={260} mood="neutral"/>
            </div>
            {/* MediaPipe-style overlay */}
            <svg viewBox="0 0 600 400" style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}>
              {/* face landmarks */}
              <g stroke="rgba(45,212,191,0.55)" strokeWidth="1" fill="none">
                <ellipse cx="300" cy="200" rx="85" ry="100"/>
                <circle cx="278" cy="180" r="6"/>
                <circle cx="322" cy="180" r="6"/>
                <path d="M 290 220 Q 300 230 310 220"/>
                <path d="M 300 195 L 300 215"/>
              </g>
              {/* landmark dots */}
              {[
                [240,170],[260,165],[340,165],[360,170],
                [220,210],[380,210],[290,250],[310,250],
                [260,275],[340,275],[300,235],
              ].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="2" fill="#2DD4BF"/>)}
            </svg>
            {/* badges */}
            <div style={{position:'absolute', top:14, left:14, display:'flex', gap:6}}>
              <div className="rc-pill teal"><span style={{width:6,height:6,borderRadius:99,background:'#2DD4BF',display:'inline-block',animation:'rc-pulse 1.4s infinite'}}/>Camera test</div>
              <div className="rc-pill"><I.eye size={10}/>Face detected</div>
              <div className="rc-pill"><I.signal size={10}/>Lighting · good</div>
            </div>
            {/* You label */}
            <div style={{position:'absolute',bottom:14,left:14, fontSize:12, padding:'5px 10px', background:'rgba(0,0,0,0.55)', borderRadius:8}}>
              You · Alex Kim
            </div>
            {/* mic level */}
            <div style={{position:'absolute',bottom:14, right:14, display:'flex',alignItems:'center',gap:8, background:'rgba(0,0,0,0.55)',padding:'5px 12px',borderRadius:8}}>
              <I.mic size={12}/>
              <Waveform tone="teal" bars={14} height={16} dense/>
            </div>
          </div>

          {/* Controls bar */}
          <div style={{
            marginTop:14, padding:'12px 16px', display:'flex', justifyContent:'center', gap:10,
            background:'rgba(255,255,255,0.04)', border:'1px solid var(--line)', borderRadius:12,
          }}>
            {[
              {i:<I.mic size={16}/>, on:true},
              {i:<I.cam size={16}/>, on:true},
              {i:<I.signal size={16}/>, on:true, label:'Blur'},
              {i:<I.eye size={16}/>, on:true, label:'Signals'},
            ].map((c,i)=>(
              <button key={i} className={`rc-btn ${c.on?'':'ghost'}`} style={{padding:'8px 14px'}}>
                {c.i}{c.label && <span style={{fontSize:12}}>{c.label}</span>}
              </button>
            ))}
            <div style={{flex:1}}/>
            <button className="rc-btn ghost"><I.cog size={14}/>Settings</button>
          </div>
        </div>

        {/* Right — Checklist + privacy */}
        <div style={{display:'flex',flexDirection:'column',gap:14, minHeight:0}}>
          <div className="rc-glass" style={{padding:18}}>
            <div className="rc-label" style={{marginBottom:12}}>System check</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {[
                {n:'Camera connected', s:'ok', d:'FaceTime HD · 1080p'},
                {n:'Microphone connected', s:'ok', d:'MacBook Pro · 90% input'},
                {n:'Speaker connected', s:'ok', d:'MacBook Pro speakers'},
                {n:'Lighting check', s:'ok', d:'Sufficient · face well lit'},
                {n:'Background check', s:'warn', d:'Slight motion detected — consider blur'},
                {n:'Network', s:'ok', d:'45 Mbps · low latency'},
              ].map(x => (
                <div key={x.n} style={{display:'flex',alignItems:'center',gap:10,fontSize:13}}>
                  <div style={{
                    width:22,height:22,borderRadius:6,display:'grid',placeItems:'center',flexShrink:0,
                    background: x.s==='ok'?'rgba(52,211,153,0.15)':'rgba(251,191,36,0.15)',
                    color: x.s==='ok'?'#6EE7B7':'#FCD34D',
                  }}>{x.s==='ok'?<I.check size={12}/>:<I.warn size={12}/>}</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontWeight:500}}>{x.n}</div>
                    <div style={{fontSize:11,color:'var(--ink-3)'}}>{x.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rc-glass" style={{padding:18}}>
            <div className="rc-label" style={{marginBottom:10}}>Consent & privacy</div>
            <div style={{fontSize:12, color:'var(--ink-1)', lineHeight:1.55, marginBottom:12, padding:'10px 12px', background:'rgba(79,124,255,0.06)', border:'1px solid rgba(79,124,255,0.25)', borderRadius:10}}>
              RoleCall analyzes this session to give coaching feedback. Video signals (eye-contact estimate, speaking pace, pauses, engagement) are coaching estimates — <strong style={{color:'var(--ink-0)'}}>not</strong> emotion or psychological assessment.
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {[
                {n:'Allow video signal analysis', on:true},
                {n:'Allow audio signal analysis', on:true},
                {n:'Save recording for review', on:false},
                {n:'Save transcript', on:true},
              ].map(t => (
                <div key={t.n} style={{display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:13}}>
                  <span>{t.n}</span>
                  <div style={{width:32,height:18,borderRadius:99,background:t.on?'linear-gradient(90deg,#2DD4BF,#8B7DFB)':'rgba(255,255,255,0.1)',position:'relative',cursor:'pointer'}}>
                    <div style={{position:'absolute',top:2,left:t.on?16:2,width:14,height:14,borderRadius:99,background:'#fff',transition:'left .15s'}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="rc-btn accent lg" style={{justifyContent:'center'}}>
            <I.video size={14}/> Join simulation
          </button>
          <button className="rc-btn ghost" style={{justifyContent:'center'}}>
            Switch to voice-only
          </button>
        </div>
      </div>
    </Frame>
  );
}

// =====================================================================
// 9. ANALYZING SCREEN
// =====================================================================
function ScreenAnalyzing() {
  const steps = [
    {n:'Transcribing conversation', s:'done', sub:'412 turns · 5:42 audio'},
    {n:'Reviewing rubric performance', s:'done', sub:'7 criteria scored'},
    {n:'Measuring speaking patterns', s:'done', sub:'Pace, pauses, fillers'},
    {n:'Analyzing video interaction signals', s:'active', sub:'Eye-contact estimate, head stability, turn-taking'},
    {n:'Generating coaching feedback', s:'queue'},
    {n:'Building next practice plan', s:'queue'},
  ];
  return (
    <Frame>
      <div className="rc-shell"/>
      <div className="rc-grain"/>
      <div style={{position:'relative', flex:1, display:'grid', placeItems:'center'}}>
        <div style={{width:680, maxWidth:'90%', textAlign:'center'}}>
          {/* Animated ring */}
          <div style={{position:'relative', width:160, height:160, margin:'0 auto 32px'}}>
            <svg width="160" height="160" style={{position:'absolute',inset:0}}>
              <defs>
                <linearGradient id="anagrad" x1="0" y1="0" x2="160" y2="160">
                  <stop offset="0" stopColor="#2DD4BF"/>
                  <stop offset="0.5" stopColor="#4F7CFF"/>
                  <stop offset="1" stopColor="#8B7DFB"/>
                </linearGradient>
              </defs>
              <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2"/>
              <circle cx="80" cy="80" r="70" fill="none" stroke="url(#anagrad)" strokeWidth="2"
                      strokeDasharray="120 440" strokeLinecap="round"
                      style={{animation:'rc-spin 2s linear infinite', transformOrigin:'80px 80px'}}/>
              <circle cx="80" cy="80" r="56" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5"/>
              <circle cx="80" cy="80" r="56" fill="none" stroke="#8B7DFB" strokeWidth="2"
                      strokeDasharray="40 320" strokeLinecap="round"
                      style={{animation:'rc-spin 3.2s linear reverse infinite', transformOrigin:'80px 80px'}}/>
            </svg>
            <div style={{position:'absolute',inset:0,display:'grid',placeItems:'center'}}>
              <I.sparkle size={32}/>
            </div>
          </div>

          <div className="rc-pill violet" style={{marginBottom:14}}>
            <I.sparkle size={11}/> 6 agents · 4 done · 1 working
          </div>
          <h1 className="rc-h-1" style={{margin:0}}>Analyzing your simulation</h1>
          <div style={{fontSize:14, color:'var(--ink-2)', marginTop:8, marginBottom:36}}>
            Reviewing the transcript, audio patterns, and video interaction signals.
          </div>

          {/* Steps */}
          <div className="rc-glass" style={{padding:18, textAlign:'left'}}>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {steps.map((s,i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{
                    width:24,height:24,borderRadius:99,display:'grid',placeItems:'center',flexShrink:0,
                    background: s.s==='done'?'linear-gradient(135deg,#2DD4BF,#8B7DFB)':
                                s.s==='active'?'rgba(139,125,251,0.2)':'rgba(255,255,255,0.05)',
                    color: s.s==='done'?'#06241F':'#B5ACFD',
                    border: s.s==='queue'?'1px solid var(--line-2)':'none',
                  }}>
                    {s.s==='done' && <I.check size={12}/>}
                    {s.s==='active' && <div style={{width:8,height:8,borderRadius:99,background:'#8B7DFB',animation:'rc-pulse 1s infinite'}}/>}
                    {s.s==='queue' && <span style={{fontSize:10,color:'var(--ink-3)'}}>{i+1}</span>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13.5, fontWeight:500, color: s.s==='queue'?'var(--ink-2)':'var(--ink-0)'}}>{s.n}</div>
                    {s.sub && <div style={{fontSize:11, color:'var(--ink-3)', marginTop:1}}>{s.sub}</div>}
                  </div>
                  {s.s==='active' && (
                    <div style={{width:120, height:4, background:'rgba(255,255,255,0.06)', borderRadius:99, overflow:'hidden'}}>
                      <div className="rc-shimmer-line" style={{width:'100%',height:'100%'}}/>
                    </div>
                  )}
                  {s.s==='done' && <div style={{fontSize:11,color:'var(--ink-3)'}} className="rc-mono">0.8s</div>}
                </div>
              ))}
            </div>
          </div>

          <div style={{marginTop:20, fontSize:12, color:'var(--ink-3)'}}>
            This usually takes about 8 seconds. Your report will open automatically.
          </div>
        </div>
      </div>
    </Frame>
  );
}

Object.assign(window, { ScreenCreate, ScreenPreview, ScreenPrecall, ScreenAnalyzing });
