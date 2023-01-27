import {storage as rootStorage} from '../storage'
import {makeMemosManager} from './transactionManager'

describe('memo manager', () => {
  it('works', async () => {
    const storage = rootStorage.join('memos/')
    const memosManager = await makeMemosManager(storage)

    expect(memosManager.getMemos()).toEqual({})

    await memosManager.saveMemo('fake-tx-id-1', 'Send money to my friend')
    await memosManager.saveMemo('fake-tx-id-2', 'Send money to my girlfriend')

    expect(memosManager.getMemos()).toEqual({
      'fake-tx-id-1': 'Send money to my friend',
      'fake-tx-id-2': 'Send money to my girlfriend',
    })

    await memosManager.clear()

    expect(memosManager.getMemos()).toEqual({})
  })
})
