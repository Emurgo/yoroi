import {MultiToken} from '../yoroi-wallets'
import {CONFIG} from './config'
import {checkAndFacadeTransactionAsync} from './facade'
import {TRANSACTION_DIRECTION} from './HistoryTransaction'
import {processTxHistoryData} from './processTransactions'
import type {RawTransaction} from './types'

//
// addresses from:
//
// const accountPubKey =
//   '42cfdc53da2220ba52ce62f8e20ab9bb99857a3fceacf43d676d7987ad909b53' +
//   'ed75534e0d0ee8fce835eb2e7c67c5caec18a9c894388d9a046380edebbfc46d'
//
// const internalChain = new AddressChain(
//   new AddressGenerator(accountPubKey, 'Internal'),
//   10,
//   2,
// )
//
// const externalChain = new AddressChain(
//   new AddressGenerator(accountPubKey, 'External'),
//   10,
//   2,
// )

const NETWORK_ID = CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID

const myAddresses = [
  // internals
  'addr_test1qqxhscc0f43vvv4w65485ktchzgu22y7hhl2cysrktlgjmn2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qlzffgl',
  'addr_test1qrh736muk0nswnc4sp7ez230ckjynmq5ff5fjv8y8terxen2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qnacvx7',
  'addr_test1qpu5mzauzr4d600gg0eqxp0knvea6sy3hwyrtn0ha7lvp6r2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qfvuagp',
  'addr_test1qp9gfjy6hm6ac7k308thhcuzq7uf6n3ysxs7xnw7dhajumn2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qgekv68',
  'addr_test1qq0eaqukftt0rhfxzts42xe30j292zy920pjl6l2ymchc3n2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qsdn7d9',
  'addr_test1qpwt7rrl6sg5jguk8sg5vg8tdq5c2vakvlzcm6ae69use9n2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2q7nc40u',
  'addr_test1qqhha5cfr7e4yl4dty23lhxm26cm845atkzlh2mmry672fm2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qq7c9ck',
  'addr_test1qply3a7s2xtumlyydepu2wd9dzdt5hv26lwdcvr9akea8qn2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qsskgau',
  'addr_test1qphm5w77h9akedes5cftrx79n0gsuaku7g960v7ecl0w2ur2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qyl4ft6',
  'addr_test1qqqa2r4e57qj45fp44n7pnagt8f54ftv56cqfxkamj8xmgm2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2q27gw89',
  // externals
  'addr_test1qq6q64sgpp2hhptm22vzewc23gttjawave63ml9z0ekq88r2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qam7esp',
  'addr_test1qrpqpz326zuufgk3u7sygxls2wl0ec9zrappl6zyf0n2v9r2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qezrvwq',
  'addr_test1qqwg3ht3euguxyq8x94ma6puqna44zqrmxex68xej5mdg6r2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2q86fpjs',
  'addr_test1qp0xk3hp7v3zudhhaxv6wvuuz68k3jcp77ha35cs04kl5nt2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qs9h0q8',
  'addr_test1qrjhfc6tc84uh3q28rqka8svket6ju46ncjdvk2agdcvcgt2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qqeh59k',
  'addr_test1qpv64ccmaslx57gpr0s63umzgus8xnp333kwwrwlr3x756n2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qw5hkdz',
  'addr_test1qp46903y4x4d0pqn4nqgan5mx8xuu8w7j63qtklah93ea8r2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qn4xfcd',
  'addr_test1qr32nez6sv6kujapt84nkyeanlkhd8j5wru9xajqppt7eun2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2q9f3gx4',
  'addr_test1qz78an2j9ftm9hwwvfhlth9ksh2l3zwvfhulujc9dppee0r2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2q53sfkr',
  'addr_test1qzd4ks0kvc889wd0ns0xgq7n8h5zrcjfeqreyjgynyz7xfr2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qxat5hx',
]

const txs: Array<RawTransaction> = [
  {
    hash: '4a3167e746d45c2737dc5150cd822f18d3ef3a1315a3edc21a3aa2b376d1e378',
    fee: '168625',
    type: 'shelley',
    withdrawals: [],
    certificates: [],
    tx_ordinal: 0,
    tx_state: 'Successful',
    last_update: '2021-01-15T12:22:31.000Z',
    block_num: 2229379,
    block_hash: '9add65678c26f19fc9e1094e9a0ee21febc973486771438fd2cd62ccd60918b7',
    time: '2021-01-15T12:22:31.000Z',
    epoch: 108,
    slot: 57735,
    inputs: [
      {
        address:
          'addr_test1qpfn8e903n5eqsplral59lhrvyud9g50mmceqeezhnfpr3aytuevw54ze6zh8cgk8vld0m7cumkttye5wc44ad04s29sm2lmry',
        amount: '999797657118',
        id: '1be680db0e5361ded2cf5b0d1689223dc61b7a8cf0485254b12c3b1ca64b61cc1',
        index: 1,
        txHash: '1be680db0e5361ded2cf5b0d1689223dc61b7a8cf0485254b12c3b1ca64b61cc',
        assets: [],
      },
    ],
    outputs: [
      {
        address:
          'addr_test1qq6q64sgpp2hhptm22vzewc23gttjawave63ml9z0ekq88r2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qam7esp',
        amount: '50000000000',
        assets: [],
      },
      {
        address:
          'addr_test1qrdnw5uy80fznx25lm402hakgh22m2r8tzcqrhgxqfdhhl9ytuevw54ze6zh8cgk8vld0m7cumkttye5wc44ad04s29s4fx450',
        amount: '949797488493',
        assets: [],
      },
    ],
  },
  {
    hash: '4aed80786eddb204a71ef691c9e1c7fc1c4c4934bc709f1c7f40e956544d8c22',
    fee: '168449',
    type: 'shelley',
    withdrawals: [],
    certificates: [],
    tx_ordinal: 0,
    tx_state: 'Successful',
    last_update: '2021-01-27T18:06:56.000Z',
    block_num: 2265695,
    block_hash: '8a7f636928df18b88f321a859c9430bb6dcc50d4dc1aa5f2c7adaa6f0e087868',
    time: '2021-01-27T18:06:56.000Z',
    epoch: 110,
    slot: 251200,
    inputs: [
      {
        address:
          'addr_test1qq6q64sgpp2hhptm22vzewc23gttjawave63ml9z0ekq88r2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qam7esp',
        amount: '50000000000',
        id: '4a3167e746d45c2737dc5150cd822f18d3ef3a1315a3edc21a3aa2b376d1e3780',
        index: 0,
        txHash: '4a3167e746d45c2737dc5150cd822f18d3ef3a1315a3edc21a3aa2b376d1e378',
        assets: [],
      },
    ],
    outputs: [
      {
        address:
          'addr_test1qrdewyn53xdjyzu20xjj6wg7kkxyqq63upxqevt24jga8fgcdwap96xuy84apchhj8u6r7uvl974sy9qz0sedc7ayjksjxmzjz',
        amount: '1000000000',
        assets: [],
      },
      {
        address:
          'addr_test1qqxhscc0f43vvv4w65485ktchzgu22y7hhl2cysrktlgjmn2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qlzffgl',
        amount: '48999831551',
        assets: [],
      },
    ],
  },
  {
    hash: 'ef147cbd5ccb0b0907a2969a697aeb06117ac83f284ddfae53a4198b03719b52',
    fee: '172585',
    type: 'shelley',
    withdrawals: [],
    certificates: [],
    tx_ordinal: 0,
    tx_state: 'Successful',
    last_update: '2021-02-19T15:53:36.000Z',
    block_num: 2335831,
    block_hash: '7d495a78597a10539d54f4c4dc5bfd2324cceb80520c712caa93e0fa0dd7c1c0',
    time: '2021-02-19T15:53:36.000Z',
    epoch: 115,
    slot: 70400,
    inputs: [
      {
        address:
          'addr_test1qqtrcd6qlxy8m30le0e044nj5nesvc322jzjjsv29zxdfpqxu2hyfhlkwuxupa9d5085eunq2qywy7hvmvej456flknsef5gyw',
        amount: '481040108',
        id: '3393cf9c82f674db5d45a72c3c054dc3c0012bb7de13283add23002194327d451',
        index: 1,
        txHash: '3393cf9c82f674db5d45a72c3c054dc3c0012bb7de13283add23002194327d45',
        assets: [
          {
            assetId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.',
            policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
            name: '',
            amount: '76',
          },
        ],
      },
    ],
    outputs: [
      {
        address:
          'addr_test1qrpqpz326zuufgk3u7sygxls2wl0ec9zrappl6zyf0n2v9r2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qezrvwq',
        amount: '1407406',
        assets: [
          {
            assetId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.',
            policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
            name: '',
            amount: '2',
          },
        ],
      },
      {
        address:
          'addr_test1qq022ftqww7e0kwz4mc2n3aaa78hvh7lytn9v6e0wtfllfcxu2hyfhlkwuxupa9d5085eunq2qywy7hvmvej456flkns5a8lc9',
        amount: '479460117',
        assets: [
          {
            assetId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.',
            policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
            name: '',
            amount: '74',
          },
        ],
      },
    ],
  },
  {
    hash: '1f210312443d2c97c25b3fff89e3009eaf30ecb293e3bc9c173e964d2f699ddc',
    fee: '177557',
    type: 'shelley',
    withdrawals: [],
    certificates: [],
    tx_ordinal: 94,
    tx_state: 'Successful',
    last_update: '2021-02-26T12:46:49.000Z',
    block_num: 2357434,
    block_hash: '6ee1c0789faff99304916e2bee37b274d136492e1059b186ee8ec9cdde0bfba3',
    time: '2021-02-26T12:46:49.000Z',
    epoch: 116,
    slot: 231993,
    inputs: [
      {
        address:
          'addr_test1qqwg3ht3euguxyq8x94ma6puqna44zqrmxex68xej5mdg6r2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2q86fpjs',
        amount: '1407406',
        id: '33ae3456581ab8dc0a9ddb265c53d08e4df0c7d16786f5932ed525c092894a8f0',
        index: 0,
        txHash: '33ae3456581ab8dc0a9ddb265c53d08e4df0c7d16786f5932ed525c092894a8f',
        assets: [
          {
            assetId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.',
            policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
            name: '',
            amount: '2',
          },
        ],
      },
      {
        address:
          'addr_test1qp9gfjy6hm6ac7k308thhcuzq7uf6n3ysxs7xnw7dhajumn2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qgekv68',
        amount: '48499317096',
        id: '5152eaa7bf59c5d4b6af44ffa14ad2616b90bb9304c311e6137072f54306fac41',
        index: 1,
        txHash: '5152eaa7bf59c5d4b6af44ffa14ad2616b90bb9304c311e6137072f54306fac4',
        assets: [
          {
            assetId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.',
            policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
            name: '',
            amount: '1',
          },
        ],
      },
    ],
    outputs: [
      {
        address:
          'addr_test1qrpqpz326zuufgk3u7sygxls2wl0ec9zrappl6zyf0n2v9r2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qezrvwq',
        amount: '1407406',
        assets: [
          {
            assetId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.',
            policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
            name: '',
            amount: '2',
          },
        ],
      },
      {
        address:
          'addr_test1qq0eaqukftt0rhfxzts42xe30j292zy920pjl6l2ymchc3n2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qsdn7d9',
        amount: '48499139539',
        assets: [
          {
            assetId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.',
            policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
            name: '',
            amount: '1',
          },
        ],
      },
    ],
  },
]

describe('processTxHistoryData', () => {
  it('regular, point-to-point ADA tx (received)', async () => {
    const tx = processTxHistoryData(
      await checkAndFacadeTransactionAsync(txs[0]),
      myAddresses,
      100, // confirmations
      NETWORK_ID,
    )

    const delta = MultiToken.fromArray(tx.delta)
    const netBalance = delta.getDefault()
    expect(netBalance.toString()).toBe('50000000000')
    expect(delta.nonDefaultEntries().length).toBe(0)
    expect(tx.direction).toBe(TRANSACTION_DIRECTION.RECEIVED)
  })

  it('regular, point-to-point ADA tx (sent)', async () => {
    const tx = processTxHistoryData(
      await checkAndFacadeTransactionAsync(txs[1]),
      myAddresses,
      100, // confirmations
      NETWORK_ID,
    )

    const delta = MultiToken.fromArray(tx.delta)
    const netBalance = delta.getDefault()
    expect(netBalance.toString()).toBe((-1000000000 - 168449).toString())
    expect(delta.nonDefaultEntries().length).toBe(0)
    expect(tx.direction).toBe(TRANSACTION_DIRECTION.SENT)
  })

  it('point-to-point ADA tx with tokens (received)', async () => {
    const tx = processTxHistoryData(
      await checkAndFacadeTransactionAsync(txs[2]),
      myAddresses,
      100, // confirmations
      NETWORK_ID,
    )

    const delta = MultiToken.fromArray(tx.delta)
    const netBalance = delta.getDefault()
    expect(netBalance.toString()).toBe('1407406')

    const netTokenBalance = delta.nonDefaultEntries()

    expect(netTokenBalance.length).toBe(1)
    expect(netTokenBalance[0].amount.toString()).toBe('2')
    expect(netTokenBalance[0].identifier).toBe('6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.')
    expect(tx.direction).toBe(TRANSACTION_DIRECTION.RECEIVED)
  })

  it('intrawallet ADA tx with tokens', async () => {
    const tx = processTxHistoryData(
      await checkAndFacadeTransactionAsync(txs[3]),
      myAddresses,
      100, // confirmations
      NETWORK_ID,
    )

    const delta = MultiToken.fromArray(tx.delta)
    const netBalance = delta.getDefault()
    expect(netBalance.toString()).toBe('-177557')

    const netTokenBalance = delta.nonDefaultEntries()

    expect(netTokenBalance.length).toBe(1)
    expect(netTokenBalance[0].amount.toString()).toBe('0')
    expect(netTokenBalance[0].identifier).toBe('6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.')
    expect(tx.direction).toBe(TRANSACTION_DIRECTION.SELF)
  })
})
