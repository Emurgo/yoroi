import {Wallet} from '@yoroi/types'

import {cardanoConfig} from '../cardano/constants'

export const addressVisualDerivationPathMaker =
  (implementation: Wallet.Implementation) =>
  ({account, role, index}: {account: number; role: number; index: number}) => {
    const {derivations} = cardanoConfig.implementations[implementation]
    const derivation = derivations.base.visual
    const {purpose, coinType} = derivation

    return `m/${purpose}'/${coinType}'/${account}'/${role}/${index}`
  }
