import {storage as rootStorage} from '../storage'
import {makeTransactionManager} from './transactionManager'

describe('memo storage', () => {
  it('works', async () => {
    const storage = rootStorage.join('tx-manager/')
    const {memo} = makeTransactionManager({storage})

    // saving one memo and removing it
    await memo.save('fake-tx-id-1', 'Send money to my friend')
    await memo.read('fake-tx-id-1').then((memo) => {
      return expect(memo).toEqual('Send money to my friend')
    })
    await memo.remove('fake-tx-id-1')
    await memo.read('fake-tx-id-1').then((memo) => {
      return expect(memo).toEqual(null)
    })

    // saving two memos and clearing storage
    await memo.save('fake-tx-id-1', 'Send money to my friend')
    await memo.save('fake-tx-id-2', 'Send money to my girlfriend')

    await memo.read('fake-tx-id-1').then((memo) => {
      return expect(memo).toEqual('Send money to my friend')
    })
    await memo.read('fake-tx-id-2').then((memo) => {
      return expect(memo).toEqual('Send money to my girlfriend')
    })

    await memo.clear()

    await memo.read('fake-tx-id-1').then((memo) => {
      return expect(memo).toEqual(null)
    })
    await memo.read('fake-tx-id-2').then((memo) => {
      return expect(memo).toEqual(null)
    })
  })
})
