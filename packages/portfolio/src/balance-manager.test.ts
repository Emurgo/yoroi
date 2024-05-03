import {Portfolio} from '@yoroi/types'
import {BehaviorSubject} from 'rxjs'
import {mountMMKVStorage, observableStorageMaker} from '@yoroi/common'

import {portfolioBalanceManagerMaker} from './balance-manager'
import {tokenBalanceMocks} from './adapters/token-balance.mocks'
import {sortTokenBalances} from './helpers/sorting'
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
  })
  const tokenManager: Portfolio.Manager.Token = {
    destroy: jest.fn(),
    hydrate: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    observable: new BehaviorSubject({} as any).asObservable(),
    sync: jest.fn().mockResolvedValue(new Map()),
  }

  it('should be instantiated', () => {
    const manager = portfolioBalanceManagerMaker({
      tokenManager,
      storage,
      primaryToken: tokenMocks.managerMaker.primaryToken,
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
  })
  const tokenManager: Portfolio.Manager.Token = {
    destroy: jest.fn(),
    hydrate: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    observable: new BehaviorSubject({} as any).asObservable(),
    sync: jest.fn().mockResolvedValue(new Map()),
  }

  afterEach(() => {
    storage.clear()
    tokenInfoStorage.clear()
  })

  const primaryBalance: Readonly<Portfolio.BalancePrimaryBreakdown> = {
    info: tokenMocks.managerMaker.primaryToken.info,
    balance: BigInt(1000000),
    lockedInBuiltTxs: BigInt(0),
    minRequiredByTokens: BigInt(0),
    records: [],
  }

  storage.primaryBalanceBreakdown.save(primaryBalance)
  storage.balances.save(tokenBalanceMocks.storage.entries1)

  it('should hydrate data', async () => {
    tokenInfoStorage.multiSet(tokenInfoMocks.storage.entries1)
    const manager = portfolioBalanceManagerMaker({
      tokenManager,
      storage,
      primaryToken: tokenMocks.managerMaker.primaryToken,
      sourceId,
    })
    const subscriber = jest.fn()
    manager.subscribe(subscriber)
    const sorted = sortTokenBalances({
      primaryTokenInfo: tokenMocks.managerMaker.primaryToken.info,
      tokenBalances: [
        ...new Map(tokenBalanceMocks.storage.entries1WithPrimary).values(),
      ],
    })
    const sortedBalances = {
      all: sorted,
      fts: sorted.filter(({info}) => isFt(info)),
      nfts: sorted.filter(({info}) => isNft(info)),
    }

    manager.hydrate()

    expect(manager.getPrimaryBreakdown()).toEqual(primaryBalance)
    expect(manager.getBalances()).toEqual(sortedBalances)

    expect(subscriber).toHaveBeenCalledTimes(1)
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
  })
  const tokenManagerObservable = new BehaviorSubject({} as any).asObservable()
  const tokenManager: jest.Mocked<Portfolio.Manager.Token> = {
    destroy: jest.fn(),
    hydrate: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    observable: tokenManagerObservable,
    sync: jest.fn().mockResolvedValue(new Map()),
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
        primaryToken: tokenMocks.managerMaker.primaryToken,
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
  })
  const tokenManagerObservable = new BehaviorSubject({} as any)
  const tokenManager: jest.Mocked<Portfolio.Manager.Token> = {
    destroy: jest.fn(),
    hydrate: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    observable: tokenManagerObservable.asObservable(),
    sync: jest.fn().mockResolvedValue(new Map()),
  }

  afterEach(() => {
    storage.clear()
    tokenInfoStorage.clear()
  })

  const primaryBalance: Readonly<Portfolio.BalancePrimaryBreakdown> = {
    info: tokenMocks.managerMaker.primaryToken.info,
    balance: BigInt(1000000),
    lockedInBuiltTxs: BigInt(0),
    minRequiredByTokens: BigInt(0),
    records: [],
  }

  it('should sync (+hydrate)', async () => {
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
        primaryToken: tokenMocks.managerMaker.primaryToken,
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

    manager.sync({
      primaryBalance,
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

    expect(mockedNotify).toHaveBeenCalledTimes(2) // Hydrate + Sync

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
        primaryToken: tokenMocks.managerMaker.primaryToken,
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

    manager.sync({
      primaryBalance,
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

    expect(mockedNotify).toHaveBeenCalledTimes(3) // Hydrate + Sync
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
        primaryToken: tokenMocks.managerMaker.primaryToken,
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

    manager.sync({
      primaryBalance,
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
        primaryToken: tokenMocks.managerMaker.primaryToken,
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
      Map<Portfolio.Token.Id, Portfolio.Token.Balance>
    > = new Map(tokenBalanceMocks.storage.entries1)

    manager.sync({
      primaryBalance,
      secondaryBalances,
    })

    expect(enqueueMock).toHaveBeenCalled()
    expect(tasks.length).toBeGreaterThan(0)

    for (const task of tasks) {
      await expect(() => task()).rejects.toThrow()
    }
  })
})