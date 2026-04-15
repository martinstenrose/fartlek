import { useState, useMemo } from 'react'
import { useLanguage } from '../lib/i18n'
import { parseTime, formatTime, formatPace, riegel, speedToPace, paceToSpeed } from '../lib/formulas'

const RIEGEL_DISTANCES = [400, 800, 1000, 3000, 5000, 10000, 21097.5, 30000, 42195]

function stripDistSeparators(v: string) {
  return v.replace(/[\s,]/g, '')
}

function riegelLabel(meters: number, lang: 'en' | 'sv'): string {
  if (meters === 21097.5) return lang === 'sv' ? 'Halvmaraton' : 'Half Marathon'
  if (meters === 42195) return lang === 'sv' ? 'Maraton' : 'Marathon'
  if (meters < 1000) return lang === 'sv' ? `${meters} m` : `${meters}m`
  const km = meters / 1000
  return lang === 'sv' ? `${km} km` : `${km}K`
}

const CARD_COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#f43f5e', '#f59e0b']

function Converter() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <RiegelCard color={CARD_COLORS[0]} />
      <MinKmToKmhCard color={CARD_COLORS[1]} />
      <KmhToMinKmCard color={CARD_COLORS[2]} />
      <CalcPaceCard color={CARD_COLORS[3]} />
      <CalcTimeCard color={CARD_COLORS[4]} />
      <CalcDistanceCard color={CARD_COLORS[5]} />
    </div>
  )
}

function CardWrapper({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ ...styles.card, borderTop: `3px solid ${color}` }}>
      <h3 style={styles.cardTitle}>{title}</h3>
      {children}
    </div>
  )
}

function RiegelCard({ color }: { color: string }) {
  const { t, lang, fmtDist } = useLanguage()
  const [distanceRaw, setDistanceRaw] = useState('')
  const [timeStr, setTimeStr] = useState('')

  const equivalents = useMemo(() => {
    const dist = parseFloat(distanceRaw)
    const time = parseTime(timeStr)
    if (!dist || isNaN(time) || dist <= 0 || time <= 0) return null

    return RIEGEL_DISTANCES.map(meters => {
      const eqTime = riegel(time, dist, meters)
      const pace = eqTime / (meters / 1000)
      return { meters, label: riegelLabel(meters, lang), time: formatTime(eqTime), pace: formatPace(pace) }
    })
  }, [distanceRaw, timeStr, lang])

  return (
    <CardWrapper title={t('distanceConverter')} color={color}>
      <div style={styles.inputRow}>
        <input
          type="text"
          inputMode="numeric"
          style={styles.input}
          value={distanceRaw ? fmtDist(parseFloat(distanceRaw)) : ''}
          onChange={e => setDistanceRaw(stripDistSeparators(e.target.value))}
          placeholder={t('converterDistPlaceholder')}
        />
        <input
          type="text"
          style={styles.input}
          value={timeStr}
          onChange={e => setTimeStr(e.target.value)}
          placeholder={t('timePlaceholder')}
        />
      </div>
      {equivalents && (
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span style={{ flex: 1 }}>{t('raceDistance')}</span>
            <span style={{ flex: 1, textAlign: 'right' }}>{t('time')}</span>
            <span style={{ flex: 1, textAlign: 'right' }}>{t('pace')}</span>
          </div>
          {equivalents.map(eq => (
            <div key={eq.meters} style={styles.tableRow}>
              <span style={{ flex: 1 }}>{eq.label}</span>
              <span className="mono" style={{ flex: 1, textAlign: 'right' }}>{eq.time}</span>
              <span className="mono" style={{ flex: 1, textAlign: 'right' }}>{eq.pace}</span>
            </div>
          ))}
        </div>
      )}
    </CardWrapper>
  )
}

function MinKmToKmhCard({ color }: { color: string }) {
  const { t, fmtNum } = useLanguage()
  const [paceStr, setPaceStr] = useState('')

  const result = useMemo(() => {
    const pace = parseTime(paceStr)
    if (isNaN(pace) || pace <= 0) return null
    return paceToSpeed(pace)
  }, [paceStr])

  return (
    <CardWrapper title={t('minKmToKmh')} color={color}>
      <input
        type="text"
        style={styles.input}
        value={paceStr}
        onChange={e => setPaceStr(e.target.value)}
        placeholder={t('timePlaceholder')}
      />
      {result && (
        <div style={styles.result}>
          <span style={styles.resultLabel}>{t('result')}</span>
          <span className="mono" style={styles.resultValue}>{fmtNum(result, 2)} {t('kmh')}</span>
        </div>
      )}
    </CardWrapper>
  )
}

function KmhToMinKmCard({ color }: { color: string }) {
  const { t } = useLanguage()
  const [speedStr, setSpeedStr] = useState('')

  const result = useMemo(() => {
    const speed = parseFloat(speedStr)
    if (isNaN(speed) || speed <= 0) return null
    return formatPace(speedToPace(speed))
  }, [speedStr])

  return (
    <CardWrapper title={t('kmhToMinKm')} color={color}>
      <input
        type="text"
        inputMode="decimal"
        style={styles.input}
        value={speedStr}
        onChange={e => setSpeedStr(e.target.value)}
        placeholder={t('kmh')}
      />
      {result && (
        <div style={styles.result}>
          <span style={styles.resultLabel}>{t('result')}</span>
          <span className="mono" style={styles.resultValue}>{result} {t('minKm')}</span>
        </div>
      )}
    </CardWrapper>
  )
}

function CalcPaceCard({ color }: { color: string }) {
  const { t } = useLanguage()
  const [distStr, setDistStr] = useState('')
  const [timeStr, setTimeStr] = useState('')

  const result = useMemo(() => {
    const dist = parseFloat(distStr)
    const time = parseTime(timeStr)
    if (isNaN(dist) || isNaN(time) || dist <= 0 || time <= 0) return null
    return formatPace(time / dist)
  }, [distStr, timeStr])

  return (
    <CardWrapper title={t('calcPace')} color={color}>
      <div style={styles.inputRow}>
        <input
          type="text"
          inputMode="decimal"
          style={styles.input}
          value={distStr}
          onChange={e => setDistStr(e.target.value)}
          placeholder={t('distanceKm')}
        />
        <input
          type="text"
          style={styles.input}
          value={timeStr}
          onChange={e => setTimeStr(e.target.value)}
          placeholder={t('timePlaceholder')}
        />
      </div>
      {result && (
        <div style={styles.result}>
          <span style={styles.resultLabel}>{t('result')}</span>
          <span className="mono" style={styles.resultValue}>{result} {t('minKm')}</span>
        </div>
      )}
    </CardWrapper>
  )
}

function CalcTimeCard({ color }: { color: string }) {
  const { t } = useLanguage()
  const [distStr, setDistStr] = useState('')
  const [paceStr, setPaceStr] = useState('')

  const result = useMemo(() => {
    const dist = parseFloat(distStr)
    const pace = parseTime(paceStr)
    if (isNaN(dist) || isNaN(pace) || dist <= 0 || pace <= 0) return null
    return formatTime(dist * pace)
  }, [distStr, paceStr])

  return (
    <CardWrapper title={t('calcTime')} color={color}>
      <div style={styles.inputRow}>
        <input
          type="text"
          inputMode="decimal"
          style={styles.input}
          value={distStr}
          onChange={e => setDistStr(e.target.value)}
          placeholder={t('distanceKm')}
        />
        <input
          type="text"
          style={styles.input}
          value={paceStr}
          onChange={e => setPaceStr(e.target.value)}
          placeholder={t('pacePlaceholder')}
        />
      </div>
      {result && (
        <div style={styles.result}>
          <span style={styles.resultLabel}>{t('result')}</span>
          <span className="mono" style={styles.resultValue}>{result}</span>
        </div>
      )}
    </CardWrapper>
  )
}

function CalcDistanceCard({ color }: { color: string }) {
  const { t, fmtNum } = useLanguage()
  const [timeStr, setTimeStr] = useState('')
  const [paceStr, setPaceStr] = useState('')

  const result = useMemo(() => {
    const time = parseTime(timeStr)
    const pace = parseTime(paceStr)
    if (isNaN(time) || isNaN(pace) || time <= 0 || pace <= 0) return null
    return time / pace
  }, [timeStr, paceStr])

  return (
    <CardWrapper title={t('calcDistance')} color={color}>
      <div style={styles.inputRow}>
        <input
          type="text"
          style={styles.input}
          value={timeStr}
          onChange={e => setTimeStr(e.target.value)}
          placeholder={t('timePlaceholder')}
        />
        <input
          type="text"
          style={styles.input}
          value={paceStr}
          onChange={e => setPaceStr(e.target.value)}
          placeholder={t('pacePlaceholder')}
        />
      </div>
      {result && (
        <div style={styles.result}>
          <span style={styles.resultLabel}>{t('result')}</span>
          <span className="mono" style={styles.resultValue}>{fmtNum(result, 2)} km</span>
        </div>
      )}
    </CardWrapper>
  )
}

export default Converter

const styles: Record<string, React.CSSProperties> = {
  card: {
    padding: '1rem',
    borderRadius: '8px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
  },
  cardTitle: {
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
  },
  inputRow: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  input: {
    width: '100%',
    padding: '0.5rem 0.65rem',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontSize: '0.9rem',
    fontFamily: '"JetBrains Mono", monospace',
  },
  result: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: '0.5rem 0',
    marginTop: '0.25rem',
  },
  resultLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  resultValue: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--accent)',
  },
  table: {
    border: '1px solid var(--border)',
    borderRadius: '8px',
    overflow: 'hidden',
    marginTop: '0.5rem',
  },
  tableHeader: {
    display: 'flex',
    padding: '0.5rem 0.75rem',
    background: 'var(--bg)',
    borderBottom: '1px solid var(--border)',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
  },
  tableRow: {
    display: 'flex',
    padding: '0.4rem 0.75rem',
    borderBottom: '1px solid var(--border)',
    fontSize: '0.8rem',
    alignItems: 'center',
  },
}
