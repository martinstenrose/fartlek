import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { createElement } from 'react'

type Lang = 'en' | 'sv'

const translations = {
  en: {
    // Toolbar
    appTitle: 'Fartlek',
    // Tabs
    tabNorwegianSingles: 'Norwegian Singles',
    tabConverter: 'Converter',
    tabHRZones: 'HR Zones',
    // HR Zones
    lthrLabel: 'Threshold heart rate (LTHR)',
    hrHintEmpty: 'Enter your threshold heart rate above to see your training zones.',
    z1Name: 'Recovery',
    z2Name: 'Aerobic base',
    z3Name: 'Tempo',
    z4Name: 'Threshold',
    z5Name: 'VO₂max',
    hrZonePct: '% LTHR',
    hrZoneBpm: 'bpm',
    hrHowToTitle: 'How to find your threshold heart rate',
    hrHowToText: 'Run as hard as you can for 30 minutes, alone and not in a race. Take the average heart rate during the last 20 minutes — that is a good estimate of your threshold heart rate.',
    hrSource: 'Zones based on Joe Friel\'s system (TrainingPeaks)',
    // Norwegian Singles — inputs
    distance: 'Distance (meters)',
    raceTime: 'Race time',
    timePlaceholder: 'mm:ss or hh:mm:ss',
    preset100m: '100m',
    preset200m: '200m',
    preset400m: '400m',
    preset800m: '800m',
    preset5k: '5K',
    preset10k: '10K',
    presetHM: 'Half Marathon',
    presetMarathon: 'Marathon',
    // Norwegian Singles — metrics
    vdot: 'VDOT',
    mas: 'MAS',
    easyPace: 'Easy pace',
    thresholdPace: 'Threshold pace',
    kmh: 'km/h',
    minKm: 'min/km',
    // Norwegian Singles — zones
    trainingZones: 'Training zones',
    zone: 'Zone',
    pctMas: '%MAS',
    pace: 'Pace',
    easyRunning: 'Easy running',
    easyDesc: 'Max 70% max heart rate',
    thresholdIntervals: 'Threshold intervals (Sub LT2)',
    thresholdDesc: '~2.5–3.5 mmol/L lactate',
    vo2maxIntervals: 'VO₂max intervals',
    vo2maxDesc: 'Near maximal oxygen uptake',
    // Norwegian Singles — workouts
    intervalWorkouts: 'Workouts',
    timeBased: 'Time-based threshold intervals',
    distanceBased: 'Distance-based threshold intervals',
    workout: 'Workout',
    structure: 'Structure',
    targetPace: 'Target pace',
    recovery: 'Recovery',
    shortIntervals: 'Short intervals',
    mediumIntervals: 'Medium intervals',
    longIntervals: 'Long intervals',
    reps1k: '1K intervals',
    reps2k: '2K intervals',
    reps3k: '3K intervals',
    structure1k: '8–12 × 1K',
    structure2k: '4–6 × 2K',
    structure3k: '3 × 3K',
    rest60s: '60s rest',
    pace15k: '15K pace',
    paceHM: 'Half Marathon pace',
    pace30k: '30K pace',
    // Norwegian Singles — info box
    aboutTitle: 'About Norwegian Singles',
    aboutItem1: '2–3 quality sessions per week plus 1 long run',
    aboutItem2: 'Quality sessions make up 20–25% of total running time',
    aboutItem3: 'Keep threshold sessions below LT2',
    aboutItem4: 'Keep easy runs very easy (max 65% of MAS)',
    restTitle: 'About resting',
    restItem1: 'Keep rest periods short to maintain lactate state',
    restItem2: 'Rest can be standing, walking, or easy jogging',
    // Norwegian Singles — errors
    errorTooFast: 'The time seems unrealistically fast for the given distance. Double-check your distance and time.',
    hintEmpty: 'Enter a distance and race time above to calculate VDOT and training zones.',
    // Converter
    distanceConverter: 'Distance converter (Riegel)',
    converterDistPlaceholder: 'Distance (m)',
    minKmToKmh: 'min/km → km/h',
    kmhToMinKm: 'km/h → min/km',
    calcPace: 'Calculate pace',
    calcTime: 'Calculate time',
    calcDistance: 'Calculate distance',
    distanceKm: 'Distance (km)',
    time: 'Time',
    pacePlaceholder: 'Pace (min/km)',
    result: 'Result',
    equivalentTimes: 'Equivalent times',
    raceDistance: 'Distance',
  },
  sv: {
    // Toolbar
    appTitle: 'Fartlek',
    // Tabs
    tabNorwegianSingles: 'Norska singlar',
    tabConverter: 'Omvandlare',
    tabHRZones: 'Pulszoner',
    // HR Zones
    lthrLabel: 'Tröskelpuls (LTHR)',
    hrHintEmpty: 'Ange din tröskelpuls ovan för att se dina träningszoner.',
    z1Name: 'Återhämtning',
    z2Name: 'Aerob bas',
    z3Name: 'Tempo',
    z4Name: 'Tröskel',
    z5Name: 'VO₂max',
    hrZonePct: '% LTHR',
    hrZoneBpm: 'bpm',
    hrHowToTitle: 'Hur du hittar din tröskelpuls',
    hrHowToText: 'Spring så hårt du kan i 30 minuter, ensam och inte i tävling. Ta snittpulsen under de sista 20 minuterna – det är en god uppskattning av din tröskelpuls.',
    hrSource: 'Zoner baserade på Joe Friels system (TrainingPeaks)',
    // Norwegian Singles — inputs
    distance: 'Distans (meter)',
    raceTime: 'Lopptid',
    timePlaceholder: 'mm:ss eller hh:mm:ss',
    preset100m: '100 m',
    preset200m: '200 m',
    preset400m: '400 m',
    preset800m: '800 m',
    preset5k: '5 km',
    preset10k: '10 km',
    presetHM: 'Halvmaraton',
    presetMarathon: 'Maraton',
    // Norwegian Singles — metrics
    vdot: 'VDOT',
    mas: 'MAS',
    easyPace: 'Lätt tempo',
    thresholdPace: 'Tröskeltempo',
    kmh: 'km/h',
    minKm: 'min/km',
    // Norwegian Singles — zones
    trainingZones: 'Träningszoner',
    zone: 'Zon',
    pctMas: '%MAS',
    pace: 'Tempo',
    easyRunning: 'Lätt löpning',
    easyDesc: 'Max 70 % av maxpuls',
    thresholdIntervals: 'Tröskelintervaller (sub LT2)',
    thresholdDesc: '~2,5–3,5 mmol/L laktat',
    vo2maxIntervals: 'VO₂max-intervaller',
    vo2maxDesc: 'Nära maximal syreupptagning',
    // Norwegian Singles — workouts
    intervalWorkouts: 'Träningspass',
    timeBased: 'Tidsbaserade tröskelintervaller',
    distanceBased: 'Distansbaserade tröskelintervaller',
    workout: 'Pass',
    structure: 'Struktur',
    targetPace: 'Måltempo',
    recovery: 'Återhämtning',
    shortIntervals: 'Korta intervaller',
    mediumIntervals: 'Medellånga intervaller',
    longIntervals: 'Långa intervaller',
    reps1k: '1 km-intervaller',
    reps2k: '2 km-intervaller',
    reps3k: '3 km-intervaller',
    structure1k: '8–12 × 1 km',
    structure2k: '4–6 × 2 km',
    structure3k: '3 × 3 km',
    rest60s: '60 s vila',
    pace15k: '15K-tempo',
    paceHM: 'Halvmaraton-tempo',
    pace30k: '30K-tempo',
    // Norwegian Singles — info box
    aboutTitle: 'Om norska singlar',
    aboutItem1: '2–3 kvalitetspass/vecka plus 1 lång löprunda',
    aboutItem2: 'Kvalitetspass motsvarar 20–25 procent av total löptid',
    aboutItem3: 'Håll tröskelpassen under LT2',
    aboutItem4: 'Låt de lätta passen vara väldigt lätta (max 65 % av MAS)',
    restTitle: 'Om vila',
    restItem1: 'Håll viloperioderna korta för att bibehålla laktatnivån',
    restItem2: 'Vila kan vara stående, gående eller lätt joggning',
    // Norwegian Singles — errors
    errorTooFast: 'Tiden verkar orimligt snabb för den angivna distansen. Dubbelkolla att distans och tid stämmer.',
    hintEmpty: 'Ange distans och lopptid ovan för att beräkna VDOT och träningszoner.',
    // Converter
    distanceConverter: 'Distansomvandlare (Riegel)',
    converterDistPlaceholder: 'Distans (m)',
    minKmToKmh: 'min/km → km/h',
    kmhToMinKm: 'km/h → min/km',
    calcPace: 'Räkna ut tempo',
    calcTime: 'Räkna ut tid',
    calcDistance: 'Räkna ut distans',
    distanceKm: 'Distans (km)',
    time: 'Tid',
    pacePlaceholder: 'Tempo (min/km)',
    result: 'Resultat',
    equivalentTimes: 'Ekvivalenta tider',
    raceDistance: 'Distans',
  },
} as const

type TranslationKey = keyof typeof translations.en

function detectLanguage(): Lang {
  const stored = localStorage.getItem('lang')
  if (stored === 'en' || stored === 'sv') return stored
  const nav = navigator.language || ''
  return nav === 'sv' || nav.startsWith('sv-') ? 'sv' : 'en'
}

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey) => string
  /** Format a number with locale decimal separator (comma in Swedish). */
  fmtNum: (value: number, decimals?: number) => string
  /** Format an integer with locale thousand separator. */
  fmtDist: (value: number) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLanguage)

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang)
    localStorage.setItem('lang', newLang)
    document.documentElement.lang = newLang
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const t = useCallback(
    (key: TranslationKey) => translations[lang][key],
    [lang],
  )

  const fmtNum = useCallback(
    (value: number, decimals = 1) =>
      value.toFixed(decimals).replace('.', lang === 'sv' ? ',' : '.'),
    [lang],
  )

  const fmtDist = useCallback(
    (value: number) =>
      new Intl.NumberFormat(lang === 'sv' ? 'sv-SE' : 'en-US').format(Math.round(value)),
    [lang],
  )

  return createElement(LanguageContext.Provider, { value: { lang, setLang, t, fmtNum, fmtDist } }, children)
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
