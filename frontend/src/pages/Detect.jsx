import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Camera, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import useDetection from '../hooks/useDetection'
import styles from './Detect.module.css'

export default function Detect() {
  const { analyse, loading, progress, loadingMsg } = useDetection()
  const [file,    setFile]    = useState(null)
  const [preview, setPreview] = useState(null)
  const [camera,  setCamera]  = useState(false)
  const [settings, setSettings] = useState({ mode:'full', lang:'en', part:'leaf' })
  const videoRef  = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  /* ── Drop / File ──────────────────────────────────────── */
  const onDrop = useCallback(accepted => {
    const f = accepted[0]
    if (!f) return
    if (f.size > 10 * 1024 * 1024) { toast.error('Max file size is 10MB'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, multiple: false,
  })

  /* ── Camera ───────────────────────────────────────────── */
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      setCamera(true)
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream }, 100)
    } catch { toast.error('Camera not available') }
  }

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setCamera(false)
  }

  const capturePhoto = () => {
    const v = videoRef.current, c = canvasRef.current
    c.width = v.videoWidth; c.height = v.videoHeight
    c.getContext('2d').drawImage(v, 0, 0)
    c.toBlob(blob => {
      const f = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
      setFile(f); setPreview(URL.createObjectURL(blob))
      closeCamera()
    })
  }

  /* ── Demo ─────────────────────────────────────────────── */
  const loadDemo = () => {
    const c = document.createElement('canvas')
    c.width = 400; c.height = 300
    const ctx = c.getContext('2d')
    const g = ctx.createLinearGradient(0,0,400,300)
    g.addColorStop(0,'#2D6A4F'); g.addColorStop(.5,'#52B788'); g.addColorStop(1,'#95D5B2')
    ctx.fillStyle = g; ctx.fillRect(0,0,400,300)
    ctx.fillStyle = 'rgba(120,70,30,.7)'
    for (let i=0; i<14; i++) {
      ctx.beginPath()
      ctx.arc(40+Math.random()*320, 40+Math.random()*220, 4+Math.random()*12, 0, Math.PI*2)
      ctx.fill()
    }
    c.toBlob(blob => {
      const f = new File([blob], 'demo-leaf.jpg', { type: 'image/jpeg' })
      setFile(f); setPreview(URL.createObjectURL(blob))
    })
  }

  const reset = () => { setFile(null); setPreview(null) }

  const handleAnalyse = () => {
    if (!file) { toast.error('Please upload an image first'); return }
    // Try to get geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => analyse(file, { ...settings, lat: pos.coords.latitude, lng: pos.coords.longitude }),
        ()  => analyse(file, settings),
        { timeout: 3000 }
      )
    } else {
      analyse(file, settings)
    }
  }

  return (
    <div className={styles.page}>
      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className={styles.loadingOverlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className={styles.spinner} />
            <div className={styles.loadingText}>{loadingMsg}</div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress || 60}%` }} />
            </div>
            <div className={styles.loadingHint}>Powered by ResNet-50 · 94.7% accuracy</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.inner}>
        <motion.div
          className={styles.header}
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        >
          <span className={styles.badge}><span className={styles.dot}/>Demo Mode</span>
          <h1 className={styles.title}>Analyse Your Orange Plant</h1>
          <p className={styles.sub}>Upload a clear photo of the leaf, fruit, or affected area. The AI model analyses it in seconds.</p>
        </motion.div>

        {!preview ? (
          <motion.div
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
          >
            {/* Drop Zone */}
            <div
              {...getRootProps()}
              className={`${styles.dropzone} ${isDragActive ? styles.dragActive : ''}`}
            >
              <input {...getInputProps()} />
              <Upload size={48} strokeWidth={1} color="var(--orange)" />
              <div className={styles.dropTitle}>Drop your image here</div>
              <div className={styles.dropHint}>or click to browse • JPG, PNG, WEBP • Max 10MB</div>
            </div>

            {/* Capture Options */}
            <div className={styles.options}>
              <button className={styles.optBtn} onClick={() => document.querySelector('input[type=file]')?.click()}>
                <Upload size={24} strokeWidth={1.5} />
                <span className={styles.optLabel}>Upload</span>
                <span className={styles.optSub}>From gallery</span>
              </button>
              <button className={styles.optBtn} onClick={openCamera}>
                <Camera size={24} strokeWidth={1.5} />
                <span className={styles.optLabel}>Camera</span>
                <span className={styles.optSub}>Take photo</span>
              </button>
              <button className={styles.optBtn} onClick={loadDemo}>
                <Zap size={24} strokeWidth={1.5} />
                <span className={styles.optLabel}>Demo</span>
                <span className={styles.optSub}>Try example</span>
              </button>
            </div>

            {/* Camera */}
            <AnimatePresence>
              {camera && (
                <motion.div
                  className={styles.cameraBox}
                  initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}}
                >
                  <div className={styles.cameraHeader}>
                    <span className={styles.cameraTitle}>📷 Camera</span>
                    <button className={styles.cameraClose} onClick={closeCamera}>✕ Close</button>
                  </div>
                  <video ref={videoRef} autoPlay playsInline className={styles.video} />
                  <canvas ref={canvasRef} style={{ display:'none' }} />
                  <button className={styles.captureBtn} onClick={capturePhoto}>📸 Capture Photo</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            className={styles.previewSection}
            initial={{ opacity:0, scale:.97 }} animate={{ opacity:1, scale:1 }}
          >
            <div className={styles.previewGrid}>
              {/* Image Preview */}
              <div className={styles.card}>
                <div className={styles.cardTitle}>🖼️ Uploaded Image</div>
                <img src={preview} alt="Uploaded" className={styles.previewImg} />
                <div className={styles.fileMeta}>
                  <div className={styles.metaRow}><span>File</span><span>{file.name.slice(0,24)}</span></div>
                  <div className={styles.metaRow}><span>Size</span><span>{(file.size/1024).toFixed(0)} KB</span></div>
                  <div className={styles.metaRow}><span>Type</span><span>{file.type.split('/')[1].toUpperCase()}</span></div>
                </div>
                <button className={styles.changeBtn} onClick={reset}>🔄 Change Image</button>
              </div>

              {/* Settings */}
              <div className={styles.card}>
                <div className={styles.cardTitle}>⚙️ Settings</div>
                <div className={styles.settings}>
                  <label className={styles.settingLabel}>Detection Mode</label>
                  <select
                    className={styles.select}
                    value={settings.mode}
                    onChange={e => setSettings(s => ({...s, mode:e.target.value}))}
                  >
                    <option value="full">Full Analysis (Recommended)</option>
                    <option value="quick">Quick Scan</option>
                    <option value="detailed">Detailed Report</option>
                  </select>

                  <label className={styles.settingLabel}>Output Language</label>
                  <select
                    className={styles.select}
                    value={settings.lang}
                    onChange={e => setSettings(s => ({...s, lang:e.target.value}))}
                  >
                    <option value="en">English</option>
                    <option value="mr">मराठी (Marathi)</option>
                    <option value="hi">हिंदी (Hindi)</option>
                  </select>

                  <label className={styles.settingLabel}>Plant Part</label>
                  <select
                    className={styles.select}
                    value={settings.part}
                    onChange={e => setSettings(s => ({...s, part:e.target.value}))}
                  >
                    <option value="leaf">Leaf</option>
                    <option value="fruit">Fruit</option>
                    <option value="bark">Bark / Stem</option>
                    <option value="root">Root</option>
                  </select>

                  <div className={styles.checkRow}>
                    <div>
                      <div className={styles.checkLabel}>Save to History</div>
                      <div className={styles.checkSub}>Store result locally</div>
                    </div>
                    <input type="checkbox" defaultChecked className={styles.checkbox} />
                  </div>
                </div>
              </div>
            </div>

            <motion.button
              className={styles.analyseBtn}
              onClick={handleAnalyse}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🔬 Analyse Disease Now
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}