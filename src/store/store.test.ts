import AsyncStorage from '@react-native-async-storage/async-storage'
import {expect} from 'chai'

import {mockPendingTransaction} from '../../storybook/mocks/transaction'
import {PendingTransactions} from '../types'
import {PendingTxStore, StoreEvent, StoreKey, StoreMethod, StoreService} from './store'

const mockedPendingTransactions: PendingTransactions = [mockPendingTransaction()]

const mockedVersionablePendingTx: PendingTxStore = {
  version: 1,
  data: mockedPendingTransactions,
}

describe('StoraService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear()
  })

  it('should write and read the same data', async () => {
    const storage = new StoreService('wallet_id')

    await storage.write(StoreKey.PendingTx, mockedVersionablePendingTx)
    const result = await storage.read(StoreKey.PendingTx)

    expect(result).to.be.eql(mockedVersionablePendingTx)
  })
  it('should delete and read undefined', async () => {
    const storage = new StoreService('wallet_id')

    await storage.write(StoreKey.PendingTx, mockedVersionablePendingTx)
    const result = await storage.remove(StoreKey.PendingTx)

    expect(result).to.be.undefined
  })
  it('should broadcast updates to all subscribers', async () => {
    // arrange
    const storage = new StoreService('wallet_id')
    const subscriber1fn = jest.fn()
    const subscriber2fn = jest.fn()
    const update1stEvent: StoreEvent = {
      key: StoreKey.PendingTx,
      method: StoreMethod.Write,
      value: mockedVersionablePendingTx,
    }
    const remove2ndEvent: StoreEvent = {
      key: StoreKey.PendingTx,
      method: StoreMethod.Remove,
    }

    // act
    const subscriber1 = storage.publisher$.subscribe(subscriber1fn)
    const subscriber2 = storage.publisher$.subscribe(subscriber2fn)
    await storage.write(StoreKey.PendingTx, mockedVersionablePendingTx)
    await storage.remove(StoreKey.PendingTx)
    subscriber1.unsubscribe()
    subscriber2.unsubscribe()

    // assert
    expect(subscriber1fn.mock.calls.length).to.be.equal(2)
    expect(subscriber2fn.mock.calls.length).to.be.equal(2)
    expect(subscriber2fn.mock.calls[0][0]).to.be.eql(update1stEvent)
    expect(subscriber2fn.mock.calls[1][0]).to.be.eql(remove2ndEvent)
  })
  it('after destroyed wont emit new events', async () => {
    const storage = new StoreService('wallet_id')
    const subscriber1fn = jest.fn()

    storage.destroy()
    const subscriber1 = storage.publisher$.subscribe(subscriber1fn)
    await storage.write(StoreKey.PendingTx, mockedVersionablePendingTx)
    subscriber1.unsubscribe()

    expect(subscriber1fn.mock.calls.length).to.be.equal(0)
  })
})
