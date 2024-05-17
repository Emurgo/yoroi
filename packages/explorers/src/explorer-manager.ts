import {Chain, Explorers} from '@yoroi/types'
import {freeze} from 'immer'

export const explorerManager: Readonly<
  Record<
    Chain.SupportedNetworks,
    Readonly<Record<Explorers.Explorer, Explorers.Manager>>
  >
> = freeze({
  [Chain.Network.Mainnet]: {
    [Explorers.Explorer.CardanoScan]: {
      token: (fingerprint) => `https://cardanoscan.io/token/${fingerprint}`,
      address: (address) => `https://cardanoscan.io/address/${address}`,
      tx: (txHash) => `https://cardanoscan.io/transaction/${txHash}`,
      pool: (poolId) => `https://cardanoscan.io/pool/${poolId}`,
    },
    [Explorers.Explorer.CExplorer]: {
      token: (fingerprint) => `https://cexplorer.io/asset/${fingerprint}`,
      address: (address) => `https://cexplorer.io/address/${address}`,
      tx: (txHash) => `https://cexplorer.io/tx/${txHash}`,
      pool: (poolId) => `https://cexplorer.io/pool/${poolId}`,
    },
  },
  [Chain.Network.Preprod]: {
    [Explorers.Explorer.CardanoScan]: {
      token: (fingerprint) =>
        `https://preprod.cardanoscan.io/token/${fingerprint}`,
      address: (address) => `https://preprod.cardanoscan.io/address/${address}`,
      tx: (txHash) => `https://preprod.cardanoscan.io/transaction/${txHash}`,
      pool: (poolId) => `https://preprod.cardanoscan.io/pool/${poolId}`,
    },
    [Explorers.Explorer.CExplorer]: {
      token: (fingerprint) =>
        `https://preprod.cexplorer.io/asset/${fingerprint}`,
      address: (address) => `https://preprod.cexplorer.io/address/${address}`,
      tx: (txHash) => `https://preprod.cexplorer.io/tx/${txHash}`,
      pool: (poolId) => `https://preprod.cexplorer.io/pool/${poolId}`,
    },
  },
  [Chain.Network.Sancho]: {
    [Explorers.Explorer.CardanoScan]: {
      token: (fingerprint) => `https://cardanoscan.io/token/${fingerprint}`,
      address: (address) => `https://cardanoscan.io/address/${address}`,
      tx: (txHash) => `https://cardanoscan.io/transaction/${txHash}`,
      pool: (poolId) => `https://cardanoscan.io/pool/${poolId}`,
    },
    [Explorers.Explorer.CExplorer]: {
      token: (fingerprint) => `https://cexplorer.io/asset/${fingerprint}`,
      address: (address) => `https://cexplorer.io/address/${address}`,
      tx: (txHash) => `https://cexplorer.io/tx/${txHash}`,
      pool: (poolId) => `https://cexplorer.io/pool/${poolId}`,
    },
  },
})
