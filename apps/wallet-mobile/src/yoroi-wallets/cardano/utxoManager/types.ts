import {Balance} from '@yoroi/types'

import {asQuantity} from '../../utils'

export type CollateralConfig = {
  minLovelace: Balance.Quantity
  maxLovelace: Balance.Quantity
}

export const collateralRange: CollateralConfig = {
  minLovelace: asQuantity(5_000_000),
  maxLovelace: asQuantity(10_000_000),
}
