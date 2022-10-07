/* eslint-disable @typescript-eslint/no-explicit-any */
import {action} from '@storybook/addon-actions'
import BigNumber from 'bignumber.js'

import {PRIMARY_ASSET_CONSTANTS} from '../../src/legacy/networks'
import {WalletMeta} from '../../src/legacy/state'
import {TokenEntry, YoroiWallet} from '../../src/yoroi-wallets'
import {
  RemotePoolMetaSuccess,
  StakePoolInfosAndHistories,
  TokenInfo,
  YoroiAmounts,
  YoroiSignedTx,
  YoroiUnsignedTx,
} from '../../src/yoroi-wallets/types'

export const mockedWalletMeta: WalletMeta = {
  id: 'wallet-id',
  name: 'my-wallet',
  networkId: 1,
  isHW: false,
  isEasyConfirmationEnabled: true,
  checksum: {
    TextPart: 'JHKT-8080',
    ImagePart:
      'b04dc22991594170974bbbb5908cc50b48f236d680a9ebfe6c1d00f52f8f4813341943eb66dec48cfe7f3be5beec705b91300a07641e668ff19dfa2fbeccbfba',
  },
  provider: '',
  walletImplementationId: 'haskell-shelley-24',
}

export const mockWallet: YoroiWallet = {
  id: 'wallet-id',
  walletImplementationId: 'haskell-shelley',
  networkId: 300,
  checksum: {
    TextPart: 'HTAO-3194',
    ImagePart:
      '2d9f9d67bf76d004b925174725170d68135e49eb00ab0dd28e602999be4e548838cfbbf892d738cebd0c2e34db0649999cde3e58dbef3c129f02f7c5dc2139fc',
  },
  isHW: false,
  hwDeviceInfo: null as any,
  isReadOnly: false,
  isEasyConfirmationEnabled: false,
  rewardAddressHex: 'reward-address-hex',
  provider: null,
  publicKeyHex: 'publicKeyHex',

  createUnsignedTx: () => {
    throw new Error('not implemented: createUnsignedTx')
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
    throw new Error('Not implemented: changePassword')
  },
  signTx: () => {
    throw new Error('Not implemented: signTx')
  },
  signTxWithLedger: () => {
    throw new Error('Not implemented: signTxWithLedger')
  },
  checkServerStatus: () =>
    Promise.resolve({
      isServerOk: true,
      isMaintenance: false,
      serverTime: Date.now(),
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
    throw new Error('Not implemented: submitTransaction')
  },
  createVotingRegTx: () => {
    throw new Error('Not implemented: createVotingRegTx')
  },
  subscribe: (...args) => {
    action('subscribe')(...args)
    return () => undefined
  },
  fetchCurrentPrice: () => Promise.resolve(1.9938153154314795),
  toJSON: () => null as any,
  internalAddresses: [],
  externalAddresses: [],
  confirmationCounts: {},
  transactions: {},

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

  fetchFundInfo: () => {
    throw new Error('not implemented: fetchFundInfo')
  },
}

export const mockHwWallet = {
  ...mockWallet,
  isHW: true,
  hwDeviceInfo: {
    bip44AccountPublic: '1234567',
    hwFeatures: {
      vendor: 'ledger',
      model: 'nano x',
      deviceId: '123456',
      deviceObj: null,
    },
  },
}

export const mockOsWallet = {
  ...mockWallet,
  isEasyConfirmationEnabled: true,
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

export const balances: YoroiAmounts = {
  [PRIMARY_ASSET_CONSTANTS.CARDANO]: '2727363743849',
  '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950': '12344',
  '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e': '215410',
  '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f.74484f444c52': '5',
  '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b.44': '2463889379',
  '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7.c8b0': '148',
}

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

export const mockYoroiTx: YoroiUnsignedTx & {mock: true} = {
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
