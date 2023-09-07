import {App, Balance} from '@yoroi/types'
import {mountMultiStorage} from '@yoroi/wallets'

import {tokenKeyExtractor} from '../helpers/token'
import {BalanceStorage} from '../types'

/**
 * Mounts a BalanceStorage that exposes a MultiStorage for tokens and the storage itself for other data
 * `multi-` prefix is used to avoid name collisions with other storage data
 *
 * @param {App.Storage} Storage mounted on the tokens folder
 *
 * @returns {Readonly<BalanceStorage>}
 */
export const portfolioManagerStorageMaker = (storage: App.Storage): Readonly<BalanceStorage> => {
  const dataFolder = 'multi-tokens/'

  const tokens = mountMultiStorage<Balance.Token>({
    storage,
    keyExtractor: tokenKeyExtractor,
    dataFolder,
  })

  return {
    tokens,
  } as const
}
