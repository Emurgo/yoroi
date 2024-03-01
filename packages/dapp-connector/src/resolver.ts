import {isKeyOf, isRecord} from '@yoroi/common'
import {mockedData} from './mocks'

type Context = {
  browserOrigin: string
  walletId: string
  trustedOrigin: string
}

type ResolvableMethod<T> = (params: unknown, context: Context) => Promise<T>

type Resolver = {
  logMessage: ResolvableMethod<void>
  enable: ResolvableMethod<boolean>
  isEnabled: ResolvableMethod<boolean>
  api: {
    getBalance: ResolvableMethod<number>
    getChangeAddresses: ResolvableMethod<string[]>
    getNetworkId: ResolvableMethod<number>
    getRewardAddresses: ResolvableMethod<string[]>
    getUsedAddresses: ResolvableMethod<string[]>
  }
}

export const resolver: Resolver = {
  logMessage: async (params) => {
    if (isRecord(params) && isKeyOf('args', params) && Array.isArray(params.args)) {
      console.log('Log From WebView:', ...params.args)
    }
  },
  enable: async (_params: unknown, context: Context) => {
    assertOriginsMatch(context)
    return hasWalletAcceptedConnection(context.walletId)
  },
  isEnabled: async (_params: unknown, context: Context) => {
    assertOriginsMatch(context)
    return hasWalletAcceptedConnection(context.walletId)
  },
  api: {
    getBalance: (_params: unknown, context: Context) => {
      assertOriginsMatch(context)
      assertWalletAcceptedConnection(context)
      return (mockedData as any)[context.walletId]?.balance
    },
    getChangeAddresses: (_params: unknown, context: Context) => {
      assertOriginsMatch(context)
      assertWalletAcceptedConnection(context)
      return (mockedData as any)[context.walletId]?.changeAddresses
    },
    getNetworkId: (_params: unknown, context: Context) => {
      assertOriginsMatch(context)
      assertWalletAcceptedConnection(context)
      return (mockedData as any)[context.walletId]?.networkId
    },
    getRewardAddresses: (_params: unknown, context: Context) => {
      assertOriginsMatch(context)
      assertWalletAcceptedConnection(context)
      return (mockedData as any)[context.walletId]?.rewardAddresses
    },
    getUsedAddresses: (_params: unknown, context: Context) => {
      assertOriginsMatch(context)
      assertWalletAcceptedConnection(context)
      return (mockedData as any)[context.walletId]?.usedAddresses
    },
  },
} as const

const assertOriginsMatch = (context: Context) => {
  if (context.browserOrigin !== context.trustedOrigin) {
    throw new Error(`Origins do not match: ${context.browserOrigin} !== ${context.trustedOrigin}`)
  }
}

const assertWalletAcceptedConnection = (context: Context) => {
  if (!hasWalletAcceptedConnection(context.walletId)) {
    throw new Error(`Wallet ${context.walletId} has not accepted the connection`)
  }
}

const hasWalletAcceptedConnection = (walletId: string) => walletId in mockedData

const handleMethod = async (
  method: string,
  params: {browserContext?: {origin?: unknown}},
  trustedContext: {walletId: string; origin: string},
) => {
  const browserOrigin = String(params?.browserContext?.origin || '')

  const context: Context = {
    browserOrigin,
    walletId: trustedContext.walletId,
    trustedOrigin: trustedContext.origin,
  }

  if (method === 'cardano_enable') {
    return resolver.enable(params, context)
  }

  if (method === 'cardano_is_enabled') {
    return resolver.isEnabled(params, context)
  }

  if (method === 'log_message') {
    return resolver.logMessage(params, context)
  }

  if (method.startsWith('api.')) {
    const methodParts = method.split('.')
    if (methodParts.length !== 2) throw new Error(`Invalid method ${method}`)
    const apiMethod = methodParts[1]
    if (!isKeyOf(apiMethod, resolver.api)) throw new Error(`Unknown method ${method}`)
    return resolver.api[apiMethod](params, context)
  }

  console.log('unknown method', method, params)
  throw new Error(`Unknown method '${method}' with params ${JSON.stringify(params)}`)
}

export const handleEvent = async (
  eventData: string,
  trustedUrl: string,
  walletId: string,
  sendMessage: (id: string, result: unknown, error?: Error) => void,
) => {
  const trustedOrigin = new URL(trustedUrl).origin

  const {id, method, params} = JSON.parse(eventData)
  handleMethod(method, params, {origin: trustedOrigin, walletId})
    .then((result) => method !== 'log_message' && sendMessage(id, result))
    .catch((error) => method !== 'log_message' && sendMessage(id, null, error))
}
