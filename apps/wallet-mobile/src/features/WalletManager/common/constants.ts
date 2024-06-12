import {Wallet} from '@yoroi/types'
import {freeze} from 'immer'

export const addressModes: ReadonlyArray<Wallet.AddressMode> = freeze(['single', 'multiple'] as const)
export const implementations: ReadonlyArray<Wallet.Implementation> = freeze([
  'cardano-shelley',
  'cardano-byron',
] as const)
