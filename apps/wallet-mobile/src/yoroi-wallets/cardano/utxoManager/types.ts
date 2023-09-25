import {Balance} from '@yoroi/types'

import {asQuantity} from '../../utils'

export type CollateralConfig = {
  minLovelace: Balance.Quantity
  maxLovelace: Balance.Quantity
}
