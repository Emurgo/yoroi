import {Portfolio} from '@yoroi/types'
import {BehaviorSubject} from 'rxjs'
import {mountMMKVStorage, observableStorageMaker} from '@yoroi/common'

import {portfolioBalanceManagerMaker} from './balance-manager'
import {tokenBalanceMocks} from './adapters/token-balance.mocks'
import {sortTokenAmountsByInfo} from './helpers/sorting'
import {tokenMocks} from './adapters/token.mocks'
import {portfolioBalanceStorageMaker} from './adapters/mmkv-storage/balance-storage-maker'
import {tokenInfoMocks} from './adapters/token-info.mocks'
import {isFt} from './helpers/is-ft'
import {isNft} from './helpers/is-nft'

const tokenInfoStorage = observableStorageMaker(
  mountMMKVStorage<Portfolio.Token.Id>({
    path: `/test/token-info/`,
  }),
)
const primaryTokenId = tokenMocks.primaryETH.info.id
const sourceId = 'sourceId'

describe('portfolioBalanceManagerMaker', () => {
  const balanceStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>({
      path: '/tmp/balance/',
      id: 'balance',
    }),
  )
  const primaryBreakdownStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>({
      path: '/tmp/primary-balance-breakdown/',
      id: 'primary-balance-breakdown',
    }),
  )
  const storage: Portfolio.Storage.Balance = portfolioBalanceStorageMaker({
    balanceStorage,
    primaryBreakdownStorage,
    primaryTokenId,
  })
  const tokenManager: Portfolio.Manager.Token = {
    destroy: jest.fn(),
    hydrate: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    observable$: new BehaviorSubject({} as any).asObservable(),
    sync: jest.fn().mockResolvedValue(new Map()),
    clear: jest.fn(),
    api: {
      tokenInfo: jest.fn(),
      tokenInfos: jest.fn(),
      tokenDiscovery: jest.fn(),
      tokenTraits: jest.fn(),
      tokenActivity: jest.fn(),
      tokenImageInvalidate: jest.fn(),
    },
  }

  it('should be instantiated', () => {
    const manager = portfolioBalanceManagerMaker({
      tokenManager,
      storage,
      primaryTokenInfo: tokenMocks.primaryETH.info,
      sourceId,
    })

    expect(manager).toBeDefined()
  })
})

describe('hydrate', () => {
  const balanceStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>({
      path: '/tmp/balance/',
      id: 'balance',
    }),
  )
  const primaryBreakdownStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>({
      path: '/tmp/primary-balance-breakdown/',
      id: 'primary-balance-breakdown',
    }),
  )
  const storage: Portfolio.Storage.Balance = portfolioBalanceStorageMaker({
    balanceStorage,
    primaryBreakdownStorage,
    primaryTokenId,
  })
  const tokenManager: Portfolio.Manager.Token = {
    destroy: jest.fn(),
    hydrate: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    observable$: new BehaviorSubject({} as any).asObservable(),
    sync: jest.fn().mockResolvedValue(new Map()),
    clear: jest.fn(),
    api: {
      tokenInfo: jest.fn(),
      tokenInfos: jest.fn(),
      tokenDiscovery: jest.fn(),
      tokenTraits: jest.fn(),
      tokenActivity: jest.fn(),
      tokenImageInvalidate: jest.fn(),
    },
  }

  afterEach(() => {
    storage.clear()
    tokenInfoStorage.clear()
  })

  const primaryStated: Readonly<Portfolio.PrimaryBreakdown> = {
    availableRewards: 1000000n,
    lockedAsStorageCost: 0n,
    totalFromTxs: 0n,
  }

  storage.primaryBreakdown.save(primaryStated)
  storage.balances.save(tokenBalanceMocks.storage.entries1)

  it('should hydrate data', async () => {
    tokenInfoStorage.multiSet(tokenInfoMocks.storage.entries1)
    const manager = portfolioBalanceManagerMaker({
      tokenManager,
      storage,
      primaryTokenInfo: tokenMocks.primaryETH.info,
      sourceId,
    })
    const subscriber = jest.fn()
    manager.subscribe(subscriber)
    const sorted = sortTokenAmountsByInfo({
      primaryTokenInfo: tokenMocks.primaryETH.info,
      amounts: [
        ...new Map(tokenBalanceMocks.storage.entries1WithPrimary).values(),
      ],
    })
    const sortedBalances = {
      records: new Map(sorted.map((amount) => [amount.info.id, amount])),
      all: sorted,
      fts: sorted.filter(({info}) => isFt(info)),
      nfts: sorted.filter(({info}) => isNft(info)),
    }

    manager.hydrate()

    expect(manager.getPrimaryBreakdown()).toEqual(primaryStated)
    expect(manager.getBalances()).toEqual(sortedBalances)

    expect(manager.getPrimaryBalance()).toEqual({
      info: tokenMocks.primaryETH.info,
      quantity: primaryStated.totalFromTxs + primaryStated.availableRewards,
    })

    expect(subscriber).toHaveBeenCalledTimes(1)
    expect(manager.getHasOnlyPrimary()).toBe(false)
    expect(manager.getIsEmpty()).toBe(false)
  })
})

describe('destroy', () => {
  const balanceStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>({
      path: '/tmp/balance/',
      id: 'balance',
    }),
  )
  const primaryBreakdownStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>({
      path: '/tmp/primary-balance-breakdown/',
      id: 'primary-balance-breakdown',
    }),
  )
  const storage: Portfolio.Storage.Balance = portfolioBalanceStorageMaker({
    balanceStorage,
    primaryBreakdownStorage,
    primaryTokenId,
  })
  const tokenManagerObservable = new BehaviorSubject({} as any).asObservable()
  const tokenManager: jest.Mocked<Portfolio.Manager.Token> = {
    destroy: jest.fn(),
    hydrate: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    observable$: tokenManagerObservable,
    sync: jest.fn().mockResolvedValue(new Map()),
    clear: jest.fn(),
    api: {
      tokenInfo: jest.fn(),
      tokenInfos: jest.fn(),
      tokenDiscovery: jest.fn(),
      tokenTraits: jest.fn(),
      tokenActivity: jest.fn(),
      tokenImageInvalidate: jest.fn(),
    },
  }
  const queueDestroy = jest.fn()
  const observerDestroy = jest.fn()

  afterEach(() => {
    storage.clear()
    tokenInfoStorage.clear()
  })

  it('should tear down observers', async () => {
    tokenManager.sync.mockResolvedValue(
      new Map(tokenInfoMocks.storage.entries1),
    )

    const tasks: any = []
    const enqueueMock = jest.fn((task) => tasks.push(task))
    const mockedNotify = jest.fn()

    const manager = portfolioBalanceManagerMaker(
      {
        tokenManager,
        storage,
        primaryTokenInfo: tokenMocks.primaryETH.info,
        sourceId,
      },
      {
        observer: {
          destroy: observerDestroy,
          notify: mockedNotify,
          subscribe: jest.fn(),
          unsubscribe: jest.fn(),
          observable: new BehaviorSubject({} as any).asObservable(),
        },
        queue: {
          enqueue: enqueueMock,
          destroy: queueDestroy,
          observable: new BehaviorSubject({}).asObservable(),
        } as any,
      },
    )

    manager.destroy()

    expect(observerDestroy).toHaveBeenCalled()
    expect(queueDestroy).toHaveBeenCalled()
    expect(tokenManager.unsubscribe).toHaveBeenCalled()
  })
})

describe('primary updates', () => {
  const balanceStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>({
      path: '/tmp/balance/',
      id: 'balance',
    }),
  )
  const primaryBreakdownStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>({
      path: '/tmp/primary-balance-breakdown/',
      id: 'primary-balance-breakdown',
    }),
  )
  const storage: Portfolio.Storage.Balance = portfolioBalanceStorageMaker({
    balanceStorage,
    primaryBreakdownStorage,
    primaryTokenId,
  })
  const tokenManagerObservable = new BehaviorSubject({} as any)
  const tokenManager: jest.Mocked<Portfolio.Manager.Token> = {
    destroy: jest.fn(),
    hydrate: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    observable$: tokenManagerObservable.asObservable(),
    sync: jest.fn().mockResolvedValue(new Map()),
    clear: jest.fn(),
    api: {
      tokenInfo: jest.fn(),
      tokenInfos: jest.fn(),
      tokenDiscovery: jest.fn(),
      tokenTraits: jest.fn(),
      tokenActivity: jest.fn(),
      tokenImageInvalidate: jest.fn(),
    },
  }

  afterEach(() => {
    storage.clear()
    tokenInfoStorage.clear()
  })

  it('should update primary stated', () => {
    const tasks: any = []
    const enqueueMock = jest.fn((task) => tasks.push(task))
    const mockedNotify = jest.fn()

    const manager = portfolioBalanceManagerMaker(
      {
        tokenManager,
        storage,
        primaryTokenInfo: tokenMocks.primaryETH.info,
        sourceId,
      },
      {
        observer: {
          destroy: jest.fn(),
          notify: mockedNotify,
          subscribe: jest.fn(),
          unsubscribe: jest.fn(),
          observable: new BehaviorSubject({} as any).asObservable(),
        },
        queue: {
          enqueue: enqueueMock,
          destroy: jest.fn(),
          observable: new BehaviorSubject({}).asObservable(),
        } as any,
      },
    )

    const subscriber = jest.fn()
    manager.subscribe(subscriber)
    manager.hydrate()

    manager.updatePrimaryStated({
      totalFromTxs: 1000001n,
      lockedAsStorageCost: 10n,
    })

    expect(manager.getPrimaryBreakdown()).toEqual({
      totalFromTxs: 1000001n,
      availableRewards: 0n,
      lockedAsStorageCost: 10n,
    })
    expect(manager.getPrimaryBalance()).toEqual({
      info: tokenMocks.primaryETH.info,
      quantity: 1000001n,
    })

    expect(mockedNotify).toHaveBeenCalledTimes(2)
    expect(mockedNotify).toHaveBeenCalledWith({
      on: Portfolio.Event.ManagerOn.Sync,
      sourceId,
      mode: 'primary-stated',
    })
  })

  it('should update primary derived', () => {
    const tasks: any = []
    const enqueueMock = jest.fn((task) => tasks.push(task))
    const mockedNotify = jest.fn()

    const manager = portfolioBalanceManagerMaker(
      {
        tokenManager,
        storage,
        primaryTokenInfo: tokenMocks.primaryETH.info,
        sourceId,
      },
      {
        observer: {
          destroy: jest.fn(),
          notify: mockedNotify,
          subscribe: jest.fn(),
          unsubscribe: jest.fn(),
          observable: new BehaviorSubject({} as any).asObservable(),
        },
        queue: {
          enqueue: enqueueMock,
          destroy: jest.fn(),
          observable: new BehaviorSubject({}).asObservable(),
        } as any,
      },
    )

    const primaryStated: Readonly<Portfolio.PrimaryBreakdown> = {
      availableRewards: 0n,
      lockedAsStorageCost: 0n,
      totalFromTxs: 1000001n,
    }
    storage.primaryBreakdown.save(primaryStated)

    const subscriber = jest.fn()
    manager.subscribe(subscriber)
    manager.hydrate()

    manager.updatePrimaryDerived({
      availableRewards: 1000001n,
    })

    expect(manager.getPrimaryBreakdown()).toEqual({
      totalFromTxs: 1000001n,
      availableRewards: 1000001n,
      lockedAsStorageCost: 0n,
    })
    expect(manager.getPrimaryBalance()).toEqual({
      info: tokenMocks.primaryETH.info,
      quantity: 2000002n,
    })

    expect(mockedNotify).toHaveBeenCalledTimes(2)
    expect(mockedNotify).toHaveBeenCalledWith({
      on: Portfolio.Event.ManagerOn.Sync,
      sourceId,
      mode: 'primary-derived',
    })
  })
})

describe('sync & refresh', () => {
  const balanceStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>({
      path: '/tmp/balance/',
      id: 'balance',
    }),
  )
  const primaryBreakdownStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>({
      path: '/tmp/primary-balance-breakdown/',
      id: 'primary-balance-breakdown',
    }),
  )
  const storage: Portfolio.Storage.Balance = portfolioBalanceStorageMaker({
    balanceStorage,
    primaryBreakdownStorage,
    primaryTokenId,
  })
  const tokenManagerObservable = new BehaviorSubject({} as any)
  const tokenManager: jest.Mocked<Portfolio.Manager.Token> = {
    destroy: jest.fn(),
    hydrate: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    observable$: tokenManagerObservable.asObservable(),
    sync: jest.fn().mockResolvedValue(new Map()),
    clear: jest.fn(),
    api: {
      tokenInfo: jest.fn(),
      tokenInfos: jest.fn(),
      tokenDiscovery: jest.fn(),
      tokenTraits: jest.fn(),
      tokenActivity: jest.fn(),
      tokenImageInvalidate: jest.fn(),
    },
  }

  afterEach(() => {
    storage.clear()
    tokenInfoStorage.clear()
  })

  const primaryStated: Readonly<Portfolio.PrimaryBreakdown> = {
    totalFromTxs: BigInt(1000000),
    availableRewards: BigInt(0),
    lockedAsStorageCost: BigInt(0),
  }

  it('should sync and respond to token event', async () => {
    tokenManager.sync.mockResolvedValue(
      new Map(tokenInfoMocks.storage.entries1),
    )

    const tasks: any = []
    const enqueueMock = jest.fn((task) => tasks.push(task))
    const mockedNotify = jest.fn()

    const manager = portfolioBalanceManagerMaker(
      {
        tokenManager,
        storage,
        primaryTokenInfo: tokenMocks.primaryETH.info,
        sourceId,
      },
      {
        observer: {
          destroy: jest.fn(),
          notify: mockedNotify,
          subscribe: jest.fn(),
          unsubscribe: jest.fn(),
          observable: new BehaviorSubject({} as any).asObservable(),
        },
        queue: {
          enqueue: enqueueMock,
          destroy: jest.fn(),
          observable: new BehaviorSubject({}).asObservable(),
        } as any,
      },
    )

    const subscriber = jest.fn()
    manager.subscribe(subscriber)
    manager.hydrate()

    const secondaryBalances = new Map(
      tokenBalanceMocks.storage.entries1.slice(0, -1),
    )

    manager.syncBalances({
      primaryStated,
      secondaryBalances,
    })

    expect(enqueueMock).toHaveBeenCalled()
    expect(tasks.length).toBe(1)

    for (const task of tasks) {
      await task()
    }

    tasks.length = 0

    expect(manager.getPrimaryBreakdown()).toEqual(expect.anything())
    expect(manager.getBalances()).toEqual(expect.anything())

    expect(mockedNotify).toHaveBeenCalledTimes(2)

    tokenManager.sync.mockResolvedValue(
      new Map(tokenInfoMocks.storage.entries1.slice(0, 1)),
    )

    // simulate an update coming from another sync on token manager
    tokenManagerObservable.next({
      on: Portfolio.Event.ManagerOn.Sync,
      sourceId: 'another-source',
      ids: [tokenInfoMocks.nftCryptoKitty.id, tokenInfoMocks.rnftWhatever.id],
    })

    expect(tasks.length).toBeGreaterThan(0)

    for (const task of tasks) {
      await task()
    }
  })

  it('should refresh', async () => {
    tokenManager.sync.mockResolvedValue(
      new Map(tokenInfoMocks.storage.entries1),
    )

    const tasks: any = []
    const enqueueMock = jest.fn((task) => tasks.push(task))
    const mockedNotify = jest.fn()

    const manager = portfolioBalanceManagerMaker(
      {
        tokenManager,
        storage,
        primaryTokenInfo: tokenMocks.primaryETH.info,
        sourceId,
      },
      {
        observer: {
          destroy: jest.fn(),
          notify: mockedNotify,
          subscribe: jest.fn(),
          unsubscribe: jest.fn(),
          observable: new BehaviorSubject({} as any).asObservable(),
        },
        queue: {
          enqueue: enqueueMock,
          destroy: jest.fn(),
          observable: new BehaviorSubject({}).asObservable(),
        } as any,
      },
    )

    const subscriber = jest.fn()
    manager.subscribe(subscriber)

    const secondaryBalances = new Map(
      tokenBalanceMocks.storage.entries1.slice(0, -1),
    )

    manager.syncBalances({
      primaryStated,
      secondaryBalances,
    })

    manager.refresh()

    expect(enqueueMock).toHaveBeenCalled()
    expect(tasks.length).toBe(2)

    for (const task of tasks) {
      await task()
    }

    tasks.length = 0

    expect(manager.getPrimaryBreakdown()).toEqual(expect.anything())
    expect(manager.getBalances()).toEqual(expect.anything())

    expect(mockedNotify).toHaveBeenCalledTimes(2)
  })

  it('should sync', async () => {
    tokenManager.sync.mockResolvedValue(
      new Map(tokenInfoMocks.storage.entries1),
    )

    const tasks: any = []
    const enqueueMock = jest.fn((task) => tasks.push(task))
    const mockedNotify = jest.fn()

    const manager = portfolioBalanceManagerMaker(
      {
        tokenManager,
        storage,
        primaryTokenInfo: tokenMocks.primaryETH.info,
        sourceId,
      },
      {
        observer: {
          destroy: jest.fn(),
          notify: mockedNotify,
          subscribe: jest.fn(),
          unsubscribe: jest.fn(),
          observable: new BehaviorSubject({} as any).asObservable(),
        },
        queue: {
          enqueue: enqueueMock,
          destroy: jest.fn(),
          observable: new BehaviorSubject({}).asObservable(),
        } as any,
      },
    )

    const subscriber = jest.fn()
    manager.subscribe(subscriber)

    const secondaryBalances = new Map(
      tokenBalanceMocks.storage.entries1.slice(0, -1),
    )

    manager.hydrate()

    manager.syncBalances({
      primaryStated,
      secondaryBalances,
    })

    expect(enqueueMock).toHaveBeenCalled()
    expect(tasks.length).toBeGreaterThan(0)

    for (const task of tasks) {
      await task()
    }

    expect(manager.getPrimaryBreakdown()).toEqual(expect.anything())
    expect(manager.getBalances()).toEqual(expect.anything())

    expect(mockedNotify).toHaveBeenCalledTimes(2) // Hydrate + Sync
  })

  it('should throw error if token manager miss a token', async () => {
    // empty map, should never happen
    tokenManager.sync.mockResolvedValue(new Map())
    const tasks: any = []
    const enqueueMock = jest.fn((task) => tasks.push(task))
    const mockedNotify = jest.fn()

    const manager = portfolioBalanceManagerMaker(
      {
        tokenManager,
        storage,
        primaryTokenInfo: tokenMocks.primaryETH.info,
        sourceId,
      },
      {
        observer: {
          destroy: jest.fn(),
          notify: mockedNotify,
          subscribe: jest.fn(),
          unsubscribe: jest.fn(),
          observable: new BehaviorSubject({} as any).asObservable(),
        },
        queue: {
          enqueue: enqueueMock,
          destroy: jest.fn(),
          observable: new BehaviorSubject({}).asObservable(),
        } as any,
      },
    )

    const secondaryBalances: Readonly<
      Map<Portfolio.Token.Id, Portfolio.Token.Amount>
    > = new Map(tokenBalanceMocks.storage.entries1)

    manager.syncBalances({
      primaryStated,
      secondaryBalances,
    })

    expect(enqueueMock).toHaveBeenCalled()
    expect(tasks.length).toBeGreaterThan(0)

    for (const task of tasks) {
      await expect(() => task()).rejects.toThrow()
    }
  })
})

describe('clear', () => {
  const balanceStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>({
      path: '/tmp/balance/',
      id: 'balance',
    }),
  )
  const primaryBreakdownStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>({
      path: '/tmp/primary-balance-breakdown/',
      id: 'primary-breakdown',
    }),
  )
  const storage: Portfolio.Storage.Balance = portfolioBalanceStorageMaker({
    balanceStorage,
    primaryBreakdownStorage,
    primaryTokenId,
  })
  const tokenManager: Portfolio.Manager.Token = {
    destroy: jest.fn(),
    hydrate: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    observable$: new BehaviorSubject({} as any).asObservable(),
    sync: jest.fn().mockResolvedValue(new Map()),
    clear: jest.fn(),
    api: {
      tokenInfo: jest.fn(),
      tokenInfos: jest.fn(),
      tokenDiscovery: jest.fn(),
      tokenTraits: jest.fn(),
      tokenActivity: jest.fn(),
      tokenImageInvalidate: jest.fn(),
    },
  }

  afterEach(() => {
    storage.clear()
    tokenInfoStorage.clear()
  })

  it('should clear all data after syncing operations are complete', async () => {
    const tasks: any = []
    const enqueueMock = jest.fn((task) => tasks.push(task))
    const mockedNotify = jest.fn()

    const manager = portfolioBalanceManagerMaker(
      {
        tokenManager,
        storage,
        primaryTokenInfo: tokenMocks.primaryETH.info,
        sourceId,
      },
      {
        queue: {
          enqueue: enqueueMock,
          destroy: jest.fn(),
          observable: new BehaviorSubject({} as any).asObservable(),
        } as any,
        observer: {
          notify: mockedNotify,
          subscribe: jest.fn(),
          unsubscribe: jest.fn(),
          destroy: jest.fn(),
          observable: new BehaviorSubject({} as any).asObservable(),
        },
      },
    )

    manager.syncBalances({
      primaryStated: {
        totalFromTxs: 500n,
        lockedAsStorageCost: 100n,
      },
      secondaryBalances: new Map(),
    })

    manager.clear()

    expect(enqueueMock).toHaveBeenCalledTimes(2)

    for (const task of tasks) {
      await task()
    }

    expect(storage.balances.all()).toEqual([])
    expect(storage.primaryBreakdown.read()).toBeNull()

    expect(mockedNotify).toHaveBeenCalledWith({
      on: Portfolio.Event.ManagerOn.Clear,
      sourceId,
    })
  })
})
