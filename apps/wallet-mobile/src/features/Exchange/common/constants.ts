import {Exchange} from '@yoroi/types'

import {BanxaLogo} from '../illustrations/BanxaLogo'
import {EncryptusLogo} from '../illustrations/EncryptusLogo'

export const storageRootExchange = 'exchange'
export const storageKeyShowBuyBannerSmall = 'show-buy-banner-small'
export const ProviderLogo = {
  [Exchange.Provider.Banxa]: BanxaLogo,
  [Exchange.Provider.Encryptus]: EncryptusLogo,
}
export const ProviderLabel = {
  [Exchange.Provider.Banxa]: 'Banxa',
  [Exchange.Provider.Encryptus]: 'Encryptus',
}
