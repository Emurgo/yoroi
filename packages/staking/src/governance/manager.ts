import {DRep, DRepCredential} from './types'
import {CardanoTypes} from '../cardanoMobile'
import {assertIsBech32WithPrefix} from '@cardano-sdk/util'

type Config = {
  networkId: number
  cardano: CardanoTypes.Wasm
}

type GovernanceManager = {
  getDReps: () => Promise<DRep[]>
  validateDrepKey: (
    drepKey: string,
  ) => Promise<{status: 'valid'} | {status: 'invalid'; reason: string}>
  delegateToDrep: (drep: DRepCredential) => Promise<void>
  voteAbstain: (drep: DRepCredential) => Promise<void>
  voteNoConfidence: (drep: DRepCredential) => Promise<void>
}

export const createGovernanceManager = (_config: Config): GovernanceManager => {
  const validateDrepKey = async (drepKey: string) => {
    try {
      assertIsBech32WithPrefix(drepKey, 'drep')
    } catch (e) {
      console.log(e)
      return {
        status: 'invalid',
        reason: 'Drep key is not a valid bech32 address',
      }
    }

    return {status: 'valid'}

    // needs blockchain check as well
  }
  return {validateDrepKey} as any
}
