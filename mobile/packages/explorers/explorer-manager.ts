import {Chain, Explorers} from '@yoroi/types'

import {freeze} from 'immer'

export const explorerManager: Readonly<
  Record<
    Chain.SupportedNetworks,
    Readonly<Record<Explorers.Explorer, Explorers.Manager>>
  >
> = freeze({
  [Chain.Network.Mainnet]: {
    [Explorers.Explorer.Cardanoscan]: {
      token: (fingerprint: string) =>
        `https://cardanoscan.io/token/${fingerprint}`,
      address: (address: string) => `https://cardanoscan.io/address/${address}`,
      tx: (txHash: string) => `https://cardanoscan.io/transaction/${txHash}`,
      pool: (poolId: string) => `https://cardanoscan.io/pool/${poolId}`,
      stake: (stakeAddress: string) =>
        `https://cardanoscan.io/stakeKey/${stakeAddress}`,
      drep: (drepId: string) => `https://cardanoscan.io/dRep/${drepId}`,
    },
    [Explorers.Explorer.Cexplorer]: {
      token: (fingerprint: string) =>
        `https://cexplorer.io/asset/${fingerprint}`,
      address: (address: string) => `https://cexplorer.io/address/${address}`,
      tx: (txHash: string) => `https://cexplorer.io/tx/${txHash}`,
      pool: (poolId: string) => `https://cexplorer.io/pool/${poolId}`,
      stake: (stakeAddress: string) =>
        `https://cexplorer.io/stake/${stakeAddress}`,
      drep: (drepId: string) => `https://cexplorer.io/drep/${drepId}`,
    },
  },
  [Chain.Network.Preprod]: {
    [Explorers.Explorer.Cardanoscan]: {
      token: (fingerprint: string) =>
        `https://preprod.cardanoscan.io/token/${fingerprint}`,
      address: (address: string) =>
        `https://preprod.cardanoscan.io/address/${address}`,
      tx: (txHash: string) =>
        `https://preprod.cardanoscan.io/transaction/${txHash}`,
      pool: (poolId: string) => `https://preprod.cardanoscan.io/pool/${poolId}`,
      stake: (stakeAddress: string) =>
        `https://preprod.cardanoscan.io/stakeKey/${stakeAddress}`,
      drep: (drepId: string) => `https://preprod.cardanoscan.io/dRep/${drepId}`,
    },
    [Explorers.Explorer.Cexplorer]: {
      token: (fingerprint: string) =>
        `https://preprod.cexplorer.io/asset/${fingerprint}`,
      address: (address: string) =>
        `https://preprod.cexplorer.io/address/${address}`,
      tx: (txHash: string) => `https://preprod.cexplorer.io/tx/${txHash}`,
      pool: (poolId: string) => `https://preprod.cexplorer.io/pool/${poolId}`,
      stake: (stakeAddress: string) =>
        `https://preprod.cexplorer.io/stake/${stakeAddress}`,
      drep: (drepId: string) => `https://preprod.cexplorer.io/drep/${drepId}`,
    },
  },
})
