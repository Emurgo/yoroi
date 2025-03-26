import {LanguageCode} from '../../../kernel/i18n/languages'
import DE_DE_DAPP from './dapp/de-DE.md'
import EN_US_DAPP from './dapp/en-US.md'
import ES_ES_DAPP from './dapp/es-ES.md'
import FR_FR_DAPP from './dapp/fr-FR.md'
import ID_ID_DAPP from './dapp/id-ID.md'
import JA_JP_DAPP from './dapp/ja-JP.md'
import KO_KR_DAPP from './dapp/ko-KR.md'
import PT_BR_DAPP from './dapp/pt-BR.md'
import RU_RU_DAPP from './dapp/ru-RU.md'
import VI_VN_DAPP from './dapp/vi-VN.md'
import ZH_CN_DAPP from './dapp/zh-Hans.md'
import DE_DE from './thirdParty/de-DE.md'
import EN_US from './thirdParty/en-US.md'
import ES_ES from './thirdParty/es-ES.md'
import FR_FR from './thirdParty/fr-FR.md'
import ID_ID from './thirdParty/id-ID.md'
import JA_JP from './thirdParty/ja-JP.md'
import KO_KR from './thirdParty/ko-KR.md'
import PT_BR from './thirdParty/pt-BR.md'
import RU_RU from './thirdParty/ru-RU.md'
import VI_VN from './thirdParty/vi-VN.md'
import ZH_CN from './thirdParty/zh-Hans.md'
import {Disclaimer} from './types'

const map = {
  [Disclaimer.Dapps]: {
    'de-DE': DE_DE_DAPP,
    'en-US': EN_US_DAPP,
    'es-ES': ES_ES_DAPP,
    'fr-FR': FR_FR_DAPP,
    'id-ID': ID_ID_DAPP,
    'ja-JP': JA_JP_DAPP,
    'ko-KR': KO_KR_DAPP,
    'pt-BR': PT_BR_DAPP,
    'ru-RU': RU_RU_DAPP,
    'vi-VN': VI_VN_DAPP,
    'zh-Hans': ZH_CN_DAPP,
  },
  [Disclaimer.Exchange]: {
    'de-DE': DE_DE,
    'en-US': EN_US,
    'es-ES': ES_ES,
    'fr-FR': FR_FR,
    'id-ID': ID_ID,
    'ja-JP': JA_JP,
    'ko-KR': KO_KR,
    'pt-BR': PT_BR,
    'ru-RU': RU_RU,
    'vi-VN': VI_VN,
    'zh-Hans': ZH_CN,
  },
  [Disclaimer.Swap]: {
    'de-DE': DE_DE,
    'en-US': EN_US,
    'es-ES': ES_ES,
    'fr-FR': FR_FR,
    'id-ID': ID_ID,
    'ja-JP': JA_JP,
    'ko-KR': KO_KR,
    'pt-BR': PT_BR,
    'ru-RU': RU_RU,
    'vi-VN': VI_VN,
    'zh-Hans': ZH_CN,
  },
  [Disclaimer.Bring]: {
    'de-DE': DE_DE,
    'en-US': EN_US,
    'es-ES': ES_ES,
    'fr-FR': FR_FR,
    'id-ID': ID_ID,
    'ja-JP': JA_JP,
    'ko-KR': KO_KR,
    'pt-BR': PT_BR,
    'ru-RU': RU_RU,
    'vi-VN': VI_VN,
    'zh-Hans': ZH_CN,
  },
} as const

export const loadText = (disclaimer: Disclaimer, languageCode: LanguageCode): string => {
  return map[disclaimer][languageCode]
}
