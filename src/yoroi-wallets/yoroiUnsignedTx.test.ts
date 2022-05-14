import {TxMetadata} from '@emurgo/yoroi-lib-core'
import BigNumber from 'bignumber.js'

import {TokenEntry} from '../types'
import {YoroiAmounts, YoroiAuxiliary, YoroiEntries, YoroiEntry} from './types'
import {Amounts, Entries, Quantities, toAmounts, toAuxiliary, toEntries} from './yoroiUnsignedTx'

describe('YoroiUnsignedTx', () => {
  it('toAmounts converts TokenEntry[] to YoroiAmounts', () => {
    const tokenEntries: Array<TokenEntry> = [
      {identifier: '', networkId: 1, amount: new BigNumber('1')},
      {identifier: '', networkId: 1, amount: new BigNumber('3')},
      {identifier: 'token123', networkId: 1, amount: new BigNumber('4')},
      {identifier: 'token123', networkId: 1, amount: new BigNumber('-2')},
      {identifier: 'token456', networkId: 1, amount: new BigNumber('2')},
    ]

    expect(toAmounts(tokenEntries)).toEqual({
      '': '4',
      token123: '2',
      token456: '2',
    } as YoroiAmounts)
  })

  it('toAuxiliary converts UnsignedTx to YoroiAuxiliary', () => {
    const txMetadata: Array<TxMetadata> = [
      {label: 'label1', data: 'data1'},
      {label: 'label2', data: 'data2'},
      {label: 'label3', data: 'data3'},
    ]

    expect(toAuxiliary(txMetadata)).toEqual({
      label1: 'data1',
      label2: 'data2',
      label3: 'data3',
    } as YoroiAuxiliary)
  })

  it('toEntries', () => {
    const defaults = {identifier: '', networkId: 1, isDefault: true}
    const addressedValues = [
      {
        address: 'address1',
        value: {
          values: [
            {identifier: '', amount: new BigNumber('1'), networkId: 1},
            {identifier: 'token123', amount: new BigNumber('2'), networkId: 1},
          ],
          defaults,
        },
      },
      {
        address: 'address2',
        value: {
          values: [
            {identifier: '', amount: new BigNumber('1'), networkId: 1},
            {identifier: 'token123', amount: new BigNumber('2'), networkId: 1},
          ],
          defaults,
        },
      },
    ]

    expect(toEntries(addressedValues)).toEqual({
      address1: {'': '1', token123: '2'},
      address2: {'': '1', token123: '2'},
    } as YoroiEntries)
  })
})

describe('Quantities', () => {
  it('sum', () => {
    expect(Quantities.sum(['1', '2'])).toEqual('3')
    expect(Quantities.sum(['1', '2', '3'])).toEqual('6')
  })

  it('diff', () => {
    expect(Quantities.diff('1', '2')).toEqual('-1')
    expect(Quantities.diff('3', '2')).toEqual('1')
  })

  it('negated', () => {
    expect(Quantities.negated('1')).toEqual('-1')
    expect(Quantities.negated('-1')).toEqual('1')
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
    })
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
    })
  })

  it('first throws error if multiple addresses', () => {
    const entries: YoroiEntries = {
      address1: {'': '1', token123: '2', token567: '-2'},
      address2: {'': '1', token123: '2', token567: '-2'},
    }

    expect(() => Entries.first(entries)).toThrowError()
  })

  it('getAmount', () => {
    const amounts: YoroiAmounts = {
      '': '1',
      token123: '2',
      token567: '-2',
    }
    const entry: YoroiEntry = {
      address: 'address',
      amounts: amounts,
    }

    expect(Entries.getAmount(entry, '')).toEqual({
      tokenId: '',
      quantity: '1',
    })
  })

  it('getPrimaryAmount', () => {
    const amounts: YoroiAmounts = {
      '': '1',
      token123: '2',
      token567: '-2',
    }
    const entries: YoroiEntries = {
      address1: amounts,
    }

    expect(Entries.getPrimaryAmount(entries)).toEqual({
      tokenId: '',
      quantity: '1',
    })
  })

  it('getSecondaryAmounts', () => {
    const amounts: YoroiAmounts = {
      '': '1',
      token123: '2',
      token567: '-2',
    }
    const entries: YoroiEntries = {
      address1: amounts,
    }

    expect(Entries.getSecondaryAmounts(entries)).toEqual({
      token123: '2',
      token567: '-2',
    })
  })
})

// const address = 'address'
// const addressing = {
//   path: [],
//   startLevel: 1,
// }
// const change = [
//   {
//     address,
//     addressing,
//     values: multiToken({
//       '': '1',
//       token123: '1',
//     }),
//   },
// ]

// const totalOutput = {
//   defaults,
//   values: [
//     {
//       amount: new BigNumber('1'),
//       identifier: '',
//       networkId: 1,
//     },
//     {
//       amount: new BigNumber('1'),
//       identifier: '',
//       networkId: 1,
//     },
//     {
//       amount: new BigNumber('1'),
//       identifier: '',
//       networkId: 1,
//     },
//     {
//       amount: new BigNumber('1'),
//       identifier: '',
//       networkId: 1,
//     },

//     {
//       amount: new BigNumber('1'),
//       identifier: 'token123',
//       networkId: 1,
//     },
//     {
//       amount: new BigNumber('1'),
//       identifier: 'token123',
//       networkId: 1,
//     },

//     {
//       amount: new BigNumber('1'),
//       identifier: 'token456',
//       networkId: 1,
//     },
//     {
//       amount: new BigNumber('1'),
//       identifier: 'token456',
//       networkId: 1,
//     },
//   ],
// }

// const outputs = [
//   {
//     address: 'address1',
//     value: multiToken({'': '1', token123: '1'}),
//   },
//   {
//     address: 'address1',
//     value: multiToken({'': '1', token123: '1'}),
//   },
//   {
//     address: 'address1',
//     value: multiToken({'': '1', token456: '1'}),
//   },
//   {
//     address: 'address2',
//     value: multiToken({'': '1', token456: '1'}),
//   },
// ]

// const mockUnsignedTx: UnsignedTx = {
//   senderUtxos: [],
//   outputs,
//   totalOutput,
//   fee: multiToken({'': '1', token123: '1'}),
//   change,
//   metadata: [{label: 'label', data: 'data '}],
//   withdrawals: null as unknown as UnsignedTx['withdrawals'],
//   deregistrations: null as unknown as UnsignedTx['deregistrations'],
//   certificates: null as unknown as UnsignedTx['certificates'],

//   inputs: null as any,
//   totalInput: null as any,
//   ttl: null as any,
//   neededStakingKeyHashes: null as any,
//   encodedTx: null as any,
//   hash: null as any,
//   sign: null as any,
// }
