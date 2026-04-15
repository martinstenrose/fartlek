import { describe, it, expect } from 'vitest'
import {
  parseTime,
  formatTime,
  formatPace,
  calcVDOT,
  calcMAS,
  speedToPace,
  paceToSpeed,
  riegel,
} from './formulas'

describe('parseTime', () => {
  it('parses mm:ss', () => {
    expect(parseTime('20:00')).toBe(20)
    expect(parseTime('25:30')).toBeCloseTo(25.5)
  })

  it('parses hh:mm:ss', () => {
    expect(parseTime('1:30:00')).toBe(90)
    expect(parseTime('2:00:00')).toBe(120)
    expect(parseTime('1:00:30')).toBeCloseTo(60.5)
  })

  it('returns NaN for invalid input', () => {
    expect(parseTime('')).toBeNaN()
    expect(parseTime('abc')).toBeNaN()
    expect(parseTime('1:2:3:4')).toBeNaN()
  })
})

describe('formatTime', () => {
  it('formats minutes < 60 as m:ss', () => {
    expect(formatTime(20)).toBe('20:00')
    expect(formatTime(5.5)).toBe('5:30')
  })

  it('formats minutes >= 60 as h:mm:ss', () => {
    expect(formatTime(90)).toBe('1:30:00')
    expect(formatTime(60)).toBe('1:00:00')
  })
})

describe('formatPace', () => {
  it('formats decimal min/km as m:ss', () => {
    expect(formatPace(4)).toBe('4:00')
    expect(formatPace(4 + 32 / 60)).toBe('4:32')
    expect(formatPace(5.5)).toBe('5:30')
  })
})

describe('calcVDOT', () => {
  it('calculates VDOT for 5K in 20:00', () => {
    const vdot = calcVDOT(5000, 20)
    expect(vdot).toBeCloseTo(49.81, 0)
  })

  it('calculates VDOT for 5K in 17:30', () => {
    const vdot = calcVDOT(5000, 17.5)
    expect(vdot).toBeCloseTo(58.2, 0)
  })

  it('calculates VDOT for 10K in 33:00', () => {
    const vdot = calcVDOT(10000, 33)
    expect(vdot).toBeCloseTo(65.1, 0)
  })

  it('increases VDOT for faster times at same distance', () => {
    expect(calcVDOT(5000, 18)).toBeGreaterThan(calcVDOT(5000, 20))
  })
})

describe('calcMAS', () => {
  it('returns a speed consistent with VDOT', () => {
    const vdot = 50
    const mas = calcMAS(vdot) // km/h
    // MAS is the speed at 100% VO2max, so VO2 at MAS speed should equal VDOT
    const vMperMin = (mas * 1000) / 60
    const vo2 = -4.6 + 0.182258 * vMperMin + 0.000104 * vMperMin * vMperMin
    expect(vo2).toBeCloseTo(vdot, 1)
  })

  it('produces reasonable MAS values', () => {
    // VDOT 40 should give roughly 14–15 km/h MAS
    const mas40 = calcMAS(40)
    expect(mas40).toBeGreaterThan(13)
    expect(mas40).toBeLessThan(16)

    // VDOT 60 should give roughly 19–20 km/h MAS
    const mas60 = calcMAS(60)
    expect(mas60).toBeGreaterThan(18)
    expect(mas60).toBeLessThan(22)
  })
})

describe('speedToPace / paceToSpeed', () => {
  it('converts km/h to min/km', () => {
    expect(speedToPace(12)).toBe(5)
    expect(speedToPace(15)).toBe(4)
  })

  it('converts min/km to km/h', () => {
    expect(paceToSpeed(5)).toBe(12)
    expect(paceToSpeed(4)).toBe(15)
  })

  it('round-trips correctly', () => {
    expect(paceToSpeed(speedToPace(13.5))).toBeCloseTo(13.5)
  })
})

describe('riegel', () => {
  it('predicts longer distances take more time', () => {
    const t5k = 20 // 20 min for 5K
    const t10k = riegel(t5k, 5000, 10000)
    expect(t10k).toBeGreaterThan(t5k * 2) // exponent > 1 means slower per km
  })

  it('returns same time for same distance', () => {
    expect(riegel(20, 5000, 5000)).toBeCloseTo(20)
  })

  it('produces reasonable half marathon prediction from 10K', () => {
    // 10K in 40:00 → HM should be roughly 1:28–1:30
    const tHM = riegel(40, 10000, 21097.5)
    expect(tHM).toBeGreaterThan(86) // > 1:26
    expect(tHM).toBeLessThan(92) // < 1:32
  })
})
