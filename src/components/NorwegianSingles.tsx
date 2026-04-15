import { useLanguage } from '../lib/i18n'

function NorwegianSingles() {
  const { t } = useLanguage()
  return <div>{t('tabNorwegianSingles')}</div>
}

export default NorwegianSingles
