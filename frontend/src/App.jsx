import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Detect from './pages/Detect'
import Results from './pages/Results'
import DiseaseLibrary from './pages/DiseaseLibrary'
import History from './pages/History'
import About from './pages/About'

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/detect"    element={<Detect />} />
          <Route path="/results"   element={<Results />} />
          <Route path="/diseases"  element={<DiseaseLibrary />} />
          <Route path="/history"   element={<History />} />
          <Route path="/about"     element={<About />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}