import BigNumber from 'bignumber.js'

import {mocks} from '../../mocks'
import {calcLockedDeposit} from './assetUtils'

describe('assetUtils', () => {
  describe('calcLockedDeposit()', () => {
    it('should calculate when there are assets', async () => {
      const lockedDeposit = await calcLockedDeposit(mocks.utxos, 300)

      expect(lockedDeposit).toEqual(new BigNumber('20360440'))
    })

    it('should return 0 when there are no assets', async () => {
      const utxos = mocks.utxos.filter((u) => u.assets.length === 0)

      const lockedDeposit = await calcLockedDeposit(utxos, 300)

      expect(lockedDeposit).toEqual(new BigNumber('0'))
    })
  })
})
