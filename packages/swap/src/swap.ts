import {Balance} from '@yoroi/types'
import {swapApiMaker} from './adapters/openswap-api/api-maker'
import {DexHunterApiMaker} from './adapters/dexhunter-api/api'
import {
  CancelRequest,
  CancelResponse,
  CreateRequest,
  CreateResponse,
  EstimateRequest,
  EstimateResponse,
  Order,
  OrdersRequest,
  OrdersResponse,
  TokensResponse,
} from './types'

export const SwapManagerMaker = ({
  address,
  stakingKey,
  dhPartnerId,
}: {
  address: string
  stakingKey: string
  dhPartnerId?: string
}) => {
  const dexhunter = DexHunterApiMaker(address, dhPartnerId)
  // TODO: actual openswap api maker refactor
  const openSwap = swapApiMaker({
    isMainnet: true,
    stakingKey,
    primaryTokenId: '.',
    supportedProviders: ['vyfi'],
  }) as unknown as ReturnType<typeof DexHunterApiMaker>

  const getOrders = async (request: OrdersRequest): Promise<OrdersResponse> => {
    const [dhResponse, osResponse] = await Promise.allSettled([
      dexhunter.getOrders(request),
      openSwap.getOrders(request),
    ])

    if (dhResponse.status === 'rejected' && osResponse.status === 'rejected')
      throw new Error(`${dhResponse.reason};${osResponse.reason}`)

    if (dhResponse.status === 'rejected' && osResponse.status === 'fulfilled')
      return osResponse.value

    if (dhResponse.status === 'fulfilled' && osResponse.status === 'rejected')
      return dhResponse.value

    if (dhResponse.status !== 'fulfilled' || osResponse.status !== 'fulfilled')
      throw new Error()

    const both = [...dhResponse.value.orders, ...osResponse.value.orders]

    const orders = Array.from(new Set(both.map((obj) => obj.id))).map((id) =>
      both.find((obj) => obj.id === id),
    ) as Order[]

    return {orders}
  }

  const cancelOrder = async (
    request: CancelRequest,
  ): Promise<CancelResponse> => {
    const [dhResponse, osResponse] = await Promise.allSettled([
      dexhunter.cancelOrder(request),
      openSwap.cancelOrder(request),
    ])

    if (dhResponse.status === 'rejected' && osResponse.status === 'rejected')
      throw new Error(`${dhResponse.reason};${osResponse.reason}`)

    if (osResponse.status === 'fulfilled') return osResponse.value

    if (dhResponse.status === 'fulfilled') return dhResponse.value

    throw new Error()
  }

  const getTokens = async (): Promise<TokensResponse> => {
    const [dhResponse, osResponse] = await Promise.allSettled([
      dexhunter.getTokens(),
      openSwap.getTokens(),
    ])

    if (dhResponse.status === 'rejected' && osResponse.status === 'rejected')
      throw new Error(`${dhResponse.reason};${osResponse.reason}`)

    if (dhResponse.status === 'rejected' && osResponse.status === 'fulfilled')
      return osResponse.value

    if (dhResponse.status === 'fulfilled' && osResponse.status === 'rejected')
      return dhResponse.value

    if (dhResponse.status !== 'fulfilled' || osResponse.status !== 'fulfilled')
      throw new Error()

    const both = [...dhResponse.value.tokens, ...osResponse.value.tokens]

    const tokens = Array.from(new Set(both.map((obj) => obj.id))).map((id) =>
      both.find((obj) => obj.id === id),
    ) as Balance.TokenInfo[]

    return {tokens}
  }

  const estimate = async (
    request: EstimateRequest,
  ): Promise<EstimateResponse> => {
    const [dhResponse, osResponse] = await Promise.allSettled([
      dexhunter.estimate(request),
      openSwap.estimate(request),
    ])

    if (dhResponse.status === 'rejected' && osResponse.status === 'rejected')
      throw new Error(`${dhResponse.reason};${osResponse.reason}`)

    if (dhResponse.status === 'rejected' && osResponse.status === 'fulfilled')
      return osResponse.value

    if (dhResponse.status === 'fulfilled' && osResponse.status === 'rejected')
      return dhResponse.value

    if (dhResponse.status !== 'fulfilled' || osResponse.status !== 'fulfilled')
      throw new Error()

    return dhResponse.value // TODO
  }

  const createOrder = async (
    request: CreateRequest,
  ): Promise<CreateResponse> => {
    const [dhResponse, osResponse] = await Promise.allSettled([
      dexhunter.createOrder(request),
      openSwap.createOrder(request),
    ])

    if (dhResponse.status === 'rejected' && osResponse.status === 'rejected')
      throw new Error(`${dhResponse.reason};${osResponse.reason}`)

    if (dhResponse.status === 'rejected' && osResponse.status === 'fulfilled')
      return osResponse.value

    if (dhResponse.status === 'fulfilled' && osResponse.status === 'rejected')
      return dhResponse.value

    if (dhResponse.status !== 'fulfilled' || osResponse.status !== 'fulfilled')
      throw new Error()

    return dhResponse.value // TODO
  }

  return {
    getOrders,
    cancelOrder,
    getTokens,
    estimate,
    createOrder,
  }
}
