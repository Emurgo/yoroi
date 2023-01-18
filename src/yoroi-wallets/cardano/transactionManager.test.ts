import {storage as rootStorage} from '../storage'
import {makeTransactionManager} from './transactionManager'

describe('transaction manager', () => {
  it('memo storage', async () => {
    const storage = rootStorage.join('tx-manager/')
    const transactionManager = makeTransactionManager(storage)

    // saving two memos
    await transactionManager.saveMemo('fake-tx-id-1', 'Send money to my friend')
    await transactionManager.saveMemo('fake-tx-id-2', 'Send money to my girlfriend')

    // reading two memos
    await transactionManager.readMemo('fake-tx-id-1').then((memo) => {
      return expect(memo).toEqual('Send money to my friend')
    })
    await transactionManager.readMemo('fake-tx-id-2').then((memo) => {
      return expect(memo).toEqual('Send money to my girlfriend')
    })
  })
})
