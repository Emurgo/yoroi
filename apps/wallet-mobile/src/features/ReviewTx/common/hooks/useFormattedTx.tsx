import {invalid, isNonNullable} from '@yoroi/common'
import {infoExtractName} from '@yoroi/portfolio'
import {Portfolio} from '@yoroi/types'
import * as _ from 'lodash'
import {useQuery} from 'react-query'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {wrappedCsl} from '../../../../yoroi-wallets/cardano/wrappedCsl'
import {formatTokenWithText} from '../../../../yoroi-wallets/utils/format'
import {asQuantity} from '../../../../yoroi-wallets/utils/utils'
import {usePortfolioTokenInfos} from '../../../Portfolio/common/hooks/usePortfolioTokenInfos'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {
  FormattedFee,
  FormattedInputs,
  FormattedOutputs,
  TransactionBody,
  TransactionInputs,
  TransactionOutputs,
} from '../types'

export const useFormattedTx = (data: TransactionBody) => {
  const {wallet} = useSelectedWallet()

  const inputs = data?.inputs ?? []
  const outputs = data?.outputs ?? []

  const inputTokenIds = inputs.flatMap((i) => {
    const receiveUTxO = getUtxoByTxIdAndIndex(wallet, i.transaction_id, i.index)
    return receiveUTxO?.assets.map((a) => `${a.policyId}.${a.assetId}` as Portfolio.Token.Id) ?? []
  })

  const outputTokenIds = outputs.flatMap((o) => {
    if (!o.amount.multiasset) return []
    const policyIds = Object.keys(o.amount.multiasset)
    const tokenIds = policyIds.flatMap((policyId) => {
      const assetIds = Object.keys(o.amount.multiasset?.[policyId] ?? {})
      return assetIds.map((assetId) => `${policyId}.${assetId}` as Portfolio.Token.Id)
    })
    return tokenIds
  })

  const tokenIds = _.uniq<Portfolio.Token.Id>([...inputTokenIds, ...outputTokenIds])
  const portfolioTokenInfos = usePortfolioTokenInfos({wallet, tokenIds}, {suspense: true})

  const formattedInputs = useFormattedInputs(wallet, inputs, portfolioTokenInfos)
  const formattedOutputs = useFormattedOutputs(wallet, outputs, portfolioTokenInfos)
  const formattedFee = formatFee(wallet, data)

  return {inputs: formattedInputs, outputs: formattedOutputs, fee: formattedFee}
}

export const useFormattedInputs = (
  wallet: YoroiWallet,
  inputs: TransactionInputs,
  tokenInfosResult: ReturnType<typeof usePortfolioTokenInfos>,
) => {
  const query = useQuery<FormattedInputs>(
    ['useFormattedInputs', inputs],
    async () => formatInputs(wallet, inputs, tokenInfosResult),
    {
      suspense: true,
    },
  )

  if (!query.data) throw new Error('invalid formatted inputs')
  return query.data
}

export const useFormattedOutputs = (
  wallet: YoroiWallet,
  outputs: TransactionOutputs,
  portfolioTokenInfos: ReturnType<typeof usePortfolioTokenInfos>,
) => {
  const query = useQuery<FormattedOutputs>(
    ['useFormattedOutputs', outputs],
    () => formatOutputs(wallet, outputs, portfolioTokenInfos),
    {
      suspense: true,
    },
  )

  if (!query.data) throw new Error('invalid formatted outputs')
  return query.data
}

const formatInputs = async (
  wallet: YoroiWallet,
  inputs: TransactionInputs,
  portfolioTokenInfos: ReturnType<typeof usePortfolioTokenInfos>,
): Promise<FormattedInputs> => {
  return Promise.all(
    inputs.map(async (input) => {
      const receiveUTxO = getUtxoByTxIdAndIndex(wallet, input.transaction_id, input.index)
      const address = receiveUTxO?.receiver
      const rewardAddress =
        address !== undefined ? await deriveRewardAddressFromAddress(address, wallet.networkManager.chainId) : null
      const coin = receiveUTxO?.amount != null ? asQuantity(receiveUTxO.amount) : null

      const primaryAssets =
        coin != null
          ? [
              {
                name: wallet.portfolioPrimaryTokenInfo.name,
                label: formatTokenWithText(coin, wallet.portfolioPrimaryTokenInfo),
                quantity: coin,
                isPrimary: true,
              },
            ]
          : []

      const multiAssets =
        receiveUTxO?.assets
          .map((a) => {
            const tokenInfo = portfolioTokenInfos.tokenInfos?.get(a.assetId as Portfolio.Token.Id)
            if (!tokenInfo) return null
            
            return {
              name: infoExtractName(tokenInfo),
              label: formatTokenWithText(quantity, tokenInfo),
              quantity: asQuantity(a.amount),
              isPrimary: false,
            }
          })
          .filter(Boolean) ?? []

      return {
        assets: [...primaryAssets, ...multiAssets].filter(isNonNullable),
        address,
        rewardAddress,
        ownAddress: address != null && isOwnedAddress(wallet, address),
        txIndex: input.index,
        txHash: input.transaction_id,
      }
    }),
  )
}

const formatOutputs = async (
  wallet: YoroiWallet,
  outputs: TransactionOutputs,
  portfolioTokenInfos: ReturnType<typeof usePortfolioTokenInfos>,
): Promise<FormattedOutputs> => {
  return Promise.all(
    outputs.map(async (output) => {
      const address = output.address
      const rewardAddress = await deriveRewardAddressFromAddress(address, wallet.networkManager.chainId)
      const coin = asQuantity(output.amount.coin)

      const primaryAssets = [
        {
          name: wallet.portfolioPrimaryTokenInfo.name,
          label: formatTokenWithText(coin, wallet.portfolioPrimaryTokenInfo),
          quantity: coin,
          isPrimary: true,
        },
      ]

      const multiAssets = output.amount.multiasset
        ? Object.entries(output.amount.multiasset).flatMap(([policyId, assets]) => {
            return Object.entries(assets).map(([assetId, amount]) => {
              const tokenInfo = portfolioTokenInfos.tokenInfos?.get(`${policyId}.${assetId}`)
              if (tokenInfo == null) return null
              return {
                name: infoExtractName(tokenInfo),
                label: formatTokenWithText(quantity, tokenInfo),
                quantity:  asQuantity(amount),
                isPrimary: false,
              }
            })
          })
        : []

      const assets = [...primaryAssets, ...multiAssets].filter(isNonNullable)

      return {
        assets,
        address,
        rewardAddress,
        ownAddress: isOwnedAddress(wallet, address),
      }
    }),
  )
}

export const formatFee = (wallet: YoroiWallet, data: TransactionBody): FormattedFee => {
  const fee = asQuantity(data?.fee ?? '0')

  return {
    name: wallet.portfolioPrimaryTokenInfo.name,
    label: formatTokenWithText(fee, wallet.portfolioPrimaryTokenInfo),
    quantity: fee,
    isPrimary: true,
  }
}

export const deriveRewardAddressFromAddress = async (address: string, chainId: number): Promise<string> => {
  const {csl, release} = wrappedCsl()

  try {
    const result = await csl.Address.fromBech32(address)
      .then((address) => csl.BaseAddress.fromAddress(address))
      .then((baseAddress) => baseAddress?.stakeCred() ?? invalid('invalid base address'))
      .then((stakeCredential) => csl.RewardAddress.new(chainId, stakeCredential))
      .then((rewardAddress) => rewardAddress.toAddress())
      .then((rewardAddrAsAddress) => rewardAddrAsAddress.toBech32(undefined))
      .catch((error) => error)

    if (typeof result !== 'string') throw new Error('Its not possible to derive reward address')
    return result
  } finally {
    release()
  }
}

const getUtxoByTxIdAndIndex = (wallet: YoroiWallet, txId: string, index: number) => {
  return wallet.utxos.find((u) => u.tx_hash === txId && u.tx_index === index)
}

const isOwnedAddress = (wallet: YoroiWallet, bech32Address: string) => {
  return wallet.internalAddresses.includes(bech32Address) || wallet.externalAddresses.includes(bech32Address)
}
