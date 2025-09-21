import {isNonNullable} from '@yoroi/common'
import {Api, Network, Portfolio} from '@yoroi/types'

import {CredKind} from '@emurgo/cross-csl-core'
import _ from 'lodash'
import * as React from 'react'

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

export const useFormattedTx = (data: TransactionBody): FormattedTx => {
  console.log('🚀 STARTING useFormattedTx')
  const {wallet} = useSelectedWallet()
  console.log('🚀 Got wallet')

  const inputs = data?.inputs ?? []
  const outputs = data?.outputs ?? []
  const referenceInputs = data?.reference_inputs ?? []
  console.log('🚀 Parsed inputs/outputs')

  console.log('🚀 About to call useUtxos')

  const inputUtxos = useUtxos(inputs, wallet)
  console.log('useFormattedTx - after first useUtxos')

  const referenceInputUtxos = useUtxos(referenceInputs, wallet)
  console.log('useFormattedTx - after second useUtxos')

  console.log('🎯 FINAL RESULT inputUtxos:', inputUtxos.length, 'items')
  console.log(
    '🎯 FINAL RESULT referenceInputUtxos:',
    referenceInputUtxos.length,
    'items',
  )

  if (inputUtxos.length > 0) {
    console.log('🎯 SUCCESS! inputUtxos has data:', inputUtxos[0])
  }
  if (referenceInputUtxos.length > 0) {
    console.log(
      '🎯 SUCCESS! referenceInputUtxos has data:',
      referenceInputUtxos[0],
    )
  }

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
  const portfolioTokenInfos = usePortfolioTokenInfosSuspense({wallet, tokenIds})

  const formattedInputs: FormattedInputs = formatInputs(
    wallet,
    portfolioTokenInfos,
    inputUtxos,
  )
  const formattedReferenceInputs: FormattedInputs = formatInputs(
    wallet,
    portfolioTokenInfos,
    referenceInputUtxos,
  )
  const formattedOutputs: FormattedOutputs = formatOutputs(
    wallet,
    outputs,
    portfolioTokenInfos,
  )
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

const formatInputs = (
  wallet: YoroiWallet,
  portfolioTokenInfos: ReturnType<typeof usePortfolioTokenInfosSuspense>,
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
  const address = CardanoMobile.Address.fromBech32(addressBech32)
  const addressKind = address.paymentCred()?.kind()
  return addressKind ?? null
}

export const useUtxos = (inputs: TransactionInputs, wallet: YoroiWallet) => {
  const {networkManager} = useSelectedNetwork()

  console.log('🔍 useUtxos called with:', {
    inputsLength: inputs.length,
    hasWallet: !!wallet,
    hasNetworkManager: !!networkManager,
  })

  // Use useState to manage UTXO data and loading state
  const [utxos, setUtxos] = React.useState<any[]>([])
  const [isLoaded, setIsLoaded] = React.useState(false)

  // Use useEffect for async side effects
  React.useEffect(() => {
    console.log('🔍 ⭐ useEffect trigger with:', {
      inputsLength: inputs.length,
      hasWallet: !!wallet,
      hasNetworkManager: !!networkManager,
    })

    let isMounted = true

    if (!wallet || !networkManager) {
      console.log('🔍 ⭐ Missing dependencies - setting empty')
      if (isMounted) {
        setUtxos([])
        setIsLoaded(true)
      }
      return
    }

    if (inputs.length === 0) {
      console.log('🔍 ⭐ No inputs - setting empty')
      if (isMounted) {
        setUtxos([])
        setIsLoaded(true)
      }
      return
    }

    console.log('🔍 ⭐ Starting async fetch...')
    if (isMounted) {
      setIsLoaded(false)
    }

    const fetchUtxos = async () => {
      try {
        const result = await getAllUtxos(
          inputs,
          wallet,
          networkManager.api.utxoData,
        )
        console.log('🔍 ⭐ SUCCESS! Setting', result.length, 'UTXOs')

        if (isMounted) {
          setUtxos(result)
          setIsLoaded(true)
          console.log('🔍 ⭐ State updated! Component should re-render now')
        } else {
          console.log('🔍 ⭐ Component unmounted, skipping state update')
        }
      } catch (error) {
        console.error('🔍 ⭐ Error:', error)
        if (isMounted) {
          setUtxos([])
          setIsLoaded(true)
        }
      }
    }

    fetchUtxos()

    // Cleanup function
    return () => {
      console.log('🔍 ⭐ useEffect cleanup - component unmounting')
      isMounted = false
    }
  }, [inputs, wallet, networkManager])

  console.log('🔍 ⭐ useUtxos returning:', {
    utxosLength: utxos.length,
    isLoaded,
    hasData: utxos.length > 0,
  })

  // Only return data when it's actually loaded
  if (!isLoaded && inputs.length > 0) {
    console.log('🔍 ⭐ Still loading, returning empty array')
    return []
  }

  return utxos
}

const getAllUtxos = async (
  inputs: TransactionInputs,
  wallet: YoroiWallet,
  getUtxoData: Network.Api['utxoData'],
) => {
  console.log('🔍 📥 getAllUtxos STARTED with inputs:', inputs.length)

  try {
    const promises = inputs.map((input: TransactionInputs[0]) => {
      console.log(
        '🔍 📥 Processing input:',
        `${input.transaction_id}:${input.index}`,
      )
      return getUtxo(wallet, input.transaction_id, input.index, getUtxoData)
    })

    console.log('🔍 📥 Created promises, waiting for Promise.all...')
    const result = await Promise.all(promises)
    console.log('🔍 📥 Promise.all completed, result:', result)

    return result ?? []
  } catch (error) {
    console.error('🔍 📥 getAllUtxos ERROR:', error)
    throw error
  }
}

const getUtxo = async (
  wallet: YoroiWallet,
  txHash: string,
  txIndex: number,
  getUtxoData: Network.Api['utxoData'],
) => {
  console.log('🔍 🎯 getUtxo STARTED for:', `${txHash}:${txIndex}`)

  const internalUtxo = wallet.utxos.find(
    (u) => u.tx_hash === txHash && u.tx_index === txIndex,
  )

  console.log(
    '🔍 🎯 Internal UTXO search result:',
    internalUtxo ? 'FOUND' : 'NOT FOUND',
  )

  if (!internalUtxo) {
    console.log('🔍 🎯 Calling external API...')
    const externalUtxo = await getUtxoData({txHash, txIndex})
    console.log('🔍 🎯 External API result:', externalUtxo ? 'SUCCESS' : 'NULL')

    if (externalUtxo == null) throw new Error('useUtxos: utxo not found')

    const rawUtxo = toRawUtxo(externalUtxo, txHash, txIndex)
    console.log('🔍 🎯 Converted to raw UTXO:', rawUtxo)
    return rawUtxo
  }

  console.log('🔍 🎯 Returning internal UTXO:', internalUtxo)
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
