import {TxMetadata} from '@emurgo/yoroi-lib-core'
import BigNumber from 'bignumber.js'

import {TokenEntry} from '../../types'
import {YoroiAmounts, YoroiEntries, YoroiMetadata} from '../types'
import {toAmounts, toEntries, toMetadata} from './unsignedTx'

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

  it('toMetadata converts UnsignedTx to YoroiMetadata', () => {
    const txMetadata: Array<TxMetadata> = [
      {label: 'label1', data: 'data1'},
      {label: 'label2', data: 'data2'},
      {label: 'label3', data: 'data3'},
    ]

    expect(toMetadata(txMetadata)).toEqual({
      label1: 'data1',
      label2: 'data2',
      label3: 'data3',
    } as YoroiMetadata)
  })

  it('toEntries converts change/outputs to YoroiEntries', () => {
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
      address1: {
        '': '1',
        token123: '2',
      },
      address2: {
        '': '1',
        token123: '2',
      },
    } as YoroiEntries)
  })
})
