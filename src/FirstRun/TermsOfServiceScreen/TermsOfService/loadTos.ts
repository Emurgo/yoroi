import loadLocalResource from 'react-native-local-resource'

import CS_CZ_TOS from './tos/cs-CZ.md'
import DE_DE_TOS from './tos/de-DE.md'
import EN_US_TOS from './tos/en-US.md'
import ES_ES_TOS from './tos/es-ES.md'
import FR_FR_TOS from './tos/fr-FR.md'
import HU_HU_TOS from './tos/hu-HU.md'
import ID_ID_TOS from './tos/id-ID.md'
import IT_IT_TOS from './tos/it-IT.md'
import JA_JP_TOS from './tos/ja-JP.md'
import KO_KR_TOS from './tos/ko-KR.md'
import NL_NL_TOS from './tos/nl-NL.md'
import PT_BR_TOS from './tos/pt-BR.md'
import RU_RU_TOS from './tos/ru-RU.md'
import SK_SK_TOS from './tos/sk-SK.md'
import ZH_CN_TOS from './tos/zh-CN.md'

const tosByCode = {
  'en-US': EN_US_TOS,
  'ja-JP': JA_JP_TOS,
  'ko-KR': KO_KR_TOS,
  'ru-RU': RU_RU_TOS,
  'es-ES': ES_ES_TOS,
  'zh-Hans': ZH_CN_TOS,
  'id-ID': ID_ID_TOS,
  'pt-BR': PT_BR_TOS,
  'de-DE': DE_DE_TOS,
  'fr-FR': FR_FR_TOS,
  'it-IT': IT_IT_TOS,
  'nl-NL': NL_NL_TOS,
  'cs-CZ': CS_CZ_TOS,
  'hu-HU': HU_HU_TOS,
  'sk-SK': SK_SK_TOS,
}

export const loadTOS = async (languageCode: string) => {
  const tosFile = tosByCode[languageCode]
  const tos = await loadLocalResource(tosFile)
  return tos
}
