import {isNonNullable} from '@yoroi/common'
import {infoExtractName} from '@yoroi/portfolio'
import * as _ from 'lodash'

import {useTokenInfos} from '../../../yoroi-wallets/hooks'
import {asQuantity} from '../../../yoroi-wallets/utils'
import {formatAdaWithText, formatTokenWithText} from '../../../yoroi-wallets/utils/format'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {TransactionBody} from './types'

export const useFormattedTransaction = (data: TransactionBody) => {
  const {wallet} = useSelectedWallet()

  const inputs = data?.inputs ?? []
  const outputs = data?.outputs ?? []

  const getUtxoByTxIdAndIndex = (txId: string, index: number) => {
    return wallet.utxos.find((u) => u.tx_hash === txId && u.tx_index === index)
  }

  const isOwnedAddress = (bech32Address: string) => {
    return wallet.internalAddresses.includes(bech32Address) || wallet.externalAddresses.includes(bech32Address)
  }

  const inputTokenIds = inputs.flatMap((i) => {
    const receiveUTxO = getUtxoByTxIdAndIndex(i.transaction_id, i.index)
    return receiveUTxO?.assets.map((a) => `${a.policyId}.${a.assetId}`) ?? []
  })

  const outputTokenIds = outputs.flatMap((o) => {
    if (!o.amount.multiasset) return []
    const policyIds = Object.keys(o.amount.multiasset)
    const tokenIds = policyIds.flatMap((policyId) => {
      const assetIds = Object.keys(o.amount.multiasset?.[policyId] ?? {})
      return assetIds.map((assetId) => `${policyId}.${assetId}`)
    })
    return tokenIds
  })

  const tokenIds = _.uniq([...inputTokenIds, ...outputTokenIds])
  const tokenInfos = useTokenInfos({wallet, tokenIds})

  const formattedInputs = inputs.map((input) => {
    const receiveUTxO = getUtxoByTxIdAndIndex(input.transaction_id, input.index)
    const address = receiveUTxO?.receiver
    const coin = receiveUTxO?.amount != null ? asQuantity(receiveUTxO.amount) : null
    const coinText = coin != null ? formatAdaWithText(coin, wallet.primaryToken) : null

    const primaryAssets =
      coinText != null
        ? [
            {
              label: coinText,
              quantity: coin,
              isPrimary: true,
            },
          ]
        : []

    const multiAssets =
      receiveUTxO?.assets
        .map((a) => {
          const tokenInfo = tokenInfos.find((t) => t.id === a.assetId)
          if (!tokenInfo) return null
          const quantity = asQuantity(a.amount)
          return {
            label: formatTokenWithText(quantity, tokenInfo),
            quantity,
            isPrimary: false,
          }
        })
        .filter(Boolean) ?? []

    return {
      assets: [...primaryAssets, ...multiAssets].filter(isNonNullable),
      address,
      ownAddress: address != null && isOwnedAddress(address),
      txIndex: input.index,
      txHash: input.transaction_id,
    }
  })

  const formattedOutputs = outputs.map((output) => {
    const address = output.address
    const coin = asQuantity(output.amount.coin)
    const coinText = formatAdaWithText(coin, wallet.primaryToken)

    const primaryAssets =
      coinText != null
        ? [
            {
              label: coinText,
              quantity: coin,
              isPrimary: true,
            },
          ]
        : []

    const multiAssets = output.amount.multiasset
      ? Object.entries(output.amount.multiasset).map(([policyId, assets]) => {
          return Object.entries(assets).map(([assetId, amount]) => {
            const tokenInfo = tokenInfos.find((t) => t.id === `${policyId}.${assetId}`)
            if (tokenInfo == null) return null
            const quantity = asQuantity(amount)
            return {
              name: infoExtractName(tokenInfo),
              quantity,
              isPrimary: false,
            }
          })
        })
      : []

    const assets = [...primaryAssets, ...multiAssets.flat()].filter(isNonNullable)
    return {assets, address, ownAddress: address != null && isOwnedAddress(address)}
  })

  const formattedFee = formatAdaWithText(asQuantity(data?.fee ?? '0'), wallet.primaryToken)

  return {inputs: formattedInputs, outputs: formattedOutputs, fee: formattedFee}
}

export type formattedTx = ReturnType<typeof useFormattedTransaction>
