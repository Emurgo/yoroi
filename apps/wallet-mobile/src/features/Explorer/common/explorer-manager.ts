import {Chain} from '@yoroi/types'
import {freeze} from 'immer'

import {ExplorerManager, Explorers} from './types'

export const explorerManager: Readonly<Record<Chain.SupportedNetworks, Readonly<Record<Explorers, ExplorerManager>>>> =
  freeze({
    [Chain.Network.Mainnet]: {
      [Explorers.CardanoScan]: {
        token: (fingerprint) => `https://cardanoscan.io/token/${fingerprint}`,
      },
      [Explorers.CExplorer]: {
        token: (fingerprint) => `https://cexplorer.io/asset/${fingerprint}`,
      },
    },
    [Chain.Network.Preprod]: {
      [Explorers.CardanoScan]: {
        token: (fingerprint) => `https://preprod.cardanoscan.io/token/${fingerprint}`,
      },
      [Explorers.CExplorer]: {
        token: (fingerprint) => `https://preprod.cexplorer.io/asset/${fingerprint}`,
      },
    },
    [Chain.Network.Sancho]: {
      [Explorers.CardanoScan]: {
        token: (fingerprint) => `https://cardanoscan.io/token/${fingerprint}`,
      },
      [Explorers.CExplorer]: {
        token: (fingerprint) => `https://cexplorer.io/asset/${fingerprint}`,
      },
    },
  })
