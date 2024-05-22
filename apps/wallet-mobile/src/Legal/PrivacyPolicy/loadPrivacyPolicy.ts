import {LanguageCode} from '../../kernel/i18n/languages'
import BN_BD_PRIVACY_POLICY from './privacyPolicy/bn-BD.md'
import CS_CZ_PRIVACY_POLICY from './privacyPolicy/cs-CZ.md'
import DE_DE_PRIVACY_POLICY from './privacyPolicy/de-DE.md'
import EN_US_PRIVACY_POLICY from './privacyPolicy/en-US.md'
import ES_ES_PRIVACY_POLICY from './privacyPolicy/es-ES.md'
import FIL_PH_PRIVACY_POLICY from './privacyPolicy/fil-PH.md'
import FR_FR_PRIVACY_POLICY from './privacyPolicy/fr-FR.md'
import HU_HU_PRIVACY_POLICY from './privacyPolicy/hu-HU.md'
import ID_ID_PRIVACY_POLICY from './privacyPolicy/id-ID.md'
import IT_IT_PRIVACY_POLICY from './privacyPolicy/it-IT.md'
import JA_JP_PRIVACY_POLICY from './privacyPolicy/ja-JP.md'
import KO_KR_PRIVACY_POLICY from './privacyPolicy/ko-KR.md'
import NL_NL_PRIVACY_POLICY from './privacyPolicy/nl-NL.md'
import PL_PL_PRIVACY_POLICY from './privacyPolicy/pl-PL.md'
import PT_BR_PRIVACY_POLICY from './privacyPolicy/pt-BR.md'
import RU_RU_PRIVACY_POLICY from './privacyPolicy/ru-RU.md'
import SK_SK_PRIVACY_POLICY from './privacyPolicy/sk-SK.md'
import SL_SI_PRIVACY_POLICY from './privacyPolicy/sl-SI.md'
import SV_SE_PRIVACY_POLICY from './privacyPolicy/sv-SE.md'
import SW_KE_PRIVACY_POLICY from './privacyPolicy/sw-KE.md'
import UK_UA_PRIVACY_POLICY from './privacyPolicy/uk-UA.md'
import VI_VN_PRIVACY_POLICY from './privacyPolicy/vi-VN.md'
import ZH_CN_PRIVACY_POLICY from './privacyPolicy/zh-Hans.md'

const codes = {
  'bn-BD': BN_BD_PRIVACY_POLICY,
  'cs-CZ': CS_CZ_PRIVACY_POLICY,
  'de-DE': DE_DE_PRIVACY_POLICY,
  'en-US': EN_US_PRIVACY_POLICY,
  'es-ES': ES_ES_PRIVACY_POLICY,
  'fil-PH': FIL_PH_PRIVACY_POLICY,
  'fr-FR': FR_FR_PRIVACY_POLICY,
  'hu-HU': HU_HU_PRIVACY_POLICY,
  'id-ID': ID_ID_PRIVACY_POLICY,
  'it-IT': IT_IT_PRIVACY_POLICY,
  'ja-JP': JA_JP_PRIVACY_POLICY,
  'ko-KR': KO_KR_PRIVACY_POLICY,
  'nl-NL': NL_NL_PRIVACY_POLICY,
  'pl-PL': PL_PL_PRIVACY_POLICY,
  'pt-BR': PT_BR_PRIVACY_POLICY,
  'ru-RU': RU_RU_PRIVACY_POLICY,
  'sk-SK': SK_SK_PRIVACY_POLICY,
  'sl-SI': SL_SI_PRIVACY_POLICY,
  'sv-SE': SV_SE_PRIVACY_POLICY,
  'sw-KE': SW_KE_PRIVACY_POLICY,
  'uk-UA': UK_UA_PRIVACY_POLICY,
  'vi-VN': VI_VN_PRIVACY_POLICY,
  'zh-Hans': ZH_CN_PRIVACY_POLICY,
}

export const loadPrivacyPolicy = (languageCode: LanguageCode): string => {
  return codes[languageCode]
}
