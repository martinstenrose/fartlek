/**
 * Parse time string "mm:ss" or "hh:mm:ss" into total minutes.
 */
export function parseTime(input: string): number {
  const parts = input.trim().split(':').map(Number)
  if (parts.some(isNaN)) return NaN
  if (parts.length === 3) return parts[0] * 60 + parts[1] + parts[2] / 60
  if (parts.length === 2) return parts[0] + parts[1] / 60
  return NaN
}

/**
 * Format minutes into "h:mm:ss" or "m:ss".
 */
export function formatTime(minutes: number): string {
  const totalSeconds = Math.round(minutes * 60)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const ss = String(s).padStart(2, '0')
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${ss}`
  return `${m}:${ss}`
}

/**
 * Format decimal min/km into "m:ss" pace string.
 */
export function formatPace(minPerKm: number): string {
  const totalSeconds = Math.round(minPerKm * 60)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Jack Daniels VDOT formula.
 * distanceM: race distance in meters
 * timeMin: race time in minutes
 */
export function calcVDOT(distanceM: number, timeMin: number): number {
  const v = distanceM / timeMin // meters per minute
  const vo2 = -4.6 + 0.182258 * v + 0.000104 * v * v
  const pctVO2max =
    0.8 +
    0.1894393 * Math.exp(-0.012778 * timeMin) +
    0.2989558 * Math.exp(-0.1932605 * timeMin)
  return vo2 / pctVO2max
}

/**
 * Maximal Aerobic Speed in km/h from VDOT.
 * Solves VO₂ = −4.6 + 0.182258v + 0.000104v² for v where VO₂ = VDOT,
 * then converts m/min to km/h.
 */
export function calcMAS(vdot: number): number {
  // 0.000104v² + 0.182258v + (−4.6 − vdot) = 0
  const a = 0.000104
  const b = 0.182258
  const c = -4.6 - vdot
  const discriminant = b * b - 4 * a * c
  const v = (-b + Math.sqrt(discriminant)) / (2 * a) // m/min, positive root
  return (v * 60) / 1000 // km/h
}

/**
 * Convert km/h to min/km.
 */
export function speedToPace(kmh: number): number {
  return 60 / kmh
}

/**
 * Convert min/km to km/h.
 */
export function paceToSpeed(minPerKm: number): number {
  return 60 / minPerKm
}

/**
 * Riegel race time prediction.
 * t1: known time (minutes), d1: known distance (meters), d2: target distance (meters)
 * Returns predicted time in minutes.
 */
export function riegel(t1: number, d1: number, d2: number): number {
  return t1 * Math.pow(d2 / d1, 1.06)
}
