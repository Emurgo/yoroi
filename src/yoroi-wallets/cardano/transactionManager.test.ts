import {storage as rootStorage} from '../storage'
import {BackendConfig, Transaction} from '../types'
import {makeMemosManager, makeTransactionManager} from './transactionManager'

jest.mock('./shelley', () => ({
  __esModule: true,
  TransactionCache: class {
    static create() {
      // this simulates that the variables evolve between calls
      let perRewardAddressCertificatesCalls = 0
      let perAddressTxsCalls = 0
      let confirmationCountsCalls = 0

      return {
        get transactions() {
          return {[mockTx.id]: mockTx}
        },
        get perRewardAddressCertificates() {
          if (perRewardAddressCertificatesCalls++ === 0) {
            return 'perRewardAddressCertificates test 1'
          }
          return 'perRewardAddressCertificates test 2'
        },
        get perAddressTxs() {
          if (perAddressTxsCalls++ === 0) {
            return 'perAddressTxs test 1'
          }
          return 'perAddressTxs test 2'
        },
        get confirmationCounts() {
          if (confirmationCountsCalls++ === 0) {
            return 'confirmationCounts test 1'
          }
          return 'confirmationCounts test 2'
        },
      }
    }
  },
}))

describe('transaction manager', () => {
  let txManager
  beforeEach(async () => {
    txManager = await makeTransactionManager(rootStorage, mockedBackendConfig)
  })

  afterEach(rootStorage.clear)

  it('stores memos', async () => {
    expect(txManager.getTransactions()).toEqual({[mockTx.id]: mockTx})

    await txManager.saveMemo(mockTx.id, 'memo 1')

    expect(txManager.getTransactions()).toEqual({[mockTx.id]: {...mockTx, memo: 'memo 1'}})
  })

  it.each([
    ['getPerRewardAddressCertificates', 'perRewardAddressCertificates test 1', 'perRewardAddressCertificates test 2'],
    ['getPerAddressTxs', 'perAddressTxs test 1', 'perAddressTxs test 2'],
    ['getConfirmationCounts', 'confirmationCounts test 1', 'confirmationCounts test 2'],
  ])('gets the updated values with %s', (method, expected1, expected2) => {
    expect(txManager[method]()).toBe(expected1)
    expect(txManager[method]()).toBe(expected2)
  })
})

describe('memos manager', () => {
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

// mocks

const mockedBackendConfig: BackendConfig = {
  API_ROOT: 'https://emurgo.node.api',
  TOKEN_INFO_SERVICE: 'https://emurgo.token.api',
  FETCH_UTXOS_MAX_ADDRESSES: 2,
  TX_HISTORY_MAX_ADDRESSES: 2,
  FILTER_USED_MAX_ADDRESSES: 2,
  TX_HISTORY_RESPONSE_LIMIT: 2,
}

const mockTx: Transaction = {
  id: '0a8962dde362eef1f840defe6f916fdf9701ad53c7cb5dd4a74ab85df8e9bffc',
  type: 'shelley',
  fee: '179537',
  status: 'Successful',
  inputs: [
    {
      address:
        'addr_test1qrrdv3uxj8shu27ea9djvnn3rl4w3lvh3cyck6yc36mvf6ctlqxj9g0azvpycncr9u600p6t556qhc3psk06uzzw6saq4kvdpq',
      amount: '967141533',
      assets: [
        {
          amount: '1',
          assetId: '57e37bc9a9c0a099a6636c3deb93b82e7edec8a9a40883017bae2674.717171717171',
          policyId: '57e37bc9a9c0a099a6636c3deb93b82e7edec8a9a40883017bae2674',
          name: '717171717171',
        },
        {
          amount: '1',
          assetId: 'fc53320cfda5add9cde1e7094c73596eacc26dbe79834b67c14b5dad.656565656565',
          policyId: 'fc53320cfda5add9cde1e7094c73596eacc26dbe79834b67c14b5dad',
          name: '656565656565',
        },
      ],
    },
    {
      address:
        'addr_test1qqgxd3r59psq0dg33t7asmvjmtu55tvvcmeq5kmhj0tmqjctlqxj9g0azvpycncr9u600p6t556qhc3psk06uzzw6saqk4x7z6',
      amount: '2000000',
      assets: [
        {
          amount: '1',
          assetId: '0b71c073fcf017eeff0664070c790a2bcc47077566904be471c46c13.727272727272',
          policyId: '0b71c073fcf017eeff0664070c790a2bcc47077566904be471c46c13',
          name: '727272727272',
        },
      ],
    },
  ],
  outputs: [
    {
      address:
        'addr_test1qrxlnftwl73taxvcapnhgctae895l582a6r7k7jjeuwvzp0rvvww4m29k4km54utxag3mlhdsr73m62rsae6ad3hj6kqcexkh8',
      amount: '7305977',
      assets: [],
    },
    {
      address:
        'addr_test1qrqzse20fh7mmt5k9xf4sug3a2lh5fa7x9nr98avp0ac78stlqxj9g0azvpycncr9u600p6t556qhc3psk06uzzw6saq6xr7ra',
      amount: '961656019',
      assets: [
        {
          amount: '1',
          assetId: '0b71c073fcf017eeff0664070c790a2bcc47077566904be471c46c13.727272727272',
          policyId: '0b71c073fcf017eeff0664070c790a2bcc47077566904be471c46c13',
          name: '727272727272',
        },
        {
          amount: '1',
          assetId: '57e37bc9a9c0a099a6636c3deb93b82e7edec8a9a40883017bae2674.717171717171',
          policyId: '57e37bc9a9c0a099a6636c3deb93b82e7edec8a9a40883017bae2674',
          name: '717171717171',
        },
        {
          amount: '1',
          assetId: 'fc53320cfda5add9cde1e7094c73596eacc26dbe79834b67c14b5dad.656565656565',
          policyId: 'fc53320cfda5add9cde1e7094c73596eacc26dbe79834b67c14b5dad',
          name: '656565656565',
        },
      ],
    },
  ],
  lastUpdatedAt: '2021-09-13T18:42:10.000Z',
  submittedAt: '2021-09-13T18:42:10.000Z',
  blockNum: 2909238,
  blockHash: 'fb418acaa29c66e799a16b594f7beedfe2ef53413e9863b61a418f2df1ff1442',
  txOrdinal: 0,
  epoch: 156,
  slot: 166914,
  withdrawals: [],
  certificates: [],
  validContract: true,
  scriptSize: 0,
  collateralInputs: [],
  memo: null,
}
