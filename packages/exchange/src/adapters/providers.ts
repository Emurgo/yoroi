/* istanbul ignore file */
import {Exchange} from '@yoroi/types'

export const Providers = {
  [Exchange.Provider.Banxa]: {
    buy: {
      fee: 2,
      min: 2,
      max: 2,
    },
  },
  [Exchange.Provider.Encryptus]: {
    sell: {
      fee: 2.5,
      min: 2.5,
      max: 2.5,
    },
    buy: {
      fee: 2.5,
      min: 2.5,
      max: 2.5,
    },
  },
}
