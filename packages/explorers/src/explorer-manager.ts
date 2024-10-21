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
      stake: (stakeAddress) =>
        `https://cardanoscan.io/stakeKey/${stakeAddress}`,
    },
    [Explorers.Explorer.CExplorer]: {
      token: (fingerprint) => `https://cexplorer.io/asset/${fingerprint}`,
      address: (address) => `https://cexplorer.io/address/${address}`,
      tx: (txHash) => `https://cexplorer.io/tx/${txHash}`,
      pool: (poolId) => `https://cexplorer.io/pool/${poolId}`,
      stake: (stakeAddress) => `https://cexplorer.io/stake/${stakeAddress}`,
    },
  },
  [Chain.Network.Preprod]: {
    [Explorers.Explorer.CardanoScan]: {
      token: (fingerprint) =>
        `https://preprod.cardanoscan.io/token/${fingerprint}`,
      address: (address) => `https://preprod.cardanoscan.io/address/${address}`,
      tx: (txHash) => `https://preprod.cardanoscan.io/transaction/${txHash}`,
      pool: (poolId) => `https://preprod.cardanoscan.io/pool/${poolId}`,
      stake: (stakeAddress) =>
        `https://preprod.cardanoscan.io/stakeKey/${stakeAddress}`,
    },
    [Explorers.Explorer.CExplorer]: {
      token: (fingerprint) =>
        `https://preprod.cexplorer.io/asset/${fingerprint}`,
      address: (address) => `https://preprod.cexplorer.io/address/${address}`,
      tx: (txHash) => `https://preprod.cexplorer.io/tx/${txHash}`,
      pool: (poolId) => `https://preprod.cexplorer.io/pool/${poolId}`,
      stake: (stakeAddress) =>
        `https://preprod.cexplorer.io/stake/${stakeAddress}`,
    },
  },
  [Chain.Network.Preview]: {
    [Explorers.Explorer.CardanoScan]: {
      token: (fingerprint) =>
        `https://preview.cardanoscan.io/token/${fingerprint}`,
      address: (address) => `https://preview.cardanoscan.io/address/${address}`,
      tx: (txHash) => `https://preview.cardanoscan.io/transaction/${txHash}`,
      pool: (poolId) => `https://preview.cardanoscan.io/pool/${poolId}`,
      stake: (stakeAddress) =>
        `https://preview.cardanoscan.io/stakeKey/${stakeAddress}`,
    },
    [Explorers.Explorer.CExplorer]: {
      token: (fingerprint) =>
        `https://preview.cexplorer.io/asset/${fingerprint}`,
      address: (address) => `https://preview.cexplorer.io/address/${address}`,
      tx: (txHash) => `https://preview.cexplorer.io/tx/${txHash}`,
      pool: (poolId) => `https://preview.cexplorer.io/pool/${poolId}`,
      stake: (stakeAddress) =>
        `https://preview.cexplorer.io/stake/${stakeAddress}`,
    },
  },
})
