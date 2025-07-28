import {LanguageCode} from '~/kernel/i18n/localization'
import DE_DE_PRIVACY_POLICY from './privacyPolicy/de-DE.md'
import EN_US_PRIVACY_POLICY from './privacyPolicy/en-US.md'
import ES_ES_PRIVACY_POLICY from './privacyPolicy/es-ES.md'
import FR_FR_PRIVACY_POLICY from './privacyPolicy/fr-FR.md'
import ID_ID_PRIVACY_POLICY from './privacyPolicy/id-ID.md'
import JA_JP_PRIVACY_POLICY from './privacyPolicy/ja-JP.md'
import KO_KR_PRIVACY_POLICY from './privacyPolicy/ko-KR.md'
import PT_BR_PRIVACY_POLICY from './privacyPolicy/pt-BR.md'
import RU_RU_PRIVACY_POLICY from './privacyPolicy/ru-RU.md'
import VI_VN_PRIVACY_POLICY from './privacyPolicy/vi-VN.md'
import ZH_CN_PRIVACY_POLICY from './privacyPolicy/zh-Hans.md'

const codes = {
  'de-DE': DE_DE_PRIVACY_POLICY,
  'en-US': EN_US_PRIVACY_POLICY,
  'es-ES': ES_ES_PRIVACY_POLICY,
  'fr-FR': FR_FR_PRIVACY_POLICY,
  'id-ID': ID_ID_PRIVACY_POLICY,
  'ja-JP': JA_JP_PRIVACY_POLICY,
  'ko-KR': KO_KR_PRIVACY_POLICY,
  'pt-BR': PT_BR_PRIVACY_POLICY,
  'ru-RU': RU_RU_PRIVACY_POLICY,
  'vi-VN': VI_VN_PRIVACY_POLICY,
  'zh-Hans': ZH_CN_PRIVACY_POLICY,
}

export const loadPrivacyPolicy = (languageCode: LanguageCode): string => {
  return codes[languageCode]
}
