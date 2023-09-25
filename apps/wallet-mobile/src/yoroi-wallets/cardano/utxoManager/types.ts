import {Balance} from '@yoroi/types'

export type CollateralConfig = {
  minLovelace: Balance.Quantity
  maxLovelace: Balance.Quantity
}
