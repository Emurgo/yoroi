import AsyncStorage from '@react-native-async-storage/async-storage'
import {expect} from 'chai'

import {mockPendingTransaction} from '../../storybook/mocks/transaction'
import {mockWallet} from '../../storybook/mocks/wallet'
import {PendingTransaction} from '../types'
import {PendingTxService} from './pendingTx'

describe('PendingTxService', () => {
  let pendingTx1: PendingTransaction
  let pendingTx2: PendingTransaction
  const wallet = mockWallet

  beforeEach(async () => {
    await AsyncStorage.clear()
    pendingTx1 = mockPendingTransaction({
      id: 'pending-tx-1',
    })
    pendingTx2 = mockPendingTransaction({
      id: 'pending-tx-2',
    })
  })

  describe('save()', () => {
    it('should initialize/create empty/does not exist', async () => {
      const pendingTxService = new PendingTxService(wallet)

      const before = await pendingTxService.readAll()
      await pendingTxService.save(pendingTx1)
      await pendingTxService.save(pendingTx2)
      const after = await pendingTxService.readAll()

      expect(before).to.be.undefined
      expect(after).to.be.eql([pendingTx1, pendingTx2])
    })
    it('should update if the record exists', async () => {
      const pendingTxService = new PendingTxService(wallet)
      const pendingTx1Update = mockPendingTransaction({
        id: 'pending-tx-1',
        status: 'FAILED',
      })

      await pendingTxService.save(pendingTx1)
      const before = await pendingTxService.read(pendingTx1.id)
      await pendingTxService.save(pendingTx1Update)
      const after = await pendingTxService.read(pendingTx1.id)

      expect(before).to.be.eql(pendingTx1)
      expect(after).to.be.eql(pendingTx1Update)
      expect((await pendingTxService.readAll())?.length).to.be.equal(1)
    })
  })

  describe('remove()', () => {
    it('should not fail if the record does not exist', async () => {
      const pendingTxService = new PendingTxService(wallet)

      await pendingTxService.remove('not-created-yet')
      const after = await pendingTxService.readAll()

      expect(after).to.be.undefined
    })
    it('should delete if the record exists', async () => {
      const pendingTxService = new PendingTxService(wallet)

      await pendingTxService.save(pendingTx1)
      await pendingTxService.save(pendingTx2)
      const before = await pendingTxService.readAll()
      await pendingTxService.remove(pendingTx1.id)
      const after = await pendingTxService.readAll()

      expect(before).to.be.eql([pendingTx1, pendingTx2])
      expect(after).to.be.eql([pendingTx2])
    })
  })

  describe('read()', () => {
    it('should return if exists', async () => {
      const pendingTxService = new PendingTxService(wallet)

      const before = await pendingTxService.read(pendingTx1.id)
      await pendingTxService.save(pendingTx1)
      const after = await pendingTxService.read(pendingTx1.id)

      expect(before).to.be.undefined
      expect(after).to.be.eql(pendingTx1)
    })
  })
})
