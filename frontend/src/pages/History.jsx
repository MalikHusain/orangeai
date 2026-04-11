import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Trash2, RefreshCw } from 'lucide-react'
import { SEVERITY_LEVELS } from '../utils/diseaseData'
import styles from './History.module.css'

export default function History() {
  const [history, setHistory] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const h = JSON.parse(localStorage.getItem('orangeai_history') || '[]')
    setHistory(h)
  }, [])

  const deleteOne = (id) => {
    const updated = history.filter(h => h.id !== id)
    setHistory(updated)
    localStorage.setItem('orangeai_history', JSON.stringify(updated))
  }

  const clearAll = () => {
    setHistory([])
    localStorage.removeItem('orangeai_history')
  }

  const stats = {
    total:    history.length,
    diseases: history.filter(h => h.severity !== 'none').length,
    healthy:  history.filter(h => h.severity === 'none').length,
    critical: history.filter(h => h.severity === 'critical').length,
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <motion.div className={styles.header} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
          <div className={styles.headerLeft}>
            <span className={styles.badge}><span className={styles.dot}/>Analysis History</span>
            <h1 className={styles.title}>Your Past Analyses</h1>
            <p className={styles.sub}>All scans saved locally in your browser. Track disease progression over time.</p>
          </div>
          {history.length > 0 && (
            <button className={styles.clearBtn} onClick={clearAll}>
              <Trash2 size={15}/> Clear All
            </button>
          )}
        </motion.div>

        {/* Stats */}
        {history.length > 0 && (
          <div className={styles.statsRow}>
            {[['Total Scans', stats.total, '#F97316'],
              ['Diseases Found', stats.diseases, '#DC2626'],
              ['Healthy', stats.healthy, '#16A34A'],
              ['Critical', stats.critical, '#7F1D1D'],
            ].map(([label, val, col]) => (
              <div key={label} className={styles.statCard}>
                <div className={styles.statNum} style={{color:col}}>{val}</div>
                <div className={styles.statLabel}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* History Grid */}
        {history.length === 0 ? (
          <motion.div className={styles.empty} initial={{opacity:0}} animate={{opacity:1}}>
            <span className={styles.emptyIcon}>🍊</span>
            <h3>No analyses yet</h3>
            <p>Upload a photo to get started — your results will appear here.</p>
            <button className={styles.startBtn} onClick={() => navigate('/detect')}>
              🔬 Start First Analysis
            </button>
          </motion.div>
        ) : (
          <div className={styles.grid}>
            <AnimatePresence>
              {history.map((item, i) => {
                const sev = SEVERITY_LEVELS[item.severity] || SEVERITY_LEVELS.low
                return (
                  <motion.div
                    key={item.id}
                    className={styles.card}
                    initial={{ opacity:0, y:20 }}
                    animate={{ opacity:1, y:0 }}
                    exit={{ opacity:0, scale:.9 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <div className={styles.cardIcon} style={{background:item.color+'20', borderColor:item.color+'40'}}>
                      {item.icon}
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardName}>{item.disease}</div>
                      <div className={styles.cardDate}>
                        {new Date(item.timestamp).toLocaleDateString('en-IN', {
                          day:'numeric', month:'short', year:'numeric'
                        })}
                      </div>
                      <div className={styles.cardMeta}>
                        <span className={styles.confBadge}>{(item.confidence*100).toFixed(1)}% conf.</span>
                        <span className={styles.sevBadge} style={{background:sev.bg, color:sev.color}}>
                          {sev.label}
                        </span>
                      </div>
                    </div>
                    <button className={styles.deleteBtn} onClick={() => deleteOne(item.id)} aria-label="Delete">
                      <Trash2 size={14}/>
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {history.length > 0 && (
          <div className={styles.actions}>
            <button className={styles.newBtn} onClick={() => navigate('/detect')}>
              <RefreshCw size={16}/> New Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  )
}