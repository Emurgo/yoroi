import {Balance} from '@yoroi/types'

import {mocks} from '../../mocks'
import {Quantities} from '../../utils'
import {calcLockedDeposit, cardanoFallbackTokenAsBalanceToken} from './cardano-helpers'

describe('calcLockedDeposit()', () => {
  it('should calculate when there are assets', async () => {
    const lockedDeposit = await calcLockedDeposit(mocks.utxos)

    expect(lockedDeposit).toEqual('20360440')
  })

  it('should return 0 when there are no assets', async () => {
    const utxos = mocks.utxos.filter((u) => u.assets.length === 0)

    const lockedDeposit = await calcLockedDeposit(utxos)

    expect(lockedDeposit).toEqual(Quantities.zero)
  })
})

describe('cardanoFallbackTokenAsBalanceToken()', () => {
  it('should return a token with the correct id', () => {
    const expectedOutput: Balance.Token = {
      info: {
        kind: 'ft',
        id: '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.54657374696e6754657374496d6167653132',
        fingerprint: 'asset1h7a758kx4ntaa6kq7wtj3suy0wtk6x9lzhqc4g', // This would be what Cardano.asFingerprint returns
        description: undefined,
        group: '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176',
        icon: undefined,
        website: undefined,
        decimals: undefined,
        mediaType: undefined,
        image: undefined,
        name: 'TestingTestImage12',
        symbol: undefined,
        ticker: undefined,
      },
    }

    const result = cardanoFallbackTokenAsBalanceToken(
      '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.54657374696e6754657374496d6167653132',
    )

    expect(result).toEqual(expectedOutput)
  })
})
