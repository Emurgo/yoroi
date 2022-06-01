import {TxMetadata} from '@emurgo/yoroi-lib-core'
import BigNumber from 'bignumber.js'

import {TokenEntry} from '../types'
import {Quantity, YoroiAmount, YoroiAmounts, YoroiEntries, YoroiEntry, YoroiMetadata} from './types'
import {Amounts, Entries, Quantities, toAmounts, toEntries, toMetadata} from './yoroiUnsignedTx'

describe('yoroi', () => {
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
})
