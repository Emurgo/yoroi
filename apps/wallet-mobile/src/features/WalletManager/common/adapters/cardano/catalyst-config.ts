import {freeze} from 'immer'

import {cardanoConfig} from './cardano-config'

export const catalystConfig = freeze({
  minAda: 450n * cardanoConfig.denominations.ada,
  displayedMinAda: 500n * cardanoConfig.denominations.ada,
} as const)
