import {Portfolio} from '@yoroi/types'
import {BehaviorSubject, Observable} from 'rxjs'

export const createTokenManagerMock = (
  tokenManagerObservable?: Observable<any>,
): jest.Mocked<Portfolio.Manager.Token> => ({
  destroy: jest.fn(),
  hydrate: jest.fn(),
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  observable$:
    tokenManagerObservable ?? new BehaviorSubject({} as any).asObservable(),
  sync: jest.fn().mockResolvedValue(new Map()),
  clear: jest.fn(),
  api: {
    tokenInfo: jest.fn(),
    tokenInfos: jest.fn(),
    tokenDiscovery: jest.fn(),
    tokenTraits: jest.fn(),
    tokenActivity: jest.fn(),
    tokenHistory: jest.fn(),
    tokenImageInvalidate: jest.fn(),
  },
})
