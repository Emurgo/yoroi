/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {action} from '@storybook/addon-actions'
import {AppApi} from '@yoroi/api'
import {createPrimaryTokenInfo} from '@yoroi/portfolio'
import {Balance, Portfolio, Wallet} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import {noop} from 'lodash'
import {Observable} from 'rxjs'

import {buildPortfolioTokenManagers} from '../../features/Portfolio/common/helpers/build-token-managers'
import {buildNetworkManagers} from '../../features/WalletManager/network-manager/network-manager'
import {fallbackTokenInfo, toTokenInfo, utf8ToHex} from '../cardano/api/utils'
import * as HASKELL_SHELLEY_TESTNET from '../cardano/constants/testnet/constants'
import {
  CHIMERIC_ACCOUNT,
  PRIMARY_TOKEN,
  PRIMARY_TOKEN_INFO,
  STAKING_KEY_INDEX,
} from '../cardano/constants/testnet/constants'
import {CardanoTypes, YoroiWallet} from '../cardano/types'
import {
  RemotePoolMetaSuccess,
  StakePoolInfosAndHistories,
  StakingInfo,
  StakingStatus,
  TransactionInfo,
  YoroiNftModerationStatus,
  YoroiSignedTx,
  YoroiUnsignedTx,
} from '../types'
import {getTokenFingerprint} from '../utils/format'
import {CardanoMobile} from '../wallets'
import {mockEncryptedStorage} from './storage'
import {mockTransactionInfo, mockTransactionInfos} from './transaction'
import {utxos} from './utxos'

const primaryTokenInfoMainnet = createPrimaryTokenInfo({
  decimals: 6,
  name: 'ADA',
  ticker: 'ADA',
  symbol: '₳',
  reference: '',
  tag: '',
  website: 'https://www.cardano.org/',
  originalImage: '',
  description: 'Cardano',
  icon: '',
  mediaType: '',
})

const walletMeta: Wallet.Meta = {
  id: 'wallet-id',
  hwDeviceInfo: null,
  isReadOnly: false,
  name: 'my-wallet',
  isHW: false,
  isEasyConfirmationEnabled: true,
  implementation: 'cardano-cip1852',
  plate: 'XXXX-1234',
  version: 3,
  avatar:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI2UxZjJmZiIgLz48cmVjdCB4PSI4IiB5PSIwIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMTdkMWFhIiAvPjxyZWN0IHg9IjE2IiB5PSIwIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMTdkMWFhIiAvPjxyZWN0IHg9IjI0IiB5PSIwIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZTFmMmZmIiAvPjxyZWN0IHg9IjMyIiB5PSIwIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZTFmMmZmIiAvPjxyZWN0IHg9IjQwIiB5PSIwIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMTdkMWFhIiAvPjxyZWN0IHg9IjQ4IiB5PSIwIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMTdkMWFhIiAvPjxyZWN0IHg9IjU2IiB5PSIwIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZTFmMmZmIiAvPjxyZWN0IHg9IjAiIHk9IjgiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNhODBiMzIiIC8+PHJlY3QgeD0iOCIgeT0iOCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI2UxZjJmZiIgLz48cmVjdCB4PSIxNiIgeT0iOCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI2UxZjJmZiIgLz48cmVjdCB4PSIyNCIgeT0iOCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzE3ZDFhYSIgLz48cmVjdCB4PSIzMiIgeT0iOCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzE3ZDFhYSIgLz48cmVjdCB4PSI0MCIgeT0iOCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI2UxZjJmZiIgLz48cmVjdCB4PSI0OCIgeT0iOCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI2UxZjJmZiIgLz48cmVjdCB4PSI1NiIgeT0iOCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI2E4MGIzMiIgLz48cmVjdCB4PSIwIiB5PSIxNiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzE3ZDFhYSIgLz48cmVjdCB4PSI4IiB5PSIxNiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI2UxZjJmZiIgLz48cmVjdCB4PSIxNiIgeT0iMTYiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxN2QxYWEiIC8+PHJlY3QgeD0iMjQiIHk9IjE2IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZTFmMmZmIiAvPjxyZWN0IHg9IjMyIiB5PSIxNiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI2UxZjJmZiIgLz48cmVjdCB4PSI0MCIgeT0iMTYiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxN2QxYWEiIC8+PHJlY3QgeD0iNDgiIHk9IjE2IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZTFmMmZmIiAvPjxyZWN0IHg9IjU2IiB5PSIxNiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzE3ZDFhYSIgLz48cmVjdCB4PSIwIiB5PSIyNCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzE3ZDFhYSIgLz48cmVjdCB4PSI4IiB5PSIyNCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI2UxZjJmZiIgLz48cmVjdCB4PSIxNiIgeT0iMjQiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxN2QxYWEiIC8+PHJlY3QgeD0iMjQiIHk9IjI0IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMTdkMWFhIiAvPjxyZWN0IHg9IjMyIiB5PSIyNCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzE3ZDFhYSIgLz48cmVjdCB4PSI0MCIgeT0iMjQiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxN2QxYWEiIC8+PHJlY3QgeD0iNDgiIHk9IjI0IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZTFmMmZmIiAvPjxyZWN0IHg9IjU2IiB5PSIyNCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzE3ZDFhYSIgLz48cmVjdCB4PSIwIiB5PSIzMiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzE3ZDFhYSIgLz48cmVjdCB4PSI4IiB5PSIzMiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzE3ZDFhYSIgLz48cmVjdCB4PSIxNiIgeT0iMzIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxN2QxYWEiIC8+PHJlY3QgeD0iMjQiIHk9IjMyIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZTFmMmZmIiAvPjxyZWN0IHg9IjMyIiB5PSIzMiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI2UxZjJmZiIgLz48cmVjdCB4PSI0MCIgeT0iMzIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxN2QxYWEiIC8+PHJlY3QgeD0iNDgiIHk9IjMyIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMTdkMWFhIiAvPjxyZWN0IHg9IjU2IiB5PSIzMiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzE3ZDFhYSIgLz48cmVjdCB4PSIwIiB5PSI0MCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI2UxZjJmZiIgLz48cmVjdCB4PSI4IiB5PSI0MCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI2UxZjJmZiIgLz48cmVjdCB4PSIxNiIgeT0iNDAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNlMWYyZmYiIC8+PHJlY3QgeD0iMjQiIHk9IjQwIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZTFmMmZmIiAvPjxyZWN0IHg9IjMyIiB5PSI0MCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI2UxZjJmZiIgLz48cmVjdCB4PSI0MCIgeT0iNDAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNlMWYyZmYiIC8+PHJlY3QgeD0iNDgiIHk9IjQwIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZTFmMmZmIiAvPjxyZWN0IHg9IjU2IiB5PSI0MCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI2UxZjJmZiIgLz48cmVjdCB4PSIwIiB5PSI0OCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI2E4MGIzMiIgLz48cmVjdCB4PSI4IiB5PSI0OCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzE3ZDFhYSIgLz48cmVjdCB4PSIxNiIgeT0iNDgiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNlMWYyZmYiIC8+PHJlY3QgeD0iMjQiIHk9IjQ4IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjYTgwYjMyIiAvPjxyZWN0IHg9IjMyIiB5PSI0OCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI2E4MGIzMiIgLz48cmVjdCB4PSI0MCIgeT0iNDgiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNlMWYyZmYiIC8+PHJlY3QgeD0iNDgiIHk9IjQ4IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMTdkMWFhIiAvPjxyZWN0IHg9IjU2IiB5PSI0OCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI2E4MGIzMiIgLz48cmVjdCB4PSIwIiB5PSI1NiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzE3ZDFhYSIgLz48cmVjdCB4PSI4IiB5PSI1NiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI2UxZjJmZiIgLz48cmVjdCB4PSIxNiIgeT0iNTYiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxN2QxYWEiIC8+PHJlY3QgeD0iMjQiIHk9IjU2IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMTdkMWFhIiAvPjxyZWN0IHg9IjMyIiB5PSI1NiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzE3ZDFhYSIgLz48cmVjdCB4PSI0MCIgeT0iNTYiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxN2QxYWEiIC8+PHJlY3QgeD0iNDgiIHk9IjU2IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZTFmMmZmIiAvPjxyZWN0IHg9IjU2IiB5PSI1NiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzE3ZDFhYSIgLz48L3N2Zz4=',
  addressMode: 'multiple',
}

// TODO: should be mocked
const {tokenManagers} = buildPortfolioTokenManagers()
const networkManagers = buildNetworkManagers({tokenManagers})

const wallet: YoroiWallet = {
  networkManager: networkManagers.mainnet,
  isEmpty: false,
  hasOnlyPrimary: false,
  id: 'wallet-id',
  api: AppApi.mockAppApi,
  primaryToken: PRIMARY_TOKEN,
  primaryTokenInfo: PRIMARY_TOKEN_INFO,
  rewardAddressHex: 'reward-address-hex',
  publicKeyHex: 'publicKeyHex',
  utxos,
  allUtxos: utxos,
  collateralId: '22d391c7a97559cb4784bd975214919618acce75cde573a7150a176700e76181:2',
  accountVisual: 0,

  balance$: new Observable<Portfolio.Event.BalanceManager>(),
  balances: {
    records: new Map(),
    all: [],
    fts: [],
    nfts: [],
  },
  primaryBalance: {
    quantity: 0n,
    info: primaryTokenInfoMainnet,
  },
  primaryBreakdown: {
    availableRewards: 0n,
    lockedAsStorageCost: 0n,
    totalFromTxs: 0n,
  },

  isMainnet: true,
  portfolioPrimaryTokenInfo: primaryTokenInfoMainnet,

  balanceManager: {
    clear: noop,
    sync: noop,
    resync: noop,
    startSync: noop,
    stopSync: noop,
  } as any,

  getStakingInfo: async () => {
    throw new Error('not implemented: getStakingInfo')
  },
  encryptedStorage: mockEncryptedStorage,
  ledgerSupportsCIP36: async () => {
    return true
  },

  getCollateralInfo: () => {
    return {
      utxo: {
        utxo_id: '22d391c7a97559cb4784bd975214919618acce75cde573a7150a176700e76181:2',
        tx_hash: '22d391c7a97559cb4784bd975214919618acce75cde573a7150a176700e76181',
        tx_index: 2,
        receiver:
          'addr_test1qrg0x4sx2wfd3l26zqs658u8vyg8qz4dzqw0zke45lpy0vkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qzplc3l',
        amount: '5449549',

        assets: [],
      },
      amount: {quantity: '5449549', tokenId: ''},
      collateralId: '22d391c7a97559cb4784bd975214919618acce75cde573a7150a176700e76181:2',
      isConfirmed: true,
    }
  },
  signSwapCancellationWithLedger: async () => {
    throw new Error('not implemented: signSwapCancellationWithLedger')
  },
  setCollateralId: () => {
    throw new Error('not implemented: createUnsignedTx')
  },
  createUnsignedTx: () => {
    throw new Error('not implemented: createUnsignedTx')
  },
  createDelegationTx: () => {
    throw new Error('not implemented: createDelegationTx')
  },
  createWithdrawalTx: () => {
    throw new Error('not implemented: createWithdrawalTx')
  },
  getStakingKey: async () => {
    const pubKeyHex =
      '8e4e2f11b6ac2a269913286e26339779ab8767579d18d173cdd324929d94e2c43e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247'
    const accountPubKey = await CardanoMobile.Bip32PublicKey.fromBytes(Buffer.from(pubKeyHex, 'hex'))
    return accountPubKey
      .derive(CHIMERIC_ACCOUNT)
      .then((key) => key.derive(STAKING_KEY_INDEX))
      .then((key) => key.toRawKey())
  },
  signRawTx(): Promise<Uint8Array | undefined> {
    throw new Error('not implemented: signRawTx')
  },
  getAllUtxosForKey: () => Promise.resolve([]),
  fetchTokenInfo: (tokenId: string) => {
    action('fetchTokenInfo')(tokenId)
    return Promise.resolve(tokenInfos[tokenId] ?? fallbackTokenInfo(tokenId))
  },
  fetchPoolInfo: (...args: unknown[]) => {
    action('fetchPoolInfo')(...args)
    return Promise.resolve({[stakePoolId]: poolInfoAndHistory} as StakePoolInfosAndHistories)
  },
  getDelegationStatus: (...args: unknown[]) => {
    action('getDelegationStatus')(...args)
    return {isRegistered: false, poolKeyHash: null}
  },
  subscribeOnTxHistoryUpdate: () => {
    return () => null
  },
  fetchAccountState: (...args: unknown[]) => {
    action('fetchAccountState')(...args)
    return Promise.resolve({['reward-address-hex']: {remainingAmount: '0', rewards: '0', withdrawals: ''}})
  },
  signTx: () => {
    throw new Error('Not implemented: signTx')
  },
  signTxWithLedger: () => {
    throw new Error('Not implemented: signTxWithLedger')
  },
  checkServerStatus: (...args: unknown[]) => {
    action('checkServerStatus')(...args)
    return Promise.resolve({
      isServerOk: true,
      isMaintenance: false,
      serverTime: Date.now(),
      isQueueOnline: true,
    })
  },
  fetchTxStatus: async (...args: unknown[]) => {
    action('fetchTxStatus')(...args)
    return {}
  },
  fetchTipStatus: async (...args: unknown[]) => {
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
  getFirstPaymentAddress: () => {
    throw new Error('Not implemented: getFirstPaymentAddress')
  },
  createVotingRegTx: () => {
    throw new Error('Not implemented: createVotingRegTx')
  },
  subscribe: (...args: unknown[]) => {
    action('subscribe')(...args)
    return (...args: unknown[]) => {
      action('unsubscribe')(...args)
    }
  },
  internalAddresses: [],
  externalAddresses: [],
  confirmationCounts: {},
  transactions: mockTransactionInfos,
  isUsedAddressIndex: {},
  receiveAddresses: [],
  receiveAddressInfo: {
    canIncrease: true,
    lastUsedIndex: 0,
    lastUsedIndexVisual: 0,
  },
  generateNewReceiveAddress: (...args: unknown[]) => {
    action('generateNewReceiveAddress')(...args)
    return true
  },
  saveMemo: async (...args: unknown[]) => {
    action('saveMemo')(...args)
  },
  clear: async (...args: unknown[]) => {
    action('clear')(...args)
  },
  sync: async (...args: unknown[]) => {
    action('sync')(...args)
  },
  resync: async (...args: unknown[]) => {
    action('resync')(...args)
  },
  fetchFundInfo: () => {
    throw new Error('not implemented: fetchFundInfo')
  },
  createUnsignedGovernanceTx: () => {
    throw new Error('not implemented: createUnsignedGovernanceTx')
  },
  getChangeAddress(): string {
    return 'addr1qxy9yjhvxh700xeluhvdpwlauuvnzav42edveyggy8fusqvg2f9wcd0u77dnlewc6zalmecex96e24j6ejgssgwneqqs762af9'
  },
}

export const metaHw: Wallet.Meta = {
  ...walletMeta,
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

const txid = '31b1abca49857fd50c7959cc019d14c7dc5deaa754ba45372fb21748c411f210'

const getTransactions = {
  success: async (...args: unknown[]) => {
    action('getTransactions')(...args)
    const txInfo = mockTransactionInfo({id: txid})

    return {
      [txInfo.id]: txInfo,
    }
  },

  error: async (...args: unknown[]) => {
    action('getTransactions')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args: unknown[]) => {
    action('getTransactions')(...args)
    return new Promise(() => null) as unknown as {[txid: string]: TransactionInfo}
  },
}

const fetchPoolInfo = {
  success: {
    poolFound: async (...args: unknown[]) => {
      action('fetchPoolInfo')(...args)
      return {[mocks.stakePoolId]: mocks.poolInfoAndHistory} as StakePoolInfosAndHistories
    },
    poolNotFound: async (...args: unknown[]) => {
      action('fetchPoolInfo')(...args)
      return {[mocks.stakePoolId]: null} as StakePoolInfosAndHistories
    },
  },
  error: async (...args: unknown[]) => {
    action('fetchPoolInfo')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args: unknown[]) => {
    action('fetchPoolInfo')(...args)
    return new Promise(() => null) as unknown as StakePoolInfosAndHistories
  },
}

export const generateManyNfts = (): Balance.TokenInfo[] => {
  return Array(30)
    .fill(undefined)
    .map((_, index) => ({
      ...nft,
      name: 'NFT ' + index,
      id: index + '',
      fingerprint: getTokenFingerprint({policyId: nft.group, assetNameHex: utf8ToHex('NFT ' + index)}),
    }))
}

const fetchNftModerationStatus = {
  success: {
    approved: async (...args: unknown[]): Promise<YoroiNftModerationStatus> => {
      action('fetchNftModerationStatus')(...args)
      return 'approved'
    },
    consent: async (...args: unknown[]): Promise<YoroiNftModerationStatus> => {
      action('fetchNftModerationStatus')(...args)
      return 'consent'
    },
    blocked: async (...args: unknown[]): Promise<YoroiNftModerationStatus> => {
      action('fetchNftModerationStatus')(...args)
      return 'blocked'
    },
    pendingReview: async (...args: unknown[]): Promise<YoroiNftModerationStatus> => {
      action('fetchNftModerationStatus')(...args)
      return 'pending'
    },
    loading: async (...args: unknown[]): Promise<YoroiNftModerationStatus> => {
      action('fetchNftModerationStatus')(...args)
      return new Promise(() => void 0) as any
    },
    random: async (...args: unknown[]): Promise<YoroiNftModerationStatus> => {
      action('fetchNftModerationStatus')(...args)
      const statuses = ['approved', 'consent', 'blocked', 'pending', 'manual_review'] as const
      return statuses[Math.floor(Math.random() * statuses.length)]
    },
  },
  error: async (...args: unknown[]) => {
    action('fetchNftModerationStatus')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args: unknown[]) => {
    action('fetchNftModerationStatus')(...args)
    return new Promise(() => null) as unknown as YoroiNftModerationStatus
  },
}

const getDelegationStatus = {
  success: {
    delegating: (...args: unknown[]) => {
      action('getDelegationStatus')(...args)
      return {isRegistered: true, poolKeyHash: stakePoolId} as StakingStatus
    },
    registered: (...args: unknown[]) => {
      action('getDelegationStatus')(...args)
      return {isRegistered: true} as StakingStatus
    },
    notRegistered: (...args: unknown[]) => {
      action('getDelegationStatus')(...args)
      return {isRegistered: false, poolKeyHash: null} as StakingStatus
    },
  },
  error: (...args: unknown[]) => {
    action('getDelegationStatus')(...args)
    throw new Error('storybook error message')
  },
  loading: (...args: unknown[]) => {
    action('getDelegationStatus')(...args)
    return new Promise(() => null) as unknown as StakingStatus
  },
}

const getStakingInfo = {
  success: {
    registered: async (...args: unknown[]) => {
      action('getStakingInfo')(...args)
      return {status: 'registered'} as StakingInfo
    },
    notRegistered: async (...args: unknown[]) => {
      action('getStakingInfo')(...args)
      return {status: 'not-registered'} as StakingInfo
    },
  },
  error: async (...args: unknown[]) => {
    action('getStakingInfo')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args: unknown[]) => {
    action('getStakingInfo')(...args)
    return new Promise(() => null) as unknown as StakingInfo
  },
}

const createUnsignedTx = {
  success: async (...args: unknown[]) => {
    action('createUnsignedTx')(...args)
    return mocks.yoroiUnsignedTx
  },
  error: async (...args: unknown[]) => {
    action('createUnsignedTx')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args: unknown[]) => {
    action('createUnsignedTx')(...args)
    return new Promise(() => null) as unknown as YoroiUnsignedTx
  },
}

const createDelegationTx = {
  success: async (...args: unknown[]) => {
    action('createDelegationTx')(...args)
    return mocks.yoroiUnsignedTx
  },
  error: async (...args: unknown[]) => {
    action('createDelegationTx')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args: unknown[]) => {
    action('createDelegationTx')(...args)
    return new Promise(() => null) as unknown as YoroiUnsignedTx
  },
}

const setCollateralId = {
  success: async (...args: unknown[]) => {
    action('setCollateralId')(...args)
    return mocks.yoroiUnsignedTx
  },
  error: async (...args: unknown[]) => {
    action('setCollateralId')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args: unknown[]) => {
    action('setCollateralId')(...args)
    return new Promise(() => null) as unknown as void
  },
}

const createWithdrawalTx = {
  success: async (...args: unknown[]) => {
    action('createWithdrawalTx')(...args)
    return mocks.yoroiUnsignedTx
  },
  error: async (...args: unknown[]) => {
    action('createWithdrawalTx')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args: unknown[]) => {
    action('createWithdrawalTx')(...args)
    return new Promise(() => null) as unknown as YoroiUnsignedTx
  },
}

const createVotingRegTx = {
  success: async (...args: unknown[]) => {
    action('createVotingRegTx')(...args)
    return {
      votingRegTx: mocks.yoroiUnsignedTx,
      votingKeyEncrypted: 'votingKeyEncrypted',
    }
  },
  error: async (...args: unknown[]) => {
    action('createVotingRegTx')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args: unknown[]) => {
    action('createVotingRegTx')(...args)
    return new Promise(() => null)
  },
}

const signTx = {
  success: async (...args: unknown[]) => {
    action('signTx')(...args)
    return yoroiSignedTx
  },
  error: async (...args: unknown[]) => {
    action('signTx')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args: unknown[]) => {
    action('signTx')(...args)
    return new Promise(() => null) as unknown as YoroiSignedTx
  },
}
const signTxWithLedger = {
  success: async (...args: unknown[]) => {
    action('signTx')(...args)
    return yoroiSignedTx
  },
  error: async (...args: unknown[]) => {
    action('signTx')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args: unknown[]): Promise<YoroiSignedTx> => {
    action('signTx')(...args)
    return new Promise(() => null)
  },
}

const submitTransaction = {
  success: async (...args: unknown[]) => {
    action('submitTransaction')(...args)
  },
  error: async (...args: unknown[]) => {
    action('submitTransaction')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
  loading: async (...args: unknown[]) => {
    action('submitTransaction')(...args)
    return new Promise<void>(() => null)
  },
}

const fetchTokenInfo = {
  success: {
    nft: async (...args: unknown[]): Promise<Balance.TokenInfo> => {
      action('fetchTokenInfo')(...args)
      return nft
    },
    randomNft: async (...args: unknown[]): Promise<Balance.TokenInfo> => {
      action('fetchTokenInfo')(...args)
      const allNfts = generateManyNfts()
      return allNfts[Math.floor(Math.random() * allNfts.length)]
    },
    ft: async (...args: unknown[]): Promise<Balance.TokenInfo> => {
      action('fetchTokenInfo')(...args)
      return {
        kind: 'ft',
        description: 'WingRiders testnet wUSDC token.',
        id: '648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198.7755534443',
        name: 'wUSDC',
        fingerprint: 'asset1n3weea8202dpev06tshdvhe9xd6f9jcqldpc2q',
        image: 'https://picsum.photos/40',
        icon: 'https://picsum.photos/40',
        group: '648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198',
        ticker: 'WUSDC',
        decimals: 3,
        symbol: undefined,
        metadatas: {
          mintFt: {
            decimals: 3,
            icon: '',
            url: 'https://wallet-testnet.nu.fi',
            description: 'WingRiders testnet wUSDC token.',
            ticker: 'WUSDC',
            version: '1',
          },
        },
      }
    },
    ftNoImage: async (...args: unknown[]): Promise<Balance.TokenInfo> => {
      action('fetchTokenInfo')(...args)
      return {
        kind: 'ft',
        description: 'WingRiders testnet wUSDC token.',
        id: '648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198.7755534443',
        name: 'wUSDC',
        fingerprint: 'asset1n3weea8202dpev06tshdvhe9xd6f9jcqldpc2q',
        image: '',
        icon: '',
        group: '648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198',
        ticker: 'WUSDC',
        decimals: 3,
        symbol: undefined,
        metadatas: {
          mintFt: {
            decimals: 3,
            icon: '',
            url: 'https://wallet-testnet.nu.fi',
            description: 'WingRiders testnet wUSDC token.',
            ticker: 'WUSDC',
            version: '1',
          },
        },
      }
    },
  },
  loading: async (...args: unknown[]) => {
    action('fetchTokenInfo')(...args)
    return new Promise(() => null) as unknown as Balance.TokenInfo
  },
  error: async (...args: unknown[]) => {
    action('fetchTokenInfo')(...args)
    return Promise.reject(new Error('storybook error message'))
  },
}

const tokenEntries: Array<CardanoTypes.TokenEntry> = [
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

const balances: Balance.Amounts = {
  '': '2727363743849',
  '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950': '12344',
  '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e': '215410',
  '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f.74484f444c52': '5',
  '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b.44': '2463889379',
  '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7.c8b0': '148',
  '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c53': '100000008',
  '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c54': '1000000000012',
  '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c55': '100000000000000000020',
}

const tokenInfos: Record<string, Balance.TokenInfo> = {
  '': HASKELL_SHELLEY_TESTNET.PRIMARY_TOKEN_INFO,
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
  '648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198.7755534443': {
    kind: 'ft',
    id: '648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198.7755534443',
    group: '648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198',
    ticker: 'WUSDC',
    image:
      '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',
    icon: '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',
    decimals: 3,
    symbol: undefined,
    metadatas: {
      mintFt: {
        decimals: 3,
        icon: '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',
        ticker: 'WUSDC',
        url: 'https://wallet-testnet.nu.fi',
        description: 'WingRiders testnet wUSDC token.',
        version: '1.0',
      },
    },
    name: 'wUSDC',
    description: 'WingRiders testnet wUSDC token.',
    fingerprint: 'asset1n3weea8202dpev06tshdvhe9xd6f9jcqldpc2q',
  },
  '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c53': {
    ...toTokenInfo({
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
    image:
      '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',
    icon: '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',
  },
  '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c54': toTokenInfo({
    networkId: 300,
    identifier: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c54',
    isDefault: false,
    metadata: {
      type: 'Cardano',
      policyId: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e',
      assetName: '74484f444c53',
      ticker: '12DEC',
      longName: '',
      numberOfDecimals: 12,
      maxSupply: null,
    },
  }),
  '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c55': toTokenInfo({
    networkId: 300,
    identifier: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c55',
    isDefault: false,
    metadata: {
      type: 'Cardano',
      policyId: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e',
      assetName: '74484f444c53',
      ticker: '20DEC',
      longName: '',
      numberOfDecimals: 20,
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
  entries: [
    {
      address: 'address1',
      amounts: {'': '99999'},
    },
  ],
  fee: {'': '12345'},
  metadata: {},
  change: [{address: 'change_address', amounts: {'': '1'}}],
  staking: {
    registrations: [],
    deregistrations: [],
    delegations: [],
    withdrawals: [],
  },
  voting: {},
  unsignedTx: {} as any,
  mock: true,
  governance: false,
}

const yoroiSignedTx: YoroiSignedTx & {mock: true} = {
  entries: [],
  fee: {'': '12345'},
  metadata: {},
  change: [],
  staking: {
    registrations: [],
    deregistrations: [],
    delegations: [],
    withdrawals: [],
  },
  voting: {},
  signedTx: {id: 'tx-id', encodedTx: new Uint8Array([1, 2, 3])},
  mock: true,
  governance: false,
}

export const nft: Balance.TokenInfo = {
  kind: 'nft',
  id: `8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4.${utf8ToHex('NFT 0')}`,
  group: '8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4',
  name: 'NFT 0',
  image: 'https://fibo-validated-nft-images.s3.amazonaws.com/asset1a6765qk8cpk2wll3hevw6xy9xry893jrzl9ms3.jpeg',
  icon: 'https://fibo-validated-nft-images.s3.amazonaws.com/asset1a6765qk8cpk2wll3hevw6xy9xry893jrzl9ms3.jpeg',
  decimals: undefined,
  ticker: 'NFT_0',
  description: 'NFT 0 description',
  fingerprint: getTokenFingerprint({
    policyId: '8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4',
    assetNameHex: utf8ToHex('NFT 0'),
  }),
  symbol: undefined,
  metadatas: {
    mintFt: undefined,
    tokenRegistry: undefined,
    mintNft: {
      name: 'NFT 0',
      description: 'NFT 0 description',
      image: 'https://fibo-validated-nft-images.s3.amazonaws.com/asset1a6765qk8cpk2wll3hevw6xy9xry893jrzl9ms3.jpeg',
    },
  },
}

export const mocks = {
  walletMeta,
  wallet,
  metaHw,

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
  setCollateralId,
  fetchNftModerationStatus,
  txid,
  getTransactions,
  fetchPoolInfo,
  fetchTokenInfo,
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
