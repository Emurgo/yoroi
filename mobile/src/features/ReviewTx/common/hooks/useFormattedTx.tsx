import {RawUtxo} from '@yoroi/api'
import {YoroiWallet} from '@yoroi/cardano-wallet'
import {deriveRewardAddressFromAddress} from '@yoroi/cardano-wallet'
import {asQuantity} from '@yoroi/cardano-wallet'
import {CardanoMobileWrapped} from '@yoroi/cardano-wallet'
import {isNonNullable} from '@yoroi/common'
import {
  type ChainValidationResult,
  type DecodedDatum,
  type Proposal,
  type ReferenceScript,
  type Vote,
  decodeDatum,
  decodeDatumToJson,
  parseDatumFromOutput,
  parseTokenList,
} from '@yoroi/tx'
import {Api, Balance, Branded, Network, Portfolio} from '@yoroi/types'
import {useSelectedNetwork} from '@yoroi/wallet-manager'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import {CredKind, WasmModuleProxy} from '@emurgo/cross-csl-core'
import * as _ from 'lodash'
import * as React from 'react'

import {usePortfolioTokenInfos} from '~/features/Portfolio/common/hooks/usePortfolioTokenInfos'

import {
  FormattedCertificate,
  FormattedFee,
  FormattedInputs,
  FormattedOutputs,
  FormattedTx,
  FormattedWithdrawals,
  FormattedWitnessSet,
  TransactionBody,
  TransactionInputs,
  TransactionOutputs,
} from '../types'

export const useFormattedTx = (
  data: TransactionBody,
  cbor?: string | null,
): {
  formattedTx: FormattedTx | null
  isLoading: boolean
  areTokenInfosLoaded: boolean
  error: Error | null
} => {
  const {wallet} = useSelectedWallet()

  const inputs = React.useMemo(() => data?.inputs ?? [], [data?.inputs])
  const outputs = React.useMemo(() => data?.outputs ?? [], [data?.outputs])
  const referenceInputs = React.useMemo(
    () => data?.reference_inputs ?? [],
    [data?.reference_inputs],
  )

  const inputUtxosResult = useUtxos(inputs, wallet)
  const referenceInputUtxosResult = useUtxos(referenceInputs, wallet)

  const isLoading =
    inputUtxosResult.isLoading || referenceInputUtxosResult.isLoading
  const error = inputUtxosResult.error || referenceInputUtxosResult.error

  const inputTokenIds = inputs.flatMap((i) => {
    const utxo = inputUtxosResult.data.find(
      (utxo: RawUtxo) =>
        utxo?.tx_hash === i.transaction_id && utxo?.tx_index === i.index,
    )
    return utxo?.assets.map((a) => a.tokenId) ?? []
  })

  const referenceInputTokenIds = referenceInputs.flatMap((i) => {
    const utxo = referenceInputUtxosResult.data.find(
      (utxo: RawUtxo) =>
        utxo?.tx_hash === i.transaction_id && utxo?.tx_index === i.index,
    )
    return utxo?.assets.map((a) => a.tokenId) ?? []
  })

  // Extract token IDs from CSL objects if CBOR is available, otherwise fall back to JSON
  const outputTokenIds = React.useMemo(() => {
    if (cbor) {
      // Extract from CSL objects using parseTokenList for correct token ID format
      // Note: This creates a separate scope, but it's fine since we're just extracting IDs (primitives)
      return CardanoMobileWrapped.cslScope((csl) => {
        const tx = csl.Transaction.fromHex(cbor)
        const txBody = tx.body()
        const txOutputs = txBody.outputs()
        const tokenIds: Portfolio.Token.Id[] = []

        for (let i = 0; i < txOutputs.len(); i++) {
          const output = txOutputs.get(i)
          const value = output.amount()
          const multiasset = value.multiasset()
          if (multiasset) {
            const tokens = parseTokenList(csl, multiasset)
            tokenIds.push(...tokens.map((t) => t.assetId as Portfolio.Token.Id))
          }
        }

        return tokenIds
      })
    }

    // Fall back to JSON parsing
    return outputs.flatMap((o) => {
      if (!o.amount.multiasset) return []
      const policyIds = Object.keys(o.amount.multiasset)
      return policyIds.flatMap((policyId) => {
        const assetIds = Object.keys(o.amount.multiasset?.[policyId] ?? {})
        return assetIds.map((assetId) => {
          // Use the asset name hex directly from JSON (CSL serializes it correctly)
          return `${policyId}.${assetId}` as Portfolio.Token.Id
        })
      })
    })
  }, [cbor, outputs])

  const mintTokenIds = React.useMemo(() => {
    // Use JSON parsing for mint (mint.keys() doesn't exist on MintsAssets type)
    return (
      data.mint?.map(([policyId, asset]) => {
        const assetNameHex = Object.keys(asset)[0] ?? ''
        return `${policyId}.${assetNameHex}` as Portfolio.Token.Id
      }) ?? []
    )
  }, [data.mint])

  const tokenIds = _.uniq<Portfolio.Token.Id>([
    ...inputTokenIds,
    ...outputTokenIds,
    ...mintTokenIds,
    ...referenceInputTokenIds,
  ])
  const {tokenInfos, isLoading: isTokenInfosLoading} = usePortfolioTokenInfos({
    wallet,
    tokenIds,
  })

  if (error) {
    return {
      formattedTx: null,
      isLoading: false,
      areTokenInfosLoaded: !isTokenInfosLoading,
      error,
    }
  }

  if (isLoading) {
    return {
      formattedTx: null,
      isLoading: true,
      areTokenInfosLoaded: !isTokenInfosLoading,
      error: null,
    }
  }

  // Create a single scope for all CSL operations if CBOR is available
  const formattedOutputs: FormattedOutputs = cbor
    ? CardanoMobileWrapped.cslScope((csl) => {
        return formatOutputs(csl, wallet, outputs, tokenInfos, cbor)
      })
    : formatOutputs(undefined, wallet, outputs, tokenInfos, cbor)

  const formattedInputs: FormattedInputs = formatInputs(
    wallet,
    tokenInfos,
    inputUtxosResult.data,
  )
  const formattedReferenceInputs: FormattedInputs = formatInputs(
    wallet,
    tokenInfos,
    referenceInputUtxosResult.data,
  )
  const formattedFee = formatFee(wallet, data)
  const formattedCertificates = formatCertificates(data.certs)
  const formattedMintData = formatMintData(data.mint, tokenInfos)

  // Extract all missing transaction body fields
  const formattedWithdrawals = cbor
    ? CardanoMobileWrapped.cslScope((csl) => {
        return formatWithdrawals(csl, wallet, cbor)
      })
    : null

  const formattedCollateral = cbor
    ? CardanoMobileWrapped.cslScope((csl) => {
        return formatCollateral(csl, wallet, tokenInfos, cbor)
      })
    : null

  const formattedCollateralReturn = cbor
    ? CardanoMobileWrapped.cslScope((csl) => {
        return formatCollateralReturn(csl, wallet, tokenInfos, cbor)
      })
    : null

  const formattedTotalCollateral = cbor
    ? CardanoMobileWrapped.cslScope((csl) => {
        return formatTotalCollateral(csl, wallet, cbor)
      })
    : null

  const formattedRequiredSigners = cbor
    ? CardanoMobileWrapped.cslScope((csl) => {
        return formatRequiredSigners(csl, cbor)
      })
    : null

  const formattedScriptDataHash = cbor
    ? CardanoMobileWrapped.cslScope((csl) => {
        return formatScriptDataHash(csl, cbor)
      })
    : null

  const formattedTtl = cbor
    ? CardanoMobileWrapped.cslScope((csl) => {
        return formatTtl(csl, cbor)
      })
    : null

  const formattedValidityIntervalStart = cbor
    ? CardanoMobileWrapped.cslScope((csl) => {
        return formatValidityIntervalStart(csl, cbor)
      })
    : null

  const formattedNetworkId = cbor
    ? CardanoMobileWrapped.cslScope((csl) => {
        return formatNetworkId(csl, cbor)
      })
    : null

  const formattedWitnessSet = cbor
    ? CardanoMobileWrapped.cslScope((csl) => {
        return formatWitnessSet(csl, cbor)
      })
    : null

  // Parse governance certificates and metadata
  const governance = cbor
    ? CardanoMobileWrapped.cslScope((csl) => {
        return parseGovernance(csl, formattedCertificates, cbor)
      })
    : null

  // Detect transaction chaining
  const chainInfo: FormattedTx['chainInfo'] = cbor
    ? CardanoMobileWrapped.cslScope((csl) => {
        const result = detectChaining(csl, formattedInputs, cbor)
        return result
          ? {
              ...result,
              validationResult: result.validationResult as
                | ChainValidationResult
                | undefined,
            }
          : null
      })
    : null

  return {
    formattedTx: {
      inputs: formattedInputs,
      outputs: formattedOutputs,
      fee: formattedFee,
      certificates: formattedCertificates,
      mint: formattedMintData,
      referenceInputs: formattedReferenceInputs,
      withdrawals: formattedWithdrawals,
      collateral: formattedCollateral,
      collateralReturn: formattedCollateralReturn,
      totalCollateral: formattedTotalCollateral,
      requiredSigners: formattedRequiredSigners,
      scriptDataHash: formattedScriptDataHash,
      ttl: formattedTtl,
      validityIntervalStart: formattedValidityIntervalStart,
      networkId: formattedNetworkId,
      witnessSet: formattedWitnessSet,
      governance,
      chainInfo,
    },
    isLoading: false,
    areTokenInfosLoaded: !isTokenInfosLoading,
    error: null,
  }
}

const formatInputs = (
  wallet: YoroiWallet,
  tokenInfos: Map<Portfolio.Token.Id, Portfolio.Token.Info> | undefined,
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
        .map((a) => {
          if (a == null) return null
          const tokenInfo = tokenInfos?.get(a.tokenId)
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
  csl: WasmModuleProxy | undefined,
  wallet: YoroiWallet,
  outputs: TransactionOutputs,
  tokenInfos: Map<Portfolio.Token.Id, Portfolio.Token.Info> | undefined,
  cbor?: string | null,
): FormattedOutputs => {
  // If CBOR is available, extract token info from CSL objects for accuracy
  if (cbor && csl) {
    const tx = csl.Transaction.fromHex(cbor)
    const txBody = tx.body()
    const txOutputs = txBody.outputs()

    return outputs.map((output, index) => {
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

      // Extract tokens from CSL object using parseTokenList
      const cslOutput = txOutputs.get(index)
      const multiAssets: Array<{
        tokenInfo: Portfolio.Token.Info
        quantity: Balance.Quantity
      }> = []

      if (cslOutput) {
        const value = cslOutput.amount()
        const multiasset = value.multiasset()
        if (multiasset) {
          const tokens = parseTokenList(csl, multiasset)
          for (const token of tokens) {
            const tokenInfo = tokenInfos?.get(
              token.assetId as Portfolio.Token.Id,
            )
            if (tokenInfo) {
              multiAssets.push({
                tokenInfo,
                quantity: asQuantity(token.amount),
              })
            }
          }
        }
      }

      const assets = [...primaryAssets, ...multiAssets].filter(isNonNullable)

      // Parse datum from output
      let datumInfo = null
      if (cslOutput) {
        const datumInfoRaw = parseDatumFromOutput(csl, cslOutput)
        if (datumInfoRaw) {
          let decoded: DecodedDatum | null = null
          let json: unknown | null = null

          // Try to decode if we have the data
          if (datumInfoRaw.data) {
            decoded = decodeDatum(csl, datumInfoRaw.data)
            if (decoded) {
              json = decodeDatumToJson(csl, {
                type: datumInfoRaw.type,
                hash: datumInfoRaw.hash,
                data: datumInfoRaw.data,
              })
            }
          }

          datumInfo = {
            type: datumInfoRaw.type,
            hash: datumInfoRaw.hash,
            data: datumInfoRaw.data,
            decoded,
            json,
          }
        }
      }

      // Detect reference script
      let referenceScript: ReferenceScript | null = null
      if (cslOutput) {
        const scriptRef = cslOutput.scriptRef()
        if (scriptRef) {
          try {
            // Extract script info directly
            let scriptHash = ''
            let scriptType: 'native' | 'plutus' = 'native'
            const scriptSize = scriptRef.toBytes().length

            if (scriptRef.isNativeScript()) {
              const nativeScript = csl.NativeScript.fromBytes(
                scriptRef.toBytes(),
              )
              if (nativeScript) {
                scriptHash = nativeScript.hash().toHex()
                scriptType = 'native'
              }
            } else if (scriptRef.isPlutusScript()) {
              const plutusScript = csl.PlutusScript.fromBytes(
                scriptRef.toBytes(),
              )
              if (plutusScript) {
                scriptHash = plutusScript.hash().toHex()
                scriptType = 'plutus'
              }
            }

            if (scriptHash) {
              // For reference scripts attached to outputs in the current transaction,
              // the txHash will be empty until the transaction is signed.
              // The txHash will be the hash of this transaction once it's submitted.
              referenceScript = {
                txHash: Branded.asTransactionHash(''), // Empty for unsigned transactions
                txIndex: index,
                scriptHash: Branded.asScriptHash(scriptHash),
                scriptType,
                scriptSize,
              }
            }
          } catch {
            // Ignore errors in script detection
          }
        }
      }

      return {
        assets,
        address,
        addressKind,
        rewardAddress,
        ownAddress: isOwnedAddress(wallet, address),
        datum: datumInfo,
        referenceScript,
      }
    })
  }

  // Fall back to JSON parsing
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
                // Use asset name hex directly from JSON (CSL serializes it correctly)
                const tokenId = `${policyId}.${assetId}` as Portfolio.Token.Id
                const tokenInfo = tokenInfos?.get(tokenId)
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
  const fee = asQuantity(data?.fee ?? Branded.ZERO_QUANTITY)

  return {
    tokenInfo: wallet.portfolioPrimaryTokenInfo,
    quantity: fee,
  }
}

const formatCertificates = (certificates: TransactionBody['certs']) => {
  if (!certificates) return null

  const formatted = certificates
    .map((cert) => {
      const entry = Object.entries(cert)[0]
      if (entry == null) return null
      const [type, certificate] = entry
      return {type, value: certificate} as FormattedCertificate
    })
    .filter(isNonNullable)

  return formatted
}

const formatMintData = (
  mintData: TransactionBody['mint'] | null,
  tokenInfos: Map<Portfolio.Token.Id, Portfolio.Token.Info> | undefined,
) => {
  if (mintData == null) return null
  return (mintData?.flatMap(([policyId, tokens]) =>
    Object.entries(tokens)
      .map(([assetNameHex, count]) => {
        // Use asset name hex directly from JSON (CSL serializes it correctly)
        const tokenId = `${policyId}.${assetNameHex}` as Portfolio.Token.Id
        return [tokenInfos?.get(tokenId), count] as const
      })
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

export const useUtxos = (inputs: TransactionInputs, wallet: YoroiWallet) => {
  const {networkManager} = useSelectedNetwork()

  const [utxos, setUtxos] = React.useState<RawUtxo[]>([])
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

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
        setError(null)
      }
      return
    }

    if (stableInputs.length === 0) {
      if (isMounted) {
        setUtxos([])
        setIsLoaded(true)
        setError(null)
      }
      return
    }

    if (isMounted) {
      setIsLoaded(false)
      setError(null)
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
          setError(null)
        }
      } catch (fetchError) {
        if (isMounted) {
          setUtxos([])
          setIsLoaded(true)
          setError(fetchError as Error)
        }
      }
    }

    fetchUtxos()

    return () => {
      isMounted = false
    }
  }, [stableInputs, wallet, networkManager])

  return {
    data: utxos,
    isLoading: !isLoaded && stableInputs.length > 0,
    error,
  }
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
  } catch (fetchError) {
    throw fetchError
  }
}

const getUtxo = async (
  wallet: YoroiWallet,
  txHash: string,
  txIndex: number,
  getUtxoData: Network.Api['utxoData'],
) => {
  const internalUtxo = wallet
    .utxos()
    .find((u) => u.tx_hash === txHash && u.tx_index === txIndex)

  if (!internalUtxo) {
    try {
      const externalUtxo = await getUtxoData({txHash, txIndex})

      if (externalUtxo == null) {
        throw new Error(`useUtxos: utxo not found for ${txHash}:${txIndex}`)
      }

      const rawUtxo = toRawUtxo(externalUtxo, txHash, txIndex)
      return rawUtxo
    } catch (error) {
      throw error
    }
  }

  return internalUtxo
}

function toRawUtxo(
  utxosData: Api.Cardano.UtxoData,
  txHash: string,
  txIndex: number,
): RawUtxo {
  const {address, amount, assets} = utxosData.output

  // Convert backend response (with assetId) to internal format (with tokenId)
  // assetId from backend is already the full token ID in format policyId.assetNameHex
  const mappedAssets = assets.map((asset) => ({
    amount: Branded.asBalanceQuantity(asset.amount),
    tokenId: asset.assetId as Portfolio.Token.Id,
    policyId: Branded.asPolicyId(asset.policyId),
    name: asset.name,
  }))

  const txHashBranded = Branded.asTransactionHash(txHash)
  return {
    amount: Branded.asBalanceQuantity(amount),
    receiver: Branded.asAddress(address),
    tx_hash: txHashBranded,
    tx_index: txIndex,
    utxo_id: Branded.asUtxoIdFromParts(txHashBranded, txIndex),
    assets: mappedAssets,
  }
}

const isOwnedAddress = (wallet: YoroiWallet, bech32Address: string) => {
  return (
    wallet.internalAddresses().includes(Branded.asAddress(bech32Address)) ||
    wallet.externalAddresses().includes(Branded.asAddress(bech32Address))
  )
}

/**
 * Format withdrawals from transaction body
 */
const formatWithdrawals = (
  csl: WasmModuleProxy,
  wallet: YoroiWallet,
  cbor: string,
): FormattedWithdrawals | null => {
  try {
    const tx = csl.Transaction.fromHex(cbor)
    const txBody = tx.body()
    const withdrawals = txBody.withdrawals()

    if (!withdrawals || withdrawals.len() === 0) {
      return null
    }

    const formatted: FormattedWithdrawals = []

    // Withdrawals is a map of RewardAddress -> Coin
    const keys = withdrawals.keys()
    for (let i = 0; i < keys.len(); i++) {
      const rewardAddress = keys.get(i)
      if (!rewardAddress) continue

      const amount = withdrawals.get(rewardAddress)
      if (!amount) continue

      // Convert RewardAddress to Address then to bech32
      const address = rewardAddress.toAddress()
      const bech32Address = address.toBech32(undefined)

      formatted.push({
        address: bech32Address,
        amount: asQuantity(amount.toStr()),
        tokenInfo: wallet.portfolioPrimaryTokenInfo,
      })
    }

    return formatted.length > 0 ? formatted : null
  } catch {
    return null
  }
}

/**
 * Format collateral inputs from transaction body
 */
const formatCollateral = (
  csl: WasmModuleProxy,
  wallet: YoroiWallet,
  tokenInfos: Map<Portfolio.Token.Id, Portfolio.Token.Info> | undefined,
  cbor: string,
): FormattedInputs | null => {
  try {
    const tx = csl.Transaction.fromHex(cbor)
    const txBody = tx.body()
    const collateral = txBody.collateral()

    if (!collateral || collateral.len() === 0) {
      return null
    }

    // Convert collateral inputs to TransactionInputs format
    const collateralInputs: TransactionInputs = []
    for (let i = 0; i < collateral.len(); i++) {
      const input = collateral.get(i)
      if (!input) continue

      collateralInputs.push({
        transaction_id: input.transactionId().toHex(),
        index: input.index(),
      })
    }

    // Fetch UTXOs for collateral inputs
    const collateralUtxos = collateralInputs
      .map((input) => {
        const utxo = wallet
          .utxos()
          .find(
            (u) =>
              u.tx_hash === input.transaction_id && u.tx_index === input.index,
          )
        return utxo
      })
      .filter(isNonNullable) as RawUtxo[]

    return formatInputs(wallet, tokenInfos, collateralUtxos)
  } catch {
    return null
  }
}

/**
 * Format collateral return output from transaction body
 */
const formatCollateralReturn = (
  csl: WasmModuleProxy,
  wallet: YoroiWallet,
  tokenInfos: Map<Portfolio.Token.Id, Portfolio.Token.Info> | undefined,
  cbor: string,
): FormattedOutputs[0] | null => {
  try {
    const tx = csl.Transaction.fromHex(cbor)
    const txBody = tx.body()
    const collateralReturn = txBody.collateralReturn()

    if (!collateralReturn) {
      return null
    }

    const address = collateralReturn.address().toBech32(undefined)
    const coin = asQuantity(collateralReturn.amount().coin().toStr())

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

    const value = collateralReturn.amount()
    const multiasset = value.multiasset()
    const multiAssets: Array<{
      tokenInfo: Portfolio.Token.Info
      quantity: Balance.Quantity
    }> = []

    if (multiasset) {
      const tokens = parseTokenList(csl, multiasset)
      for (const token of tokens) {
        const tokenInfo = tokenInfos?.get(token.assetId as Portfolio.Token.Id)
        if (tokenInfo) {
          multiAssets.push({
            tokenInfo,
            quantity: asQuantity(token.amount),
          })
        }
      }
    }

    const assets = [...primaryAssets, ...multiAssets].filter(isNonNullable)

    return {
      assets,
      address,
      addressKind,
      rewardAddress,
      ownAddress: isOwnedAddress(wallet, address),
    }
  } catch {
    return null
  }
}

/**
 * Format total collateral from transaction body
 */
const formatTotalCollateral = (
  csl: WasmModuleProxy,
  wallet: YoroiWallet,
  cbor: string,
): FormattedFee | null => {
  try {
    const tx = csl.Transaction.fromHex(cbor)
    const txBody = tx.body()
    const totalCollateral = txBody.totalCollateral()

    if (!totalCollateral) {
      return null
    }

    return {
      tokenInfo: wallet.portfolioPrimaryTokenInfo,
      quantity: asQuantity(totalCollateral.toStr()),
    }
  } catch {
    return null
  }
}

/**
 * Format required signers from transaction body
 */
const formatRequiredSigners = (
  csl: WasmModuleProxy,
  cbor: string,
): string[] | null => {
  try {
    const tx = csl.Transaction.fromHex(cbor)
    const txBody = tx.body()
    const requiredSigners = txBody.requiredSigners()

    if (!requiredSigners || requiredSigners.len() === 0) {
      return null
    }

    const signers: string[] = []
    for (let i = 0; i < requiredSigners.len(); i++) {
      const signer = requiredSigners.get(i)
      if (signer) {
        signers.push(signer.toHex())
      }
    }

    return signers.length > 0 ? signers : null
  } catch {
    return null
  }
}

/**
 * Format script data hash from transaction body
 */
const formatScriptDataHash = (
  csl: WasmModuleProxy,
  cbor: string,
): string | null => {
  try {
    const tx = csl.Transaction.fromHex(cbor)
    const txBody = tx.body()
    const scriptDataHash = txBody.scriptDataHash()

    if (!scriptDataHash) {
      return null
    }

    return scriptDataHash.toHex()
  } catch {
    return null
  }
}

/**
 * Format TTL from transaction body
 */
const formatTtl = (csl: WasmModuleProxy, cbor: string): number | null => {
  try {
    const tx = csl.Transaction.fromHex(cbor)
    const txBody = tx.body()
    const ttl = txBody.ttl()

    return ttl ?? null
  } catch {
    return null
  }
}

/**
 * Format validity interval start from transaction body
 */
const formatValidityIntervalStart = (
  csl: WasmModuleProxy,
  cbor: string,
): number | null => {
  try {
    const tx = csl.Transaction.fromHex(cbor)
    const txBody = tx.body()
    const validityStart = txBody.validityStartIntervalBignum()

    if (!validityStart) {
      return null
    }

    return parseInt(validityStart.toStr(), 10)
  } catch {
    return null
  }
}

/**
 * Format network ID from transaction body
 */
const formatNetworkId = (csl: WasmModuleProxy, cbor: string): number | null => {
  try {
    const tx = csl.Transaction.fromHex(cbor)
    const txBody = tx.body()
    const networkId = txBody.networkId()

    if (networkId == null) {
      return null
    }

    // NetworkId is an enum: 0 = Testnet, 1 = Mainnet
    return networkId.kind()
  } catch {
    return null
  }
}

/**
 * Format witness set from transaction
 */
const formatWitnessSet = (
  csl: WasmModuleProxy,
  cbor: string,
): FormattedWitnessSet | null => {
  try {
    const tx = csl.Transaction.fromHex(cbor)
    const witnessSet = tx.witnessSet()

    if (!witnessSet) {
      return null
    }

    const formatted: FormattedWitnessSet = {
      vkeys: [],
      bootstraps: [],
      nativeScripts: [],
      plutusScripts: [],
      plutusData: [],
    }

    // Extract VKey witnesses
    const vkeys = witnessSet.vkeys()
    if (vkeys) {
      for (let i = 0; i < vkeys.len(); i++) {
        const vkey = vkeys.get(i)
        if (!vkey) continue

        const publicKey = vkey.vkey().toBytes()
        const signature = vkey.signature().toBytes()

        formatted.vkeys.push({
          publicKey: Buffer.from(publicKey).toString('hex'),
          signature: Buffer.from(signature).toString('hex'),
        })
      }
    }

    // Extract bootstrap witnesses
    const bootstraps = witnessSet.bootstraps()
    if (bootstraps) {
      for (let i = 0; i < bootstraps.len(); i++) {
        const bootstrap = bootstraps.get(i)
        if (!bootstrap) continue

        const publicKey = bootstrap.vkey().toBytes()
        const signature = bootstrap.signature().toBytes()
        const chaincode = bootstrap.chainCode()
        const attributes = bootstrap.attributes()

        formatted.bootstraps.push({
          publicKey: Buffer.from(publicKey).toString('hex'),
          signature: Buffer.from(signature).toString('hex'),
          chaincode: Buffer.from(chaincode).toString('hex'),
          attributes: Buffer.from(attributes).toString('hex'),
        })
      }
    }

    // Extract native script witnesses
    const nativeScripts = witnessSet.nativeScripts()
    if (nativeScripts) {
      for (let i = 0; i < nativeScripts.len(); i++) {
        const script = nativeScripts.get(i)
        if (!script) continue

        formatted.nativeScripts.push({
          scriptHash: script.hash().toHex(),
        })
      }
    }

    // Extract Plutus script witnesses
    const plutusScripts = witnessSet.plutusScripts()
    if (plutusScripts) {
      for (let i = 0; i < plutusScripts.len(); i++) {
        const script = plutusScripts.get(i)
        if (!script) continue

        const scriptBytes = script.toBytes()

        formatted.plutusScripts.push({
          scriptHash: script.hash().toHex(),
          scriptBytes: Buffer.from(scriptBytes).toString('hex'),
        })
      }
    }

    // Extract Plutus data (redeemers)
    const plutusData = witnessSet.plutusData()
    if (plutusData) {
      for (let i = 0; i < plutusData.len(); i++) {
        const datum = plutusData.get(i)
        if (!datum) continue

        const dataBytes = datum.toBytes()

        formatted.plutusData.push({
          data: Buffer.from(dataBytes).toString('hex'),
        })
      }
    }

    // Return null if all arrays are empty
    if (
      formatted.vkeys.length === 0 &&
      formatted.bootstraps.length === 0 &&
      formatted.nativeScripts.length === 0 &&
      formatted.plutusScripts.length === 0 &&
      formatted.plutusData.length === 0
    ) {
      return null
    }

    return formatted
  } catch {
    return null
  }
}

/**
 * Parse governance certificates and metadata from transaction
 */
const parseGovernance = (
  csl: WasmModuleProxy,
  certificates: FormattedCertificate[] | null,
  cbor: string,
): {proposals: Proposal[]; votes: Vote[]} | null => {
  if (!certificates || certificates.length === 0) {
    return null
  }

  const proposals: Proposal[] = []
  const votes: Vote[] = []

  try {
    const tx = csl.Transaction.fromHex(cbor)
    const txBody = tx.body()
    const certs = txBody.certs()

    if (!certs) {
      return null
    }

    for (let i = 0; i < certs.len(); i++) {
      const cert = certs.get(i)
      if (!cert) continue

      // Note: VoteDelegation certificates are delegations, not votes.
      // They delegate voting power to a DRep but don't cast votes on specific governance actions.
      // VoteDelegation certificates are already displayed correctly in the Operations tab.
      // Actual votes on governance actions would be in transaction metadata, not certificates.
      // For now, we skip VoteDelegation certificates here.

      // TODO: Parse actual votes from transaction metadata
      // TODO: Parse governance proposals from certificates or metadata
    }
  } catch {
    // Ignore parsing errors
    return null
  }

  if (proposals.length === 0 && votes.length === 0) {
    return null
  }

  return {proposals, votes}
}

/**
 * Detect transaction chaining
 */
const detectChaining = (
  _csl: WasmModuleProxy,
  _inputs: FormattedInputs,
  cbor: string,
): {
  isChained: boolean
  chainOrder?: number
  validationResult?: unknown
} | null => {
  try {
    const tx = _csl.Transaction.fromHex(cbor)
    const txBody = tx.body()
    const txInputs = txBody.inputs()

    if (!txInputs || txInputs.len() === 0) {
      return {isChained: false}
    }

    // Check if any inputs reference unconfirmed transactions
    // This is a simplified check - full chaining detection would require
    // checking against a mempool or transaction chain state
    let isChained = false

    for (let i = 0; i < txInputs.len(); i++) {
      const input = txInputs.get(i)
      if (!input) continue

      // In a real implementation, you'd check if the referenced transaction
      // is in the mempool or part of a chain
      // For now, we'll just detect if there are multiple transactions
      // that might be chained (simplified heuristic)
      // Note: This is a placeholder - actual chaining detection would require
      // checking transaction dependencies
      if (input) {
        // Placeholder for future chaining detection logic
      }
    }

    return {
      isChained,
      chainOrder: isChained ? 0 : undefined,
    }
  } catch {
    return {isChained: false}
  }
}
