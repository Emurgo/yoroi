import {atomicBreakdown, isString} from '@yoroi/common'
import {getPoolUrlByProvider} from '@yoroi/swap'
import {Explorers, Portfolio, Swap} from '@yoroi/types'

import {NumberLocale} from '../../../../../kernel/i18n/languages'
import {TransactionInfo} from '../../../../../yoroi-wallets/types'

export const MAX_DECIMALS = 10

export type MappedOpenOrder = {
  owner: string | undefined
  utxo: string | undefined
  tokenPrice: string
  tokenAmount: string
  id: string
  assetFromLabel: string
  assetToLabel: string
  date: string
  txId: string
  total: string
  txLink: string
  toTokenInfo: Portfolio.Token.Info | undefined
  provider: Swap.PoolProvider | undefined
  poolUrl: string | undefined
  fromTokenInfo: Portfolio.Token.Info | undefined
  fromTokenAmount: string
  from: {
    tokenId: Portfolio.Token.Id
    quantity: bigint
  }
  to: {
    tokenId: Portfolio.Token.Id
    quantity: bigint
  }
}

export const mapOpenOrders = (
  orders: Array<Swap.OpenOrder | Swap.CompletedOrder>,
  tokenInfos: Portfolio.Token.Info[],
  numberLocale: NumberLocale,
  transactionInfos: TransactionInfo[],
  explorerManager: Explorers.Manager,
): Array<MappedOpenOrder> => {
  if (orders.length === 0) return []

  return orders.map((order: Swap.OpenOrder | Swap.CompletedOrder) => {
    const {from, to} = order
    const [txIdOpen] = 'utxo' in order ? order.utxo.split('#', 1) : [undefined]
    const txIdComplete = 'txHash' in order ? order.txHash : undefined
    const txId = txIdComplete ?? txIdOpen ?? ''
    const id = `${from.tokenId}-${to.tokenId}-${txId}`
    const txLink = explorerManager.tx(txId)

    const txInfo = transactionInfos.find((tx) => tx.id === txId)
    const submittedAt = txInfo?.submittedAt
    const date = isString(submittedAt) ? new Date(submittedAt).toISOString() : ''

    const fromTokenInfo = tokenInfos.find((tokenInfo) => tokenInfo.id === order.from.tokenId)
    const fromLabel = fromTokenInfo?.ticker ?? fromTokenInfo?.name ?? '-'
    const fromQuantity = atomicBreakdown(from.quantity, fromTokenInfo?.decimals ?? 0).bn
    const total = fromQuantity.toFormat(numberLocale)

    const toTokenInfo = tokenInfos.find((tokenInfo) => tokenInfo.id === order.to.tokenId)
    const toLabel = toTokenInfo?.ticker ?? toTokenInfo?.name ?? '-'
    const toQuantity = atomicBreakdown(to.quantity, toTokenInfo?.decimals ?? 0).bn
    const tokenAmount = toQuantity.decimalPlaces(MAX_DECIMALS).toFormat(numberLocale)
    const tokenPrice = toQuantity.isZero()
      ? '0'
      : fromQuantity.dividedBy(toQuantity).decimalPlaces(MAX_DECIMALS).toFormat(numberLocale)

    return {
      owner: 'owner' in order ? order.owner : undefined,
      utxo: 'utxo' in order ? order.utxo : undefined,
      tokenPrice,
      tokenAmount,
      id,
      assetFromLabel: fromLabel,
      assetToLabel: toLabel,
      date,
      txId,
      total,
      txLink,
      fromTokenInfo,
      toTokenInfo,
      provider: 'provider' in order ? order.provider : undefined,
      poolUrl: 'provider' in order ? getPoolUrlByProvider(order.provider) : undefined,
      fromTokenAmount: total,
      from,
      to,
    }
  })
}
