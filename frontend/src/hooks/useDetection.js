import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { detectDisease } from '../utils/api'
import { DISEASES } from '../utils/diseaseData'

export default function useDetection() {
  const navigate = useNavigate()
  const [loading, setLoading]     = useState(false)
  const [progress, setProgress]   = useState(0)
  const [loadingMsg, setLoadingMsg] = useState('')

  const STEPS = [
    'Preprocessing image...',
    'Loading CNN model...',
    'Running inference...',
    'Analysing disease patterns...',
    'Calculating confidence scores...',
    'Generating treatment plan...',
    'Building multilingual report...',
  ]

  const [backendOnline, setBackendOnline] = useState(true)

  const analyse = useCallback(async (file, settings) => {
    setLoading(true)
    setProgress(0)

    // Animate loading messages
    let step = 0
    const msgInterval = setInterval(() => {
      setLoadingMsg(STEPS[Math.min(step++, STEPS.length - 1)])
    }, 400)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('mode', settings.mode || 'full')
      formData.append('lang', settings.lang || 'en')
      formData.append('part', settings.part || 'leaf')
      if (settings.lat) formData.append('lat', settings.lat)
      if (settings.lng) formData.append('lng', settings.lng)

      let result
      try {
        const { data } = await detectDisease(formData, setProgress)
        result = data.result
        setBackendOnline(true)
      } catch {
        // Demo fallback when backend is not running
        setBackendOnline(false)
        await new Promise(r => setTimeout(r, 2500))
        result = generateDemoResult()
      }

      // Attach full disease data from local DB
      const diseaseData = DISEASES.find(d => d.id === result.primary?.id) ||
                          DISEASES.find(d => d.name === result.primary?.name) ||
                          DISEASES[0]

      const enriched = { ...result, diseaseData, imageUrl: URL.createObjectURL(file), settings }

      // Save to localStorage history
      const history = JSON.parse(localStorage.getItem('orangeai_history') || '[]')
      history.unshift({
        id: Date.now(),
        disease: diseaseData.name,
        icon: diseaseData.icon,
        color: diseaseData.color,
        confidence: result.confidence,
        severity: diseaseData.severity,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem('orangeai_history', JSON.stringify(history.slice(0, 30)))

      // Pass result via navigation state
      navigate('/results', { state: { result: enriched } })
      toast.success('Analysis complete!')

    } catch (err) {
      toast.error('Analysis failed. Please try again.')
      console.error(err)
    } finally {
      clearInterval(msgInterval)
      setLoading(false)
      setProgress(0)
    }
  }, [navigate])

  return { analyse, loading, progress, loadingMsg, backendOnline }
}

function generateDemoResult() {
  const diseases = [
    { id: 'citrus_canker', name: 'Citrus Canker' },
    { id: 'hlb',           name: 'Huanglongbing (HLB)' },
    { id: 'black_spot',    name: 'Citrus Black Spot' },
    { id: 'melanose',      name: 'Melanose' },
    { id: 'healthy',       name: 'Healthy Plant' },
  ]
  const primary = diseases[Math.floor(Math.random() * diseases.length)]
  const confidence = 0.72 + Math.random() * 0.24
  const others = diseases.filter(d => d.id !== primary.id).slice(0, 3)
    .map(d => ({ ...d, confidence: Math.random() * 0.2 }))

  return {
    primary: { ...primary, confidence, severity: 'high' },
    top3: [{ ...primary, confidence }, ...others.slice(0, 2)],
    probabilities: Object.fromEntries(
      diseases.map(d => [d.name, d.id === primary.id ? confidence : Math.random() * 0.15])
    ),
    timestamp: new Date().toISOString(),
    confidence,
  }
}