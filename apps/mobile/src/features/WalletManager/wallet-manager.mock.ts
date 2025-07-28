import {Chain, Network, Wallet} from '@yoroi/types'
import {BehaviorSubject, Observable} from 'rxjs'
import {YoroiWallet} from '~/wallets/cardano/types'
import {WalletManager} from './wallet-manager'
import {walletMeta} from './wallet.mock'

export function createMockWalletManager(
  overrides: Partial<WalletManager> = {},
): WalletManager {
  const noop = (..._args: unknown[]) => undefined
  const bool$ = (v: boolean) => new BehaviorSubject(v).asObservable()
  const value$ = <T>(v: T): Observable<T> =>
    new BehaviorSubject<T>(v).asObservable()

  const defaults: Partial<Record<keyof WalletManager, unknown>> = {
    setSelectedWalletId: noop,
    setSelectedNetwork: noop,
    pauseSyncing: noop,
    resumeSyncing: noop,
    startSyncing: noop,
    stopSyncing: noop,
    restartSyncing: noop,

    selectedWalledId: null,
    selectedNetwork: Chain.Network.Mainnet,
    hasWallets: false,
    isSyncing: false,
    isSyncActive: true,

    selectedWalletId$: value$<YoroiWallet['id'] | null>(null),
    selectedNetwork$: value$<Chain.SupportedNetworks>(Chain.Network.Mainnet),
    walletMetas$: value$<Map<YoroiWallet['id'], Wallet.Meta>>(new Map()),
    syncWalletInfos$: value$<Map<string, unknown>>(new Map()),
    syncing$: bool$(false),
    syncActive$: bool$(true),

    hydrate: async () => ({wallets: [], metas: []}),
    walletIdsMarkedForDeletion: async () => [],
    removeWalletsMarkedForDeletion: async () => undefined,
    getNetworkManager: (_n: Chain.SupportedNetworks) => ({}) as Network.Manager,
    getTokenManager: (_n: Chain.SupportedNetworks) => ({}) as Network.Manager,
    getWalletsByNetwork: () => new Map(),
    getWalletById: (_: string) => undefined,
    getWalletMetaById: (_: string) => undefined,
    checksum: (_: string) => ({plate: '', seed: ''}),
    isWalletAccountDuplicated: () => false,
    findWalletMetadataByPublicKeyHex: () => undefined,
    validateWalletName: () => ({}),
    generateWalletKeys: async () => ({rootKey: '', accountPubKeyHex: ''}),
    subscribe: (_cb: unknown) => noop,
    disableEasyConfirmation: async () => undefined,
    enableEasyConfirmation: async () => undefined,
    renameWallet: noop,
    changeWalletAddressMode: noop,
    updateWalletHWDeviceInfo: noop,
    changeWalletPassword: async () => undefined,
    removeWallet: async () => undefined,
    createWalletMnemonic: async () => {
      throw new Error('createWalletMnemonic not mocked')
    },
    createWalletXPub: async () => {
      throw new Error('createWalletXPub not mocked')
    },
  }

  const proxy: WalletManager = new Proxy(
    {...defaults, ...overrides},
    {
      get(target, prop: keyof WalletManager) {
        if (prop in target) return target[prop]
        throw new Error(
          `WalletManager mock: member "${String(prop)}" was accessed but not mocked.`,
        )
      },
    },
  ) as WalletManager

  return proxy
}

const walletMetas$ = new BehaviorSubject<Map<string, Wallet.Meta>>(
  new Map([['wallet-1', walletMeta]]),
)

export const walletManagerMock = createMockWalletManager({
  walletMetas$: walletMetas$.asObservable(),
  get walletMetas() {
    return walletMetas$.value
  },
})
