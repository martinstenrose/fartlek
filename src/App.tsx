import { useState, useEffect, useCallback } from 'react'
import { LanguageProvider, useLanguage } from './lib/i18n'
import NorwegianSingles from './components/NorwegianSingles'
import Converter from './components/Converter'

type Theme = 'light' | 'dark' | 'system'

const themeIcons: Record<Theme, string> = {
  light: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  dark: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  system: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
}

const themes: Theme[] = ['light', 'dark', 'system']

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

function AppContent() {
  const { lang, setLang, t } = useLanguage()
  const [tab, setTab] = useState<'singles' | 'converter'>('singles')
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system'
  })

  const applyTheme = useCallback((th: Theme) => {
    document.documentElement.setAttribute('data-theme', resolveTheme(th))
  }, [])

  useEffect(() => {
    applyTheme(theme)
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => { if (theme === 'system') applyTheme('system') }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme, applyTheme])

  const cycleTheme = () => {
    const next = themes[(themes.indexOf(theme) + 1) % themes.length]
    setThemeState(next)
    localStorage.setItem('theme', next)
  }

  const toggleLang = () => {
    setLang(lang === 'en' ? 'sv' : 'en')
  }

  return (
    <>
      <div style={styles.toolbar}>
        <div style={styles.toolbarTitle}>{t('appTitle')}</div>
        <div style={styles.toolbarActions}>
          <button style={styles.toolbarBtn} onClick={toggleLang} aria-label="Switch language">
            {lang === 'en' ? '🇬🇧' : '🇸🇪'}
          </button>
          <button
            style={styles.toolbarBtn}
            onClick={cycleTheme}
            aria-label="Switch theme"
            dangerouslySetInnerHTML={{ __html: themeIcons[theme] }}
          />
        </div>
      </div>

      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(tab === 'singles' ? styles.tabActive : {}) }}
          onClick={() => setTab('singles')}
        >
          {t('tabNorwegianSingles')}
        </button>
        <button
          style={{ ...styles.tab, ...(tab === 'converter' ? styles.tabActive : {}) }}
          onClick={() => setTab('converter')}
        >
          {t('tabConverter')}
        </button>
      </div>

      <main style={styles.main}>
        {tab === 'singles' ? <NorwegianSingles /> : <Converter />}
      </main>
    </>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}

export default App

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.25rem',
    background: 'var(--bg-toolbar)',
    borderBottom: '1px solid var(--border)',
    boxShadow: 'var(--shadow)',
  },
  toolbarTitle: {
    fontSize: '1rem',
    fontWeight: 600,
  },
  toolbarActions: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  toolbarBtn: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    padding: 0,
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.25rem',
    height: '2.25rem',
  },
  tabs: {
    display: 'flex',
    maxWidth: '640px',
    margin: '0 auto',
    padding: '0.75rem 1.25rem 0',
    gap: '0.5rem',
  },
  tab: {
    flex: 1,
    padding: '0.5rem 1rem',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    background: 'var(--bg-surface)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    fontWeight: 500,
  },
  tabActive: {
    background: 'var(--accent)',
    color: '#ffffff',
    borderColor: 'var(--accent)',
  },
  main: {
    maxWidth: '640px',
    margin: '1rem auto',
    padding: '0 1.25rem',
  },
}
