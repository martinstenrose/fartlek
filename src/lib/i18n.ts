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
    // Norwegian Singles — inputs
    distance: 'Distance (meters)',
    raceTime: 'Race time',
    timePlaceholder: 'mm:ss or hh:mm:ss',
    // Norwegian Singles — metrics
    vdot: 'VDOT',
    mas: 'MAS',
    easyPace: 'Easy pace',
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
    intervalWorkouts: 'Interval workouts',
    timeBased: 'Time-based',
    distanceBased: 'Distance-based',
    workout: 'Workout',
    structure: 'Structure',
    targetPace: 'Target pace',
    recovery: 'Recovery',
    shortIntervals: 'Short intervals',
    mediumIntervals: 'Medium intervals',
    longIntervals: 'Long intervals',
    reps1k: '1K reps',
    reps2k: '2K reps',
    reps3k: '3K reps',
    rest60s: '60s rest',
    pace15k: '15K pace',
    paceHM: 'HM pace',
    pace30k: '30K pace',
    // Norwegian Singles — info box
    aboutTitle: 'About Norwegian Singles',
    aboutItem1: '2–3 quality sessions per week plus 1 long run',
    aboutItem2: 'Quality sessions make up 20–25% of total running time',
    aboutItem3: 'Keep threshold sessions below LT2',
    aboutItem4: 'Keep easy runs very easy (max 65% of MAS)',
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
    // Norwegian Singles — inputs
    distance: 'Distans (meter)',
    raceTime: 'Lopptid',
    timePlaceholder: 'mm:ss eller hh:mm:ss',
    // Norwegian Singles — metrics
    vdot: 'VDOT',
    mas: 'MAS',
    easyPace: 'Lätt tempo',
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
    intervalWorkouts: 'Intervallpass',
    timeBased: 'Tidsbaserade',
    distanceBased: 'Distansbaserade',
    workout: 'Pass',
    structure: 'Struktur',
    targetPace: 'Måltempo',
    recovery: 'Återhämtning',
    shortIntervals: 'Korta intervaller',
    mediumIntervals: 'Medellånga intervaller',
    longIntervals: 'Långa intervaller',
    reps1k: '1K-rep',
    reps2k: '2K-rep',
    reps3k: '3K-rep',
    rest60s: '60 s vila',
    pace15k: '15K-tempo',
    paceHM: 'HM-tempo',
    pace30k: '30K-tempo',
    // Norwegian Singles — info box
    aboutTitle: 'Om norska singlar',
    aboutItem1: '2–3 kvalitetspass/vecka plus 1 lång löprunda',
    aboutItem2: 'Kvalitetspass motsvarar 20–25 procent av total löptid',
    aboutItem3: 'Håll tröskelpassen under LT2',
    aboutItem4: 'Låt de lätta passen vara väldigt lätta (max 65 % av MAS)',
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

  return createElement(LanguageContext.Provider, { value: { lang, setLang, t } }, children)
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
