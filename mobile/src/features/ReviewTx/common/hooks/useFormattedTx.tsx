import {isNonNullable} from '@yoroi/common'
import {Api, Network, Portfolio} from '@yoroi/types'

import {CredKind} from '@emurgo/cross-csl-core'
import {useQuery} from '@tanstack/react-query'
import _ from 'lodash'

import {usePortfolioTokenInfosSuspense} from '~/features/Portfolio/common/hooks/usePortfolioTokenInfos'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {YoroiWallet} from '~/wallets/cardano/types'
import {deriveRewardAddressFromAddress} from '~/wallets/cardano/utils'
import {RawUtxo} from '~/wallets/types/other'
import {asQuantity} from '~/wallets/utils/utils'
import {CardanoMobile} from '~/wallets/wallets'

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

export const useFormattedTx = (
  data: TransactionBody | null,
): {
  data: FormattedTx | null
  isLoading: boolean
  error: Error | null
} => {
  const {wallet} = useSelectedWallet()

  const inputs = data?.inputs ?? []
  const outputs = data?.outputs ?? []
  const referenceInputs = data?.reference_inputs ?? []

  const inputUtxosResult = useUtxos(inputs, wallet)
  const referenceInputUtxosResult = useUtxos(referenceInputs, wallet)

  const inputTokenIds = inputs.flatMap((i) => {
    const utxo = inputUtxosResult.data.find(
      (utxo: RawUtxo) =>
        utxo?.tx_hash === i.transaction_id && utxo?.tx_index === i.index,
    )
    return (
      utxo?.assets.map(
        (a: {policyId: string; assetId: string}) =>
          `${a.policyId}.${a.assetId}` as Portfolio.Token.Id,
      ) ?? []
    )
  })

  const referenceInputTokenIds = referenceInputs.flatMap((i) => {
    const utxo = referenceInputUtxosResult.data.find(
      (utxo: RawUtxo) =>
        utxo?.tx_hash === i.transaction_id && utxo?.tx_index === i.index,
    )
    return (
      utxo?.assets.map(
        (a: {policyId: string; assetId: string}) =>
          `${a.policyId}.${a.assetId}` as Portfolio.Token.Id,
      ) ?? []
    )
  })

  const outputTokenIds = outputs.flatMap((o) => {
    if (!o.amount.multiasset) return []
    const policyIds = Object.keys(o.amount.multiasset)
    const tokenIds = policyIds.flatMap((policyId) => {
      const assetIds = Object.keys(o.amount.multiasset?.[policyId] ?? {})
      return assetIds.map(
        (assetId) => `${policyId}.${assetId}` as Portfolio.Token.Id,
      )
    })
    return tokenIds
  })

  const mintTokenIds =
    data?.mint?.map(
      ([policyId, asset]) =>
        `${policyId}.${Object.keys(asset)[0] ?? ''}` as Portfolio.Token.Id,
    ) ?? []

  const tokenIds = _.uniq<Portfolio.Token.Id>([
    ...inputTokenIds,
    ...outputTokenIds,
    ...mintTokenIds,
    ...referenceInputTokenIds,
  ])
  const portfolioTokenInfos = usePortfolioTokenInfosSuspense({wallet, tokenIds})

  const formattedInputs = formatInputs(
    wallet,
    portfolioTokenInfos,
    inputUtxosResult.data,
  )
  const formattedReferenceInputs = formatInputs(
    wallet,
    portfolioTokenInfos,
    referenceInputUtxosResult.data,
  )
  const formattedOutputs = formatOutputs(wallet, outputs, portfolioTokenInfos)

  const isLoading =
    inputUtxosResult.isLoading || referenceInputUtxosResult.isLoading

  const error = inputUtxosResult.error || referenceInputUtxosResult.error

  if (error) {
    return {
      data: null,
      isLoading: false,
      error,
    }
  }

  if (isLoading || !data) {
    return {
      data: null,
      isLoading,
      error: null,
    }
  }

  const formattedFee = formatFee(wallet, data)
  const formattedCertificates = formatCertificates(data.certs)
  const formattedMintData = formatMintData(data.mint, portfolioTokenInfos)

  return {
    data: {
      inputs: formattedInputs,
      outputs: formattedOutputs,
      fee: formattedFee,
      certificates: formattedCertificates,
      mint: formattedMintData,
      referenceInputs: formattedReferenceInputs,
    },
    isLoading: false,
    error: null,
  }
}

const formatInputs = (
  wallet: YoroiWallet,
  portfolioTokenInfos: ReturnType<typeof usePortfolioTokenInfosSuspense>,
  inputUtxos: RawUtxo[],
): FormattedInputs => {
  return inputUtxos.map((utxo: RawUtxo) => {
    const address = utxo?.receiver
    const coin = utxo?.amount != null ? asQuantity(utxo.amount) : null

    const addressKind = address != null ? getAddressKind(address) : null
    const rewardAddress =
      address != null && addressKind === CredKind.Key
        ? deriveAddress(address, wallet.networkManager.chainId)
        : null

    const primaryAssets =
      coin != null
        ? [
            {
              tokenInfo: wallet.portfolioPrimaryTokenInfo,
              quantity: coin,
            },
          ]
        : []

    const multiAssets =
      utxo?.assets
        .map((a: {assetId: string; amount: string}) => {
          if (a == null) return null
          const tokenInfo = portfolioTokenInfos.tokenInfos?.get(
            a.assetId as Portfolio.Token.Id,
          )
          if (!tokenInfo) return null
          const quantity = asQuantity(a.amount)

          return {
            tokenInfo,
            quantity: quantity,
          }
        })
        .filter(Boolean) ?? []

    return {
      assets: [...primaryAssets, ...multiAssets].filter(isNonNullable),
      address,
      addressKind: addressKind ?? null,
      rewardAddress,
      ownAddress: address != null ? isOwnedAddress(wallet, address) : null,
      txIndex: utxo.tx_index,
      txHash: utxo.tx_hash,
    }
  })
}

const formatOutputs = (
  wallet: YoroiWallet,
  outputs: TransactionOutputs,
  portfolioTokenInfos: ReturnType<typeof usePortfolioTokenInfosSuspense>,
): FormattedOutputs => {
  return outputs.map((output) => {
    const address = output.address
    const coin = asQuantity(output.amount.coin)

    const addressKind = getAddressKind(address)
    const rewardAddress =
      addressKind === CredKind.Key
        ? deriveAddress(address, wallet.networkManager.chainId)
        : null

    const primaryAssets = [
      {
        tokenInfo: wallet.portfolioPrimaryTokenInfo,
        quantity: coin,
      },
    ]

    const multiAssets = output.amount.multiasset
      ? Object.entries(output.amount.multiasset).flatMap(
          ([policyId, assets]) => {
            return Object.entries(assets as Record<string, string>).map(
              ([assetId, amount]) => {
                const tokenInfo = portfolioTokenInfos.tokenInfos?.get(
                  `${policyId}.${assetId}`,
                )
                if (tokenInfo == null) return null
                const quantity = asQuantity(amount)

                return {
                  tokenInfo,
                  quantity,
                }
              },
            )
          },
        )
      : []

    const assets = [...primaryAssets, ...multiAssets].filter(isNonNullable)

    return {
      assets,
      address,
      addressKind,
      rewardAddress,
      ownAddress: isOwnedAddress(wallet, address),
    }
  })
}

export const formatFee = (
  wallet: YoroiWallet,
  data: TransactionBody,
): FormattedFee => {
  const fee = asQuantity(data?.fee ?? '0')

  return {
    tokenInfo: wallet.portfolioPrimaryTokenInfo,
    quantity: fee,
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
  portfolioTokenInfos: ReturnType<typeof usePortfolioTokenInfosSuspense>,
) => {
  if (mintData == null) return null
  return (mintData?.flatMap(([policyId, tokens]) =>
    Object.entries(tokens)
      .map(([assetNameHex, count]) => [
        portfolioTokenInfos.tokenInfos?.get(`${policyId}.${assetNameHex}`),
        count,
      ])
      .filter(([tokenInfo]) => tokenInfo != null),
  ) ?? []) as Array<[Portfolio.Token.Info, string]>
}

const deriveAddress = (address: string, chainId: number) => {
  try {
    return deriveRewardAddressFromAddress(address, chainId)
  } catch {
    return null
  }
}

const getAddressKind = (addressBech32: string): CredKind | null => {
  try {
    const address = CardanoMobile.Address.fromBech32(addressBech32)
    const addressKind = address.paymentCred()?.kind()
    return addressKind ?? null
  } catch {
    return null
  }
}

export const useUtxos = (
  inputs: TransactionInputs,
  wallet: YoroiWallet,
): {
  data: RawUtxo[]
  isLoading: boolean
  error: Error | null
} => {
  const {networkManager} = useSelectedNetwork()

  const query = useQuery<RawUtxo[]>({
    queryKey: ['useUtxos', inputs],
    queryFn: async () =>
      getAllUtxos(inputs, wallet, networkManager.api.utxoData),
    enabled: inputs != null && inputs.length > 0,
    staleTime: 5 * 60 * 1000,
  })

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  }
}

const getAllUtxos = async (
  inputs: TransactionInputs,
  wallet: YoroiWallet,
  getUtxoData: Network.Api['utxoData'],
): Promise<RawUtxo[]> => {
  return Promise.all(
    inputs.map((input: TransactionInputs[0]) =>
      getUtxo(wallet, input.transaction_id, input.index, getUtxoData),
    ),
  )
}

const getUtxo = async (
  wallet: YoroiWallet,
  txHash: string,
  txIndex: number,
  getUtxoData: Network.Api['utxoData'],
): Promise<RawUtxo> => {
  const internalUtxo = wallet.utxos.find(
    (u) => u.tx_hash === txHash && u.tx_index === txIndex,
  )

  if (!internalUtxo) {
    const externalUtxo = await getUtxoData({txHash, txIndex})
    if (externalUtxo == null) throw new Error('useUtxos: utxo not found')

    return toRawUtxo(externalUtxo, txHash, txIndex)
  }

  return internalUtxo
}

function toRawUtxo(
  utxosData: Api.Cardano.UtxoData,
  txHash: string,
  txIndex: number,
): RawUtxo {
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
  return (
    wallet.internalAddresses.includes(bech32Address) ||
    wallet.externalAddresses.includes(bech32Address)
  )
}
