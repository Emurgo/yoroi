import {storage as rootStorage} from '../storage'
import {makeMemosManager} from './transactionManager'

describe('transaction manager', () => {
  it('memo storage', async () => {
    const storage = rootStorage.join('memos/')
    const memosManager = await makeMemosManager(storage)

    await memosManager.saveMemo('fake-tx-id-1', 'Send money to my friend')
    await memosManager.saveMemo('fake-tx-id-2', 'Send money to my girlfriend')

    expect(memosManager.memos).toEqual({
      'fake-tx-id-1': 'Send money to my friend',
      'fake-tx-id-2': 'Send money to my girlfriend',
    })
  })
})
