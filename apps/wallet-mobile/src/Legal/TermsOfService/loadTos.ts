import BN_BD_TOS from './tos/bn-BD.md'
import CS_CZ_TOS from './tos/cs-CZ.md'
import DE_DE_TOS from './tos/de-DE.md'
import EN_US_TOS from './tos/en-US.md'
import ES_ES_TOS from './tos/es-ES.md'
import FIL_PH_TOS from './tos/fil-PH.md'
import FR_FR_TOS from './tos/fr-FR.md'
import HU_HU_TOS from './tos/hu-HU.md'
import ID_ID_TOS from './tos/id-ID.md'
import IT_IT_TOS from './tos/it-IT.md'
import JA_JP_TOS from './tos/ja-JP.md'
import KO_KR_TOS from './tos/ko-KR.md'
import NL_NL_TOS from './tos/nl-NL.md'
import PL_PL_TOS from './tos/pl-PL.md'
import PT_BR_TOS from './tos/pt-BR.md'
import RU_RU_TOS from './tos/ru-RU.md'
import SK_SK_TOS from './tos/sk-SK.md'
import SL_SI_TOS from './tos/sl-SI.md'
import SV_SE_TOS from './tos/sv-SE.md'
import SW_KE_TOS from './tos/sw-KE.md'
import UK_UA_TOS from './tos/uk-UA.md'
import VI_VN_TOS from './tos/vi-VN.md'
import ZH_CN_TOS from './tos/zh-Hans.md'

const tosByCode = {
  'bn-BD': BN_BD_TOS,
  'cs-CZ': CS_CZ_TOS,
  'de-DE': DE_DE_TOS,
  'en-US': EN_US_TOS,
  'es-ES': ES_ES_TOS,
  'fil-PH': FIL_PH_TOS,
  'fr-FR': FR_FR_TOS,
  'hu-HU': HU_HU_TOS,
  'id-ID': ID_ID_TOS,
  'it-IT': IT_IT_TOS,
  'ja-JP': JA_JP_TOS,
  'ko-KR': KO_KR_TOS,
  'nl-NL': NL_NL_TOS,
  'pl-PL': PL_PL_TOS,
  'pt-BR': PT_BR_TOS,
  'ru-RU': RU_RU_TOS,
  'sk-SK': SK_SK_TOS,
  'sl-SI': SL_SI_TOS,
  'sv-SE': SV_SE_TOS,
  'sw-KE': SW_KE_TOS,
  'uk-UA': UK_UA_TOS,
  'vi-VN': VI_VN_TOS,
  'zh-Hans': ZH_CN_TOS,
}

export const loadTOS = (languageCode: keyof typeof tosByCode): string => {
  console.log('------------------------------')
  console.log(languageCode)
  // fetch(HU_HU_TOS).then((response) => response.text()).then((text) => console.log(text))
  console.log(tosByCode[languageCode])
  console.log('------------------------------')
  return tosByCode[languageCode]
}
