import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import styles from './Home.module.css'

const fade  = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }
const stagger = { show: { transition: { staggerChildren: 0.12 } } }

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className={styles.hero}>
        <motion.div
          className={styles.heroContent}
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fade} className={styles.badge}>
            <span className={styles.dot} />
            AI-Driven · Instant Diagnosis · Farmer-Friendly
          </motion.div>

          <motion.h1 variants={fade} className={styles.h1}>
            Detect <em>Orange</em> Diseases<br />Instantly with AI
          </motion.h1>

          <motion.p variants={fade} className={styles.desc}>
            Upload a photo of your orange leaf or fruit. Our deep learning model
            identifies diseases in seconds and recommends treatments — in your language.
          </motion.p>

          <motion.div variants={fade} className={styles.stats}>
            {[['94.7%','Accuracy'],['9','Disease Classes'],['&lt;3s','Detection Time'],['3','Languages']].map(([n,l]) => (
              <div key={l} className={styles.stat}>
                <span className={styles.statNum} dangerouslySetInnerHTML={{__html:n}} />
                <span className={styles.statLabel}>{l}</span>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fade} className={styles.ctas}>
            <button className={styles.ctaPrimary} onClick={() => navigate('/detect')}>
              🔬 Start Detection
            </button>
            <button className={styles.ctaSecondary} onClick={() => navigate('/diseases')}>
              📖 View Disease Library
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.heroCard}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <DemoCard />
        </motion.div>
      </section>

      {/* ── Stats Band ───────────────────────────────────── */}
      <div className={styles.band}>
        {[
          ['8+','Orange diseases detected'],
          ['94.7%','Model accuracy (ResNet-50)'],
          ['50K+','Training images'],
          ['100%','Free for farmers'],
        ].map(([n,l]) => (
          <div key={l} className={styles.bandItem}>
            <div className={styles.bandNum}>{n}</div>
            <div className={styles.bandLabel}>{l}</div>
          </div>
        ))}
      </div>

      {/* ── Features ─────────────────────────────────────── */}
      <section className={styles.features}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Everything a Farmer Needs</h2>
          <p className={styles.sectionSub}>
            From photo to treatment in under 3 seconds — in your own language.
          </p>
          <div className={styles.featureGrid}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                className={styles.featureCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className={styles.featureIcon} style={{ background: f.bg }}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className={styles.howSection}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle} style={{ color: 'white' }}>From Photo to Treatment in 4 Steps</h2>
          <div className={styles.steps}>
            {STEPS.map((s, i) => (
              <div key={s.title} className={styles.step}>
                <div className={styles.stepNum}>{i + 1}</div>
                <div className={styles.stepIcon}>{s.icon}</div>
                <div className={styles.stepTitle}>{s.title}</div>
                <div className={styles.stepDesc}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className={styles.ctaSection}>
        <motion.div
          className={styles.ctaBox}
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.ctaTitle}>Ready to Protect Your Crop?</h2>
          <p className={styles.ctaDesc}>Upload a photo right now — it's free and takes under 3 seconds.</p>
          <button className={styles.ctaPrimary} style={{ fontSize: 17 }} onClick={() => navigate('/detect')}>
            🍊 Start Free Analysis
          </button>
        </motion.div>
      </section>
    </div>
  )
}

function DemoCard() {
  return (
    <div className={styles.demoCard}>
      <div className={styles.demoHeader}>
        <div className={styles.demoDots}>
          <span style={{background:'#f87171'}}/><span style={{background:'#fbbf24'}}/><span style={{background:'#4ade80'}}/>
        </div>
        <div className={styles.liveBadge}>
          <span className={styles.liveDot}/>
          LIVE DETECTION
        </div>
      </div>

      <div className={styles.demoImgWrap}>
        <div className={styles.scanLine}/>
        <div className={styles.scanCorners}><span/></div>
        <svg className={styles.orangeSvg} width="90" height="90" viewBox="0 0 90 90" fill="none">
          <circle cx="45" cy="48" r="34" fill="#f97316"/>
          <circle cx="45" cy="48" r="34" fill="url(#os)" opacity="0.4"/>
          <path d="M18 38 Q45 28 72 38" stroke="#ea6b0a" strokeWidth="1" fill="none" opacity="0.5"/>
          <path d="M14 50 Q45 40 76 50" stroke="#ea6b0a" strokeWidth="1" fill="none" opacity="0.5"/>
          <path d="M18 62 Q45 54 72 62" stroke="#ea6b0a" strokeWidth="1" fill="none" opacity="0.5"/>
          <path d="M45 16 Q38 8 32 12 Q36 20 45 16Z" fill="#16a34a"/>
          <path d="M45 16 Q52 7 58 11 Q54 19 45 16Z" fill="#15803d"/>
          <line x1="45" y1="14" x2="45" y2="20" stroke="#78350f" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="35" cy="44" r="4" fill="#7f1d1d" opacity="0.75"/>
          <circle cx="55" cy="52" r="3" fill="#7f1d1d" opacity="0.65"/>
          <circle cx="42" cy="58" r="2.5" fill="#7f1d1d" opacity="0.6"/>
          <circle cx="33" cy="36" r="7" fill="white" opacity="0.15"/>
          <defs>
            <radialGradient id="os" cx="30%" cy="30%">
              <stop offset="0%" stopColor="white" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#c2410c" stopOpacity="0.5"/>
            </radialGradient>
          </defs>
        </svg>
        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:0.07}} viewBox="0 0 260 180" preserveAspectRatio="none">
          <defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0L0 0 0 20" fill="none" stroke="#fb923c" strokeWidth="0.5"/></pattern></defs>
          <rect width="260" height="180" fill="url(#grid)"/>
        </svg>
      </div>

      <div className={styles.demoChipRow}>
        <span className={styles.demoChip}>
          <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#ef4444"/><path d="M5 2.5v3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/><circle cx="5" cy="7" r="0.5" fill="white"/></svg>
          Citrus Canker Detected
        </span>
        <span className={styles.demoTime}>0.82s</span>
      </div>

      {[['Citrus Canker',87,'#f87171','#dc2626'],['Melanose',8,'#fbbf24','#d97706'],['Healthy Plant',5,'#4ade80','#15803d']].map(([name,pct,light,dark])=>(
        <div key={name} className={styles.demoRow}>
          <span className={styles.demoLabel}>{name}</span>
          <div className={styles.demoBar}>
            <div className={styles.demoFill} style={{width:`${pct}%`, background:`linear-gradient(90deg,${dark},${light})`}}/>
          </div>
          <span className={styles.demoPct} style={{color:light}}>{pct}%</span>
        </div>
      ))}

      <div className={styles.demoFooter}>
        <span className={styles.demoLogo}>ORANGEAI</span>
        <span className={styles.demoVersion}>ResNet-50 · v1.0</span>
      </div>
    </div>
  )
}

const FEATURES = [
  { icon:'📸', bg:'#FFF7ED', title:'Photo Upload & Camera',   desc:'Upload from gallery or use live camera. Works on any smartphone.' },
  { icon:'🧠', bg:'#EFF6FF', title:'ResNet-50 AI Model',       desc:'Transfer-learned CNN trained on 50,000+ orange disease images.' },
  { icon:'📊', bg:'#F0FDF4', title:'Confidence Scoring',       desc:'See probability distribution across all 9 disease classes.' },
  { icon:'💊', bg:'#FEF9C3', title:'Treatment Plans',          desc:'Chemical, organic, and preventive treatment for every disease.' },
  { icon:'🗣️', bg:'#FDF4FF', title:'Marathi & Hindi TTS',      desc:'Results spoken aloud in Marathi and Hindi for farmers.' },
  { icon:'🗺️', bg:'#ECFEFF', title:'Vidarbha Disease Heatmap', desc:'Geo-tagged community reports mapped across the orange belt.' },
  { icon:'📄', bg:'#FFF1F2', title:'Downloadable Reports',      desc:'Full PDF-style report for each analysis — share with your agronomist.' },
  { icon:'📋', bg:'#F0FDF4', title:'Analysis History',          desc:'All past scans saved locally — track disease progression over time.' },
]

const STEPS = [
  { icon:'📸', title:'Upload Photo',     desc:'Take a clear photo of the affected leaf, fruit, or bark with your phone.' },
  { icon:'🧠', title:'AI Analyses',      desc:'CNN model analyses 224×224 pixels and computes softmax probabilities across 9 classes.' },
  { icon:'💊', title:'Get Treatment',    desc:'Receive instant diagnosis with confidence score, severity rating, and treatment plan.' },
  { icon:'🗺️', title:'Report & Track',  desc:'Your geo-tagged result contributes to the regional disease heatmap for all farmers.' },
]