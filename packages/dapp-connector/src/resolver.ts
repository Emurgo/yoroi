import {isKeyOf, isRecord} from '@yoroi/common'
import {mockedData, mockWalletId1} from './mocks'
import {Storage} from './adapters/async-storage'

type Context = {
  browserOrigin: string
  wallet: Wallet
  trustedOrigin: string
  storage: Storage
}

type ResolvableMethod<T> = (params: unknown, context: Context) => Promise<T>

type Resolver = {
  logMessage: ResolvableMethod<void>
  enable: ResolvableMethod<boolean>
  isEnabled: ResolvableMethod<boolean>
  api: {
    getBalance: ResolvableMethod<string>
    getChangeAddresses: ResolvableMethod<string[]>
    getNetworkId: ResolvableMethod<number>
    getRewardAddresses: ResolvableMethod<string[]>
    getUsedAddresses: ResolvableMethod<string[]>
  }
}

export const resolver: Resolver = {
  logMessage: async (params) => {
    if (isRecord(params) && isKeyOf('args', params) && Array.isArray(params.args)) {
      console.log('Log From Dapp Connector:', ...params.args)
    }
  },
  enable: async (_params: unknown, context: Context) => {
    assertOriginsMatch(context)
    if (await hasWalletAcceptedConnection(context)) return true
    const manualAccept = await context.wallet.confirmConnection(context.trustedOrigin)
    if (!manualAccept) return false
    await context.storage.save({walletId: context.wallet.id, dappOrigin: context.trustedOrigin})
    return true
  },
  isEnabled: async (_params: unknown, context: Context) => {
    assertOriginsMatch(context)
    return hasWalletAcceptedConnection(context)
  },
  api: {
    getBalance: async (_params: unknown, context: Context) => {
      assertOriginsMatch(context)
      await assertWalletAcceptedConnection(context)
      return mockedData[mockWalletId1].balance
    },
    getChangeAddresses: async (_params: unknown, context: Context) => {
      assertOriginsMatch(context)
      await assertWalletAcceptedConnection(context)
      return mockedData[mockWalletId1].changeAddresses
    },
    getNetworkId: async (_params: unknown, context: Context) => {
      assertOriginsMatch(context)
      await assertWalletAcceptedConnection(context)
      return context.wallet.networkId
    },
    getRewardAddresses: async (_params: unknown, context: Context) => {
      assertOriginsMatch(context)
      await assertWalletAcceptedConnection(context)
      return mockedData[mockWalletId1].rewardAddresses
    },
    getUsedAddresses: async (_params: unknown, context: Context) => {
      assertOriginsMatch(context)
      await assertWalletAcceptedConnection(context)
      return mockedData[mockWalletId1].usedAddresses
    },
  },
} as const

const assertOriginsMatch = (context: Context) => {
  if (context.browserOrigin !== context.trustedOrigin) {
    throw new Error(`Origins do not match: ${context.browserOrigin} !== ${context.trustedOrigin}`)
  }
}

const assertWalletAcceptedConnection = async (context: Context) => {
  if (!(await hasWalletAcceptedConnection(context))) {
    throw new Error(`Wallet ${context.wallet.id} has not accepted the connection to ${context.trustedOrigin}`)
  }
}

const hasWalletAcceptedConnection = async (context: Context) => {
  const connections = await context.storage.read()
  const requestedConnection = {walletId: context.wallet.id, dappOrigin: context.trustedOrigin}
  return connections.some(
    (c) => c.walletId === requestedConnection.walletId && c.dappOrigin === requestedConnection.dappOrigin,
  )
}

const handleMethod = async (
  method: string,
  params: {browserContext?: {origin?: unknown}},
  trustedContext: {wallet: Wallet; origin: string; storage: Storage},
) => {
  const browserOrigin = String(params?.browserContext?.origin || '')

  const context: Context = {
    browserOrigin,
    wallet: trustedContext.wallet,
    trustedOrigin: trustedContext.origin,
    storage: trustedContext.storage,
  }

  if (method === 'cardano_enable') {
    return resolver.enable(params, context)
  }

  if (method === 'cardano_is_enabled') {
    return resolver.isEnabled(params, context)
  }

  if (method === LOG_MESSAGE_EVENT) {
    return resolver.logMessage(params, context)
  }

  if (method.startsWith('api.')) {
    const methodParts = method.split('.')
    if (methodParts.length !== 2) throw new Error(`Invalid method ${method}`)
    const apiMethod = methodParts[1]
    if (!isKeyOf(apiMethod, resolver.api)) throw new Error(`Unknown method ${method}`)
    return resolver.api[apiMethod](params, context)
  }

  throw new Error(`Unknown method '${method}' with params ${JSON.stringify(params)}`)
}

export const resolverHandleEvent = async (
  eventData: string,
  trustedUrl: string,
  wallet: Wallet,
  sendMessage: (id: string, result: unknown, error?: Error) => void,
  storage: Storage,
) => {
  const trustedOrigin = new URL(trustedUrl).origin
  const {id, method, params} = JSON.parse(eventData)
  try {
    const result = await handleMethod(method, params, {origin: trustedOrigin, wallet, storage})
    if (method !== LOG_MESSAGE_EVENT) sendMessage(id, result)
  } catch (error) {
    if (method !== LOG_MESSAGE_EVENT && error instanceof Error) sendMessage(id, null, error)
  }
}

type Wallet = {
  id: string
  networkId: number
  confirmConnection: (dappOrigin: string) => Promise<boolean>
}

const LOG_MESSAGE_EVENT = 'log_message'
