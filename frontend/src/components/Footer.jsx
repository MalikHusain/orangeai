import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.icon}>🍊</span>
          <span className={styles.name}>OrangeAI</span>
        </div>
        <p className={styles.tagline}>
          AI-powered orange disease detection for farmers across India
        </p>
        <div className={styles.links}>
          <span>ResNet-50 · 94.7% Accuracy</span>
          <span className={styles.dot}>·</span>
          <span>Marathi · Hindi · English</span>
          <span className={styles.dot}>·</span>
          <span>Free & Open Source</span>
        </div>
        <p className={styles.copy}>© {new Date().getFullYear()} OrangeAI. Built to protect orange crops.</p>
      </div>
    </footer>
  )
}