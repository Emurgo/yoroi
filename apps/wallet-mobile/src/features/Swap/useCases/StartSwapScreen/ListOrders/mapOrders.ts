import {Pool} from '@yoroi/openswap'
import {Balance} from '@yoroi/types'
import {SwapCompletedOrder, SwapOpenOrder} from '@yoroi/types/lib/swap/order'
import {isString} from '@yoroi/wallets'
import BigNumber from 'bignumber.js'

import {NumberLocale} from '../../../../../i18n/languages'
import {TransactionInfo} from '../../../../../yoroi-wallets/types'
import {Quantities} from '../../../../../yoroi-wallets/utils'

const MAX_DECIMALS = 10

export const mapOrders = (
  orders: Array<SwapOpenOrder | SwapCompletedOrder>,
  tokenInfos: Balance.TokenInfo[],
  numberLocale: NumberLocale,
  transactionInfos: TransactionInfo[],
) => {
  return orders.map((order) => {
    const fromTokenInfo = tokenInfos.find((tokenInfo) => tokenInfo.id === order.from.tokenId)
    const toTokenInfo = tokenInfos.find((tokenInfo) => tokenInfo.id === order.to.tokenId)
    const id = `${order.from.tokenId}-${order.to.tokenId}-${order.utxo}`
    const fromLabel = fromTokenInfo?.ticker ?? fromTokenInfo?.name ?? '-'
    const toLabel = toTokenInfo?.ticker ?? toTokenInfo?.name ?? '-'
    const tokenAmount = BigNumber(Quantities.denominated(order.to.quantity, toTokenInfo?.decimals ?? 0))
      .decimalPlaces(MAX_DECIMALS)
      .toFormat({
        ...numberLocale,
      })
    const tokenPrice = BigNumber(
      Quantities.quotient(
        Quantities.denominated(order.from.quantity, fromTokenInfo?.decimals ?? 0),
        Quantities.denominated(order.to.quantity, toTokenInfo?.decimals ?? 0),
      ),
    )
      .decimalPlaces(MAX_DECIMALS)
      .toFormat(numberLocale)
    const txId = order.utxo.split('#')[0]
    const total = BigNumber(Quantities.denominated(order.from.quantity, fromTokenInfo?.decimals ?? 0)).toFormat(
      numberLocale,
    )
    const matchingTxInfo = transactionInfos.find((tx) => tx.id === txId)
    const submittedAt = matchingTxInfo?.submittedAt
    const txLink = `https://cardanoscan.io/transaction/${txId}`
    const date = isString(submittedAt) ? new Date(submittedAt).toISOString() : ''
    return {
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
      poolUrl: 'provider' in order ? getPoolUrl(order.provider) : undefined,
      fromTokenAmount: BigNumber(Quantities.denominated(order.from.quantity, fromTokenInfo?.decimals ?? 0)).toFormat(
        numberLocale,
      ),
    }
  })
}

const getPoolUrl = (provider: Pool['provider']) => {
  return poolUrls[provider] ?? poolUrls.muesliswap_v1
}

const poolUrls: Record<Pool['provider'], string> = {
  minswap: 'https://minswap.org',
  sundaeswap: 'https://sundae.fi',
  wingriders: 'https://www.wingriders.com',
  muesliswap_v1: 'https://muesliswap.com',
  muesliswap_v2: 'https://muesliswap.com',
  muesliswap_v3: 'https://muesliswap.com',
  muesliswap_v4: 'https://muesliswap.com',
}
