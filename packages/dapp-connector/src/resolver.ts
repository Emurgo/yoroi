import {isKeyOf, isRecord, createTypeGuardFromSchema} from '@yoroi/common'
import {Storage} from './adapters/async-storage'
import {z} from 'zod'
import {Address, TransactionUnspentOutput, TransactionWitnessSet, Value} from '@emurgo/cross-csl-core'

type Context = {
  browserOrigin: string
  wallet: ResolverWallet
  trustedOrigin: string
  storage: Storage
  supportedExtensions: Array<{cip: number}>
}

type ResolvableMethod<T> = (params: unknown, context: Context) => Promise<T>

type Resolver = {
  logMessage: ResolvableMethod<void>
  enable: ResolvableMethod<boolean>
  isEnabled: ResolvableMethod<boolean>
  api: {
    getBalance: ResolvableMethod<string>
    getChangeAddress: ResolvableMethod<string>
    getNetworkId: ResolvableMethod<number>
    getRewardAddresses: ResolvableMethod<string[]>
    getUsedAddresses: ResolvableMethod<string[]>
    getExtensions: ResolvableMethod<Array<{cip: number}>>
    getUnusedAddresses: ResolvableMethod<string[]>
    getUtxos: ResolvableMethod<string[] | null>
    getCollateral: ResolvableMethod<string[] | null>
    submitTx: ResolvableMethod<string>
    signTx: ResolvableMethod<TransactionWitnessSet>
    signData: ResolvableMethod<{signature: string; key: string}>
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
    signTx: async (params: unknown, context: Context) => {
      assertOriginsMatch(context)
      await assertWalletAcceptedConnection(context)
      const tx =
        isRecord(params) && isKeyOf('args', params) && Array.isArray(params.args) && typeof params.args[0] === 'string'
          ? params.args[0]
          : undefined
      const partialSign =
        isRecord(params) && isKeyOf('args', params) && Array.isArray(params.args) && typeof params.args[1] === 'boolean'
          ? params.args[1]
          : undefined
      if (tx === undefined) throw new Error('Invalid params')
      return context.wallet.signTx(tx, partialSign ?? false)
    },
    signData: async (params: unknown, context: Context) => {
      assertOriginsMatch(context)
      await assertWalletAcceptedConnection(context)
      const address =
        isRecord(params) && isKeyOf('args', params) && Array.isArray(params.args) && typeof params.args[0] === 'string'
          ? params.args[0]
          : undefined
      const payload =
        isRecord(params) && isKeyOf('args', params) && Array.isArray(params.args) && typeof params.args[1] === 'string'
          ? params.args[1]
          : undefined
      if (address === undefined || payload === undefined) throw new Error('Invalid params')
      return context.wallet.signData(address, payload)
    },
    submitTx: async (params: unknown, context: Context) => {
      assertOriginsMatch(context)
      await assertWalletAcceptedConnection(context)
      if (
        !isRecord(params) ||
        !isKeyOf('args', params) ||
        !Array.isArray(params.args) ||
        typeof params.args[0] !== 'string'
      ) {
        throw new Error('Invalid params')
      }
      return context.wallet.submitTx(params.args[0])
    },
    getCollateral: async (params: unknown, context: Context) => {
      assertOriginsMatch(context)
      await assertWalletAcceptedConnection(context)
      const value =
        isRecord(params) && Array.isArray(params.args) && typeof params.args[0] === 'string'
          ? params.args[0]
          : undefined
      const result = await context.wallet.getCollateral(value)

      if (result === null || result.length === 0) return null

      return Promise.all(result.map((u) => u.toHex()))
    },

    getUnusedAddresses: async (_params: unknown, context: Context) => {
      assertOriginsMatch(context)
      await assertWalletAcceptedConnection(context)
      const addresses = await context.wallet.getUnusedAddresses()
      return Promise.all(addresses.map((a) => a.toHex()))
    },
    getExtensions: async (_params: unknown, context: Context) => {
      assertOriginsMatch(context)
      await assertWalletAcceptedConnection(context)
      return context.supportedExtensions
    },
    getBalance: async (params: unknown, context: Context) => {
      assertOriginsMatch(context)
      await assertWalletAcceptedConnection(context)
      if (!isGetBalanceParams(params)) throw new Error('Invalid params')
      const [tokenId = '*'] = params.args || []
      const balance = await context.wallet.getBalance(tokenId)
      return balance.toHex()
    },
    getChangeAddress: async (_params: unknown, context: Context) => {
      assertOriginsMatch(context)
      await assertWalletAcceptedConnection(context)
      const address = await context.wallet.getChangeAddress()
      return address.toHex()
    },
    getNetworkId: async (_params: unknown, context: Context) => {
      assertOriginsMatch(context)
      await assertWalletAcceptedConnection(context)
      return context.wallet.networkId
    },
    getRewardAddresses: async (_params: unknown, context: Context) => {
      assertOriginsMatch(context)
      await assertWalletAcceptedConnection(context)
      const addresses = await context.wallet.getRewardAddresses()
      return Promise.all(addresses.map((a) => a.toHex()))
    },
    getUtxos: async (params: unknown, context: Context) => {
      assertOriginsMatch(context)
      await assertWalletAcceptedConnection(context)
      const value =
        isRecord(params) && Array.isArray(params.args) && typeof params.args[0] === 'string'
          ? params.args[0]
          : undefined
      const pagination =
        isRecord(params) && Array.isArray(params.args) && isPaginationParams(params.args[1])
          ? params.args[1]
          : undefined
      const utxos = await context.wallet.getUtxos(value, pagination)
      if (utxos === null || utxos.length === 0) return null
      return Promise.all(utxos.map((u) => u.toHex()))
    },
    getUsedAddresses: async (params: unknown, context: Context) => {
      assertOriginsMatch(context)
      await assertWalletAcceptedConnection(context)
      const pagination =
        isRecord(params) && Array.isArray(params.args) && isPaginationParams(params.args[0])
          ? params.args[0]
          : undefined
      const addresses = await context.wallet.getUsedAddresses(pagination)
      return Promise.all(addresses.map((a) => a.toHex()))
    },
  },
} as const

const paginationSchema = z.object({page: z.number(), limit: z.number()})
const getBalanceSchema = z.object({args: z.array(z.string().optional())})
const isGetBalanceParams = createTypeGuardFromSchema(getBalanceSchema)
const isPaginationParams = createTypeGuardFromSchema(paginationSchema)

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
  trustedContext: {wallet: ResolverWallet; origin: string; storage: Storage; supportedExtensions: Array<{cip: number}>},
) => {
  const browserOrigin = String(params?.browserContext?.origin || '')

  const context: Context = {
    browserOrigin,
    wallet: trustedContext.wallet,
    trustedOrigin: trustedContext.origin,
    storage: trustedContext.storage,
    supportedExtensions: trustedContext.supportedExtensions,
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
  wallet: ResolverWallet,
  sendMessage: (id: string, result: unknown, error?: Error) => void,
  storage: Storage,
  supportedExtensions: Array<{cip: number}>,
) => {
  const trustedOrigin = new URL(trustedUrl).origin
  const {id, method, params} = JSON.parse(eventData)
  try {
    const result = await handleMethod(method, params, {origin: trustedOrigin, wallet, storage, supportedExtensions})
    if (method !== LOG_MESSAGE_EVENT) sendMessage(id, result)
  } catch (error) {
    sendMessage(id, null, error as Error)
  }
}

export type ResolverWallet = {
  id: string
  networkId: number
  confirmConnection: (dappOrigin: string) => Promise<boolean>
  getBalance: (tokenId?: string) => Promise<Value>
  getUnusedAddresses: () => Promise<Address[]>
  getUsedAddresses: (pagination?: Pagination) => Promise<Address[]>
  getChangeAddress: () => Promise<Address>
  getRewardAddresses: () => Promise<Address[]>
  getUtxos: (value?: string, pagination?: Pagination) => Promise<TransactionUnspentOutput[] | null>
  getCollateral: (value?: string) => Promise<TransactionUnspentOutput[] | null>
  submitTx: (cbor: string) => Promise<string>
  signTx: (txHex: string, partialSign?: boolean) => Promise<TransactionWitnessSet>
  signData: (address: string, payload: string) => Promise<{signature: string; key: string}>
}

type Pagination = {
  page: number
  limit: number
}

const LOG_MESSAGE_EVENT = 'log_message'
