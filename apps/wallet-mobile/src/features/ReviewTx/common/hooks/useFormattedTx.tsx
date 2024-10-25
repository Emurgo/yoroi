import {CredKind} from '@emurgo/cross-csl-core'
import {isNonNullable} from '@yoroi/common'
import {infoExtractName} from '@yoroi/portfolio'
import {Portfolio} from '@yoroi/types'
import _ from 'lodash'
import {useQuery} from 'react-query'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {deriveRewardAddressFromAddress} from '../../../../yoroi-wallets/cardano/utils'
import {wrappedCsl} from '../../../../yoroi-wallets/cardano/wrappedCsl'
import {formatTokenWithText} from '../../../../yoroi-wallets/utils/format'
import {asQuantity} from '../../../../yoroi-wallets/utils/utils'
import {usePortfolioTokenInfos} from '../../../Portfolio/common/hooks/usePortfolioTokenInfos'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {
  FormattedCertificate,
  FormattedFee,
  FormattedInputs,
  FormattedOutputs,
  FormattedTx,
  TransactionBody,
  TransactionInputs,
  TransactionOutputs,
} from '../types'

export const useFormattedTx = (data: TransactionBody): FormattedTx => {
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
  const formattedCertificates = formatCertificates(data.certs)

  return {
    inputs: formattedInputs,
    outputs: formattedOutputs,
    fee: formattedFee,
    certificates: formattedCertificates,
  }
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
      const coin = receiveUTxO?.amount != null ? asQuantity(receiveUTxO.amount) : null

      const addressKind = address != null ? await getAddressKind(address) : null
      const rewardAddress =
        address != null && addressKind === CredKind.Key
          ? await deriveAddress(address, wallet.networkManager.chainId)
          : null

      const primaryAssets =
        coin != null
          ? [
              {
                tokenInfo: wallet.portfolioPrimaryTokenInfo,
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
            const quantity = asQuantity(a.amount)

            return {
              tokenInfo,
              name: infoExtractName(tokenInfo),
              label: formatTokenWithText(quantity, tokenInfo),
              quantity: quantity,
              isPrimary: false,
            }
          })
          .filter(Boolean) ?? []

      return {
        assets: [...primaryAssets, ...multiAssets].filter(isNonNullable),
        address,
        addressKind: addressKind ?? null,
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
      const coin = asQuantity(output.amount.coin)

      const addressKind = await getAddressKind(address)
      const rewardAddress =
        addressKind === CredKind.Key ? await deriveAddress(address, wallet.networkManager.chainId) : null

      const primaryAssets = [
        {
          tokenInfo: wallet.portfolioPrimaryTokenInfo,
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
              const quantity = asQuantity(amount)

              return {
                tokenInfo,
                name: infoExtractName(tokenInfo),
                label: formatTokenWithText(quantity, tokenInfo),
                quantity,
                isPrimary: false,
              }
            })
          })
        : []

      const assets = [...primaryAssets, ...multiAssets].filter(isNonNullable)

      return {
        assets,
        address,
        addressKind,
        rewardAddress,
        ownAddress: isOwnedAddress(wallet, address),
      }
    }),
  )
}

export const formatFee = (wallet: YoroiWallet, data: TransactionBody): FormattedFee => {
  const fee = asQuantity(data?.fee ?? '0')

  return {
    tokenInfo: wallet.portfolioPrimaryTokenInfo,
    name: wallet.portfolioPrimaryTokenInfo.name,
    label: formatTokenWithText(fee, wallet.portfolioPrimaryTokenInfo),
    quantity: fee,
    isPrimary: true,
  }
}

const formatCertificates = (certificates: TransactionBody['certs']) => {
  return (
    certificates?.map((cert) => {
      const [type, certificate] = Object.entries(cert)[0]
      return {type, certificate} as unknown as FormattedCertificate
    }) ?? null
  )
}

const deriveAddress = async (address: string, chainId: number) => {
  try {
    return await deriveRewardAddressFromAddress(address, chainId)
  } catch {
    return null
  }
}

const getAddressKind = async (addressBech32: string): Promise<CredKind | null> => {
  const {csl, release} = wrappedCsl()

  try {
    const address = await csl.Address.fromBech32(addressBech32)
    const addressKind = await (await address.paymentCred())?.kind()
    return addressKind ?? null
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
