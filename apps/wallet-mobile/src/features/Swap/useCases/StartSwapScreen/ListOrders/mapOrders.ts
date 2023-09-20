import {getPoolUrlByProvider} from '@yoroi/swap'
import {Balance} from '@yoroi/types'
import {BalanceAmount, BalanceCardanoMetadatas} from '@yoroi/types/lib/balance/token'
import {SwapCompletedOrder, SwapOpenOrder} from '@yoroi/types/lib/swap/order'
import {SwapPoolProvider} from '@yoroi/types/lib/swap/pool'
import {BalanceTokenInfo} from '@yoroi/types/src/balance/token'
import {isString} from '@yoroi/wallets'
import BigNumber from 'bignumber.js'

import {NumberLocale} from '../../../../../i18n/languages'
import {TransactionInfo} from '../../../../../yoroi-wallets/types'
import {Quantities} from '../../../../../yoroi-wallets/utils'

const MAX_DECIMALS = 10

export type MappedOrder = {
  owner: unknown
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
  toTokenInfo: BalanceTokenInfo<BalanceCardanoMetadatas> | undefined
  provider: SwapPoolProvider | undefined
  poolUrl: string | undefined
  fromTokenInfo: BalanceTokenInfo<BalanceCardanoMetadatas> | undefined
  fromTokenAmount: string
  from: BalanceAmount
  to: BalanceAmount
}

export const mapOrders = (
  orders: Array<SwapOpenOrder | SwapCompletedOrder>,
  tokenInfos: Balance.TokenInfo[],
  numberLocale: NumberLocale,
  transactionInfos: TransactionInfo[],
): Array<MappedOrder> => {
  if (orders.length === 0) return []

  return orders.map((order: SwapOpenOrder | SwapCompletedOrder) => {
    const {from, to} = order
    const [txIdOpen] = 'utxo' in order ? order.utxo.split('#', 1) : [undefined]
    const txIdComplete = 'txHash' in order ? order.txHash : undefined
    const txId = txIdComplete ?? txIdOpen ?? ''
    const id = `${from.tokenId}-${to.tokenId}-${txId}`
    const txLink = `https://cardanoscan.io/transaction/${txId}` // FIX: this should come from the wallet (preprod/mainnet) explorers

    const txInfo = transactionInfos.find((tx) => tx.id === txId)
    const submittedAt = txInfo?.submittedAt
    const date = isString(submittedAt) ? new Date(submittedAt).toISOString() : ''

    const fromTokenInfo = tokenInfos.find((tokenInfo) => tokenInfo.id === order.from.tokenId)
    const fromLabel = fromTokenInfo?.ticker ?? fromTokenInfo?.name ?? '-'
    const total = BigNumber(Quantities.denominated(from.quantity, fromTokenInfo?.decimals ?? 0)).toFormat(numberLocale)

    const toTokenInfo = tokenInfos.find((tokenInfo) => tokenInfo.id === order.to.tokenId)
    const toLabel = toTokenInfo?.ticker ?? toTokenInfo?.name ?? '-'
    const tokenAmount = BigNumber(Quantities.denominated(to.quantity, toTokenInfo?.decimals ?? 0))
      .decimalPlaces(MAX_DECIMALS)
      .toFormat({
        ...numberLocale,
      })
    const tokenPrice = BigNumber(
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
      fromTokenAmount: BigNumber(Quantities.denominated(order.from.quantity, fromTokenInfo?.decimals ?? 0)).toFormat(
        numberLocale,
      ),
      from,
      to,
    }
  })
}
