import {Balance} from '@yoroi/types'
import {SwapOrder} from '@yoroi/types/lib/swap/order'
import {isString} from '@yoroi/wallets'
import BigNumber from 'bignumber.js'
import React from 'react'

import {NumberLocale} from '../../../../../i18n/languages'
import {TransactionInfo} from '../../../../../yoroi-wallets/types'
import {Quantities} from '../../../../../yoroi-wallets/utils'

export type OrderProps = {
  tokenPrice: string
  tokenAmount: string
  assetFromLabel: string
  assetFromIcon: React.ReactNode
  assetToLabel: string
  assetToIcon: React.ReactNode
  date: string
  liquidityPoolIcon: React.ReactNode
  liquidityPoolName: string
  txId: string
  total: string
  poolUrl: string
  txLink: string
}

export const mapOrders = (
  orders: Array<SwapOrder>,
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
    const tokenAmount = BigNumber(Quantities.denominated(order.to.quantity, toTokenInfo?.decimals ?? 0)).toFormat(
      numberLocale,
    )
    const tokenPrice = BigNumber(
      Quantities.quotient(
        Quantities.denominated(order.from.quantity, fromTokenInfo?.decimals ?? 0),
        Quantities.denominated(order.to.quantity, toTokenInfo?.decimals ?? 0),
      ),
    ).toFormat(numberLocale)
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
      provider: order.provider,
      poolUrl: `https://google.com`, // TODO: get pool url from order.provider
    }
  })
}
