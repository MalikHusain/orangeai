import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { DISEASES, SEVERITY_LEVELS, GEO_DISTRICTS } from '../utils/diseaseData'
import styles from './Results.module.css'

const TABS = ['🔬 Diagnosis','💊 Treatment','🗣️ Language','🗺️ Heatmap','📄 Report']

/* ── TTS Status Banner ── */
function TTSStatusBanner({ error, loading }) {
  if (loading) return (
    <div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:12,
      padding:'12px 16px',marginBottom:20,fontSize:13,color:'#1D4ED8',
      display:'flex',alignItems:'center',gap:10}}>
      <span style={{display:'inline-block',width:14,height:14,border:'2px solid #93C5FD',
        borderTopColor:'#1D4ED8',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      Generating audio... (gTTS is contacting Google)
    </div>
  )

  if (error) {
    const isOffline = error.includes('Failed to fetch') || error.includes('NetworkError') || error.includes('Load failed')
    const isNotInstalled = error.includes('503') || error.includes('gtts')
    return (
      <div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:12,
        padding:'12px 16px',marginBottom:20,fontSize:13,color:'#991B1B'}}>
        <div style={{fontWeight:700,marginBottom:6}}>
          {isOffline ? '❌ Backend not running' : isNotInstalled ? '❌ gTTS not installed' : '❌ TTS Error'}
        </div>
        <div style={{lineHeight:1.6}}>
          {isOffline && <>TTS service is temporarily unavailable. Please try again in a moment.</>}
          {isNotInstalled && <>Install gTTS: <code style={{background:'#FEE2E2',padding:'1px 6px',borderRadius:4}}>pip install gtts</code> then restart backend</>}
          {!isOffline && !isNotInstalled && <code style={{background:'#FEE2E2',padding:'1px 6px',borderRadius:4}}>{error}</code>}
        </div>
      </div>
    )
  }

  return (
    <div style={{background:'#F0FDF4',border:'1px solid #86EFAC',borderRadius:12,
      padding:'12px 16px',marginBottom:20,fontSize:13,color:'#166534',
      display:'flex',alignItems:'center',gap:8}}>
      🎵 <strong>Hindi &amp; Marathi</strong> — powered by gTTS backend &nbsp;·&nbsp;
      <strong>English</strong> — browser voice &nbsp;·&nbsp;
      Powered by gTTS cloud service
    </div>
  )
}

export default function Results() {
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const [tab, setTab] = useState(0)
  const canvasRef  = useRef(null)
  const result     = state?.result

  useEffect(() => {
    if (!result) navigate('/detect')
  }, [result, navigate])

  useEffect(() => {
    if (tab === 3) drawHeatmap()
  }, [tab])

  if (!result) return null

  const disease  = result.diseaseData || DISEASES[0]
  const conf     = result.confidence || 0.87
  const sev      = SEVERITY_LEVELS[disease.severity] || SEVERITY_LEVELS.low
  const probData = Object.entries(result.probabilities || {}).map(([name,v]) => ({ name: name.replace(' (HLB)',''), value: +(v*100).toFixed(1) })).sort((a,b) => b.value - a.value).slice(0,6)

  /* ── Heatmap Canvas ───────────────────────────────────── */
  function drawHeatmap() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.offsetWidth, H = canvas.offsetHeight || 340
    canvas.width = W; canvas.height = H

    // Background
    ctx.fillStyle = '#DBEAFE'; ctx.fillRect(0,0,W,H)

    // Grid lines
    ctx.strokeStyle = '#BFDBFE'; ctx.lineWidth = 1; ctx.setLineDash([4,4])
    for(let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(W/5*i,0);ctx.lineTo(W/5*i,H);ctx.stroke()}
    for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(0,H/4*i);ctx.lineTo(W,H/4*i);ctx.stroke()}
    ctx.setLineDash([])

    // Boundary box
    ctx.strokeStyle = '#93C5FD'; ctx.lineWidth = 2
    ctx.strokeRect(20, 20, W-40, H-40)

    // Region label
    ctx.fillStyle = '#1D4ED8'; ctx.font = 'bold 12px DM Sans,sans-serif'; ctx.textAlign = 'left'
    ctx.fillText('Vidarbha Orange Belt — Maharashtra', 28, 16)

    const SEV_COLORS = { high:'#DC2626', medium:'#F97316', low:'#22C55E' }

    GEO_DISTRICTS.forEach(d => {
      const x = 20 + d.x * (W-40)
      const y = 20 + d.y * (H-40)
      const col = SEV_COLORS[d.severity]

      // Glow
      const g = ctx.createRadialGradient(x,y,0,x,y,28)
      g.addColorStop(0, col+'55'); g.addColorStop(1,'transparent')
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,y,28,0,Math.PI*2); ctx.fill()

      // Dot
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x,y,9,0,Math.PI*2); ctx.fill()
      ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2); ctx.fill()
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill()

      // Label
      ctx.fillStyle = '#1E3A5F'; ctx.font = 'bold 11px DM Sans,sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(d.name, x, y+20)
    })
  }

  const [speaking, setSpeaking]         = useState(false)
  const [speakingLang, setSpeakingLang] = useState(null)
  const [ttsLoading, setTtsLoading]     = useState(false)
  const [ttsError, setTtsError]         = useState(null)

  // ── gTTS Backend TTS ─────────────────────────────────────────
  // Uses a NEW Audio() object each time — avoids the "tab not mounted" bug
  // where audioRef.current is null because <audio> is inside a conditional tab.

  const activaudioRef = useRef(null) // track the currently playing Audio object

  const stopAll = () => {
    if (activaudioRef.current) {
      activaudioRef.current.pause()
      activaudioRef.current.src = ''
      activaudioRef.current = null
    }
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setSpeakingLang(null)
  }

  const speakViaBrowser = (text, lang) => {
    // Pure browser fallback — uses whatever voice is installed
    window.speechSynthesis.cancel()
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(text)
      const voices = window.speechSynthesis.getVoices()
      const voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]))
        || voices.find(v => v.default) || voices[0]
      if (voice) { u.voice = voice; u.lang = voice.lang }
      u.rate = 0.85; u.volume = 1.0
      u.onend   = () => { setSpeaking(false); setSpeakingLang(null) }
      u.onerror = () => { setSpeaking(false); setSpeakingLang(null) }
      window.speechSynthesis.speak(u)
    }, 200)
  }

  const speakViaGTTS = async (text, lang) => {
    setTtsLoading(true)
    setTtsError(null)

    try {
      const ttsUrl = (import.meta.env.VITE_API_URL || '/api') + '/tts'
      const res = await fetch(ttsUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text, lang }),
        signal:  AbortSignal.timeout(10000), // 10s timeout
      })

      if (!res.ok) {
        const detail = await res.text()
        throw new Error(`Backend error ${res.status}: ${detail}`)
      }

      const blob = await res.blob()
      if (blob.size === 0) throw new Error('Empty audio response from backend')

      const url   = URL.createObjectURL(blob)
      const audio = new Audio(url)   // fresh Audio object — no ref needed
      activaudioRef.current = audio

      audio.onended = () => {
        URL.revokeObjectURL(url)
        activaudioRef.current = null
        setSpeaking(false)
        setSpeakingLang(null)
      }
      audio.onerror = (e) => {
        console.error('Audio playback error:', e)
        URL.revokeObjectURL(url)
        activaudioRef.current = null
        setSpeaking(false)
        setSpeakingLang(null)
        setTtsError('Audio playback failed')
      }

      await audio.play()

    } catch (err) {
      console.error('gTTS error:', err.message)
      setTtsError(err.message)
      setSpeaking(false)
      setSpeakingLang(null)
      // Do NOT auto-fallback to English — show the error so user knows what happened
    } finally {
      setTtsLoading(false)
    }
  }

  const speak = (text, lang) => {
    // Toggle off
    if (speaking && speakingLang === lang) { stopAll(); return }

    stopAll()
    setTtsError(null)
    setSpeaking(true)
    setSpeakingLang(lang)

    // English uses browser (always available)
    if (lang === 'en-IN' || lang === 'en') {
      speakViaBrowser(text, lang)
    } else {
      // Hindi/Marathi → use backend gTTS
      speakViaGTTS(text, lang)
    }
  }

  const stopSpeak = () => stopAll()

  const downloadReport = () => {
    const lines = [
      `OrangeAI Detection Report`,
      `${'═'.repeat(40)}`,
      `Date        : ${new Date().toLocaleString()}`,
      `Disease     : ${disease.name}`,
      `Sci. Name   : ${disease.sci}`,
      `Confidence  : ${(conf*100).toFixed(1)}%`,
      `Severity    : ${disease.severity.toUpperCase()}`,
      ``,
      `Description`,
      `${'─'.repeat(40)}`,
      disease.desc,
      ``,
      `Symptoms`,
      `${'─'.repeat(40)}`,
      ...disease.symptoms.map(s => `• ${s}`),
      ``,
      `Chemical Treatment`,
      `${'─'.repeat(40)}`,
      ...disease.treatments.chemical.map(t => `• ${t}`),
      ``,
      `Organic Treatment`,
      `${'─'.repeat(40)}`,
      ...disease.treatments.organic.map(t => `• ${t}`),
      ``,
      `Preventive Measures`,
      `${'─'.repeat(40)}`,
      ...disease.treatments.preventive.map(t => `• ${t}`),
      ``,
      `Marathi : ${disease.marathi}`,
      `Hindi   : ${disease.hindi}`,
      ``,
      `Generated by OrangeAI`,
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `orangeai-report-${Date.now()}.txt`
    a.click()
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Header */}
        <motion.div className={styles.resultHeader} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
          <div className={styles.badge} style={{background:sev.bg, color:sev.color, borderColor:sev.color+'40'}}>
            <span className={styles.dot}/>
            {disease.id === 'healthy' ? '✅ Analysis Complete' : `⚠️ Disease Detected — ${sev.label.toUpperCase()} Severity`}
          </div>
          <h1 className={styles.title}>
            {disease.id === 'healthy' ? 'Your Plant is Healthy!' : disease.name}
          </h1>
          <p className={styles.confLine}>
            <span className={styles.confNum}>{(conf*100).toFixed(1)}%</span> confidence
            &nbsp;·&nbsp; ResNet-50 CNN &nbsp;·&nbsp; {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map((t,i) => (
            <button
              key={t}
              className={`${styles.tab} ${tab===i ? styles.activeTab : ''}`}
              onClick={() => setTab(i)}
            >{t}</button>
          ))}
        </div>

        {/* ── Tab 0: Diagnosis ────────────────────────────── */}
        {tab === 0 && (
          <motion.div className={styles.tabContent} initial={{opacity:0}} animate={{opacity:1}}>
            <div className={styles.diagGrid}>
              {/* Main result card */}
              <div className={styles.card}>
                <div className={styles.diseaseHeader}>
                  <span className={styles.diseaseIcon}>{disease.icon}</span>
                  <div>
                    <div className={styles.diseaseName}>{disease.name}</div>
                    <div className={styles.diseaseSci}>{disease.sci}</div>
                    <div className={styles.diseaseBadge} style={{background:sev.bg, color:sev.color}}>
                      {disease.type} · {sev.label} severity
                    </div>
                  </div>
                  <div className={styles.confBadge} style={{background:sev.bg, color:sev.color}}>
                    {(conf*100).toFixed(1)}%
                  </div>
                </div>
                <p className={styles.diseaseDesc}>{disease.desc}</p>

                <div className={styles.symptomsTitle}>Symptoms Observed</div>
                <ul className={styles.symptomsList}>
                  {disease.symptoms.map(s => <li key={s}>{s}</li>)}
                </ul>

                {/* Severity bar */}
                <div className={styles.sevTitle}>Severity Level</div>
                <div className={styles.sevBar}>
                  {['none','low','medium','high','critical'].map((s,i) => (
                    <div
                      key={s}
                      className={styles.sevSeg}
                      style={{
                        background: SEVERITY_LEVELS[s].color,
                        opacity: SEVERITY_LEVELS[s].order <= SEVERITY_LEVELS[disease.severity]?.order ? 1 : 0.15,
                      }}
                    />
                  ))}
                </div>
                <div className={styles.sevLabels}>
                  <span>None</span><span>Low</span><span>Medium</span><span>High</span><span>Critical</span>
                </div>
              </div>

              {/* Probability chart */}
              <div className={styles.card}>
                <div className={styles.cardTitle}>📊 Probability Distribution</div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={probData} layout="vertical" margin={{left:10,right:24,top:4,bottom:4}}>
                    <XAxis type="number" domain={[0,100]} tick={{fontSize:11}} tickFormatter={v=>`${v}%`}/>
                    <YAxis type="category" dataKey="name" tick={{fontSize:11}} width={110}/>
                    <Tooltip formatter={v => [`${v}%`,'Confidence']}/>
                    <Bar dataKey="value" radius={[0,6,6,0]} maxBarSize={20}>
                      {probData.map((_,i) => (
                        <Cell key={i} fill={i===0 ? '#F97316' : i===1 ? '#FBBF24' : '#D1D5DB'}/>
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Preview image */}
                {result.imageUrl && (
                  <>
                    <div className={styles.cardTitle} style={{marginTop:20}}>🖼️ Analysed Image</div>
                    <img src={result.imageUrl} alt="Analysed" className={styles.resultImg}/>
                  </>
                )}
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.btnSecondary} onClick={() => navigate('/detect')}>🔄 New Analysis</button>
              <button className={styles.btnSecondary} onClick={() => setTab(4)}>📄 View Report</button>
              <button className={styles.btnPrimary} onClick={() => setTab(1)}>💊 See Treatment →</button>
            </div>
          </motion.div>
        )}

        {/* ── Tab 1: Treatment ────────────────────────────── */}
        {tab === 1 && (
          <motion.div className={styles.tabContent} initial={{opacity:0}} animate={{opacity:1}}>
            <div className={styles.treatmentGrid}>
              {[
                { key:'chemical',   icon:'🧪', label:'Chemical Treatment',  bg:'#EFF6FF', col:'#1D4ED8' },
                { key:'organic',    icon:'🌿', label:'Organic / Bio',        bg:'#F0FDF4', col:'#15803D' },
                { key:'preventive', icon:'🛡️', label:'Preventive Measures',  bg:'#FFF7ED', col:'#C2410C' },
              ].map(t => (
                <div key={t.key} className={styles.treatCard}>
                  <div className={styles.treatHeader} style={{background:t.bg}}>
                    <span className={styles.treatIcon}>{t.icon}</span>
                    <span className={styles.treatLabel} style={{color:t.col}}>{t.label}</span>
                  </div>
                  <ul className={styles.treatList}>
                    {disease.treatments[t.key].map(item => (
                      <li key={item} className={styles.treatItem}>
                        <span className={styles.treatBullet} style={{color:t.col}}>›</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Tab 2: Language ─────────────────────────────── */}
        {tab === 2 && (
          <motion.div className={styles.tabContent} initial={{opacity:0}} animate={{opacity:1}}>

            {/* Status banner */}
            <TTSStatusBanner error={ttsError} loading={ttsLoading} />

            <div className={styles.langGrid}>

              {/* ── Marathi ── */}
              <div className={styles.langCard} style={{background:'linear-gradient(135deg,#FFF7ED,#FED7AA)',borderColor:'#FDBA74'}}>
                <div className={styles.langFlag}>🇮🇳</div>
                <div className={styles.langName}>मराठीत निकाल</div>
                <div className={styles.langText}>{disease.marathi}</div>
                <div className={styles.langBtns}>
                  <button
                    className={styles.speakBtn}
                    style={{
                      background: speaking && speakingLang==='mr-IN' ? '#C2410C' : 'var(--orange)',
                    }}
                    onClick={() => speaking && speakingLang==='mr-IN' ? stopSpeak() : speak(disease.marathi,'mr-IN')}
                  >
                    {ttsLoading && speakingLang==='mr-IN' ? '⏳ लोड होत आहे...' : speaking && speakingLang==='mr-IN' ? '⏹ थांबवा' : '🔊 ऐका (Listen)'}
                  </button>
                  <button className={styles.copyBtn} onClick={() => navigator.clipboard.writeText(disease.marathi)}>
                    📋 Copy
                  </button>
                </div>
                {speaking && speakingLang==='mr-IN' && (
                  <div className={styles.waveRow}>
                    {[1,2,3,4,5].map(i=><span key={i} className={styles.wave} style={{animationDelay:`${i*0.1}s`}}/>)}
                    <span style={{fontSize:12,color:'#C2410C',marginLeft:8}}>बोलत आहे...</span>
                  </div>
                )}

              </div>

              {/* ── Hindi ── */}
              <div className={styles.langCard} style={{background:'linear-gradient(135deg,#F0FDF4,#DCFCE7)',borderColor:'#86EFAC'}}>
                <div className={styles.langFlag}>🇮🇳</div>
                <div className={styles.langName} style={{color:'#15803D'}}>हिंदी में परिणाम</div>
                <div className={styles.langText}>{disease.hindi}</div>
                <div className={styles.langBtns}>
                  <button
                    className={styles.speakBtn}
                    style={{
                      background: speaking && speakingLang==='hi-IN' ? '#166534' : '#16A34A',
                    }}
                    onClick={() => speaking && speakingLang==='hi-IN' ? stopSpeak() : speak(disease.hindi,'hi-IN')}
                  >
                    {ttsLoading && speakingLang==='hi-IN' ? '⏳ लोड हो रहा है...' : speaking && speakingLang==='hi-IN' ? '⏹ रोकें' : '🔊 सुनें (Listen)'}
                  </button>
                  <button className={styles.copyBtn} onClick={() => navigator.clipboard.writeText(disease.hindi)}>
                    📋 Copy
                  </button>
                </div>
                {speaking && speakingLang==='hi-IN' && (
                  <div className={styles.waveRow}>
                    {[1,2,3,4,5].map(i=><span key={i} className={styles.wave} style={{animationDelay:`${i*0.1}s`}}/>)}
                    <span style={{fontSize:12,color:'#166534',marginLeft:8}}>बोल रहा है...</span>
                  </div>
                )}

              </div>
            </div>

            {/* ── English fallback ── */}
            <div className={styles.langCard} style={{background:'#EFF6FF',borderColor:'#BFDBFE',marginTop:16}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <span style={{fontSize:24}}>🇬🇧</span>
                <div style={{fontSize:15,fontWeight:700,color:'#1D4ED8'}}>English</div>
              </div>
              <div style={{fontSize:15,color:'#1e293b',fontWeight:500,marginBottom:14,lineHeight:1.65}}>
                {disease.name} detected with {(conf*100).toFixed(1)}% confidence.
                Severity: {disease.severity}. {disease.desc}
              </div>
              <button
                className={styles.speakBtn}
                style={{
                  background: speaking && speakingLang==='en-IN' ? '#1D4ED8' : '#2563EB',
                }}
                onClick={() =>
                  speaking && speakingLang==='en-IN'
                    ? stopSpeak()
                    : speak(`${disease.name} detected. Severity ${disease.severity}. ${disease.desc}`, 'en-IN')
                }
              >
                {ttsLoading && speakingLang==='en-IN' ? '⏳ Loading...' : speaking && speakingLang==='en-IN' ? '⏹ Stop' : '🔊 Listen (English)'}
              </button>
              {speaking && speakingLang==='en-IN' && (
                <div className={styles.waveRow} style={{marginTop:10}}>
                  {[1,2,3,4,5].map(i=><span key={i} className={styles.wave} style={{animationDelay:`${i*0.1}s`,background:'#2563EB'}}/>)}
                  <span style={{fontSize:12,color:'#1D4ED8',marginLeft:8}}>Speaking...</span>
                </div>
              )}
            </div>

          </motion.div>
        )}

        {/* ── Tab 3: Heatmap ──────────────────────────────── */}
        {tab === 3 && (
          <motion.div className={styles.tabContent} initial={{opacity:0}} animate={{opacity:1}}>
            <div className={styles.card} style={{padding:24}}>
              <div className={styles.cardTitle}>🗺️ Disease Heatmap — Vidarbha Region, Maharashtra</div>
              <p style={{fontSize:14,color:'var(--gray-500)',marginBottom:16}}>
                Geo-tagged disease reports from farmer submissions across Maharashtra's orange belt.
              </p>
              <canvas ref={canvasRef} className={styles.mapCanvas} height={340}/>
              <div className={styles.mapLegend}>
                {[['#DC2626','High severity'],['#F97316','Moderate'],['#22C55E','Healthy region']].map(([c,l])=>(
                  <span key={l} className={styles.legendItem}>
                    <span className={styles.legendDot} style={{background:c}}/>
                    {l}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.districtGrid}>
              {GEO_DISTRICTS.map(d => (
                <div key={d.name} className={styles.districtCard} style={{borderColor:d.severity==='high'?'#FCA5A5':d.severity==='medium'?'#FED7AA':'#BBF7D0'}}>
                  <div className={styles.districtName}>{d.name}</div>
                  <div className={styles.districtReports}>{d.reports} reports this month</div>
                  <div className={styles.districtSev}
                    style={{background:SEVERITY_LEVELS[d.severity]?.bg, color:SEVERITY_LEVELS[d.severity]?.color}}>
                    {d.severity}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Tab 4: Report ───────────────────────────────── */}
        {tab === 4 && (
          <motion.div className={styles.tabContent} initial={{opacity:0}} animate={{opacity:1}}>
            <div className={styles.reportCard}>
              <div className={styles.reportHeader}>
                <div>
                  <div className={styles.reportTitle}>OrangeAI Detection Report</div>
                  <div className={styles.reportDate}>Generated: {new Date().toLocaleString()}</div>
                </div>
                <div className={styles.reportConf} style={{color:sev.color}}>{(conf*100).toFixed(1)}%</div>
              </div>

              <table className={styles.reportTable}>
                <tbody>
                  {[
                    ['Disease Detected',  `${disease.icon} ${disease.name}`],
                    ['Scientific Name',   disease.sci],
                    ['Disease Type',      disease.type],
                    ['Confidence Score',  `${(conf*100).toFixed(1)}%`],
                    ['Severity',          disease.severity.toUpperCase()],
                    ['Plant Part',        result.settings?.part || '—'],
                    ['Analysis Mode',     result.settings?.mode || '—'],
                    ['Date',              new Date().toLocaleString()],
                  ].map(([k,v],i) => (
                    <tr key={k} style={{background: i%2===0 ? 'var(--gray-50)' : 'white'}}>
                      <td className={styles.reportKey}>{k}</td>
                      <td className={styles.reportVal}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={styles.reportSection}>
                <div className={styles.reportSectionTitle}>Description</div>
                <p className={styles.reportText}>{disease.desc}</p>
              </div>

              <div className={styles.reportSection}>
                <div className={styles.reportSectionTitle}>Symptoms</div>
                <ul className={styles.reportList}>
                  {disease.symptoms.map(s => <li key={s}>{s}</li>)}
                </ul>
              </div>

              {['chemical','organic','preventive'].map(type => (
                <div key={type} className={styles.reportSection}>
                  <div className={styles.reportSectionTitle} style={{textTransform:'capitalize'}}>{type} Treatment</div>
                  <ul className={styles.reportList}>
                    {disease.treatments[type].map(t => <li key={t}>{t}</li>)}
                  </ul>
                </div>
              ))}

              <div className={styles.reportSection}>
                <div className={styles.reportSectionTitle}>Multilingual Results</div>
                <p className={styles.reportText}><strong>Marathi:</strong> {disease.marathi}</p>
                <p className={styles.reportText} style={{marginTop:8}}><strong>Hindi:</strong> {disease.hindi}</p>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.btnSecondary} onClick={() => navigate('/detect')}>🔄 New Analysis</button>
              <button className={styles.btnPrimary} onClick={downloadReport}>⬇️ Download Report</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}