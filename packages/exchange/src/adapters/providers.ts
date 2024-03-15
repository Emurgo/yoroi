/* istanbul ignore file */
import {Exchange} from '@yoroi/types'

export const Providers: Exchange.Providers = {
  [Exchange.Provider.Banxa]: {
    buy: {
      fee: 2,
      min: 100000000,
    },
  },
  [Exchange.Provider.Encryptus]: {
    sell: {
      fee: 2.5,
      min: 1,
    },
  },
}
