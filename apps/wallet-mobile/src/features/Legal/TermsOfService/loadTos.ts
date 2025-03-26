import DE_DE_TOS from './tos/de-DE.md'
import EN_US_TOS from './tos/en-US.md'
import ES_ES_TOS from './tos/es-ES.md'
import FR_FR_TOS from './tos/fr-FR.md'
import ID_ID_TOS from './tos/id-ID.md'
import JA_JP_TOS from './tos/ja-JP.md'
import KO_KR_TOS from './tos/ko-KR.md'
import PT_BR_TOS from './tos/pt-BR.md'
import RU_RU_TOS from './tos/ru-RU.md'
import VI_VN_TOS from './tos/vi-VN.md'
import ZH_CN_TOS from './tos/zh-Hans.md'

const tosByCode = {
  'de-DE': DE_DE_TOS,
  'en-US': EN_US_TOS,
  'es-ES': ES_ES_TOS,
  'fr-FR': FR_FR_TOS,
  'id-ID': ID_ID_TOS,
  'ja-JP': JA_JP_TOS,
  'ko-KR': KO_KR_TOS,
  'pt-BR': PT_BR_TOS,
  'ru-RU': RU_RU_TOS,
  'vi-VN': VI_VN_TOS,
  'zh-Hans': ZH_CN_TOS,
}

export const loadTOS = (languageCode: keyof typeof tosByCode): string => {
  return tosByCode[languageCode]
}
