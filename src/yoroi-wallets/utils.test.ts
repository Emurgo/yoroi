import {Quantity, YoroiAmount, YoroiAmounts, YoroiEntries, YoroiEntry} from './types'
import {Amounts, Entries, Quantities} from './utils'

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
