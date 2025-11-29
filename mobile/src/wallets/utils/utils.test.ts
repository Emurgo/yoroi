import {RawUtxo} from '@yoroi/api'
import {primaryTokenId} from '@yoroi/portfolio'
import {TransactionOutput} from '@yoroi/tx'
import {
  Address,
  Balance,
  PolicyId,
  Portfolio,
  TokenId,
  TransactionHash,
  UtxoId,
} from '@yoroi/types'

import BigNumber from 'bignumber.js'

import {
  Amounts,
  Entries,
  Quantities,
  Utxos,
  asQuantity,
  splitStringInto64CharArray,
} from './utils'

describe('Quantities', () => {
  it('sum', () => {
    expect(
      Quantities.sum(['1' as Balance.Quantity, '2' as Balance.Quantity]),
    ).toEqual('3' as Balance.Quantity)
    expect(
      Quantities.sum([
        '1' as Balance.Quantity,
        '2' as Balance.Quantity,
        '3' as Balance.Quantity,
      ]),
    ).toEqual('6' as Balance.Quantity)
  })

  it('diff', () => {
    expect(
      Quantities.diff('1' as Balance.Quantity, '2' as Balance.Quantity),
    ).toEqual('-1' as Balance.Quantity)
    expect(
      Quantities.diff('3' as Balance.Quantity, '2' as Balance.Quantity),
    ).toEqual('1' as Balance.Quantity)
  })

  it('negated', () => {
    expect(Quantities.negated('1' as Balance.Quantity)).toEqual(
      '-1' as Balance.Quantity,
    )
    expect(Quantities.negated('-1' as Balance.Quantity)).toEqual(
      '1' as Balance.Quantity,
    )
  })
  it('product', () => {
    expect(
      Quantities.product(['1' as Balance.Quantity, '2' as Balance.Quantity]),
    ).toEqual('2' as Balance.Quantity)
    expect(
      Quantities.product(['2' as Balance.Quantity, '3' as Balance.Quantity]),
    ).toEqual('6' as Balance.Quantity)
  })
  it('quotient', () => {
    expect(
      Quantities.quotient('1' as Balance.Quantity, '2' as Balance.Quantity),
    ).toEqual('0.5' as Balance.Quantity)
    expect(
      Quantities.quotient('2' as Balance.Quantity, '1' as Balance.Quantity),
    ).toEqual('2' as Balance.Quantity)
  })
  it('isGreaterThan', () => {
    expect(
      Quantities.isGreaterThan(
        '1' as Balance.Quantity,
        '2' as Balance.Quantity,
      ),
    ).toBe(false)
    expect(
      Quantities.isGreaterThan(
        '2' as Balance.Quantity,
        '2' as Balance.Quantity,
      ),
    ).toBe(false)
    expect(
      Quantities.isGreaterThan(
        '2' as Balance.Quantity,
        '1' as Balance.Quantity,
      ),
    ).toBe(true)
  })
  it('decimalPlaces', () => {
    expect(Quantities.decimalPlaces('1' as Balance.Quantity, 2)).toBe('1')
    expect(Quantities.decimalPlaces('1.00000' as Balance.Quantity, 2)).toBe('1')
    expect(Quantities.decimalPlaces('1.123456' as Balance.Quantity, 2)).toBe(
      '1.12',
    )
    expect(Quantities.decimalPlaces('1.123456' as Balance.Quantity, 10)).toBe(
      '1.123456',
    )
  })
  it('denominated', () => {
    expect(Quantities.denominated('1' as Balance.Quantity, 2)).toBe('0.01')
    expect(Quantities.denominated('1000' as Balance.Quantity, 2)).toBe('10')
    expect(Quantities.denominated('112345' as Balance.Quantity, 3)).toBe(
      '112.345',
    )
    expect(Quantities.denominated('1123456' as Balance.Quantity, 10)).toBe(
      '0.0001123456',
    )
    expect(Quantities.denominated('1123456' as Balance.Quantity, 20)).toBe(
      '0.00000000000001123456',
    )
  })
  it('integer', () => {
    expect(Quantities.integer(Quantities.zero, 15)).toBe('0')
    expect(Quantities.integer(asQuantity(-1), 3)).toBe('-1000')
    expect(Quantities.integer(asQuantity(2.5), 2)).toBe('250')
    expect(Quantities.integer('1' as Balance.Quantity, 2)).toBe('100')
    expect(Quantities.integer('1000' as Balance.Quantity, 2)).toBe('100000')
    expect(Quantities.integer('123.456' as Balance.Quantity, 3)).toBe('123456')
    expect(Quantities.integer('1.08' as Balance.Quantity, 10)).toBe(
      '10800000000',
    )
    expect(Quantities.integer('1.0800001' as Balance.Quantity, 3)).toBe('1080')
    expect(
      Quantities.integer(asQuantity(new BigNumber('0000000000015')), 6),
    ).toBe('15000000')
    expect(Quantities.integer(asQuantity(new BigNumber(1.5)), 6)).toBe(
      '1500000',
    )
  })
  it('zero & isZero', () => {
    expect(Quantities.isZero(Quantities.integer(Quantities.zero, 15))).toBe(
      true,
    )
    expect(
      Quantities.isZero(Quantities.integer('0' as Balance.Quantity, 2)),
    ).toBe(true)
    expect(
      Quantities.isZero(Quantities.integer('-1' as Balance.Quantity, 2)),
    ).toBe(false)
    expect(
      Quantities.isZero(Quantities.integer('1' as Balance.Quantity, 2)),
    ).toBe(false)
    expect(
      Quantities.isZero(
        Quantities.integer('0.00000000000001' as Balance.Quantity, 18),
      ),
    ).toBe(false)
    expect(Quantities.isZero(Quantities.zero)).toBe(true)
  })
  it('isAtomic', () => {
    expect(Quantities.isAtomic('1' as Balance.Quantity, 0)).toBe(true)
    expect(Quantities.isAtomic('0' as Balance.Quantity, 0)).toBe(false)
    expect(Quantities.isAtomic('1' as Balance.Quantity, 1)).toBe(false)
    expect(Quantities.isAtomic('1' as Balance.Quantity, 10)).toBe(false)
    expect(Quantities.isAtomic('-1' as Balance.Quantity, 0)).toBe(true)
    expect(Quantities.isAtomic('0.0000000001' as Balance.Quantity, 10)).toBe(
      true,
    )
    expect(Quantities.isAtomic('0.0000000001' as Balance.Quantity, 11)).toBe(
      false,
    )
    expect(Quantities.isAtomic('100000' as Balance.Quantity, 6)).toBe(false)
    expect(Quantities.isAtomic('2' as Balance.Quantity, 0)).toBe(false)
    expect(Quantities.isAtomic('-2' as Balance.Quantity, 0)).toBe(false)
  })
  it('max', () => {
    expect(
      Quantities.max('1' as Balance.Quantity, '2' as Balance.Quantity),
    ).toEqual('2')
    expect(
      Quantities.max(
        '1' as Balance.Quantity,
        '2' as Balance.Quantity,
        '3' as Balance.Quantity,
      ),
    ).toEqual('3')
    expect(
      Quantities.max(
        '3' as Balance.Quantity,
        '2' as Balance.Quantity,
        '1' as Balance.Quantity,
      ),
    ).toEqual('3')
    expect(
      Quantities.max('1' as Balance.Quantity, '1' as Balance.Quantity),
    ).toEqual('1')
  })
  it('parseFromText', () => {
    const english = {
      prefix: '',
      decimalSeparator: '.',
      groupSeparator: ',',
      groupSize: 3,
      secondaryGroupSize: 0,
      fractionGroupSize: 0,
      fractionGroupSeparator: ' ',
      suffix: '',
    }

    const italian = {
      ...english,
      decimalSeparator: ',',
      groupSeparator: ' ',
    }

    BigNumber.config({
      FORMAT: italian,
    })

    expect(Quantities.parseFromText('', 3, italian)).toEqual(['', '0'])
    expect(Quantities.parseFromText('1', 3, italian)).toEqual(['1', '1000'])
    expect(Quantities.parseFromText('123,55', 3, italian)).toEqual([
      '123,55',
      '123550',
    ])
    expect(Quantities.parseFromText('1234,6666', 3, italian)).toEqual([
      '1234,666',
      '1234666',
    ])
    expect(Quantities.parseFromText('55,', 3, italian)).toEqual([
      '55,',
      '55000',
    ])
    expect(Quantities.parseFromText('55,0', 3, italian)).toEqual([
      '55,0',
      '55000',
    ])
    expect(Quantities.parseFromText('55,10', 3, italian)).toEqual([
      '55,10',
      '55100',
    ])

    expect(Quantities.parseFromText('ab1.5c,6.5', 3, italian)).toEqual([
      '15,65',
      '15650',
    ])

    BigNumber.config({
      FORMAT: english,
    })

    expect(Quantities.parseFromText('', 3, english)).toEqual(['', '0'])
    expect(Quantities.parseFromText('1', 3, english)).toEqual(['1', '1000'])
    expect(Quantities.parseFromText('123.55', 3, english)).toEqual([
      '123.55',
      '123550',
    ])
    expect(Quantities.parseFromText('1234.6666', 3, english)).toEqual([
      '1234.666',
      '1234666',
    ])
    expect(Quantities.parseFromText('55.', 3, english)).toEqual([
      '55.',
      '55000',
    ])
    expect(Quantities.parseFromText('55.0', 3, english)).toEqual([
      '55.0',
      '55000',
    ])
    expect(Quantities.parseFromText('55.10', 3, english)).toEqual([
      '55.10',
      '55100',
    ])

    expect(Quantities.parseFromText('ab1.5c,6.5', 3, english)).toEqual([
      '1.565', // sanitizedInput preserves all valid digits
      '1565',
    ])

    expect(Quantities.parseFromText('1.23456', 0, english, 3)).toEqual([
      '1.234',
      '1',
    ])
    expect(Quantities.parseFromText('1.23456', 2, english, 3)).toEqual([
      '1.234',
      '123',
    ])
  })
})

describe('Amounts', () => {
  it('sums multiple Balance.Amounts into a single Balance.Amounts', () => {
    const amounts1: Balance.Amounts = {
      ['.' as TokenId]: '1' as Balance.Quantity,
      ['token123' as TokenId]: '2' as Balance.Quantity,
      ['token567' as TokenId]: '-2' as Balance.Quantity,
    } as Balance.Amounts
    const amounts2: Balance.Amounts = {
      ['.' as TokenId]: '3' as Balance.Quantity,
      ['token456' as TokenId]: '4' as Balance.Quantity,
    } as Balance.Amounts

    expect(Amounts.sum([amounts1, amounts2])).toEqual({
      ['.' as TokenId]: '4' as Balance.Quantity,
      ['token123' as TokenId]: '2' as Balance.Quantity,
      ['token456' as TokenId]: '4' as Balance.Quantity,
      ['token567' as TokenId]: '-2' as Balance.Quantity,
    } as Balance.Amounts)
  })

  it('diffs 2 Balance.Amounts into a single Balance.Amounts', () => {
    const amounts1: Balance.Amounts = {
      '.': '1',
      'token123': '2',
      'token567': '-2',
    } as Balance.Amounts
    const amounts2: Balance.Amounts = {
      '.': '3',
      'token456': '4',
    } as Balance.Amounts

    expect(Amounts.diff(amounts1, amounts2)).toEqual({
      ['.' as TokenId]: '-2' as Balance.Quantity,
      ['token123' as TokenId]: '2' as Balance.Quantity,
      ['token456' as TokenId]: '-4' as Balance.Quantity,
      ['token567' as TokenId]: '-2' as Balance.Quantity,
    } as Balance.Amounts)
  })

  it('negate Balance.Amounts', () => {
    const amounts1: Balance.Amounts = {
      '.': '1',
      'token123': '2',
      'token567': '-2',
    } as Balance.Amounts

    expect(Amounts.negated(amounts1)).toEqual({
      ['.' as TokenId]: '-1' as Balance.Quantity,
      ['token123' as TokenId]: '-2' as Balance.Quantity,
      ['token567' as TokenId]: '2' as Balance.Quantity,
    } as Balance.Amounts)
  })

  it('getAmount', () => {
    const amounts: Balance.Amounts = {
      ['.' as TokenId]: '1' as Balance.Quantity,
      ['token123' as TokenId]: '2' as Balance.Quantity,
      ['token567' as TokenId]: '-2' as Balance.Quantity,
    } as Balance.Amounts

    Object.entries(amounts).forEach(([tokenId, quantity]) =>
      expect(Amounts.getAmount(amounts, tokenId)).toEqual({
        tokenId: tokenId as TokenId,
        quantity: quantity as Balance.Quantity,
      } as Balance.Amount),
    )
  })

  it('includes', () => {
    const amounts: Balance.Amounts = {
      ['.' as TokenId]: '1' as Balance.Quantity,
      ['token123' as TokenId]: '2' as Balance.Quantity,
      ['token567' as TokenId]: '-2' as Balance.Quantity,
    } as Balance.Amounts

    Object.keys(amounts).forEach((tokenId) =>
      expect(Amounts.includes(amounts, tokenId)).toBe(true),
    )

    expect(Amounts.includes(amounts, 'does-not-include')).toBe(false)
  })

  it('remove', () => {
    const amounts: Balance.Amounts = {
      ['.' as TokenId]: '123' as Balance.Quantity,
      ['policyId123.assetName123' as TokenId]: '456' as Balance.Quantity,
      ['policyId567.assetName567' as TokenId]: '-789' as Balance.Quantity,
    } as Balance.Amounts

    expect(
      Amounts.remove(amounts, ['policyId123.assetName123' as TokenId]),
    ).toEqual({
      ['.' as TokenId]: '123' as Balance.Quantity,
      ['token567' as TokenId]: '-789' as Balance.Quantity,
    } as Balance.Amounts)
  })

  it('toArray', () => {
    const amounts: Balance.Amounts = {
      ['.' as TokenId]: '123' as Balance.Quantity,
      ['token123' as TokenId]: '456' as Balance.Quantity,
      ['token567' as TokenId]: '-789' as Balance.Quantity,
    } as Balance.Amounts

    expect(Amounts.toArray(amounts)).toEqual([
      {tokenId: '.' as TokenId, quantity: '123' as Balance.Quantity},
      {tokenId: 'token123' as TokenId, quantity: '456' as Balance.Quantity},
      {tokenId: 'token567' as TokenId, quantity: '-789' as Balance.Quantity},
    ] as Array<Balance.Amount>)
  })

  it('from Array', () => {
    const amounts: Array<Balance.Amount> = [
      {tokenId: '.' as TokenId, quantity: '123' as Balance.Quantity},
      {tokenId: 'SUN' as TokenId, quantity: '456' as Balance.Quantity},
      {tokenId: 'QWE' as TokenId, quantity: '789' as Balance.Quantity},
    ]

    expect(Amounts.fromArray(amounts)).toEqual({
      ['.' as TokenId]: '123' as Balance.Quantity,
      ['SUN' as TokenId]: '456' as Balance.Quantity,
      ['QWE' as TokenId]: '789' as Balance.Quantity,
    } as Balance.Amounts)
  })

  it('map', () => {
    const amounts: Balance.Amounts = {
      ['.' as TokenId]: '1' as Balance.Quantity,
      ['SUN' as TokenId]: '4' as Balance.Quantity,
      ['QWE' as TokenId]: '7' as Balance.Quantity,
    } as Balance.Amounts

    expect(
      Amounts.map(amounts, (amount) => ({
        ...amount,
        quantity: Quantities.sum([amount.quantity, '1' as Balance.Quantity]),
      })),
    ).toEqual({
      '.': '2',
      'SUN': '5',
      'QWE': '8',
    } as Balance.Amounts)
  })

  describe('save', () => {
    it('updating when already exists', () => {
      const amounts: Balance.Amounts = {
        ['updateToken' as TokenId]: '456' as Balance.Quantity,
      } as Balance.Amounts
      const updateAmount: Balance.Amount = {
        tokenId: 'updateToken' as TokenId,
        quantity: '321' as Balance.Quantity,
      }

      expect(Amounts.save(amounts, updateAmount)).toEqual({
        ['updateToken' as TokenId]: '321' as Balance.Quantity,
      } as Balance.Amounts)
    })

    it('adding when it doesnt exist', () => {
      const amounts: Balance.Amounts = {
        ['updateToken' as TokenId]: '456' as Balance.Quantity,
      } as Balance.Amounts
      const addAmount: Balance.Amount = {
        tokenId: 'addToken' as TokenId,
        quantity: '789' as Balance.Quantity,
      }

      expect(Amounts.save(amounts, addAmount)).toEqual({
        ['addToken' as TokenId]: '789' as Balance.Quantity,
        updateToken: '456',
      })
    })
  })
})

describe('Entries', () => {
  it('first gets the first entry from YoroiEnrties', () => {
    const entries: TransactionOutput[] = [
      {
        address: 'address1' as Address,
        amounts: {
          [primaryTokenId]: '1',
          ['token123' as TokenId]: '2',
          ['token567' as TokenId]: '-2',
        } as Balance.Amounts,
      },
    ]

    expect(Entries.first(entries)).toEqual({
      address: 'address1' as Address,
      amounts: {
        '.': '1',
        'token123': '2',
        'token567': '-2',
      },
    } as TransactionOutput)
  })

  it('first returns first item multiple entries', () => {
    const entries: TransactionOutput[] = [
      {
        address: 'address1' as Address,
        amounts: {
          [primaryTokenId]: '1',
          ['token123' as TokenId]: '2',
          ['token567' as TokenId]: '-2',
        } as Balance.Amounts,
      },
      {
        address: 'address2' as Address,
        amounts: {
          [primaryTokenId]: '1',
          ['token123' as TokenId]: '2',
          ['token567' as TokenId]: '-2',
        } as Balance.Amounts,
      },
    ]

    expect(Entries.first(entries)).toEqual({
      address: 'address1' as Address,
      amounts: {[primaryTokenId]: '1', token123: '2', token567: '-2'},
    })
  })

  it('remove', () => {
    const entries: TransactionOutput[] = [
      {
        address: 'address1' as Address,
        amounts: {
          [primaryTokenId]: '1',
          ['token123' as TokenId]: '2',
          ['token567' as TokenId]: '-2',
        } as Balance.Amounts,
      },
      {
        address: 'address2' as Address,
        amounts: {
          [primaryTokenId]: '1',
          ['token123' as TokenId]: '2',
          ['token567' as TokenId]: '-2',
        } as Balance.Amounts,
      },
      {
        address: 'address3' as Address,
        amounts: {
          [primaryTokenId]: '1',
          ['token123' as TokenId]: '2',
          ['token567' as TokenId]: '-2',
        } as Balance.Amounts,
      },
    ]

    const expectedEntries: TransactionOutput[] = [
      {
        address: 'address1' as Address,
        amounts: {
          [primaryTokenId]: '1',
          ['token123' as TokenId]: '2',
          ['token567' as TokenId]: '-2',
        } as Balance.Amounts,
      },
      {
        address: 'address3' as Address,
        amounts: {
          [primaryTokenId]: '1',
          ['token123' as TokenId]: '2',
          ['token567' as TokenId]: '-2',
        } as Balance.Amounts,
      },
    ]

    expect(Entries.remove(entries, ['address2'])).toEqual(expectedEntries)
  })

  it('toAddresses', () => {
    const entries: TransactionOutput[] = [
      {
        address: 'address1' as Address,
        amounts: {
          [primaryTokenId]: '1',
          ['token123' as TokenId]: '2',
          ['token567' as TokenId]: '-2',
        } as Balance.Amounts,
      },
      {
        address: 'address2' as Address,
        amounts: {
          [primaryTokenId]: '1',
          ['token123' as TokenId]: '2',
          ['token567' as TokenId]: '-2',
        } as Balance.Amounts,
      },
      {
        address: 'address3' as Address,
        amounts: {
          [primaryTokenId]: '1',
          ['token123' as TokenId]: '2',
          ['token567' as TokenId]: '-2',
        } as Balance.Amounts,
      },
    ]

    expect(Entries.toAddresses(entries)).toEqual([
      'address1',
      'address2',
      'address3',
    ])
  })

  it('toAmounts', () => {
    const entries: TransactionOutput[] = [
      {
        address: 'address1' as Address,
        amounts: {
          [primaryTokenId]: '1',
          ['token123' as TokenId]: '2',
          ['token567' as TokenId]: '-2',
        } as Balance.Amounts,
      },
      {
        address: 'address2' as Address,
        amounts: {
          [primaryTokenId]: '1',
          ['token123' as TokenId]: '2',
          ['token567' as TokenId]: '-2',
        } as Balance.Amounts,
      },
      {
        address: 'address3' as Address,
        amounts: {
          [primaryTokenId]: '1',
          ['token123' as TokenId]: '2',
          ['token567' as TokenId]: '-2',
        } as Balance.Amounts,
      },
    ]

    expect(Entries.toAmounts(entries)).toEqual({
      ['.' as TokenId]: '3' as Balance.Quantity,
      ['token123' as TokenId]: '6' as Balance.Quantity,
      ['token567' as TokenId]: '-6' as Balance.Quantity,
    } as Balance.Amounts)
  })
})

describe('Utxos', () => {
  describe('toAmounts', () => {
    it('Empty Utxos', () => {
      const utxos: RawUtxo[] = []
      const primaryTokenId =
        'policyId.assetName' as TokenId as Portfolio.Token.Id

      expect(Utxos.toAmounts(utxos, primaryTokenId)).toEqual({
        'policyId.assetName': '0',
      } as Balance.Amounts)
    })

    it('Utxos without tokens', () => {
      const utxos: RawUtxo[] = [
        {
          amount: '10132' as Balance.Quantity,
          assets: [],
          receiver: '' as Address,
          tx_hash: '' as TransactionHash,
          tx_index: 12,
          utxo_id: '' as UtxoId,
        },
        {
          amount: '612413' as Balance.Quantity,
          assets: [],
          receiver: '' as Address,
          tx_hash: '' as TransactionHash,
          tx_index: 13,
          utxo_id: '' as UtxoId,
        },
        {
          amount: '3212' as Balance.Quantity,
          assets: [],
          receiver: '' as Address,
          tx_hash: '' as TransactionHash,
          tx_index: 15,
          utxo_id: '' as UtxoId,
        },
        {
          amount: '1933' as Balance.Quantity,
          receiver: '' as Address,
          tx_hash: '' as TransactionHash,
          tx_index: 14,
          utxo_id: '' as UtxoId,
          assets: [],
        },
      ]

      const primaryTokenId =
        'policyId.assetName' as TokenId as Portfolio.Token.Id

      expect(Utxos.toAmounts(utxos, primaryTokenId)).toEqual({
        'policyId.assetName': '627690',
      } as Balance.Amounts)
    })

    it('Utxos with tokens', () => {
      const utxos: RawUtxo[] = [
        {
          amount: '1024' as Balance.Quantity,
          assets: [
            {
              tokenId: 'policy123.token123' as Portfolio.Token.Id,
              amount: '10' as Balance.Quantity,
              policyId: 'policy123' as PolicyId,
              name: 'token123',
            },
            {
              tokenId: 'policy567.token567' as Portfolio.Token.Id,
              amount: '6' as Balance.Quantity,
              policyId: 'policy567' as PolicyId,
              name: 'token567',
            },
          ],
          receiver: '' as Address,
          tx_hash: '' as TransactionHash,
          tx_index: 12,
          utxo_id: '' as UtxoId,
        },
        {
          amount: '62314' as Balance.Quantity,
          assets: [
            {
              tokenId: 'policy123.token123' as Portfolio.Token.Id,
              amount: '5' as Balance.Quantity,
              policyId: 'policy123' as PolicyId,
              name: 'token123',
            },
          ],
          receiver: '' as Address,
          tx_hash: '' as TransactionHash,
          tx_index: 13,
          utxo_id: '' as UtxoId,
        },
        {
          amount: '332' as Balance.Quantity,
          assets: [
            {
              tokenId: 'policy567.token567' as Portfolio.Token.Id,
              amount: '2' as Balance.Quantity,
              policyId: 'policy567' as PolicyId,
              name: 'token567',
            },
          ],
          receiver: '' as Address,
          tx_hash: '' as TransactionHash,
          tx_index: 15,
          utxo_id: '' as UtxoId,
        },
        {
          amount: '4235' as Balance.Quantity,
          receiver: '' as Address,
          tx_hash: '' as TransactionHash,
          tx_index: 14,
          utxo_id: '' as UtxoId,
          assets: [],
        },
      ]

      const primaryTokenId =
        'policyId.assetName' as TokenId as Portfolio.Token.Id

      expect(Utxos.toAmounts(utxos, primaryTokenId)).toEqual({
        'policyId.assetName': '67905',
        'policyId123.assetName123': '15',
        'policyId567.assetName567': '8',
      } as Balance.Amounts)
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

describe('splitStringInto64CharArray', () => {
  it('should split a short string into a single element array', () => {
    const inputString = 'Hello, World!'
    const expectedArray = [inputString]

    const result = splitStringInto64CharArray(inputString)

    expect(result).toEqual(expectedArray)
  })

  it('should split a long string into multiple 64-character elements', () => {
    const inputString =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789023123'
    const expectedArray = [
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789023',
      '123',
    ]

    const result = splitStringInto64CharArray(inputString)

    expect(result).toEqual(expectedArray)
  })

  it('should handle an empty input string', () => {
    const inputString = ''
    const expectedArray: string[] = []

    const result = splitStringInto64CharArray(inputString)

    expect(result).toEqual(expectedArray)
  })
})
