import {LanguageCode} from '~/kernel/i18n/localization'

import {loadTextAsset} from '../../../common/loadTextAsset'
import {Disclaimer} from '../../../common/types'
// Dapp disclaimer assets
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
// Share wallet disclaimer assets
import DE_DE_SHARE_WALLET from './shareWallet/de-DE.md'
import EL_GR_SHARE_WALLET from './shareWallet/el-GR.md'
import EN_US_SHARE_WALLET from './shareWallet/en-US.md'
import ES_ES_SHARE_WALLET from './shareWallet/es-ES.md'
import FR_FR_SHARE_WALLET from './shareWallet/fr-FR.md'
import HR_HR_SHARE_WALLET from './shareWallet/hr-HR.md'
import ID_ID_SHARE_WALLET from './shareWallet/id-ID.md'
import JA_JP_SHARE_WALLET from './shareWallet/ja-JP.md'
import KO_KR_SHARE_WALLET from './shareWallet/ko-KR.md'
import PT_BR_SHARE_WALLET from './shareWallet/pt-BR.md'
import RU_RU_SHARE_WALLET from './shareWallet/ru-RU.md'
import TL_PH_SHARE_WALLET from './shareWallet/tl-PH.md'
import TR_TR_SHARE_WALLET from './shareWallet/tr-TR.md'
import VI_VN_SHARE_WALLET from './shareWallet/vi-VN.md'
import ZH_CN_SHARE_WALLET from './shareWallet/zh-CN.md'
import ZH_HANS_SHARE_WALLET from './shareWallet/zh-Hans.md'
import ZH_TW_SHARE_WALLET from './shareWallet/zh-TW.md'
// Third party disclaimer assets
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
import ZH_CN from './thirdParty/zh-CN.md'

const assetMap = {
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
  [Disclaimer.ShareWallet]: {
    'de-DE': DE_DE_SHARE_WALLET,
    'el-GR': EL_GR_SHARE_WALLET,
    'en-US': EN_US_SHARE_WALLET,
    'es-ES': ES_ES_SHARE_WALLET,
    'fr-FR': FR_FR_SHARE_WALLET,
    'hr-HR': HR_HR_SHARE_WALLET,
    'id-ID': ID_ID_SHARE_WALLET,
    'ja-JP': JA_JP_SHARE_WALLET,
    'ko-KR': KO_KR_SHARE_WALLET,
    'pt-BR': PT_BR_SHARE_WALLET,
    'ru-RU': RU_RU_SHARE_WALLET,
    'tl-PH': TL_PH_SHARE_WALLET,
    'tr-TR': TR_TR_SHARE_WALLET,
    'vi-VN': VI_VN_SHARE_WALLET,
    'zh-CN': ZH_CN_SHARE_WALLET,
    'zh-Hans': ZH_HANS_SHARE_WALLET,
    'zh-TW': ZH_TW_SHARE_WALLET,
  },
} as const

export const loadText = async (
  disclaimer: Disclaimer,
  languageCode: LanguageCode,
): Promise<string> => {
  const assetModule = assetMap[disclaimer][languageCode]
  return await loadTextAsset(assetModule)
}
