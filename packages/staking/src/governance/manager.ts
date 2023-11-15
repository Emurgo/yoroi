import {YoroiUnsignedTx} from '@yoroi/wallet-mobile/src/yoroi-wallets/types'
import {DRep, DRepCredential} from './types'

type Config = {
  networkId: number
}

type GovernanceManager = {
  getDReps: () => Promise<DRep[]>
  delegateToDrep: (drep: DRepCredential) => Promise<YoroiUnsignedTx>
  voteAbstain: (drep: DRepCredential) => Promise<YoroiUnsignedTx>
  voteNoConfidence: (drep: DRepCredential) => Promise<YoroiUnsignedTx>
}

export const createGovernanceManager = (_config: Config): GovernanceManager => {
  return {} as any
}
