import {isNonNullable} from '@yoroi/common'
import {Api, Network, Portfolio} from '@yoroi/types'

import {CredKind} from '@emurgo/cross-csl-core'
import _ from 'lodash'
import * as React from 'react'

import {usePortfolioTokenInfos} from '~/features/Portfolio/common/hooks/usePortfolioTokenInfos'
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

export const useFormattedTx = (data: TransactionBody): FormattedTx => {
  const {wallet} = useSelectedWallet()

  const inputs = data?.inputs ?? []
  const outputs = data?.outputs ?? []
  const referenceInputs = data?.reference_inputs ?? []

  const inputUtxos = useUtxos(inputs, wallet)

  const referenceInputUtxos = useUtxos(referenceInputs, wallet)

  const inputTokenIds = inputs.flatMap((i) => {
    const utxo = inputUtxos.find(
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
    const utxo = referenceInputUtxos.find(
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
    data.mint?.map(
      ([policyId, asset]) =>
        `${policyId}.${Object.keys(asset)[0] ?? ''}` as Portfolio.Token.Id,
    ) ?? []

  const tokenIds = _.uniq<Portfolio.Token.Id>([
    ...inputTokenIds,
    ...outputTokenIds,
    ...mintTokenIds,
    ...referenceInputTokenIds,
  ])
  const {tokenInfos} = usePortfolioTokenInfos({wallet, tokenIds})

  const formattedInputs: FormattedInputs = formatInputs(
    wallet,
    tokenInfos,
    inputUtxos,
  )
  const formattedReferenceInputs: FormattedInputs = formatInputs(
    wallet,
    tokenInfos,
    referenceInputUtxos,
  )
  const formattedOutputs: FormattedOutputs = formatOutputs(
    wallet,
    outputs,
    tokenInfos,
  )
  const formattedFee = formatFee(wallet, data)
  const formattedCertificates = formatCertificates(data.certs)
  const formattedMintData = formatMintData(data.mint, tokenInfos)

  return {
    inputs: formattedInputs,
    outputs: formattedOutputs,
    fee: formattedFee,
    certificates: formattedCertificates,
    mint: formattedMintData,
    referenceInputs: formattedReferenceInputs,
  }
}

const formatInputs = (
  wallet: YoroiWallet,
  tokenInfos: Map<Portfolio.Token.Id, Portfolio.Token.Info> | undefined,
  inputUtxos: ReturnType<typeof useUtxos>,
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
          const tokenInfo = tokenInfos?.get(a.assetId as Portfolio.Token.Id)
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
  tokenInfos: Map<Portfolio.Token.Id, Portfolio.Token.Info> | undefined,
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
                const tokenInfo = tokenInfos?.get(`${policyId}.${assetId}`)
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
  tokenInfos: Map<Portfolio.Token.Id, Portfolio.Token.Info> | undefined,
) => {
  if (mintData == null) return null
  return (mintData?.flatMap(([policyId, tokens]) =>
    Object.entries(tokens)
      .map(([assetNameHex, count]) => [
        tokenInfos?.get(`${policyId}.${assetNameHex}`),
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
  } catch (e) {
    return null
  }
}

export const useUtxos = (inputs: TransactionInputs, wallet: YoroiWallet) => {
  const {networkManager} = useSelectedNetwork()

  const [utxos, setUtxos] = React.useState<any[]>([])
  const [isLoaded, setIsLoaded] = React.useState(false)

  const inputsRef = React.useRef<TransactionInputs>([])
  const stableInputs = React.useMemo(() => {
    const inputsKey = inputs
      .map((input) => `${input.transaction_id}:${input.index}`)
      .join(',')
    const prevInputsKey = inputsRef.current
      .map((input) => `${input.transaction_id}:${input.index}`)
      .join(',')

    if (inputsKey !== prevInputsKey) {
      inputsRef.current = inputs
    }

    return inputsRef.current
  }, [inputs])

  React.useEffect(() => {
    let isMounted = true

    if (!wallet || !networkManager) {
      if (isMounted) {
        setUtxos([])
        setIsLoaded(true)
      }
      return
    }

    if (stableInputs.length === 0) {
      if (isMounted) {
        setUtxos([])
        setIsLoaded(true)
      }
      return
    }

    if (isMounted) {
      setIsLoaded(false)
    }

    const fetchUtxos = async () => {
      try {
        const result = await getAllUtxos(
          stableInputs,
          wallet,
          networkManager.api.utxoData,
        )

        if (isMounted) {
          setUtxos(result)
          setIsLoaded(true)
        }
      } catch (error) {
        if (isMounted) {
          setUtxos([])
          setIsLoaded(true)
        }
      }
    }

    fetchUtxos()

    return () => {
      isMounted = false
    }
  }, [stableInputs, wallet, networkManager])

  if (!isLoaded && stableInputs.length > 0) {
    return []
  }

  return utxos
}

const getAllUtxos = async (
  inputs: TransactionInputs,
  wallet: YoroiWallet,
  getUtxoData: Network.Api['utxoData'],
) => {
  try {
    const promises = inputs.map((input: TransactionInputs[0]) => {
      return getUtxo(wallet, input.transaction_id, input.index, getUtxoData)
    })
    const result = await Promise.all(promises)

    return result ?? []
  } catch (error) {
    throw error
  }
}

const getUtxo = async (
  wallet: YoroiWallet,
  txHash: string,
  txIndex: number,
  getUtxoData: Network.Api['utxoData'],
) => {
  const internalUtxo = wallet.utxos.find(
    (u) => u.tx_hash === txHash && u.tx_index === txIndex,
  )

  if (!internalUtxo) {
    const externalUtxo = await getUtxoData({txHash, txIndex})

    if (externalUtxo == null) throw new Error('useUtxos: utxo not found')

    const rawUtxo = toRawUtxo(externalUtxo, txHash, txIndex)
    return rawUtxo
  }
  return internalUtxo
}

function toRawUtxo(
  utxosData: Api.Cardano.UtxoData,
  txHash: string,
  txIndex: number,
) {
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
