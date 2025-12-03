import {App} from '@yoroi/types'

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
}

/**
 * Wallet encrypted storage interface
 * Matches the structure returned by makeWalletEncryptedStorage
 */
export type WalletEncryptedStorage = {
  xpriv: {
    read: (password: string) => Promise<string>
    write: (value: string, password: string) => Promise<void>
    remove: () => Promise<void>
  }
  xpub: {
    read: (accountVisual: number) => Promise<string | null>
    write: (accountVisual: number, accountPubKeyHex: string) => Promise<void>
    remove: (accountVisual: number) => Promise<void>
  }
  clear: () => Promise<void>
}

