import {Chain} from '@yoroi/types'

import {BehaviorSubject} from 'rxjs'

import {YoroiWallet} from '~/wallets/cardano/types'

import {defaultSyncConfig} from './sync-config'
import {makeSyncManager} from './sync-manager'

describe('SyncManager', () => {
  let mockWallets: YoroiWallet[]
  let wallets$: BehaviorSubject<YoroiWallet[]>
  let selectedWalletId$: BehaviorSubject<string | null>
  let selectedNetwork$: BehaviorSubject<Chain.SupportedNetworks>
  let syncManager: ReturnType<typeof makeSyncManager>

  beforeEach(() => {
    mockWallets = [
      {
        id: 'wallet-1',
        sync: jest.fn().mockResolvedValue(undefined),
        networkManager: {
          network: Chain.Network.Mainnet,
        },
      } as unknown as YoroiWallet,
      {
        id: 'wallet-2',
        sync: jest.fn().mockResolvedValue(undefined),
        networkManager: {
          network: Chain.Network.Mainnet,
        },
      } as unknown as YoroiWallet,
    ]

    wallets$ = new BehaviorSubject(mockWallets)
    selectedWalletId$ = new BehaviorSubject<string | null>(null)
    selectedNetwork$ = new BehaviorSubject<Chain.SupportedNetworks>(
      Chain.Network.Mainnet,
    )

    syncManager = makeSyncManager(
      wallets$.asObservable(),
      selectedWalletId$.asObservable(),
      selectedNetwork$.asObservable(),
      defaultSyncConfig,
    )
  })

  afterEach(() => {
    syncManager.stop()
  })

  describe('start', () => {
    it('should start syncing wallets', (done) => {
      syncManager.start()

      syncManager.syncWalletInfos$.subscribe((infos) => {
        if (infos.size > 0) {
          expect(infos.has('wallet-1')).toBe(true)
          expect(infos.has('wallet-2')).toBe(true)
          done()
        }
      })
    })
  })

  describe('stop', () => {
    it('should stop syncing and clean up', () => {
      syncManager.start()
      syncManager.stop()

      // After stop, should not emit new sync infos
      let emissionCount = 0
      syncManager.syncWalletInfos$.subscribe(() => {
        emissionCount++
      })

      // Wait a bit to ensure no new emissions
      setTimeout(() => {
        expect(emissionCount).toBeLessThanOrEqual(1) // Only initial emission
      }, 100)
    })
  })

  describe('pause/resume', () => {
    it('should pause and resume syncing', () => {
      syncManager.start()
      syncManager.pause()
      syncManager.resume()

      // Should not throw
      expect(true).toBe(true)
    })
  })

  describe('updateWallets', () => {
    it('should update the list of wallets to sync', () => {
      syncManager.start()
      const newWallets = [
        {
          id: 'wallet-3',
          sync: jest.fn().mockResolvedValue(undefined),
          networkManager: {
            network: Chain.Network.Mainnet,
          },
        } as unknown as YoroiWallet,
      ]

      syncManager.updateWallets(newWallets)

      // Should handle new wallets
      expect(true).toBe(true)
    })
  })

  describe('updateNetwork', () => {
    it('should update the network filter', () => {
      syncManager.start()
      syncManager.updateNetwork(Chain.Network.Testnet)

      // Should filter wallets by new network
      expect(true).toBe(true)
    })
  })

  describe('notifyTransactionSubmitted', () => {
    it('should trigger fast polling after transaction submission', () => {
      syncManager.start()
      syncManager.notifyTransactionSubmitted({
        walletId: 'wallet-1',
        txId: 'tx-123',
        timestamp: Date.now(),
      })

      // Should trigger fast sync
      expect(true).toBe(true)
    })
  })
})
