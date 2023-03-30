import BigNumber from 'bignumber.js'

import {Quantity, YoroiAmount, YoroiAmounts, YoroiEntries, YoroiEntry} from '../types'
import {RawUtxo} from '../types/other'
import {Amounts, asQuantity, Entries, Quantities, Utxos} from '.'

describe('Quantities', () => {
  it('sum', () => {
    expect(Quantities.sum(['1', '2'])).toEqual('3' as Quantity)
    expect(Quantities.sum(['1', '2', '3'])).toEqual('6' as Quantity)
  })

  it('diff', () => {
    expect(Quantities.diff('1', '2')).toEqual('-1' as Quantity)
    expect(Quantities.diff('3', '2')).toEqual('1' as Quantity)
  })

  it('negated', () => {
    expect(Quantities.negated('1')).toEqual('-1' as Quantity)
    expect(Quantities.negated('-1')).toEqual('1' as Quantity)
  })
  it('product', () => {
    expect(Quantities.product(['1', '2'])).toEqual('2' as Quantity)
    expect(Quantities.product(['2', '3'])).toEqual('6' as Quantity)
  })
  it('quotient', () => {
    expect(Quantities.quotient('1', '2')).toEqual('0.5' as Quantity)
    expect(Quantities.quotient('2', '1')).toEqual('2' as Quantity)
  })
  it('isGreaterThan', () => {
    expect(Quantities.isGreaterThan('1', '2')).toBe(false)
    expect(Quantities.isGreaterThan('2', '2')).toBe(false)
    expect(Quantities.isGreaterThan('2', '1')).toBe(true)
  })
  it('decimalPlaces', () => {
    expect(Quantities.decimalPlaces('1', 2)).toBe('1')
    expect(Quantities.decimalPlaces('1.00000', 2)).toBe('1')
    expect(Quantities.decimalPlaces('1.123456', 2)).toBe('1.12')
    expect(Quantities.decimalPlaces('1.123456', 10)).toBe('1.123456')
  })
  it('denominated', () => {
    expect(Quantities.denominated('1', 2)).toBe('0.01')
    expect(Quantities.denominated('1000', 2)).toBe('10')
    expect(Quantities.denominated('112345', 3)).toBe('112.345')
    expect(Quantities.denominated('1123456', 10)).toBe('0.0001123456')
    expect(Quantities.denominated('1123456', 20)).toBe('0.00000000000001123456')
  })
  it('integer', () => {
    expect(Quantities.integer(Quantities.zero, 15)).toBe('0')
    expect(Quantities.integer(asQuantity(-1), 3)).toBe('-1000')
    expect(Quantities.integer(asQuantity(2.5), 2)).toBe('250')
    expect(Quantities.integer('1', 2)).toBe('100')
    expect(Quantities.integer('1000', 2)).toBe('100000')
    expect(Quantities.integer('123.456', 3)).toBe('123456')
    expect(Quantities.integer('1.08', 10)).toBe('10800000000')
    expect(Quantities.integer('1.0800001', 3)).toBe('1080')
    expect(Quantities.integer(asQuantity(new BigNumber('0000000000015')), 6)).toBe('15000000')
    expect(Quantities.integer(asQuantity(new BigNumber(1.5)), 6)).toBe('1500000')
  })
  it('zero & isZero', () => {
    expect(Quantities.isZero(Quantities.integer(Quantities.zero, 15))).toBe(true)
    expect(Quantities.isZero(Quantities.integer('0', 2))).toBe(true)
    expect(Quantities.isZero(Quantities.integer('-1', 2))).toBe(false)
    expect(Quantities.isZero(Quantities.integer('1', 2))).toBe(false)
    expect(Quantities.isZero(Quantities.integer('0.00000000000001', 18))).toBe(false)
    expect(Quantities.isZero(Quantities.zero)).toBe(true)
  })
  it('isAtomic', () => {
    expect(Quantities.isAtomic('1', 0)).toBe(true)
    expect(Quantities.isAtomic('0', 0)).toBe(false)
    expect(Quantities.isAtomic('1', 1)).toBe(false)
    expect(Quantities.isAtomic('1', 10)).toBe(false)
    expect(Quantities.isAtomic('-1', 0)).toBe(true)
    expect(Quantities.isAtomic('0.0000000001', 10)).toBe(true)
    expect(Quantities.isAtomic('0.0000000001', 11)).toBe(false)
    expect(Quantities.isAtomic('100000', 6)).toBe(false)
    expect(Quantities.isAtomic('2', 0)).toBe(false)
    expect(Quantities.isAtomic('-2', 0)).toBe(false)
  })
  it('max', () => {
    expect(Quantities.max('1', '2')).toEqual('2')
    expect(Quantities.max('1', '2', '3')).toEqual('3')
    expect(Quantities.max('3', '2', '1')).toEqual('3')
    expect(Quantities.max('1', '1')).toEqual('1')
  })
})

describe('Amounts', () => {
  it('sums multiple YoroiAmounts into a single YoroiAmounts', () => {
    const amounts1: YoroiAmounts = {
      '': '1',
      token123: '2',
      token567: '-2',
    }
    const amounts2: YoroiAmounts = {
      '': '3',
      token456: '4',
    }

    expect(Amounts.sum([amounts1, amounts2])).toEqual({
      '': '4',
      token123: '2',
      token456: '4',
      token567: '-2',
    } as YoroiAmounts)
  })

  it('diffs 2 YoroiAmounts into a single YoroiAmounts', () => {
    const amounts1: YoroiAmounts = {
      '': '1',
      token123: '2',
      token567: '-2',
    }
    const amounts2: YoroiAmounts = {
      '': '3',
      token456: '4',
    }

    expect(Amounts.diff(amounts1, amounts2)).toEqual({
      '': '-2',
      token123: '2',
      token456: '-4',
      token567: '-2',
    } as YoroiAmounts)
  })

  it('negate YoroiAmounts', () => {
    const amounts1: YoroiAmounts = {
      '': '1',
      token123: '2',
      token567: '-2',
    }

    expect(Amounts.negated(amounts1)).toEqual({
      '': '-1',
      token123: '-2',
      token567: '2',
    } as YoroiAmounts)
  })

  it('getAmount', () => {
    const amounts: YoroiAmounts = {
      '': '1',
      token123: '2',
      token567: '-2',
    }

    Object.entries(amounts).forEach(([tokenId, quantity]) =>
      expect(Amounts.getAmount(amounts, tokenId)).toEqual({
        tokenId,
        quantity,
      } as YoroiAmount),
    )
  })

  it('includes', () => {
    const amounts: YoroiAmounts = {
      '': '1',
      token123: '2',
      token567: '-2',
    }

    Object.keys(amounts).forEach((tokenId) => expect(Amounts.includes(amounts, tokenId)).toBe(true))

    expect(Amounts.includes(amounts, 'does-not-include')).toBe(false)
  })

  it('remove', () => {
    const amounts: YoroiAmounts = {
      '': '123',
      token123: '456',
      token567: '-789',
    }

    expect(Amounts.remove(amounts, ['token123'])).toEqual({
      '': '123',
      token567: '-789',
    } as YoroiAmounts)
  })

  it('toArray', () => {
    const amounts: YoroiAmounts = {
      '': '123',
      token123: '456',
      token567: '-789',
    }

    expect(Amounts.toArray(amounts)).toEqual([
      {tokenId: '', quantity: '123'},
      {tokenId: 'token123', quantity: '456'},
      {tokenId: 'token567', quantity: '-789'},
    ] as Array<YoroiAmount>)
  })

  it('from Array', () => {
    const amounts: Array<YoroiAmount> = [
      {tokenId: '', quantity: '123'},
      {tokenId: 'SUN', quantity: '456'},
      {tokenId: 'QWE', quantity: '789'},
    ]

    expect(Amounts.fromArray(amounts)).toEqual({
      '': '123',
      SUN: '456',
      QWE: '789',
    } as YoroiAmounts)
  })

  it('map', () => {
    const amounts: YoroiAmounts = {
      '': '1',
      SUN: '4',
      QWE: '7',
    }

    expect(
      Amounts.map(amounts, (amount) => ({
        ...amount,
        quantity: Quantities.sum([amount.quantity, '1']),
      })),
    ).toEqual({
      '': '2',
      SUN: '5',
      QWE: '8',
    } as YoroiAmounts)
  })

  describe('save', () => {
    it('updating when already exists', () => {
      const amounts: YoroiAmounts = {
        updateToken: '456',
      }
      const updateAmount: YoroiAmount = {
        tokenId: 'updateToken',
        quantity: '321',
      }

      expect(Amounts.save(amounts, updateAmount)).toEqual({
        updateToken: '321',
      })
    })

    it('adding when it doesnt exist', () => {
      const amounts: YoroiAmounts = {
        updateToken: '456',
      }
      const addAmount: YoroiAmount = {
        tokenId: 'addToken',
        quantity: '789',
      }

      expect(Amounts.save(amounts, addAmount)).toEqual({
        addToken: '789',
        updateToken: '456',
      })
    })
  })
})

describe('Entries', () => {
  it('first gets the first entry from YoroiEnrties', () => {
    const entries: YoroiEntries = {
      address1: {'': '1', token123: '2', token567: '-2'},
    }

    expect(Entries.first(entries)).toEqual({
      address: 'address1',
      amounts: {
        '': '1',
        token123: '2',
        token567: '-2',
      },
    } as YoroiEntry)
  })

  it('first throws error if multiple addresses', () => {
    const entries: YoroiEntries = {
      address1: {'': '1', token123: '2', token567: '-2'},
      address2: {'': '1', token123: '2', token567: '-2'},
    }

    expect(() => Entries.first(entries)).toThrowError()
  })

  it('remove', () => {
    const entries1: YoroiEntries = {
      address1: {
        '': '1',
        token123: '2',
        token567: '-2',
      },
      address2: {
        '': '1',
        token123: '2',
        token567: '-2',
      },
      address3: {
        '': '1',
        token123: '2',
        token567: '-2',
      },
    }

    expect(Entries.remove(entries1, ['address2'])).toEqual({
      address1: {
        '': '1',
        token123: '2',
        token567: '-2',
      },
      address3: {
        '': '1',
        token123: '2',
        token567: '-2',
      },
    } as YoroiEntries)
  })

  it('toAddresses', () => {
    const entries: YoroiEntries = {
      address1: {
        '': '1',
        token123: '2',
        token567: '-2',
      },
      address2: {
        '': '1',
        token123: '2',
        token567: '-2',
      },
      address3: {
        '': '1',
        token123: '2',
        token567: '-2',
      },
    }

    expect(Entries.toAddresses(entries)).toEqual(['address1', 'address2', 'address3'])
  })

  it('toAmounts', () => {
    const entries: YoroiEntries = {
      address1: {
        '': '1',
        token123: '2',
        token567: '-2',
      },
      address2: {
        '': '1',
        token123: '2',
        token567: '-2',
      },
      address3: {
        '': '1',
        token123: '2',
        token567: '-2',
      },
    }

    expect(Entries.toAmounts(entries)).toEqual({
      '': '3',
      token123: '6',
      token567: '-6',
    } as YoroiAmounts)
  })
})

describe('Utxos', () => {
  describe('toAmounts', () => {
    it('Empty Utxos', () => {
      const utxos: RawUtxo[] = []
      const primaryTokenId = 'primaryTokenId'

      expect(Utxos.toAmounts(utxos, primaryTokenId)).toEqual({
        primaryTokenId: '0',
      } as YoroiAmounts)
    })

    it('Utxos without tokens', () => {
      const utxos: RawUtxo[] = [
        {
          amount: '10132',
          assets: [],
          receiver: '',
          tx_hash: '',
          tx_index: 12,
          utxo_id: '',
        },
        {
          amount: '612413',
          assets: [],
          receiver: '',
          tx_hash: '',
          tx_index: 13,
          utxo_id: '',
        },
        {
          amount: '3212',
          assets: [],
          receiver: '',
          tx_hash: '',
          tx_index: 15,
          utxo_id: '',
        },
        {
          amount: '1933',
          receiver: '',
          tx_hash: '',
          tx_index: 14,
          utxo_id: '',
          assets: [],
        },
      ]

      const primaryTokenId = 'primaryTokenId'

      expect(Utxos.toAmounts(utxos, primaryTokenId)).toEqual({
        primaryTokenId: '627690',
      } as YoroiAmounts)
    })

    it('Utxos with tokens', () => {
      const utxos: RawUtxo[] = [
        {
          amount: '1024',
          assets: [
            {assetId: 'token123', amount: '10', policyId: '', name: ''},
            {assetId: 'token567', amount: '6', policyId: '', name: ''},
          ],
          receiver: '',
          tx_hash: '',
          tx_index: 12,
          utxo_id: '',
        },
        {
          amount: '62314',
          assets: [{assetId: 'token123', amount: '5', policyId: '', name: ''}],
          receiver: '',
          tx_hash: '',
          tx_index: 13,
          utxo_id: '',
        },
        {
          amount: '332',
          assets: [{assetId: 'token567', amount: '2', policyId: '', name: ''}],
          receiver: '',
          tx_hash: '',
          tx_index: 15,
          utxo_id: '',
        },
        {
          amount: '4235',
          receiver: '',
          tx_hash: '',
          tx_index: 14,
          utxo_id: '',
          assets: [],
        },
      ]

      const primaryTokenId = 'primaryTokenId'

      expect(Utxos.toAmounts(utxos, primaryTokenId)).toEqual({
        primaryTokenId: '67905',
        token123: '15',
        token567: '8',
      } as YoroiAmounts)
    })
  })
})

describe('asQuantity', () => {
  it.each`
    input             | output
    ${'0'}            | ${'0'}
    ${'1'}            | ${'1'}
    ${'1.000001'}     | ${'1.000001'}
    ${'0.0000000000'} | ${'0'}
    ${-0}             | ${'0'}
    ${1 / 3}          | ${'0.3333333333333333'}
    ${-1}             | ${'-1'}
  `('when the input is $input it should return $output', ({input, output}) => {
    expect(asQuantity(input)).toEqual(output)
  })

  it.each`
    input
    ${''}
    ${undefined}
    ${null}
    ${NaN}
    ${Infinity}
    ${-Infinity}
  `('when the input is $input it should throw error', ({input}) => {
    expect(() => asQuantity(input)).toThrowError('Invalid quantity')
  })
})
