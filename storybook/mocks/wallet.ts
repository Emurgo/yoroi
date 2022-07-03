import BigNumber from 'bignumber.js'
import KeyStore from '../../src/legacy/KeyStore'

import {RemotePoolMetaSuccess, StakePoolInfosAndHistories, TokenEntry, TokenInfo} from '../../src/types'
import {YoroiWallet} from '../../src/yoroi-wallets'
import {YoroiSignedTx} from '../../src/yoroi-wallets/types'

export const mockWallet: YoroiWallet = {
  id: 'wallet-id',
  walletImplementationId: 'haskell-shelley',
  networkId: 300,
  checksum: {TextPart: 'text-part', ImagePart: 'image-part'},
  isHW: false,
  hwDeviceInfo: null as any,
  isReadOnly: false,
  isEasyConfirmationEnabled: false,
  rewardAddressHex: 'reward-address-hex',
  provider: null,
  publicKeyHex: 'publicKeyHex',

  createUnsignedTx: () => {
    throw new Error('not implemented: createDelegationTx')
  },
  createDelegationTx: () => {
    throw new Error('not implemented: createDelegationTx')
  },
  createWithdrawalTx: () => {
    throw new Error('not implemented: createWithdrawalTx')
  },
  fetchUTXOs: () => Promise.resolve([]),
  getAllUtxosForKey: () => Promise.resolve([]),
  fetchTokenInfo: () => Promise.resolve(tokenResponses),
  fetchPoolInfo: () => Promise.resolve({[stakePoolId]: poolInfoAndHistory} as StakePoolInfosAndHistories),
  getDelegationStatus: () => Promise.resolve({isRegistered: false, poolKeyHash: null}),
  subscribeOnTxHistoryUpdate: () => {
    null
  },
  fetchAccountState: () =>
    Promise.resolve({['reward-address-hex']: {remainingAmount: '0', rewards: '0', withdrawals: ''}}),
  changePassword: () => {
    throw new Error('Not implemented')
  },
  signTx: () => {
    throw new Error('Not implemented')
  },
  signTxWithLedger: () => {
    throw new Error('Not implemented')
  },
  checkServerStatus: () =>
    Promise.resolve({
      isServerOk: true,
      isMaintenance: false,
      serverTime: new Date(),
      isQueueOnline: true,
    }),
  fetchTxStatus: async () => ({}),
  fetchTipStatus: async () =>
    Promise.resolve({
      bestBlock: {
        epoch: 210,
        slot: 76027,
        globalSlot: 60426427,
        hash: '2cf5a471a0c58cbc22534a0d437fbd91576ef10b98eea7ead5887e28f7a4fed8',
        height: 3617708,
      },
      safeBlock: {
        epoch: 210,
        slot: 75415,
        globalSlot: 60425815,
        hash: 'ca18a2b607411dd18fbb2c1c0e653ec8a6a3f794f46ce050b4a07cf8ba4ab916',
        height: 3617698,
      },
    }),
  submitTransaction: () => {
    throw new Error('Not implemented')
  },
  createVotingRegTx: () => {
    throw new Error('Not implemented')
  },
  subscribe: () => {
    throw new Error('Not implemented')
  },
  fetchCurrentPrice: async () => Promise.resolve(1.9938153154314795),
  toJSON: () => null as any,

  // enableEasyConfirmation: () => {
  //   throw new Error('not implemented: enableEasyConfirmation')
  // },

  // canGenerateNewReceiveAddress: () => {
  //   throw new Error('not implemented: canGenerateNewReceiveAddress')
  // },

  // generateNewUiReceiveAddress: () => {
  //   throw new Error('not implemented: generateNewUiReceiveAddress')
  // },

  // generateNewUiReceiveAddressIfNeeded: () => {
  //   throw new Error('not implemented: generateNewUiReceiveAddressIfNeeded')
  // },

  // getAddressingInfo: () => {
  //   throw new Error('not implemented: getAddressingInfo')
  // },

  // createUnsignedTx: () => {
  //   throw new Error('not implemented: createUnsignedTx')
  // },

  // fetchFundInfo: () => {
  //   throw new Error('not implemented: fetchFundInfo')
  // },
}

export const tokenEntries: Array<TokenEntry> = [
  {
    networkId: 123,
    identifier: '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950',
    amount: new BigNumber(12344.00234523),
  },
  {
    networkId: 123,
    identifier: '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950',
    amount: new BigNumber(12344.00234523),
  },
  {
    networkId: 123,
    identifier: '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950',
    amount: new BigNumber(12344.00234523),
  },
  {
    networkId: 123,
    identifier: '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950',
    amount: new BigNumber(12344.00234523),
  },
  {
    networkId: 123,
    identifier: '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950',
    amount: new BigNumber(12344.00234523),
  },
  {
    networkId: 123,
    identifier: '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950',
    amount: new BigNumber(12344.00234523),
  },
]

export const tokenResponses: Record<string, TokenInfo> = {
  '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d7444524950': {
    name: 'tDRIP',
    decimals: 6,
    assetName: '7444524950',
    longName: 'tDRIP',
    policyId: '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d',
    ticker: 'tDRIP',
  },
}

export const stakePoolId = 'af22f95915a19cd57adb14c558dcc4a175f60c6193dc23b8bd2d8beb'
export const poolInfoAndHistory: RemotePoolMetaSuccess = {
  info: {
    ticker: 'EMUR1',
    name: 'Emurgo #1',
    description:
      'EMURGO is a multinational blockchain technology company providing solutions for developers, startups, enterprises, and governments.',
    homepage: 'https://emurgo.io',
  },
  history: [
    {
      epoch: 6,
      slot: 36343,
      tx_ordinal: 0,
      cert_ordinal: 0,
      payload: {
        kind: 'PoolRegistration',
        certIndex: 123,
        poolParams: {},
      },
    },
  ],
}

export const mockYoroiTx = {
  entries: {},
  amounts: {},
  fee: {'': '12345'},
  metadata: {},
  change: {},
  staking: {
    registrations: {},
    deregistrations: {},
    delegations: {},
    withdrawals: {},
  },
  voting: {},
  unsignedTx: {} as any,
  mock: true,
} as const

export const mockYoroiSignedTx: YoroiSignedTx & {mock: true} = {
  entries: {},
  amounts: {},
  fee: {'': '12345'},
  metadata: {},
  change: {},
  staking: {
    registrations: {},
    deregistrations: {},
    delegations: {},
    withdrawals: {},
  },
  voting: {},
  signedTx: {id: 'tx-id', encodedTx: new Uint8Array([1, 2, 3])},
  mock: true,
}

export const mockKeyStore = (overrides?: {
  getData?: typeof KeyStore.getData
  storeData?: typeof KeyStore.storeData
  deleteData?: typeof KeyStore.deleteData
}) =>
  ({
    getData: async (_keyId, _encrpytionMethod, _message, password, _intl) => {
      if (password !== 'password') throw new Error('Invalid Password')

      return 'masterkey'
    },
    storeData: async () => undefined,
    deleteData: async () => undefined,
    ...(overrides as any),
  } as unknown as typeof KeyStore)
