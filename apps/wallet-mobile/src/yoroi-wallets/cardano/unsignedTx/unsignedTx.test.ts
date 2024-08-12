import {Balance} from '@yoroi/types'
import BigNumber from 'bignumber.js'

import {YoroiEntry, YoroiMetadata} from '../../types'
import {CardanoTypes} from '../types'
import {toAmounts, toDisplayAddress, toEntriesFromOutputs, toMetadata} from './unsignedTx'

describe('YoroiUnsignedTx', () => {
  it('toAmounts converts TokenEntry[] to Balance.Amounts', () => {
    const tokenEntries: Array<CardanoTypes.TokenEntry> = [
      {identifier: '.', networkId: 1, amount: new BigNumber('1')},
      {identifier: '.', networkId: 1, amount: new BigNumber('3')},
      {identifier: 'token123', networkId: 1, amount: new BigNumber('4')},
      {identifier: 'token123', networkId: 1, amount: new BigNumber('-2')},
      {identifier: 'token456', networkId: 1, amount: new BigNumber('2')},
    ]

    expect(toAmounts(tokenEntries)).toEqual({
      '.': '4',
      token123: '2',
      token456: '2',
    } as Balance.Amounts)
  })

  it('toMetadata converts UnsignedTx to YoroiMetadata', () => {
    const txMetadata: Array<CardanoTypes.TxMetadata> = [
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

  it('toEntries converts change/outputs to YoroiEntry[]', async () => {
    const defaults = {identifier: '.', networkId: 1, isDefault: true}
    const addressedValues = [
      {
        address: 'address1',
        value: {
          values: [
            {identifier: '.', amount: new BigNumber('1'), networkId: 1},
            {identifier: 'token123', amount: new BigNumber('2'), networkId: 1},
          ],
          defaults,
        },
      },
      {
        address: 'address2',
        value: {
          values: [
            {identifier: '.', amount: new BigNumber('1'), networkId: 1},
            {identifier: 'token123', amount: new BigNumber('2'), networkId: 1},
          ],
          defaults,
        },
      },
    ]

    const expectedEntries: YoroiEntry[] = [
      {address: 'address1', amounts: {'.': '1', token123: '2'}},
      {address: 'address2', amounts: {'.': '1', token123: '2'}},
    ]
    expect(await toEntriesFromOutputs(addressedValues)).toEqual(expectedEntries)
  })

  describe('toDisplayAddress', () => {
    it('converts base addresses to display format', async () => {
      const baseAddress =
        '0047105ab5818c2d97c4133fc1965caf2efaa6d8a1dac89787269cf925f23a7df7d41b2dcb227efd76bcc9f03942768db0e7850aafeb687eca'

      expect(await toDisplayAddress(baseAddress)).toBe(
        'addr_test1qpr3qk44sxxzm97yzvlur9ju4uh04fkc58dv39u8y6w0jf0j8f7l04qm9h9jylhaw67vnupegfmgmv88s592l6mg0m9q4v9w46',
      )
    })

    it('converts pointer addresses to display format', async () => {
      const pointerAddress = '419493315cd92eb5d8c4304e67b7e16ae36d61d34502694657811a2c8e640200'

      expect(await toDisplayAddress(pointerAddress)).toBe(
        'addr1gx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzernyqgqq9uys76',
      )
    })

    it('converts enterprise addresses to display format', async () => {
      const enterpriseAddress = '619493315cd92eb5d8c4304e67b7e16ae36d61d34502694657811a2c8e'

      expect(await toDisplayAddress(enterpriseAddress)).toBe(
        'addr1vx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzers66hrl8',
      )
    })

    it('converts byron addresses to display format', async () => {
      const byronAddress = '82d818582183581cab56f22552e28af9ce124da76f8f87b622b4d70ab4d8a24f196a8bfea0001add00c102'

      expect(await toDisplayAddress(byronAddress)).toBe('Ae2tdPwUPEZDuM3S8RBo5RYn25Tv4rEiu9MYephhjqL2ZxFAeoUzTXcVcpZ')
    })

    it('converts stake addresses to display format', async () => {
      const stakeAddress = 'e1e0c88d248e9c2ddab6f8f46afd470f07a20f43f5f945df643233c8ec'

      expect(await toDisplayAddress(stakeAddress)).toBe('stake1u8sv3rfy36wzmk4klr6x4l28pur6yr6r7hu5thmyxgeu3mqw94567')
    })

    it('does not convert bech32 addresses', async () => {
      const bech32Address = 'addr1vpu5vlrf4xkxv2qpwngf6cjhtw542ayty80v8dyr49rf5eg0yu80w'

      expect(await toDisplayAddress(bech32Address)).toBe(bech32Address)
    })

    it('does not convert base58 addresses', async () => {
      const base58Address =
        '37btjrVyb4KDXBNC4haBVPCrro8AQPHwvCMp3RFhhSVWwfFmZ6wwzSK6JK1hY6wHNmtrpTf1kdbva8TCneM2YsiXT7mrzT21EacHnPpz5YyUdj64na'

      expect(await toDisplayAddress(base58Address)).toBe(base58Address)
    })
  })
})
