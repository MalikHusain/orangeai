import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { DISEASES, SEVERITY_LEVELS } from '../utils/diseaseData'
import styles from './DiseaseLibrary.module.css'

const TYPES = ['All', 'Bacterial', 'Fungal', 'Viral', 'Oomycete', 'Healthy']

export default function DiseaseLibrary() {
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  const filtered = filter === 'All' ? DISEASES : DISEASES.filter(d =>
    filter === 'Healthy' ? d.id === 'healthy' : d.type.includes(filter)
  )

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <motion.div className={styles.header} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
          <span className={styles.badge}><span className={styles.dot}/>Disease Library</span>
          <h1 className={styles.title}>Orange Diseases We Detect</h1>
          <p className={styles.sub}>9 classes including 8 diseases and healthy. Click any card for full details.</p>
        </motion.div>

        {/* Filters */}
        <div className={styles.filters}>
          {TYPES.map(t => (
            <button
              key={t}
              className={`${styles.filterBtn} ${filter===t ? styles.filterActive : ''}`}
              onClick={() => setFilter(t)}
            >{t}</button>
          ))}
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          <AnimatePresence>
            {filtered.map((d, i) => {
              const sev = SEVERITY_LEVELS[d.severity]
              return (
                <motion.div
                  key={d.id}
                  className={styles.card}
                  onClick={() => setSelected(d)}
                  initial={{ opacity:0, y:20 }}
                  animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, scale:.95 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,.1)' }}
                >
                  <div className={styles.cardIcon} style={{background:d.bg}}>{d.icon}</div>
                  <div className={styles.cardName}>{d.name}</div>
                  <div className={styles.cardSci}>{d.sci}</div>
                  <p className={styles.cardDesc}>{d.desc.slice(0,90)}…</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.typeTag}>{d.type}</span>
                    <span className={styles.sevTag} style={{background:sev.bg, color:sev.color}}>
                      {sev.label}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className={styles.overlay}
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className={styles.modal}
              initial={{opacity:0, y:40, scale:.96}}
              animate={{opacity:1, y:0, scale:1}}
              exit={{opacity:0, y:40, scale:.96}}
              onClick={e => e.stopPropagation()}
            >
              <button className={styles.modalClose} onClick={() => setSelected(null)}>✕</button>

              <div className={styles.modalHeader}>
                <span className={styles.modalIcon} style={{background:selected.bg}}>{selected.icon}</span>
                <div>
                  <div className={styles.modalName}>{selected.name}</div>
                  <div className={styles.modalSci}>{selected.sci}</div>
                  <div className={styles.modalTags}>
                    <span className={styles.typeTag}>{selected.type}</span>
                    <span className={styles.sevTag}
                      style={{background:SEVERITY_LEVELS[selected.severity].bg, color:SEVERITY_LEVELS[selected.severity].color}}>
                      {SEVERITY_LEVELS[selected.severity].label} Severity
                    </span>
                  </div>
                </div>
              </div>

              <p className={styles.modalDesc}>{selected.desc}</p>

              <div className={styles.modalSection}>
                <div className={styles.modalSectionTitle}>🔍 Symptoms</div>
                <ul className={styles.modalList}>
                  {selected.symptoms.map(s => <li key={s}>{s}</li>)}
                </ul>
              </div>

              <div className={styles.modalSection}>
                <div className={styles.modalSectionTitle}>💊 Treatment Overview</div>
                <div className={styles.treatGrid}>
                  {[['🧪','Chemical',selected.treatments.chemical],
                    ['🌿','Organic', selected.treatments.organic],
                    ['🛡️','Preventive', selected.treatments.preventive]].map(([icon,label,items]) => (
                    <div key={label} className={styles.treatBox}>
                      <div className={styles.treatBoxTitle}>{icon} {label}</div>
                      <ul>{items.map(t => <li key={t}>{t}</li>)}</ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.modalSection}>
                <div className={styles.modalSectionTitle}>🗣️ Local Language</div>
                <div className={styles.langRow}>
                  <div className={styles.langBox}>
                    <div className={styles.langBoxLabel}>मराठी</div>
                    <div className={styles.langBoxText}>{selected.marathi}</div>
                  </div>
                  <div className={styles.langBox}>
                    <div className={styles.langBoxLabel}>हिंदी</div>
                    <div className={styles.langBoxText}>{selected.hindi}</div>
                  </div>
                </div>
              </div>

              <button className={styles.detectBtn} onClick={() => { setSelected(null); navigate('/detect') }}>
                🔬 Detect This Disease
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}