import { useLanguage } from '../lib/i18n'

function Converter() {
  const { t } = useLanguage()
  return <div>{t('tabConverter')}</div>
}

export default Converter
