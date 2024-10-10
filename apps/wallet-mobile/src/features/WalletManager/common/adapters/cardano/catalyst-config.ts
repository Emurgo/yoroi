import {freeze} from 'immer'

import {cardanoConfig} from './cardano-config'

export const catalystConfig = freeze({
  minAda: 25n * cardanoConfig.denominations.ada,
} as const)
