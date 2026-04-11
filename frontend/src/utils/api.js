import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 30000 })

export const detectDisease = (formData, onProgress) =>
  api.post('/detect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: e => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  })

export const getHistory   = ()      => api.get('/history')
export const deleteHistory = (id)   => api.delete(`/history/${id}`)
export const getGeoReports = ()     => api.get('/geo-reports')
export const getStats      = ()     => api.get('/stats')
export const submitGeoReport = (d)  => api.post('/geo-report', d)

export default api