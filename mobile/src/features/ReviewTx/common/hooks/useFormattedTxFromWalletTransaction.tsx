import {RawUtxo} from '@yoroi/api'
import {isNonNullable} from '@yoroi/common'
import {createUnknownTokenInfo} from '@yoroi/portfolio'
import {Portfolio} from '@yoroi/types'
import {WalletTransaction} from '@yoroi/types'

import {CredKind} from '@emurgo/cross-csl-core'
import * as React from 'react'

import {usePortfolioTokenInfos} from '~/features/Portfolio/common/hooks/usePortfolioTokenInfos'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {YoroiWallet} from '~/wallets/cardano/types'
import {deriveRewardAddressFromAddress} from '~/wallets/cardano/utils'
import {CardanoMobileWrapped} from '~/wallets/cardano/wrappedCsl'
import {asQuantity} from '~/wallets/utils/utils'

import {
  CertificateType,
  FormattedCertificate,
  FormattedInputs,
  FormattedOutputs,
  FormattedTx,
  TransactionOutputs,
} from '../types'
import {formatFee} from './useFormattedTx'

/**
 * Convert WalletTransaction to FormattedTx format
 * Used for displaying historical transactions in TxDetails and transaction list
 */
export const useFormattedTxFromWalletTransaction = (
  walletTransaction: WalletTransaction | undefined,
): {
  formattedTx: FormattedTx | null
  isLoading: boolean
  areTokenInfosLoaded: boolean
  error: Error | null
} => {
  const {wallet} = useSelectedWallet()

  // Convert WalletTransaction outputs to TransactionOutputs format
  const outputs: TransactionOutputs = React.useMemo(() => {
    if (!walletTransaction) return []

    return walletTransaction.outputs.map((output) => {
      const coin = output.amount
      const multiasset: Record<string, Record<string, string>> = {}

      // Group assets by policyId
      for (const asset of output.assets) {
        if (!asset?.amount) {
          continue
        }

        // Handle both tokenId (new) and assetId (legacy) field names
        // The actual data may have assetId even though the type says tokenId
        const assetWithLegacy = asset as {
          tokenId?: string
          assetId?: string
          policyId?: string
          name?: string
          amount: string
        }
        const tokenId: string | undefined =
          assetWithLegacy.tokenId || assetWithLegacy.assetId

        if (!tokenId) {
          // If we have policyId and name, construct the tokenId
          if (asset.policyId && asset.name) {
            // name is in hex format, use it directly
            const constructedTokenId = `${asset.policyId}.${asset.name}`
            const [policyId, assetNameHex] = constructedTokenId.split('.')
            if (policyId && assetNameHex) {
              if (!multiasset[policyId]) {
                multiasset[policyId] = {}
              }
              multiasset[policyId][assetNameHex] = asset.amount
              continue
            }
          }
          continue
        }

        // tokenId is already the full token ID (policyId.assetNameHex)
        // Extract policyId and assetNameHex from tokenId
        const [policyId, assetNameHex] = tokenId.split('.')
        if (!policyId || !assetNameHex) {
          continue
        }
        const amount = asset.amount
        if (!multiasset[policyId]) {
          multiasset[policyId] = {}
        }
        multiasset[policyId][assetNameHex] = amount
      }

      return {
        address: output.address,
        amount: {
          coin,
          multiasset:
            Object.keys(multiasset).length > 0 ? multiasset : undefined,
        },
      }
    })
  }, [walletTransaction])

  // For historical transactions, we don't need to fetch UTXOs - we already have the input data
  // Reference inputs are not available in WalletTransaction, so always empty

  // Collect all token IDs from inputs, outputs, and mint
  const inputTokenIds = React.useMemo(() => {
    if (!walletTransaction) return []
    const tokenIds = walletTransaction.inputs.flatMap((input) => {
      return (
        input.assets
          ?.map((a: {tokenId?: Portfolio.Token.Id; assetId?: string}) => {
            // Handle both tokenId (new) and assetId (legacy) field names
            const tokenId: Portfolio.Token.Id | null =
              (a.tokenId as Portfolio.Token.Id) ||
              (a.assetId as Portfolio.Token.Id | null)
            return tokenId
          })
          .filter(isNonNullable) ?? []
      )
    })
    return tokenIds
  }, [walletTransaction])

  const outputTokenIds = React.useMemo(() => {
    return outputs.flatMap((output) => {
      if (!output.amount.multiasset) return []
      const policyIds = Object.keys(output.amount.multiasset)
      return policyIds.flatMap((policyId) => {
        // assetIds are already in hex format (we converted name to hex above)
        const assetNameHexes = Object.keys(
          output.amount.multiasset?.[policyId] ?? {},
        )
        return assetNameHexes.map((assetNameHex) => {
          return `${policyId}.${assetNameHex}` as Portfolio.Token.Id
        })
      })
    })
  }, [outputs])

  // Extract mint data from metadata if available
  // Note: WalletTransaction doesn't have explicit mint field, so we try to extract from metadata
  const mintTokenIds = React.useMemo(() => {
    // Mint data is not directly available in WalletTransaction
    // We could extract from metadata if needed, but for now return empty
    return [] as Portfolio.Token.Id[]
  }, [])

  const tokenIds = React.useMemo(() => {
    return Array.from(
      new Set<Portfolio.Token.Id>([
        ...inputTokenIds,
        ...outputTokenIds,
        ...mintTokenIds,
      ]),
    )
  }, [inputTokenIds, outputTokenIds, mintTokenIds])

  const {tokenInfos, isLoading: isTokenInfosLoading} = usePortfolioTokenInfos({
    wallet,
    tokenIds,
  })

  // Get all UTXOs to check script address ownership
  const allUtxos = React.useMemo(() => wallet.allUtxos(), [wallet])

  const formattedInputs: FormattedInputs = React.useMemo(() => {
    if (!walletTransaction) return []
    return formatInputsFromWalletTransaction(
      wallet,
      tokenInfos,
      walletTransaction.inputs,
      walletTransaction.id,
      allUtxos,
    )
  }, [wallet, tokenInfos, walletTransaction, allUtxos])

  const formattedReferenceInputs: FormattedInputs = [] // Not available in WalletTransaction

  const formattedOutputs: FormattedOutputs = React.useMemo(() => {
    if (!walletTransaction) return []
    const result = formatOutputsFromWalletTransaction(
      wallet,
      outputs,
      tokenInfos,
      allUtxos,
      walletTransaction.inputs,
    )
    return result
  }, [wallet, outputs, tokenInfos, walletTransaction, allUtxos])

  if (!walletTransaction) {
    return {
      formattedTx: null,
      isLoading: false,
      areTokenInfosLoaded: !isTokenInfosLoading,
      error: null,
    }
  }

  const formattedFee = formatFee(wallet, {
    fee: walletTransaction.fee ?? '0',
  } as any)
  const formattedCertificates = formatCertificatesFromWalletTransaction(
    walletTransaction.certificates,
  )
  const formattedMintData = null // Mint data not directly available in WalletTransaction

  return {
    formattedTx: {
      inputs: formattedInputs,
      outputs: formattedOutputs,
      fee: formattedFee,
      certificates: formattedCertificates,
      mint: formattedMintData,
      referenceInputs: formattedReferenceInputs,
      withdrawals: null,
      collateral: null,
      collateralReturn: null,
      totalCollateral: null,
      requiredSigners: null,
      scriptDataHash: null,
      ttl: null,
      validityIntervalStart: null,
      networkId: null,
      witnessSet: null,
    },
    isLoading: false, // No async operations, always ready
    areTokenInfosLoaded: !isTokenInfosLoading,
    error: null, // No async operations, no errors possible
  }
}

const formatInputsFromWalletTransaction = (
  wallet: YoroiWallet,
  tokenInfos: Map<Portfolio.Token.Id, Portfolio.Token.Info> | undefined,
  walletInputs: WalletTransaction['inputs'],
  currentTxId: string,
  allUtxos?: Array<RawUtxo>,
): FormattedInputs => {
  const formatted = walletInputs.map((input, arrayIndex) => {
    const address = input.address
    const coin = input.amount != null ? asQuantity(input.amount) : null

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
      input.assets
        ?.map(
          (a: {
            tokenId?: Portfolio.Token.Id
            assetId?: string // Legacy field name, still present in stored data
            amount: string
          }) => {
            if (a == null) {
              return null
            }

            // Handle both tokenId (new) and assetId (legacy) field names
            const tokenId: Portfolio.Token.Id | undefined =
              (a.tokenId as Portfolio.Token.Id) ||
              (a.assetId as Portfolio.Token.Id | undefined)

            if (!tokenId) {
              return null
            }

            const tokenInfo = tokenInfos?.get(tokenId)
            const quantity = asQuantity(a.amount)

            // If tokenInfo is not loaded yet, create a fallback unknown token info
            // This ensures tokens are still displayed even while token info is loading
            const finalTokenInfo = tokenInfo
              ? tokenInfo
              : createUnknownTokenInfo({
                  id: tokenId,
                  name: tokenId,
                })

            return {
              tokenInfo: finalTokenInfo,
              quantity: quantity,
            }
          },
        )
        .filter(Boolean) ?? []

    // Extract txHash and txIndex from input.id
    // input.id is either "tx_hash" or "tx_hash:tx_index"
    let txHash = currentTxId // fallback to current transaction
    let txIndex = arrayIndex // fallback to array index

    if (input.id) {
      const parts = input.id.split(':')
      if (parts.length === 2 && parts[0] && parts[1]) {
        txHash = parts[0]
        const parsedIndex = parseInt(parts[1], 10)
        if (!isNaN(parsedIndex)) {
          txIndex = parsedIndex
        }
      } else {
        txHash = input.id
      }
    }

    return {
      assets: [...primaryAssets, ...multiAssets].filter(isNonNullable),
      address,
      addressKind: addressKind ?? null,
      rewardAddress,
      ownAddress:
        address != null ? isOwnedAddress(wallet, address, allUtxos) : null,
      txIndex,
      txHash,
    }
  })

  return formatted
}

const formatOutputsFromWalletTransaction = (
  wallet: YoroiWallet,
  outputs: TransactionOutputs,
  tokenInfos: Map<Portfolio.Token.Id, Portfolio.Token.Info> | undefined,
  allUtxos?: Array<RawUtxo>,
  _walletInputs?: WalletTransaction['inputs'],
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
                const tokenId = `${policyId}.${assetId}` as Portfolio.Token.Id
                const tokenInfo = tokenInfos?.get(tokenId)
                const quantity = asQuantity(amount)

                // If tokenInfo is not loaded yet, create a fallback unknown token info
                // This ensures tokens are still displayed even while token info is loading
                const finalTokenInfo = tokenInfo
                  ? tokenInfo
                  : createUnknownTokenInfo({
                      id: tokenId,
                      name: tokenId,
                    })

                return {
                  tokenInfo: finalTokenInfo,
                  quantity,
                }
              },
            )
          },
        )
      : []

    const assets = [...primaryAssets, ...multiAssets].filter(isNonNullable)

    // Check both payment address and reward address (if available) for ownership
    const paymentAddressOwned = isOwnedAddress(wallet, address, allUtxos)
    const rewardAddressOwned =
      rewardAddress != null && isOwnedAddress(wallet, rewardAddress, allUtxos)
    const ownAddress = paymentAddressOwned || rewardAddressOwned

    return {
      assets,
      address,
      addressKind,
      rewardAddress,
      ownAddress,
    }
  })
}

const formatCertificatesFromWalletTransaction = (
  certificates: WalletTransaction['certificates'],
): FormattedCertificate[] | null => {
  if (!certificates || certificates.length === 0) return null

  // Convert RemoteCertificateMeta to minimal FormattedCertificate format
  // We only have the certificate kind and limited fields, so we create minimal certificates
  // that can still be displayed in the UI (operations only need the type for most cases)
  return certificates
    .map((cert): FormattedCertificate | null => {
      const kind = cert.kind
      if (!kind) return null

      // Map RemoteCertificateMeta fields to the format expected by operations
      const value: Partial<Record<string, unknown>> = {}

      // For StakeDelegation, map poolKeyHash to pool_keyhash (what operations expect)
      if (kind === 'StakeDelegation' && 'poolKeyHash' in cert) {
        value.pool_keyhash = cert.poolKeyHash
      }

      // Handle VoteDelegation and combined vote delegation certificates
      // Extract drep field if available (may be null for historical transactions)
      if (
        kind === 'VoteDelegation' ||
        kind === 'VoteRegistrationAndDelegation' ||
        kind === 'StakeAndVoteDelegation' ||
        kind === 'StakeVoteRegistrationAndDelegation'
      ) {
        // drep may be present in the cert, or may be null/undefined
        if ('drep' in cert) {
          value.drep = (cert as any).drep
        }
        // If drep is not present, value.drep will remain undefined
        // Operations will handle this by showing generic VoteDelegation
      }

      // Handle StakeRegistrationAndDelegation - extract poolKeyHash if available
      if (kind === 'StakeRegistrationAndDelegation' && 'poolKeyHash' in cert) {
        value.pool_keyhash = (cert as any).poolKeyHash
      }

      // For other certificate types, we just include the type
      // Operations that only need the type (StakeRegistration, StakeDeregistration, etc.)
      // will work fine. Operations that need additional fields may show limited info.

      return {
        type: kind as CertificateType,
        value,
      }
    })
    .filter(isNonNullable)
}

const deriveAddress = (address: string, chainId: number) => {
  try {
    return deriveRewardAddressFromAddress(address, chainId)
  } catch {
    return null
  }
}

const getAddressKind = (addressBech32: string): CredKind | null => {
  return CardanoMobileWrapped.cslScope((csl) => {
    try {
      const address = csl.Address.fromBech32(addressBech32)
      const addressKind = address.paymentCred()?.kind()
      return addressKind ?? null
    } catch (e) {
      return null
    }
  })
}

const isOwnedAddress = (
  wallet: YoroiWallet,
  bech32Address: string,
  allUtxos?: Array<RawUtxo>,
) => {
  // Check if it's a standard payment address (internal or external)
  if (
    wallet.internalAddresses().includes(bech32Address) ||
    wallet.externalAddresses().includes(bech32Address)
  ) {
    return true
  }

  // For script addresses (addr1x), check if the wallet has UTXOs at this address
  // This indicates the wallet controls or uses this script address
  if (bech32Address.startsWith('addr1x') && allUtxos) {
    return allUtxos.some((utxo) => utxo.receiver === bech32Address)
  }

  return false
}
