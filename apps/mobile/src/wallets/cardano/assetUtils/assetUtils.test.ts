import BigNumber from 'bignumber.js'

import {mocks} from '../../mocks/wallet'
import {calcLockedDeposit} from './assetUtils'

describe('assetUtils', () => {
  describe('calcLockedDeposit()', () => {
    const address =
      'addr_test1qrrdv3uxj8shu27ea9djvnn3rl4w3lvh3cyck6yc36mvf6ctlqxj9g0azvpycncr9u600p6t556qhc3psk06uzzw6saq4kvdpq'
    it('should calculate when there are assets', async () => {
      const lockedDeposit = await calcLockedDeposit({
        rawUtxos: mocks.utxos,
        address,
        coinsPerUtxoByteStr: '4310',
      })

      expect(lockedDeposit).toEqual(new BigNumber('20360440'))
    })

    it('should return 0 when there are no assets', async () => {
      const utxos = mocks.utxos.filter((u) => u.assets.length === 0)

      const lockedDeposit = await calcLockedDeposit({rawUtxos: utxos, address, coinsPerUtxoByteStr: '4310'})

      expect(lockedDeposit).toEqual(new BigNumber('0'))
    })
  })
})
