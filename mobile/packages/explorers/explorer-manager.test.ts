import {Chain, Explorers} from '@yoroi/types'

import {explorerManager} from './explorer-manager'

describe('explorerManager', () => {
  it('should have the correct structure', () => {
    expect(explorerManager).toEqual({
      [Chain.Network.Mainnet]: {
        [Explorers.Explorer.Cardanoscan]: {
          token: expect.any(Function),
          address: expect.any(Function),
          tx: expect.any(Function),
          pool: expect.any(Function),
          stake: expect.any(Function),
        },
        [Explorers.Explorer.Cexplorer]: {
          token: expect.any(Function),
          address: expect.any(Function),
          tx: expect.any(Function),
          pool: expect.any(Function),
          stake: expect.any(Function),
        },
      },
      [Chain.Network.Preprod]: {
        [Explorers.Explorer.Cardanoscan]: {
          token: expect.any(Function),
          address: expect.any(Function),
          tx: expect.any(Function),
          pool: expect.any(Function),
          stake: expect.any(Function),
        },
        [Explorers.Explorer.Cexplorer]: {
          token: expect.any(Function),
          address: expect.any(Function),
          tx: expect.any(Function),
          pool: expect.any(Function),
          stake: expect.any(Function),
        },
      },
      [Chain.Network.Preview]: {
        [Explorers.Explorer.Cardanoscan]: {
          token: expect.any(Function),
          address: expect.any(Function),
          tx: expect.any(Function),
          pool: expect.any(Function),
          stake: expect.any(Function),
        },
        [Explorers.Explorer.Cexplorer]: {
          token: expect.any(Function),
          address: expect.any(Function),
          tx: expect.any(Function),
          pool: expect.any(Function),
          stake: expect.any(Function),
        },
      },
    })
  })

  it('should generate the correct URLs for Mainnet', () => {
    const mainnetExplorer = explorerManager[Chain.Network.Mainnet]
    expect(
      mainnetExplorer[Explorers.Explorer.Cardanoscan].token('fingerprint'),
    ).toBe('https://cardanoscan.io/token/fingerprint')
    expect(
      mainnetExplorer[Explorers.Explorer.Cardanoscan].address('address'),
    ).toBe('https://cardanoscan.io/address/address')
    expect(mainnetExplorer[Explorers.Explorer.Cardanoscan].tx('txHash')).toBe(
      'https://cardanoscan.io/transaction/txHash',
    )
    expect(mainnetExplorer[Explorers.Explorer.Cardanoscan].pool('poolId')).toBe(
      'https://cardanoscan.io/pool/poolId',
    )
    expect(
      mainnetExplorer[Explorers.Explorer.Cardanoscan].stake('stakeAddress'),
    ).toBe('https://cardanoscan.io/stakeKey/stakeAddress')

    expect(
      mainnetExplorer[Explorers.Explorer.Cexplorer].token('fingerprint'),
    ).toBe('https://cexplorer.io/asset/fingerprint')
    expect(
      mainnetExplorer[Explorers.Explorer.Cexplorer].address('address'),
    ).toBe('https://cexplorer.io/address/address')
    expect(mainnetExplorer[Explorers.Explorer.Cexplorer].tx('txHash')).toBe(
      'https://cexplorer.io/tx/txHash',
    )
    expect(mainnetExplorer[Explorers.Explorer.Cexplorer].pool('poolId')).toBe(
      'https://cexplorer.io/pool/poolId',
    )
    expect(
      mainnetExplorer[Explorers.Explorer.Cexplorer].stake('stakeAddress'),
    ).toBe('https://cexplorer.io/stake/stakeAddress')
  })

  it('should generate the correct URLs for Preprod', () => {
    const preprodExplorer = explorerManager[Chain.Network.Preprod]
    expect(
      preprodExplorer[Explorers.Explorer.Cardanoscan].token('fingerprint'),
    ).toBe('https://preprod.cardanoscan.io/token/fingerprint')
    expect(
      preprodExplorer[Explorers.Explorer.Cardanoscan].address('address'),
    ).toBe('https://preprod.cardanoscan.io/address/address')
    expect(preprodExplorer[Explorers.Explorer.Cardanoscan].tx('txHash')).toBe(
      'https://preprod.cardanoscan.io/transaction/txHash',
    )
    expect(preprodExplorer[Explorers.Explorer.Cardanoscan].pool('poolId')).toBe(
      'https://preprod.cardanoscan.io/pool/poolId',
    )
    expect(
      preprodExplorer[Explorers.Explorer.Cardanoscan].stake('stakeAddress'),
    ).toBe('https://preprod.cardanoscan.io/stakeKey/stakeAddress')

    expect(
      preprodExplorer[Explorers.Explorer.Cexplorer].token('fingerprint'),
    ).toBe('https://preprod.cexplorer.io/asset/fingerprint')
    expect(
      preprodExplorer[Explorers.Explorer.Cexplorer].address('address'),
    ).toBe('https://preprod.cexplorer.io/address/address')
    expect(preprodExplorer[Explorers.Explorer.Cexplorer].tx('txHash')).toBe(
      'https://preprod.cexplorer.io/tx/txHash',
    )
    expect(preprodExplorer[Explorers.Explorer.Cexplorer].pool('poolId')).toBe(
      'https://preprod.cexplorer.io/pool/poolId',
    )
    expect(
      preprodExplorer[Explorers.Explorer.Cexplorer].stake('stakeAddress'),
    ).toBe('https://preprod.cexplorer.io/stake/stakeAddress')
  })

  it('should generate the correct URLs for Preview', () => {
    const previewExplorer = explorerManager[Chain.Network.Preview]
    expect(
      previewExplorer[Explorers.Explorer.Cardanoscan].token('fingerprint'),
    ).toBe('https://preview.cardanoscan.io/token/fingerprint')
    expect(
      previewExplorer[Explorers.Explorer.Cardanoscan].address('address'),
    ).toBe('https://preview.cardanoscan.io/address/address')
    expect(previewExplorer[Explorers.Explorer.Cardanoscan].tx('txHash')).toBe(
      'https://preview.cardanoscan.io/transaction/txHash',
    )
    expect(previewExplorer[Explorers.Explorer.Cardanoscan].pool('poolId')).toBe(
      'https://preview.cardanoscan.io/pool/poolId',
    )
    expect(
      previewExplorer[Explorers.Explorer.Cardanoscan].stake('stakeAddress'),
    ).toBe('https://preview.cardanoscan.io/stakeKey/stakeAddress')

    expect(
      previewExplorer[Explorers.Explorer.Cexplorer].token('fingerprint'),
    ).toBe('https://preview.cexplorer.io/asset/fingerprint')
    expect(
      previewExplorer[Explorers.Explorer.Cexplorer].address('address'),
    ).toBe('https://preview.cexplorer.io/address/address')
    expect(previewExplorer[Explorers.Explorer.Cexplorer].tx('txHash')).toBe(
      'https://preview.cexplorer.io/tx/txHash',
    )
    expect(previewExplorer[Explorers.Explorer.Cexplorer].pool('poolId')).toBe(
      'https://preview.cexplorer.io/pool/poolId',
    )
    expect(
      previewExplorer[Explorers.Explorer.Cexplorer].stake('stakeAddress'),
    ).toBe('https://preview.cexplorer.io/stake/stakeAddress')
  })
})
