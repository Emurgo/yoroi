import {RawUtxo} from '@yoroi/api'
import {Hex} from '@yoroi/common'
import {CardanoAddressedUtxo} from '@yoroi/tx'
import {TransactionOutput} from '@yoroi/tx'
import {App, Portfolio} from '@yoroi/types'

import {SignTransactionRequest} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {WasmModuleProxy} from '@emurgo/cross-csl-core'

import {YoroiWallet} from './types'

/**
 * Dependencies that need to be injected into makeCardanoWallet
 * These are platform-specific implementations that should come from the app
 */
export type CardanoWalletDependencies = {
  /**
   * Root storage instance for wallet data
   */
  rootStorage: Readonly<App.Storage>

  /**
   * Factory function to create encrypted storage for a wallet
   */
  makeWalletEncryptedStorage: (id: string) => WalletEncryptedStorage

  /**
   * Factory function to build portfolio balance manager
   * Returns a function that creates balance manager for a specific wallet
   */
  buildPortfolioBalanceManager: (params: {
    networkRootStorage: App.Storage<false, Portfolio.Token.Id>
    tokenManager: Portfolio.Manager.Token
    primaryTokenInfo: Portfolio.Token.Info
  }) => (walletId: YoroiWallet['id']) => {
    balanceManager: Portfolio.Manager.Balance
    balanceStorage: Portfolio.Storage.Balance
  }

  /**
   * Transform raw UTXOs to balance manager sync arguments
   */
  toBalanceManagerSyncArgs: (
    rawUtxos: RawUtxo[],
    lockedAsStorageCost: bigint,
  ) => {
    primaryStated: {
      totalFromTxs: bigint
      lockedAsStorageCost: bigint
    }
    secondaryBalances: Map<
      Portfolio.Token.Id,
      Omit<Portfolio.Token.Amount, 'info'>
    >
  }

  /**
   * Factory function to create memos manager
   */
  makeMemosManager: (storage: App.Storage) => Promise<MemosManager>

  /**
   * Transform wallet transaction to ledger sign request
   * Used for hardware wallet signing
   */
  toLedgerSignRequest: (
    csl: WasmModuleProxy,
    cbor: string,
    networkId: number,
    protocolMagic: number,
    ownUtxoAddressMap: {[addressHex: string]: Array<number>},
    ownStakeAddressMap: {[addressHex: string]: Array<number>},
    addressedUtxos: Array<CardanoAddressedUtxo>,
    additionalRequiredSigners?: Array<string>,
    stakingDerivationPath?: number[],
  ) => Promise<SignTransactionRequest>

  /**
   * Create collateral entry helper
   * Used for CIP-30 dApp connector
   */
  createCollateralEntry: (
    wallet: YoroiWallet,
    amount?: string,
  ) => TransactionOutput
}

/**
 * Wallet encrypted storage interface
 * Matches the structure returned by makeWalletEncryptedStorage
 */
export type WalletEncryptedStorage = {
  readonly xpriv: {
    readonly read: (password: string) => Promise<Hex>
    readonly write: (value: string, password: string) => Promise<void>
    readonly remove: () => Promise<void>
  }
  readonly xpub: {
    readonly read: (accountVisual: number) => Promise<string | null>
    readonly write: (
      accountVisual: number,
      accountPubKeyHex: string,
    ) => Promise<void>
    readonly remove: (accountVisual: number) => Promise<void>
  }
  readonly clear: () => Promise<void>
}

/**
 * Memos manager interface
 * Manages transaction memos/notes
 */
export type MemosManager = {
  getMemos: () => Record<string, string>
  saveMemo: (txId: string, memo: string) => Promise<void>
  clear: () => Promise<void>
}
