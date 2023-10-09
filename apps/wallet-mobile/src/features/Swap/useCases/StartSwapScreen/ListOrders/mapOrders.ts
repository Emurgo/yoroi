import {isString} from '@yoroi/common'
import {isNonNullable} from '@yoroi/common'
import {getPoolUrlByProvider} from '@yoroi/swap'
import {Balance, Swap} from '@yoroi/types'
import BigNumber from 'bignumber.js'

import {NumberLocale} from '../../../../../i18n/languages'
import {NETWORK_CONFIG} from '../../../../../yoroi-wallets/cardano/constants/mainnet/constants'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {useTokenInfo} from '../../../../../yoroi-wallets/hooks'
import {TransactionInfo} from '../../../../../yoroi-wallets/types'
import {asQuantity, Quantities} from '../../../../../yoroi-wallets/utils'

const MAX_DECIMALS = 10

export type MappedCompleteOrder = {
  id: string
  provider: Swap.PoolProvider
  date: string
  tokenPrice: string
  sellLabel: string
  sellQuantity: string
  sellTokenId: string
  buyLabel: string
  buyQuantity: string
  buyTokenId: string
  txLink: string
}
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
  toTokenInfo: Balance.TokenInfo | undefined
  provider: Swap.PoolProvider | undefined
  poolUrl: string | undefined
  fromTokenInfo: Balance.TokenInfo | undefined
  fromTokenAmount: string
  from: Balance.Amount
  to: Balance.Amount
}

export const mapCompletedOrders = (orders: TransactionInfo[], wallet: YoroiWallet): Array<MappedCompleteOrder> => {
  if (orders.length === 0) return []
  const result = orders
    .map((order) => {
      let metadata: {
        buyTokenId: string
        sellTokenId: string
        sellQuantity: Balance.Quantity
        buyQuantity: Balance.Quantity
        provider: Swap.SupportedProvider
      }

      try {
        metadata = JSON.parse(order.metadata as string)

        const buyTokenInfo = useTokenInfo({wallet, tokenId: metadata.buyTokenId})
        const sellTokenInfo = useTokenInfo({wallet, tokenId: metadata.sellTokenId})

        const buyLabel = buyTokenInfo?.ticker ?? buyTokenInfo?.name ?? '-'
        const sellLabel = sellTokenInfo?.ticker ?? sellTokenInfo?.name ?? '-'

        const txLink = NETWORK_CONFIG.EXPLORER_URL_FOR_TX(order.id)
        const tokenPrice = asQuantity(new BigNumber(metadata.sellQuantity).dividedBy(metadata.buyQuantity).toString())

        const formattedBuyQuantity = Quantities.format(metadata.buyQuantity, buyTokenInfo.decimals ?? 0)
        const formattedSellQuantity = Quantities.format(metadata.sellQuantity, sellTokenInfo.decimals ?? 0)

        return {
          id: order.id,
          provider: metadata.provider,
          date: order?.lastUpdatedAt,
          sellLabel,
          sellQuantity: formattedSellQuantity,
          sellTokenId: sellTokenInfo.id,
          buyLabel,
          buyQuantity: formattedBuyQuantity,
          buyTokenId: buyTokenInfo.id,
          txLink,
          tokenPrice: Quantities.format(tokenPrice, sellTokenInfo.decimals ?? 0, MAX_DECIMALS),
        }
      } catch (error) {
        console.error('Error parsing JSON: ', error)
        return null
      }
    })
    .filter(isNonNullable)

  return result
}

export const mapOpenOrders = (
  orders: Array<Swap.OpenOrder | Swap.CompletedOrder>,
  tokenInfos: Balance.TokenInfo[],
  numberLocale: NumberLocale,
  transactionInfos: TransactionInfo[],
): Array<MappedOpenOrder> => {
  if (orders.length === 0) return []

  return orders.map((order: Swap.OpenOrder | Swap.CompletedOrder) => {
    const {from, to} = order
    const [txIdOpen] = 'utxo' in order ? order.utxo.split('#', 1) : [undefined]
    const txIdComplete = 'txHash' in order ? order.txHash : undefined
    const txId = txIdComplete ?? txIdOpen ?? ''
    const id = `${from.tokenId}-${to.tokenId}-${txId}`
    const txLink = NETWORK_CONFIG.EXPLORER_URL_FOR_TX(txId)

    const txInfo = transactionInfos.find((tx) => tx.id === txId)
    const submittedAt = txInfo?.submittedAt
    const date = isString(submittedAt) ? new Date(submittedAt).toISOString() : ''

    const fromTokenInfo = tokenInfos.find((tokenInfo) => tokenInfo.id === order.from.tokenId)
    const fromLabel = fromTokenInfo?.ticker ?? fromTokenInfo?.name ?? '-'
    const total = new BigNumber(Quantities.denominated(from.quantity, fromTokenInfo?.decimals ?? 0)).toFormat(
      numberLocale,
    )

    const toTokenInfo = tokenInfos.find((tokenInfo) => tokenInfo.id === order.to.tokenId)
    const toLabel = toTokenInfo?.ticker ?? toTokenInfo?.name ?? '-'
    const tokenAmount = new BigNumber(Quantities.denominated(to.quantity, toTokenInfo?.decimals ?? 0))
      .decimalPlaces(MAX_DECIMALS)
      .toFormat({
        ...numberLocale,
      })
    const tokenPrice = new BigNumber(
      Quantities.quotient(
        Quantities.denominated(from.quantity, fromTokenInfo?.decimals ?? 0),
        Quantities.denominated(to.quantity, toTokenInfo?.decimals ?? 0),
      ),
    )
      .decimalPlaces(MAX_DECIMALS)
      .toFormat(numberLocale)

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
      fromTokenAmount: new BigNumber(
        Quantities.denominated(order.from.quantity, fromTokenInfo?.decimals ?? 0),
      ).toFormat(numberLocale),
      from,
      to,
    }
  })
}
