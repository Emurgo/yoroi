import {App, Portfolio} from '@yoroi/types'
import {mountMultiStorage} from '@yoroi/wallets'

import {PortfolioManagerStorage} from '../types'

/**
 * Mounts a PortfolioManagerStorage that exposes a MultiStorage for tokens and the storage itself for other data
 * `multi-` prefix is used to avoid name collisions with other storage data
 *
 * @param {App.Storage} Storage mounted on the tokens folder
 *
 * @returns {Readonly<PortfolioManagerStorage>}
 */
export const portfolioManagerStorageMaker = <M extends Record<string, unknown>>(
  storage: App.Storage,
): Readonly<PortfolioManagerStorage<M>> => {
  const dataFolder = 'multi-tokens/'

  const tokens = mountMultiStorage<Portfolio.Token<M>>({
    storage,
    keyExtractor: (item) => item.info.id,
    dataFolder,
  })

  return {
    tokens,
  } as const
}
