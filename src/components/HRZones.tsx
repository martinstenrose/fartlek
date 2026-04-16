import { useState, useMemo } from 'react'
import { useLanguage } from '../lib/i18n'

const HR_ZONES = [
  { key: 'z1', pctLow: null as number | null, pctHigh: 0.85 as number | null, pctLabel: '< 85%', color: 'var(--zone-easy)' },
  { key: 'z2', pctLow: 0.85,                 pctHigh: 0.90,                   pctLabel: '85–89%', color: '#84cc16' },
  { key: 'z3', pctLow: 0.90,                 pctHigh: 0.95,                   pctLabel: '90–94%', color: '#eab308' },
  { key: 'z4', pctLow: 0.95,                 pctHigh: 1.00,                   pctLabel: '95–99%', color: '#f97316' },
  { key: 'z5', pctLow: 1.00,                 pctHigh: null as number | null,  pctLabel: '≥ 100%', color: '#ef4444' },
]

function bpmRange(lthr: number, pctLow: number | null, pctHigh: number | null): string {
  if (pctLow === null) return `< ${Math.round(lthr * pctHigh!)}`
  if (pctHigh === null) return `≥ ${Math.round(lthr * pctLow)}`
  return `${Math.round(lthr * pctLow)}–${Math.round(lthr * pctHigh) - 1}`
}

function HRZones() {
  const { t } = useLanguage()
  const [lthrStr, setLthrStr] = useState('')

  const zones = useMemo(() => {
    const lthr = parseInt(lthrStr, 10)
    if (!lthr || lthr <= 0) return null
    return HR_ZONES.map(z => ({
      ...z,
      bpm: bpmRange(lthr, z.pctLow, z.pctHigh),
    }))
  }, [lthrStr])

  return (
    <div>
      {/* Input */}
      <div style={styles.section}>
        <label style={styles.label}>{t('lthrLabel')}</label>
        <input
          type="text"
          inputMode="numeric"
          style={styles.input}
          value={lthrStr}
          onChange={e => setLthrStr(e.target.value.replace(/\D/g, ''))}
          placeholder="bpm"
        />
      </div>

      {/* Hint */}
      {!lthrStr && (
        <div style={styles.hint}>{t('hrHintEmpty')}</div>
      )}

      {/* Zone table */}
      {zones && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>{t('tabHRZones')}</h3>
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <span style={{ flex: 2 }}>{t('zone')}</span>
              <span style={{ flex: 1, textAlign: 'right' }}>{t('hrZonePct')}</span>
              <span style={{ flex: 1, textAlign: 'right' }}>{t('hrZoneBpm')}</span>
            </div>
            {zones.map(z => (
              <div key={z.key} style={{ ...styles.tableRow, borderLeft: `3px solid ${z.color}` }}>
                <span style={{ flex: 2 }}>
                  <span style={styles.zoneLabel}>{z.key.toUpperCase()}</span>
                  <span style={styles.zoneDesc}>{t(`${z.key}Name` as Parameters<typeof t>[0])}</span>
                </span>
                <span className="mono" style={{ flex: 1, textAlign: 'right' }}>{z.pctLabel}</span>
                <span className="mono" style={{ flex: 1, textAlign: 'right' }}>{z.bpm}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How-to info box */}
      <div style={styles.infoBox}>
        <h4 style={styles.infoTitle}>{t('hrHowToTitle')}</h4>
        <p style={styles.infoText}>{t('hrHowToText')}</p>
        <p style={styles.infoSource}>{t('hrSource')}</p>
      </div>
    </div>
  )
}

export default HRZones

const styles: Record<string, React.CSSProperties> = {
  section: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    marginBottom: '0.35rem',
    color: 'var(--text)',
  },
  input: {
    width: '100%',
    padding: '0.5rem 0.65rem',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    background: 'var(--bg-surface)',
    color: 'var(--text)',
    fontSize: '1rem',
    fontFamily: '"JetBrains Mono", monospace',
  },
  hint: {
    padding: '1rem',
    borderRadius: '8px',
    background: 'var(--bg-surface)',
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
    marginBottom: '0.75rem',
  },
  table: {
    border: '1px solid var(--border)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    padding: '0.5rem 0.75rem',
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border)',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
  },
  tableRow: {
    display: 'flex',
    padding: '0.5rem 0.75rem',
    borderBottom: '1px solid var(--border)',
    fontSize: '0.8rem',
    alignItems: 'center',
  },
  zoneLabel: {
    display: 'block',
    fontWeight: 600,
  },
  zoneDesc: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  infoBox: {
    padding: '1rem',
    borderRadius: '8px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    marginTop: '1.5rem',
  },
  infoTitle: {
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
  infoText: {
    fontSize: '0.8rem',
    lineHeight: 1.7,
    color: 'var(--text-muted)',
    marginBottom: '0.75rem',
  },
  infoSource: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
}
