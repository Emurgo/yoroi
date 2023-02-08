/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {action} from '@storybook/addon-actions'
import BigNumber from 'bignumber.js'

import {getDefaultAssetByNetworkId} from '../../src/legacy/config'
import {getTokenFingerprint} from '../../src/legacy/format'
import {
  asciiToHex,
  fallbackTokenInfo,
  primaryTokenInfo,
  TokenEntry,
  toTokenInfo,
  WalletMeta,
  YoroiWallet,
} from '../../src/yoroi-wallets'
import {PRIMARY_ASSET_CONSTANTS} from '../../src/yoroi-wallets/cardano/networks'
import {
  RemotePoolMetaSuccess,
  StakePoolInfosAndHistories,
  StakingInfo,
  StakingStatus,
  TokenInfo,
  TransactionInfo,
  YoroiAmounts,
  YoroiNft,
  YoroiNftModerationStatus,
  YoroiSignedTx,
  YoroiUnsignedTx,
} from '../../src/yoroi-wallets/types'
import {mockEncryptedStorage} from './storage'
import {mockTransactionInfo, mockTransactionInfos} from './transaction'
import {utxos} from './utxos'

const walletMeta: WalletMeta = {
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
  walletImplementationId: 'haskell-shelley-24',
}

const wallet: YoroiWallet = {
  id: 'wallet-id',
  primaryToken: getDefaultAssetByNetworkId(300),
  primaryTokenInfo: primaryTokenInfo.testnet,
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
  publicKeyHex: 'publicKeyHex',
  utxos,
  getStakingInfo: async () => {
    throw new Error('not implemented: getStakingInfo')
  },
  encryptedStorage: mockEncryptedStorage,

  createUnsignedTx: () => {
    throw new Error('not implemented: createUnsignedTx')
  },
  createDelegationTx: () => {
    throw new Error('not implemented: createDelegationTx')
  },
  createWithdrawalTx: () => {
    throw new Error('not implemented: createWithdrawalTx')
  },
  getAllUtxosForKey: () => Promise.resolve([]),
  fetchTokenInfo: (tokenId: string) => {
    action('fetchTokenInfo')(tokenId)
    return Promise.resolve(tokenInfos[tokenId] ?? fallbackTokenInfo(tokenId))
  },
  fetchNfts() {
    throw new Error('not implemented: fetchNfts')
  },
  fetchNftModerationStatus() {
    throw new Error('not implemented: fetchNftModerationStatus')
  },
  fetchPoolInfo: (...args) => {
    action('fetchPoolInfo')(...args)
    return Promise.resolve({[stakePoolId]: poolInfoAndHistory} as StakePoolInfosAndHistories)
  },
  getDelegationStatus: (...args) => {
    action('getDelegationStatus')(...args)
    return Promise.resolve({isRegistered: false, poolKeyHash: null})
  },
  subscribeOnTxHistoryUpdate: () => {
    return () => null
  },
  fetchAccountState: (...args) => {
    action('fetchAccountState')(...args)
    return Promise.resolve({['reward-address-hex']: {remainingAmount: '0', rewards: '0', withdrawals: ''}})
  },
  changePassword: () => {
    throw new Error('Not implemented: changePassword')
  },
  signTx: () => {
    throw new Error('Not implemented: signTx')
  },
  signTxWithLedger: () => {
    throw new Error('Not implemented: signTxWithLedger')
  },
  checkServerStatus: (...args) => {
    action('checkServerStatus')(...args)
    return Promise.resolve({
      isServerOk: true,
      isMaintenance: false,
      serverTime: Date.now(),
      isQueueOnline: true,
    })
  },
  fetchTxStatus: async (...args) => {
    action('fetchTxStatus')(...args)
    return {}
  },
  fetchTipStatus: async (...args) => {
    action('fetchTipStatus')(...args)
    return Promise.resolve({
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
    })
  },
  submitTransaction: () => {
    throw new Error('Not implemented: submitTransaction')
  },
  createVotingRegTx: () => {
    throw new Error('Not implemented: createVotingRegTx')
  },
  subscribe: (...args) => {
    action('subscribe')(...args)
    return (...args) => {
      action('unsubscribe')(...args)
    }
  },
  fetchCurrentPrice: (...args) => {
    action('fetchCurrentPrice')(...args)
    return Promise.resolve(1.9938153154314795)
  },
  internalAddresses: [],
  externalAddresses: [],
  confirmationCounts: {},
  transactions: mockTransactionInfos,
  isUsedAddressIndex: {},
  numReceiveAddresses: 0,
  receiveAddresses: [],
  canGenerateNewReceiveAddress: (...args) => {
    action('canGenerateNewReceiveAddress')(...args)
    return true
  },
  generateNewReceiveAddressIfNeeded: (...args) => {
    action('generateNewReceiveAddressIfNeeded')(...args)
    return true
  },
  generateNewReceiveAddress: (...args) => {
    action('generateNewReceiveAddress')(...args)
    return true
  },
  save: async (...args) => {
    action('save')(...args)
  },
  saveMemo: async (...args) => {
    action('saveMemo')(...args)
  },
  tryDoFullSync: async (...args) => {
    action('tryDoFullSync')(...args)
  },
  clear: async (...args) => {
    action('clear')(...args)
  },
  sync: async (...args) => {
    action('sync')(...args)
  },
  resync: async (...args) => {
    action('resync')(...args)
  },
  enableEasyConfirmation: async (rootKey: string) => {
    action('enableEasyConfirmation')(rootKey)
  },
  disableEasyConfirmation: async () => {
    action('disableEasyConfirmation')
  },

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

  fetchFundInfo: () => {
    throw new Error('not implemented: fetchFundInfo')
  },
  startSync: () => {
    throw new Error('not implemented: start')
  },
  stopSync: () => {
    throw new Error('not implemented: stop')
  },
}

const hwWallet: YoroiWallet = {
  ...wallet,
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

const osWallet: YoroiWallet = {
  ...wallet,
  isEasyConfirmationEnabled: true,
}

const readonlyWallet: YoroiWallet = {
  ...wallet,
  isReadOnly: true,
}

const txid = '31b1abca49857fd50c7959cc019d14c7dc5deaa754ba45372fb21748c411f210'

const getTransactions = {
  success: async (...args) => {
    action('getTransactions')(...args)
    const txInfo = mockTransactionInfo({id: txid})

    return {
      [txInfo.id]: txInfo,
    }
  },

  error: async (...args) => {
    action('getTransactions')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args) => {
    action('getTransactions')(...args)
    return new Promise(() => null) as unknown as {[txid: string]: TransactionInfo}
  },
}

const fetchPoolInfo = {
  success: {
    poolFound: async (...args) => {
      action('fetchPoolInfo')(...args)
      return {[mocks.stakePoolId]: mocks.poolInfoAndHistory} as StakePoolInfosAndHistories
    },
    poolNotFound: async (...args) => {
      action('fetchPoolInfo')(...args)
      return {[mocks.stakePoolId]: null} as StakePoolInfosAndHistories
    },
  },
  error: async (...args) => {
    action('fetchPoolInfo')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args) => {
    action('fetchPoolInfo')(...args)
    return new Promise(() => null) as unknown as StakePoolInfosAndHistories
  },
}

const fetchNfts = {
  success: {
    many: async (...args) => {
      action('fetchNfts')(...args)
      const nfts = Array(30)
        .fill(undefined)
        .map((_, index) => ({
          ...nft,
          name: 'NFT ' + index,
          id: index + '',
          fingerprint: getTokenFingerprint({policyId: nft.metadata.policyId, assetNameHex: asciiToHex('NFT ' + index)}),
          metadata: {...nft.metadata, policyId: nft.metadata.policyId, assetNameHex: asciiToHex('NFT ' + index)},
        }))
      return nfts
    },
    empty: async (...args) => {
      action('fetchNfts')(...args)
      return []
    },
  },
  error: async (...args) => {
    action('fetchNfts')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args) => {
    action('fetchNfts')(...args)
    return new Promise(() => null) as unknown as YoroiNft[]
  },
}

const fetchNftModerationStatus = {
  success: {
    approved: async (...args): Promise<YoroiNftModerationStatus> => {
      action('fetchNftModerationStatus')(...args)
      return 'approved'
    },
    consent: async (...args): Promise<YoroiNftModerationStatus> => {
      action('fetchNftModerationStatus')(...args)
      return 'consent'
    },
    blocked: async (...args): Promise<YoroiNftModerationStatus> => {
      action('fetchNftModerationStatus')(...args)
      return 'blocked'
    },
    pendingReview: async (...args): Promise<YoroiNftModerationStatus> => {
      action('fetchNftModerationStatus')(...args)
      return 'pending'
    },
    loading: async (...args): Promise<YoroiNftModerationStatus> => {
      action('fetchNftModerationStatus')(...args)
      return new Promise(() => void 0) as any
    },
    random: async (...args): Promise<YoroiNftModerationStatus> => {
      action('fetchNftModerationStatus')(...args)
      const statuses = ['approved', 'consent', 'blocked', 'pending', 'manual_review'] as const
      return statuses[Math.floor(Math.random() * statuses.length)]
    },
  },
  error: async (...args) => {
    action('fetchNftModerationStatus')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args) => {
    action('fetchNftModerationStatus')(...args)
    return new Promise(() => null) as unknown as YoroiNftModerationStatus
  },
}

const getDelegationStatus = {
  success: {
    delegating: async (...args) => {
      action('getDelegationStatus')(...args)
      return {isRegistered: true, poolKeyHash: stakePoolId} as StakingStatus
    },
    registered: async (...args) => {
      action('getDelegationStatus')(...args)
      return {isRegistered: true} as StakingStatus
    },
    notRegistered: async (...args) => {
      action('getDelegationStatus')(...args)
      return {isRegistered: false, poolKeyHash: null} as StakingStatus
    },
  },
  error: async (...args) => {
    action('getDelegationStatus')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args) => {
    action('getDelegationStatus')(...args)
    return new Promise(() => null) as unknown as StakingStatus
  },
}

const getStakingInfo = {
  success: {
    registered: async (...args) => {
      action('getStakingInfo')(...args)
      return {status: 'registered'} as StakingInfo
    },
    notRegistered: async (...args) => {
      action('getStakingInfo')(...args)
      return {status: 'not-registered'} as StakingInfo
    },
  },
  error: async (...args) => {
    action('getStakingInfo')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args) => {
    action('getStakingInfo')(...args)
    return new Promise(() => null) as unknown as StakingInfo
  },
}

const createUnsignedTx = {
  success: async (...args) => {
    action('createUnsignedTx')(...args)
    return mocks.yoroiUnsignedTx
  },
  error: async (...args) => {
    action('createUnsignedTx')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args) => {
    action('createUnsignedTx')(...args)
    return new Promise(() => null) as unknown as YoroiUnsignedTx
  },
}

const createDelegationTx = {
  success: async (...args) => {
    action('createDelegationTx')(...args)
    return mocks.yoroiUnsignedTx
  },
  error: async (...args) => {
    action('createDelegationTx')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args) => {
    action('createDelegationTx')(...args)
    return new Promise(() => null) as unknown as YoroiUnsignedTx
  },
}

const createWithdrawalTx = {
  success: async (...args) => {
    action('createWithdrawalTx')(...args)
    return mocks.yoroiUnsignedTx
  },
  error: async (...args) => {
    action('createWithdrawalTx')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args) => {
    action('createWithdrawalTx')(...args)
    return new Promise(() => null) as unknown as YoroiUnsignedTx
  },
}

const createVotingRegTx = {
  success: async (...args) => {
    action('createVotingRegTx')(...args)
    return {
      votingRegTx: mocks.yoroiUnsignedTx,
      votingKeyEncrypted: 'votingKeyEncrypted',
    }
  },
  error: async (...args) => {
    action('createVotingRegTx')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args) => {
    action('createVotingRegTx')(...args)
    return new Promise(() => null)
  },
}

const signTx = {
  success: async (...args) => {
    action('signTx')(...args)
    return yoroiSignedTx
  },
  error: async (...args) => {
    action('signTx')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args) => {
    action('signTx')(...args)
    return new Promise(() => null) as unknown as YoroiSignedTx
  },
}
const signTxWithLedger = {
  success: async (...args) => {
    action('signTx')(...args)
    return yoroiSignedTx
  },
  error: async (...args) => {
    action('signTx')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args): Promise<YoroiSignedTx> => {
    action('signTx')(...args)
    return new Promise(() => null)
  },
}

const submitTransaction = {
  success: async (...args) => {
    action('submitTransaction')(...args)
    return [] as unknown as []
  },
  error: async (...args) => {
    action('submitTransaction')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args) => {
    action('submitTransaction')(...args)
    return new Promise(() => null) as unknown as []
  },
}

const fetchCurrentPrice = {
  success: async (...args) => {
    action('fetchCurrentPrice')(...args)
    return 0.123456789
  },
  error: async (...args) => {
    action('fetchCurrentPrice')(...args)
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args) => {
    action('fetchCurrentPrice')(...args)
    return new Promise(() => null) as unknown as number
  },
}

const tokenEntries: Array<TokenEntry> = [
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

const balances: YoroiAmounts = {
  [PRIMARY_ASSET_CONSTANTS.CARDANO]: '2727363743849',
  '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950': '12344',
  '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e': '215410',
  '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f.74484f444c52': '5',
  '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b.44': '2463889379',
  '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7.c8b0': '148',
  '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c53': '100000008',
}

const tokenInfos: Record<string, TokenInfo> = {
  '': primaryTokenInfo.mainnet,
  '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950': toTokenInfo({
    networkId: 300,
    identifier: '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950',
    isDefault: false,
    metadata: {
      type: 'Cardano',
      policyId: '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d',
      assetName: '7444524950',
      ticker: '',
      longName: '',
      numberOfDecimals: 0,
      maxSupply: null,
    },
  }),
  '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e': toTokenInfo({
    networkId: 300,
    identifier: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e',
    isDefault: false,
    metadata: {
      type: 'Cardano',
      policyId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6',
      assetName: '4d494e',
      ticker: '',
      longName: '',
      numberOfDecimals: 0,
      maxSupply: null,
    },
  }),
  '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f.74484f444c52': toTokenInfo({
    networkId: 300,
    identifier: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f.74484f444c52',
    isDefault: false,
    metadata: {
      type: 'Cardano',
      policyId: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f',
      assetName: '74484f444c52',
      ticker: '',
      longName: '',
      numberOfDecimals: 0,
      maxSupply: null,
    },
  }),
  '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b.44': toTokenInfo({
    networkId: 300,
    identifier: '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b.44',
    isDefault: false,
    metadata: {
      type: 'Cardano',
      policyId: '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b',
      assetName: '44',
      ticker: '',
      longName: '',
      numberOfDecimals: 0,
      maxSupply: null,
    },
  }),
  '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7.c8b0': toTokenInfo({
    networkId: 300,
    identifier: '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7.c8b0',
    isDefault: false,
    metadata: {
      type: 'Cardano',
      policyId: '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7',
      assetName: 'c8b0',
      ticker: '',
      longName: '',
      numberOfDecimals: 0,
      maxSupply: null,
    },
  }),
  '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c53': toTokenInfo({
    networkId: 300,
    identifier: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c53',
    isDefault: false,
    metadata: {
      type: 'Cardano',
      policyId: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e',
      assetName: '74484f444c53',
      ticker: '8DEC',
      longName: '',
      numberOfDecimals: 8,
      maxSupply: null,
    },
  }),
}

const stakePoolId = 'af22f95915a19cd57adb14c558dcc4a175f60c6193dc23b8bd2d8beb'
const poolInfoAndHistory: RemotePoolMetaSuccess = {
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

const stakingInfo: StakingInfo = {
  status: 'staked',
  amount: '123456789',
  rewards: '123',
  poolId: 'poolId',
}

const yoroiUnsignedTx: YoroiUnsignedTx & {mock: true} = {
  entries: {
    address1: {'': '99999'},
  },
  amounts: {'': '99999'},
  fee: {'': '12345'},
  metadata: {},
  change: {
    change_address: {'': '1'},
  },
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

const yoroiSignedTx: YoroiSignedTx & {mock: true} = {
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

const nft: YoroiNft = {
  id: '1',
  name: 'Image 1',
  description: 'NFT 1 description',
  image: 'https://fibo-validated-nft-images.s3.amazonaws.com/asset1a6765qk8cpk2wll3hevw6xy9xry893jrzl9ms3.jpeg',
  thumbnail: 'https://fibo-validated-nft-images.s3.amazonaws.com/p_asset1a6765qk8cpk2wll3hevw6xy9xry893jrzl9ms3.jpeg',
  fingerprint: getTokenFingerprint({
    policyId: '8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4',
    assetNameHex: '496D6167652031',
  }),
  metadata: {
    policyId: '8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4',
    assetNameHex: '496D6167652031',
    originalMetadata: {
      name: 'Image 1',
      description: 'NFT 1 description',
      image: 'https://fibo-validated-nft-images.s3.amazonaws.com/asset1a6765qk8cpk2wll3hevw6xy9xry893jrzl9ms3.jpeg',
    },
  },
}

export const mocks = {
  walletMeta,
  wallet,
  osWallet,
  hwWallet,
  readonlyWallet,

  stakePoolId,

  encryptedStorage: mockEncryptedStorage,

  balances,
  stakingInfo,
  poolInfoAndHistory,
  tokenEntries,
  tokenInfos,
  yoroiUnsignedTx,
  yoroiSignedTx,
  utxos,
  fetchCurrentPrice,
  fetchNfts,
  fetchNftModerationStatus,
  txid,
  getTransactions,
  fetchPoolInfo,
  createUnsignedTx,
  createDelegationTx,
  createWithdrawalTx,
  createVotingRegTx,
  getStakingInfo,
  getDelegationStatus,
  signTx,
  signTxWithLedger,
  submitTransaction,
}
