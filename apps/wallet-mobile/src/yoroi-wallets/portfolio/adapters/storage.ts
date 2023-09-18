import {App, Balance} from '@yoroi/types'
import {mountMultiStorage} from '@yoroi/wallets'

import {Tokens} from '../helpers/tokens'
import {PortfolioManagerStorage} from '../types'

/**
 * Mounts a PortfolioManagerStorage that exposes a MultiStorage for tokens and the storage itself for other data
 * `multi-` prefix is used to avoid name collisions with other storage data
 *
 * @param {App.Storage} Storage mounted on the tokens folder
 *
 * @returns {Readonly<PortfolioManagerStorage>}
 */
export const portfolioManagerStorageMaker = (storage: App.Storage): Readonly<PortfolioManagerStorage> => {
  const dataFolder = 'multi-tokens/'

  const tokens = mountMultiStorage<Balance.Token>({
    storage,
    keyExtractor: Tokens.getId,
    dataFolder,
  })

  return {
    tokens,
  } as const
}
