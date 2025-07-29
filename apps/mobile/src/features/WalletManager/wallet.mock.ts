import {AppApi} from '@yoroi/api'
import {cardanoConfig, protocolParamsPlaceholder} from '@yoroi/blockchains'
import {createPrimaryTokenInfo} from '@yoroi/portfolio'
import {Portfolio, Wallet} from '@yoroi/types'
import {noop} from 'lodash'
import {Observable} from 'rxjs'
import {YoroiWallet} from '../../wallets/cardano/types'
import {mockEncryptedStorage} from '../../wallets/mocks/storage'
import {mockTransactionInfos} from '../../wallets/mocks/transaction'
import {utxos} from '../../wallets/mocks/utxos'
import {
  RemotePoolMetaSuccess,
  StakePoolInfosAndHistories,
} from '../../wallets/types/staking'
import {CardanoMobile} from '../../wallets/wallets'
import {networkManagers} from './common/constants'

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
})

export const walletMeta: Wallet.Meta = {
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
const wallet: YoroiWallet = {
  getAddressing(_address: string): {path: number[]; startLevel: number} {
    throw new Error('Method not implemented.')
  },
  networkManager: networkManagers.mainnet,
  isEmpty: false,
  hasOnlyPrimary: false,
  id: 'wallet-id',
  api: AppApi.mockAppApi,
  rewardAddressHex: 'reward-address-hex',
  publicKeyHex: 'publicKeyHex',
  utxos,
  allUtxos: utxos,
  collateralId:
    '22d391c7a97559cb4784bd975214919618acce75cde573a7150a176700e76181:2',
  accountVisual: 0,
  protocolParams: protocolParamsPlaceholder,

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
  ledgerSupportsCIP1694: async () => {
    return true
  },

  getCollateralInfo: () => {
    return {
      utxo: {
        utxo_id:
          '22d391c7a97559cb4784bd975214919618acce75cde573a7150a176700e76181:2',
        tx_hash:
          '22d391c7a97559cb4784bd975214919618acce75cde573a7150a176700e76181',
        tx_index: 2,
        receiver:
          'addr_test1qrg0x4sx2wfd3l26zqs658u8vyg8qz4dzqw0zke45lpy0vkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qzplc3l',
        amount: '5449549',

        assets: [],
      },
      amount: {quantity: 5449549n, info: primaryTokenInfoMainnet},
      collateralId:
        '22d391c7a97559cb4784bd975214919618acce75cde573a7150a176700e76181:2',
      isConfirmed: true,
    }
  },
  signRawTxWithLedger: async () => {
    throw new Error('not implemented: signRawTxWithLedger')
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
  getStakingKey: () => {
    const pubKeyHex =
      '8e4e2f11b6ac2a269913286e26339779ab8767579d18d173cdd324929d94e2c43e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247'
    const accountPubKey = CardanoMobile.Bip32PublicKey.fromBytes(
      Buffer.from(pubKeyHex, 'hex'),
    )
    return accountPubKey
      .derive(
        cardanoConfig.implementations['cardano-cip1852'].features.staking
          .derivation.role,
      )
      .derive(
        cardanoConfig.implementations['cardano-cip1852'].features.staking
          .derivation.index,
      )
      .toRawKey()
  },
  signRawTx(): Promise<Uint8Array | undefined> {
    throw new Error('not implemented: signRawTx')
  },
  getAllUtxosForKey: () => [],
  fetchPoolInfo: (...args: unknown[]) => {
    return Promise.resolve({
      [stakePoolId]: poolInfoAndHistory,
    } as StakePoolInfosAndHistories)
  },
  getDelegationStatus: (...args: unknown[]) => {
    return {isRegistered: false, poolKeyHash: null}
  },
  subscribeOnTxHistoryUpdate: () => {
    return () => null
  },
  fetchAccountState: (...args: unknown[]) => {
    return Promise.resolve({
      ['reward-address-hex']: {
        remainingAmount: '0',
        rewards: '0',
        withdrawals: '',
      },
    })
  },
  signTx: () => {
    throw new Error('Not implemented: signTx')
  },
  signTxWithLedger: () => {
    throw new Error('Not implemented: signTxWithLedger')
  },
  checkServerStatus: (...args: unknown[]) => {
    return Promise.resolve({
      isServerOk: true,
      isMaintenance: false,
      serverTime: Date.now(),
      isQueueOnline: true,
    })
  },
  fetchTxStatus: async (...args: unknown[]) => {
    return {}
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
    throw new Error('not implemented: subscribe')
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
    return true
  },
  saveMemo: async (...args: unknown[]) => {
    throw new Error('not implemented: saveMemo')
  },
  clear: async (...args: unknown[]) => {
    throw new Error('not implemented: clear')
  },
  sync: async (...args: unknown[]) => {
    throw new Error('not implemented: sync')
  },
  resync: async (...args: unknown[]) => {
    throw new Error('not implemented: resync')
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

export const walletMocks = {
  walletMeta,
  wallet,
}
