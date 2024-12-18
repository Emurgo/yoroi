import {CredKind} from '@emurgo/cross-csl-core'
import {isNonNullable} from '@yoroi/common'
import {infoExtractName} from '@yoroi/portfolio'
import {ApiUtxoData, Portfolio} from '@yoroi/types'
import {NetworkApi} from '@yoroi/types/lib/typescript/network/manager'
import _ from 'lodash'
import {useQuery} from 'react-query'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {deriveRewardAddressFromAddress} from '../../../../yoroi-wallets/cardano/utils'
import {wrappedCsl} from '../../../../yoroi-wallets/cardano/wrappedCsl'
import {formatTokenWithText} from '../../../../yoroi-wallets/utils/format'
import {asQuantity} from '../../../../yoroi-wallets/utils/utils'
import {usePortfolioTokenInfos} from '../../../Portfolio/common/hooks/usePortfolioTokenInfos'
import {useSelectedNetwork} from '../../../WalletManager/common/hooks/useSelectedNetwork'
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
  const referenceInputs = data?.reference_inputs ?? []

  const inputUtxos = useUtxos(inputs, wallet)
  const referenceInputUtxos = useUtxos(referenceInputs, wallet)

  const inputTokenIds = inputs.flatMap((i) => {
    const utxo = inputUtxos.find((utxo) => utxo?.tx_hash === i.transaction_id && utxo?.tx_index === i.index)
    return utxo?.assets.map((a) => `${a.policyId}.${a.assetId}` as Portfolio.Token.Id) ?? []
  })

  const referenceInputTokenIds = referenceInputs.flatMap((i) => {
    const utxo = referenceInputUtxos.find((utxo) => utxo?.tx_hash === i.transaction_id && utxo?.tx_index === i.index)
    return utxo?.assets.map((a) => `${a.policyId}.${a.assetId}` as Portfolio.Token.Id) ?? []
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

  const mintTokenIds =
    data.mint?.map(([policyId, asset]) => `${policyId}.${Object.keys(asset)[0] ?? ''}` as Portfolio.Token.Id) ?? []

  const tokenIds = _.uniq<Portfolio.Token.Id>([
    ...inputTokenIds,
    ...outputTokenIds,
    ...mintTokenIds,
    ...referenceInputTokenIds,
  ])
  const portfolioTokenInfos = usePortfolioTokenInfos({wallet, tokenIds}, {suspense: true})

  const formattedInputs = useFormattedInputs(wallet, inputs, portfolioTokenInfos, inputUtxos)
  const formattedReferenceInputs = useFormattedInputs(wallet, inputs, portfolioTokenInfos, referenceInputUtxos)
  const formattedOutputs = useFormattedOutputs(wallet, outputs, portfolioTokenInfos)
  const formattedFee = formatFee(wallet, data)
  const formattedCertificates = formatCertificates(data.certs)
  const formattedMintData = formatMintData(data.mint, portfolioTokenInfos)

  return {
    inputs: formattedInputs,
    outputs: formattedOutputs,
    fee: formattedFee,
    certificates: formattedCertificates,
    mint: formattedMintData,
    referenceInputs: formattedReferenceInputs,
  }
}

export const useFormattedInputs = (
  wallet: YoroiWallet,
  inputs: TransactionInputs,
  tokenInfosResult: ReturnType<typeof usePortfolioTokenInfos>,
  inputUtxos: ReturnType<typeof useUtxos>,
) => {
  const query = useQuery<FormattedInputs>(
    ['useFormattedInputs', inputs, inputUtxos],
    async () => formatInputs(wallet, inputs, tokenInfosResult, inputUtxos),
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
  inputUtxos: ReturnType<typeof useUtxos>,
): Promise<FormattedInputs> => {
  if (inputUtxos.length === 0) return Promise.resolve([])

  return Promise.all(
    inputs.map(async (input) => {
      const receiveUTxO = inputUtxos.find(
        (utxo) => utxo?.tx_hash === input.transaction_id && utxo?.tx_index === input.index,
      )
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
        ownAddress: address != null ? isOwnedAddress(wallet, address) : null,
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
      return {type, value: certificate} as unknown as FormattedCertificate
    }) ?? null
  )
}

const formatMintData = (
  mintData: TransactionBody['mint'] | null,
  portfolioTokenInfos: ReturnType<typeof usePortfolioTokenInfos>,
) => {
  if (mintData == null) return null
  return (mintData?.flatMap(([policyId, tokens]) =>
    Object.entries(tokens)
      .map(([assetNameHex, count]) => [portfolioTokenInfos.tokenInfos?.get(`${policyId}.${assetNameHex}`), count])
      .filter(([tokenInfo]) => tokenInfo != null),
  ) ?? []) as Array<[Portfolio.Token.Info, string]>
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

export const useUtxos = (inputs: TransactionInputs, wallet: YoroiWallet) => {
  const {networkManager} = useSelectedNetwork()

  const query = useQuery(['useUtxos', inputs], async () => getAllUtxos(inputs, wallet, networkManager.api.utxoData), {
    suspense: true,
  })

  if (!query.data) throw new Error('invalid formatted inputs')
  return query.data
}

const getAllUtxos = async (inputs: TransactionInputs, wallet: YoroiWallet, getUtxoData: NetworkApi['utxoData']) => {
  return Promise.all(inputs.map((input) => getUtxo(wallet, input.transaction_id, input.index, getUtxoData))) ?? []
}

const getUtxo = async (wallet: YoroiWallet, txHash: string, txIndex: number, getUtxoData: NetworkApi['utxoData']) => {
  const internalUtxo = wallet.utxos.find((u) => u.tx_hash === txHash && u.tx_index === txIndex)

  if (!internalUtxo) {
    const externalUtxo = await getUtxoData({txHash, txIndex})
    if (externalUtxo == null) throw new Error('useUtxos: utxo not found')

    return toRawUtxo(externalUtxo, txHash, txIndex)
  }

  return internalUtxo
}

function toRawUtxo(utxosData: ApiUtxoData, txHash: string, txIndex: number) {
  const {address, amount, assets} = utxosData.output

  const mappedAssets = assets.map((asset) => ({
    amount: asset.amount,
    assetId: asset.assetId,
    policyId: asset.policyId,
    name: asset.name,
  }))

  return {
    amount: amount,
    receiver: address,
    tx_hash: txHash,
    tx_index: txIndex,
    utxo_id: `${txHash}:${txIndex}`,
    assets: mappedAssets,
  }
}

const isOwnedAddress = (wallet: YoroiWallet, bech32Address: string) => {
  return wallet.internalAddresses.includes(bech32Address) || wallet.externalAddresses.includes(bech32Address)
}
