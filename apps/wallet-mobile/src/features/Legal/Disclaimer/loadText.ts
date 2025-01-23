import {LanguageCode} from '../../../kernel/i18n/languages'
import BN_BD_DAPP from './dapp/bn-BD.md'
import CS_CZ_DAPP from './dapp/cs-CZ.md'
import DE_DE_DAPP from './dapp/de-DE.md'
import EN_US_DAPP from './dapp/en-US.md'
import ES_ES_DAPP from './dapp/es-ES.md'
import FIL_PH_DAPP from './dapp/fil-PH.md'
import FR_FR_DAPP from './dapp/fr-FR.md'
import HU_HU_DAPP from './dapp/hu-HU.md'
import ID_ID_DAPP from './dapp/id-ID.md'
import IT_IT_DAPP from './dapp/it-IT.md'
import JA_JP_DAPP from './dapp/ja-JP.md'
import KO_KR_DAPP from './dapp/ko-KR.md'
import NL_NL_DAPP from './dapp/nl-NL.md'
import PL_PL_DAPP from './dapp/pl-PL.md'
import PT_BR_DAPP from './dapp/pt-BR.md'
import RU_RU_DAPP from './dapp/ru-RU.md'
import SK_SK_DAPP from './dapp/sk-SK.md'
import SL_SI_DAPP from './dapp/sl-SI.md'
import SV_SE_DAPP from './dapp/sv-SE.md'
import SW_KE_DAPP from './dapp/sw-KE.md'
import UK_UA_DAPP from './dapp/uk-UA.md'
import VI_VN_DAPP from './dapp/vi-VN.md'
import ZH_CN_DAPP from './dapp/zh-Hans.md'
import BN_BD from './thirdParty/bn-BD.md'
import CS_CZ from './thirdParty/cs-CZ.md'
import DE_DE from './thirdParty/de-DE.md'
import EN_US from './thirdParty/en-US.md'
import ES_ES from './thirdParty/es-ES.md'
import FIL_PH from './thirdParty/fil-PH.md'
import FR_FR from './thirdParty/fr-FR.md'
import HU_HU from './thirdParty/hu-HU.md'
import ID_ID from './thirdParty/id-ID.md'
import IT_IT from './thirdParty/it-IT.md'
import JA_JP from './thirdParty/ja-JP.md'
import KO_KR from './thirdParty/ko-KR.md'
import NL_NL from './thirdParty/nl-NL.md'
import PL_PL from './thirdParty/pl-PL.md'
import PT_BR from './thirdParty/pt-BR.md'
import RU_RU from './thirdParty/ru-RU.md'
import SK_SK from './thirdParty/sk-SK.md'
import SL_SI from './thirdParty/sl-SI.md'
import SV_SE from './thirdParty/sv-SE.md'
import SW_KE from './thirdParty/sw-KE.md'
import UK_UA from './thirdParty/uk-UA.md'
import VI_VN from './thirdParty/vi-VN.md'
import ZH_CN from './thirdParty/zh-Hans.md'
import {Disclaimer} from './types'

const map = {
  [Disclaimer.Dapps]: {
    'bn-BD': BN_BD_DAPP,
    'cs-CZ': CS_CZ_DAPP,
    'de-DE': DE_DE_DAPP,
    'en-US': EN_US_DAPP,
    'es-ES': ES_ES_DAPP,
    'fil-PH': FIL_PH_DAPP,
    'fr-FR': FR_FR_DAPP,
    'hu-HU': HU_HU_DAPP,
    'id-ID': ID_ID_DAPP,
    'it-IT': IT_IT_DAPP,
    'ja-JP': JA_JP_DAPP,
    'ko-KR': KO_KR_DAPP,
    'nl-NL': NL_NL_DAPP,
    'pl-PL': PL_PL_DAPP,
    'pt-BR': PT_BR_DAPP,
    'ru-RU': RU_RU_DAPP,
    'sk-SK': SK_SK_DAPP,
    'sl-SI': SL_SI_DAPP,
    'sv-SE': SV_SE_DAPP,
    'sw-KE': SW_KE_DAPP,
    'uk-UA': UK_UA_DAPP,
    'vi-VN': VI_VN_DAPP,
    'zh-Hans': ZH_CN_DAPP,
  },
  [Disclaimer.Exchange]: {
    'bn-BD': BN_BD,
    'cs-CZ': CS_CZ,
    'de-DE': DE_DE,
    'en-US': EN_US,
    'es-ES': ES_ES,
    'fil-PH': FIL_PH,
    'fr-FR': FR_FR,
    'hu-HU': HU_HU,
    'id-ID': ID_ID,
    'it-IT': IT_IT,
    'ja-JP': JA_JP,
    'ko-KR': KO_KR,
    'nl-NL': NL_NL,
    'pl-PL': PL_PL,
    'pt-BR': PT_BR,
    'ru-RU': RU_RU,
    'sk-SK': SK_SK,
    'sl-SI': SL_SI,
    'sv-SE': SV_SE,
    'sw-KE': SW_KE,
    'uk-UA': UK_UA,
    'vi-VN': VI_VN,
    'zh-Hans': ZH_CN,
  },
  [Disclaimer.Swap]: {
    'bn-BD': BN_BD,
    'cs-CZ': CS_CZ,
    'de-DE': DE_DE,
    'en-US': EN_US,
    'es-ES': ES_ES,
    'fil-PH': FIL_PH,
    'fr-FR': FR_FR,
    'hu-HU': HU_HU,
    'id-ID': ID_ID,
    'it-IT': IT_IT,
    'ja-JP': JA_JP,
    'ko-KR': KO_KR,
    'nl-NL': NL_NL,
    'pl-PL': PL_PL,
    'pt-BR': PT_BR,
    'ru-RU': RU_RU,
    'sk-SK': SK_SK,
    'sl-SI': SL_SI,
    'sv-SE': SV_SE,
    'sw-KE': SW_KE,
    'uk-UA': UK_UA,
    'vi-VN': VI_VN,
    'zh-Hans': ZH_CN,
  },
  [Disclaimer.Bring]: {
    'bn-BD': BN_BD,
    'cs-CZ': CS_CZ,
    'de-DE': DE_DE,
    'en-US': EN_US,
    'es-ES': ES_ES,
    'fil-PH': FIL_PH,
    'fr-FR': FR_FR,
    'hu-HU': HU_HU,
    'id-ID': ID_ID,
    'it-IT': IT_IT,
    'ja-JP': JA_JP,
    'ko-KR': KO_KR,
    'nl-NL': NL_NL,
    'pl-PL': PL_PL,
    'pt-BR': PT_BR,
    'ru-RU': RU_RU,
    'sk-SK': SK_SK,
    'sl-SI': SL_SI,
    'sv-SE': SV_SE,
    'sw-KE': SW_KE,
    'uk-UA': UK_UA,
    'vi-VN': VI_VN,
    'zh-Hans': ZH_CN,
  },
} as const

export const loadText = (disclaimer: Disclaimer, languageCode: LanguageCode): string => {
  return map[disclaimer][languageCode]
}
