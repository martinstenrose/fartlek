import { useState, useMemo } from 'react'
import { useLanguage } from '../lib/i18n'
import { parseTime, calcVDOT, calcMAS, speedToPace, formatPace, riegel } from '../lib/formulas'

const DISTANCES = [
  { labelKey: 'preset5k' as const, meters: 5000 },
  { labelKey: 'preset10k' as const, meters: 10000 },
  { labelKey: 'presetHM' as const, meters: 21097.5 },
  { labelKey: 'presetMarathon' as const, meters: 42195 },
]

function stripDistSeparators(v: string) {
  return v.replace(/[\s,]/g, '')
}

function NorwegianSingles() {
  const { t, fmtNum, fmtDist } = useLanguage()
  const [distanceRaw, setDistanceRaw] = useState('')
  const [timeStr, setTimeStr] = useState('')

  const result = useMemo(() => {
    const distance = parseFloat(distanceRaw)
    const timeMin = parseTime(timeStr)
    if (!distanceRaw || isNaN(distance) || isNaN(timeMin) || distance <= 0 || timeMin <= 0) return null

    const vdot = calcVDOT(distance, timeMin)
    if (vdot > 85) return { error: 'tooFast' as const }

    const mas = calcMAS(vdot)
    const easyPace = speedToPace(mas * 0.65)

    const zones = [
      { key: 'easy', low: 0.60, high: 0.65, color: 'var(--zone-easy)' },
      { key: 'threshold', low: 0.85, high: 0.90, color: 'var(--zone-threshold)' },
      { key: 'vo2max', low: 0.95, high: 1.00, color: 'var(--zone-vo2max)' },
    ].map(z => ({
      ...z,
      paceLow: formatPace(speedToPace(mas * z.high)),
      paceHigh: formatPace(speedToPace(mas * z.low)),
    }))

    // Race pace equivalents via Riegel
    const t15k = riegel(timeMin, distance, 15000)
    const tHM = riegel(timeMin, distance, 21097.5)
    const t30k = riegel(timeMin, distance, 30000)
    const pace15k = formatPace(t15k / 15)
    const paceHM = formatPace(tHM / 21.0975)
    const pace30k = formatPace(t30k / 30)

    return { vdot, mas, easyPace, zones, pace15k, paceHM, pace30k }
  }, [distanceRaw, timeStr])

  const hasInput = distanceRaw !== '' || timeStr !== ''

  return (
    <div>
      {/* Distance input */}
      <div style={styles.section}>
        <label style={styles.label}>{t('distance')}</label>
        <input
          type="text"
          inputMode="numeric"
          style={styles.input}
          value={distanceRaw ? fmtDist(parseFloat(distanceRaw)) : ''}
          onChange={e => setDistanceRaw(stripDistSeparators(e.target.value))}
          placeholder={fmtDist(5000)}
        />
        <div style={styles.quickButtons}>
          {DISTANCES.map(d => (
            <button
              key={d.labelKey}
              style={styles.quickBtn}
              onClick={() => setDistanceRaw(String(d.meters))}
            >
              {t(d.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Time input */}
      <div style={styles.section}>
        <label style={styles.label}>{t('raceTime')}</label>
        <input
          type="text"
          style={styles.input}
          value={timeStr}
          onChange={e => setTimeStr(e.target.value)}
          placeholder={t('timePlaceholder')}
        />
      </div>

      {/* Results */}
      {!hasInput && (
        <div style={styles.hint}>{t('hintEmpty')}</div>
      )}

      {result && 'error' in result && (
        <div style={styles.error}>{t('errorTooFast')}</div>
      )}

      {result && !('error' in result) && (
        <>
          {/* Key metrics */}
          <div style={styles.metricsGrid}>
            <MetricCard label={t('vdot')} value={fmtNum(result.vdot, 1)} />
            <MetricCard label={`${t('mas')} (${t('kmh')})`} value={fmtNum(result.mas, 1)} />
            <MetricCard label={`${t('easyPace')} (${t('minKm')})`} value={formatPace(result.easyPace)} />
          </div>

          {/* Training zones */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>{t('trainingZones')}</h3>
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <span style={{ flex: 2 }}>{t('zone')}</span>
                <span style={{ flex: 1, textAlign: 'right' }}>{t('pctMas')}</span>
                <span style={{ flex: 1, textAlign: 'right' }}>{t('pace')}</span>
              </div>
              {result.zones.map(z => (
                <div key={z.key} style={{ ...styles.tableRow, borderLeft: `3px solid ${z.color}` }}>
                  <span style={{ flex: 2 }}>
                    {z.key === 'easy' && t('easyRunning')}
                    {z.key === 'threshold' && t('thresholdIntervals')}
                    {z.key === 'vo2max' && t('vo2maxIntervals')}
                  </span>
                  <span className="mono" style={{ flex: 1, textAlign: 'right' }}>
                    {Math.round(z.low * 100)}–{Math.round(z.high * 100)}%
                  </span>
                  <span className="mono" style={{ flex: 1, textAlign: 'right' }}>
                    {z.paceLow}–{z.paceHigh}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interval workouts */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>{t('intervalWorkouts')}</h3>

            <h4 style={styles.subTitle}>{t('timeBased')}</h4>
            <WorkoutTable
              rows={[
                { name: t('shortIntervals'), structure: '8–12 × 3–4 min', pace: `${result.pace15k} (${t('pace15k')})`, recovery: t('rest60s') },
                { name: t('mediumIntervals'), structure: '4–6 × 6–8 min', pace: `${result.paceHM} (${t('paceHM')})`, recovery: t('rest60s') },
                { name: t('longIntervals'), structure: '3 × 10–12 min', pace: `${result.pace30k} (${t('pace30k')})`, recovery: t('rest60s') },
              ]}
            />

            <h4 style={styles.subTitle}>{t('distanceBased')}</h4>
            <WorkoutTable
              rows={[
                { name: t('reps1k'), structure: '8–12 × 1K', pace: `${result.pace15k} (${t('pace15k')})`, recovery: t('rest60s') },
                { name: t('reps2k'), structure: '4–6 × 2K', pace: `${result.paceHM} (${t('paceHM')})`, recovery: t('rest60s') },
                { name: t('reps3k'), structure: '3 × 3K', pace: `${result.pace30k} (${t('pace30k')})`, recovery: t('rest60s') },
              ]}
            />
          </div>

          {/* Info box */}
          <div style={styles.infoBox}>
            <h4 style={styles.infoTitle}>{t('aboutTitle')}</h4>
            <ul style={styles.infoList}>
              <li>{t('aboutItem1')}</li>
              <li>{t('aboutItem2')}</li>
              <li>{t('aboutItem3')}</li>
              <li>{t('aboutItem4')}</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricLabel}>{label}</div>
      <div className="mono" style={styles.metricValue}>{value}</div>
    </div>
  )
}

function WorkoutTable({ rows }: { rows: { name: string; structure: string; pace: string; recovery: string }[] }) {
  const { t } = useLanguage()
  return (
    <div style={styles.table}>
      <div style={styles.tableHeader}>
        <span style={{ flex: 2 }}>{t('workout')}</span>
        <span style={{ flex: 2 }}>{t('structure')}</span>
        <span style={{ flex: 2 }}>{t('targetPace')}</span>
        <span style={{ flex: 1, textAlign: 'right' }}>{t('recovery')}</span>
      </div>
      {rows.map(r => (
        <div key={r.name} style={styles.tableRow}>
          <span style={{ flex: 2 }}>{r.name}</span>
          <span className="mono" style={{ flex: 2 }}>{r.structure}</span>
          <span className="mono" style={{ flex: 2 }}>{r.pace}</span>
          <span style={{ flex: 1, textAlign: 'right' }}>{r.recovery}</span>
        </div>
      ))}
    </div>
  )
}

export default NorwegianSingles

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
  quickButtons: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  quickBtn: {
    flex: 1,
    padding: '0.4rem',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    background: 'var(--bg-surface)',
    color: 'var(--text)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontFamily: 'inherit',
    fontWeight: 500,
  },
  hint: {
    padding: '1rem',
    borderRadius: '8px',
    background: 'var(--bg-surface)',
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    textAlign: 'center',
  },
  error: {
    padding: '1rem',
    borderRadius: '8px',
    background: '#7f1d1d20',
    border: '1px solid #dc2626',
    color: '#dc2626',
    fontSize: '0.875rem',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  metricCard: {
    padding: '0.75rem',
    borderRadius: '8px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
    marginBottom: '0.25rem',
  },
  metricValue: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--accent)',
  },
  sectionTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
    marginBottom: '0.75rem',
  },
  subTitle: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: '0.5rem',
    marginTop: '1rem',
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
  infoList: {
    paddingLeft: '1.25rem',
    fontSize: '0.8rem',
    lineHeight: 1.7,
    color: 'var(--text-muted)',
  },
}
