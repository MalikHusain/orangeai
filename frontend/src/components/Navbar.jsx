import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import styles from './Navbar.module.css'

const LINKS = [
  { to: '/',         label: 'Home'      },
  { to: '/detect',   label: 'Detect'    },
  { to: '/diseases', label: 'Diseases'  },
  { to: '/history',  label: 'History'   },
  { to: '/about',    label: 'About'     },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles.logo}>
          <span className={styles.logoIcon}>🍊</span>
          <span className={styles.logoText}>Orange<em>AI</em></span>
        </NavLink>

        <ul className={styles.links}>
          {LINKS.map(l => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.active : ''}`}
                end={l.to === '/'}
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <button
          className={styles.cta}
          onClick={() => navigate('/detect')}
        >
          🔬 Analyse Now
        </button>

        <button
          className={styles.hamburger}
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className={styles.mobile}>
          {LINKS.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={styles.mobileLink}
              onClick={() => setOpen(false)}
              end={l.to === '/'}
            >
              {l.label}
            </NavLink>
          ))}
          <button
            className={`${styles.cta} ${styles.mobileCta}`}
            onClick={() => { navigate('/detect'); setOpen(false) }}
          >
            🔬 Analyse Now
          </button>
        </div>
      )}
    </header>
  )
}