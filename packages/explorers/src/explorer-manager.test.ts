import {Chain, Explorers} from '@yoroi/types'

import {explorerManager} from './explorer-manager'

describe('explorerManager', () => {
  it('should have the correct structure', () => {
    expect(explorerManager).toEqual({
      [Chain.Network.Mainnet]: {
        [Explorers.Explorer.CardanoScan]: {
          token: expect.any(Function),
          address: expect.any(Function),
          tx: expect.any(Function),
          pool: expect.any(Function),
        },
        [Explorers.Explorer.CExplorer]: {
          token: expect.any(Function),
          address: expect.any(Function),
          tx: expect.any(Function),
          pool: expect.any(Function),
        },
      },
      [Chain.Network.Preprod]: {
        [Explorers.Explorer.CardanoScan]: {
          token: expect.any(Function),
          address: expect.any(Function),
          tx: expect.any(Function),
          pool: expect.any(Function),
        },
        [Explorers.Explorer.CExplorer]: {
          token: expect.any(Function),
          address: expect.any(Function),
          tx: expect.any(Function),
          pool: expect.any(Function),
        },
      },
      [Chain.Network.Sancho]: {
        [Explorers.Explorer.CardanoScan]: {
          token: expect.any(Function),
          address: expect.any(Function),
          tx: expect.any(Function),
          pool: expect.any(Function),
        },
        [Explorers.Explorer.CExplorer]: {
          token: expect.any(Function),
          address: expect.any(Function),
          tx: expect.any(Function),
          pool: expect.any(Function),
        },
      },
    })
  })

  it('should generate the correct URLs for Mainnet', () => {
    const mainnetExplorer = explorerManager[Chain.Network.Mainnet]
    expect(
      mainnetExplorer[Explorers.Explorer.CardanoScan].token('fingerprint'),
    ).toBe('https://cardanoscan.io/token/fingerprint')
    expect(
      mainnetExplorer[Explorers.Explorer.CardanoScan].address('address'),
    ).toBe('https://cardanoscan.io/address/address')
    expect(mainnetExplorer[Explorers.Explorer.CardanoScan].tx('txHash')).toBe(
      'https://cardanoscan.io/transaction/txHash',
    )
    expect(mainnetExplorer[Explorers.Explorer.CardanoScan].pool('poolId')).toBe(
      'https://cardanoscan.io/pool/poolId',
    )

    expect(
      mainnetExplorer[Explorers.Explorer.CExplorer].token('fingerprint'),
    ).toBe('https://cexplorer.io/asset/fingerprint')
    expect(
      mainnetExplorer[Explorers.Explorer.CExplorer].address('address'),
    ).toBe('https://cexplorer.io/address/address')
    expect(mainnetExplorer[Explorers.Explorer.CExplorer].tx('txHash')).toBe(
      'https://cexplorer.io/tx/txHash',
    )
    expect(mainnetExplorer[Explorers.Explorer.CExplorer].pool('poolId')).toBe(
      'https://cexplorer.io/pool/poolId',
    )
  })

  it('should generate the correct URLs for Preprod', () => {
    const preprodExplorer = explorerManager[Chain.Network.Preprod]
    expect(
      preprodExplorer[Explorers.Explorer.CardanoScan].token('fingerprint'),
    ).toBe('https://preprod.cardanoscan.io/token/fingerprint')
    expect(
      preprodExplorer[Explorers.Explorer.CardanoScan].address('address'),
    ).toBe('https://preprod.cardanoscan.io/address/address')
    expect(preprodExplorer[Explorers.Explorer.CardanoScan].tx('txHash')).toBe(
      'https://preprod.cardanoscan.io/transaction/txHash',
    )
    expect(preprodExplorer[Explorers.Explorer.CardanoScan].pool('poolId')).toBe(
      'https://preprod.cardanoscan.io/pool/poolId',
    )

    expect(
      preprodExplorer[Explorers.Explorer.CExplorer].token('fingerprint'),
    ).toBe('https://preprod.cexplorer.io/asset/fingerprint')
    expect(
      preprodExplorer[Explorers.Explorer.CExplorer].address('address'),
    ).toBe('https://preprod.cexplorer.io/address/address')
    expect(preprodExplorer[Explorers.Explorer.CExplorer].tx('txHash')).toBe(
      'https://preprod.cexplorer.io/tx/txHash',
    )
    expect(preprodExplorer[Explorers.Explorer.CExplorer].pool('poolId')).toBe(
      'https://preprod.cexplorer.io/pool/poolId',
    )
  })

  it('should generate the correct URLs for Sancho', () => {
    const sanchoExplorer = explorerManager[Chain.Network.Sancho]
    expect(
      sanchoExplorer[Explorers.Explorer.CardanoScan].token('fingerprint'),
    ).toBe('https://cardanoscan.io/token/fingerprint')
    expect(
      sanchoExplorer[Explorers.Explorer.CardanoScan].address('address'),
    ).toBe('https://cardanoscan.io/address/address')
    expect(sanchoExplorer[Explorers.Explorer.CardanoScan].tx('txHash')).toBe(
      'https://cardanoscan.io/transaction/txHash',
    )
    expect(sanchoExplorer[Explorers.Explorer.CardanoScan].pool('poolId')).toBe(
      'https://cardanoscan.io/pool/poolId',
    )

    expect(
      sanchoExplorer[Explorers.Explorer.CExplorer].token('fingerprint'),
    ).toBe('https://cexplorer.io/asset/fingerprint')
    expect(
      sanchoExplorer[Explorers.Explorer.CExplorer].address('address'),
    ).toBe('https://cexplorer.io/address/address')
    expect(sanchoExplorer[Explorers.Explorer.CExplorer].tx('txHash')).toBe(
      'https://cexplorer.io/tx/txHash',
    )
    expect(sanchoExplorer[Explorers.Explorer.CExplorer].pool('poolId')).toBe(
      'https://cexplorer.io/pool/poolId',
    )
  })
})
