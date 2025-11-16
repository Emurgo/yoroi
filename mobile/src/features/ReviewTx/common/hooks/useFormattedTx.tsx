import {isNonNullable} from '@yoroi/common'
import {
  type DecodedDatum,
  type Proposal,
  type ReferenceScript,
  type Vote,
  decodeDatum,
  decodeDatumToJson,
  parseDatumFromOutput,
  parseTokenList,
} from '@yoroi/tx'
import {Api, Balance, Network, Portfolio} from '@yoroi/types'

import {CredKind, WasmModuleProxy} from '@emurgo/cross-csl-core'
import * as _ from 'lodash'
import * as React from 'react'

import {usePortfolioTokenInfos} from '~/features/Portfolio/common/hooks/usePortfolioTokenInfos'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {YoroiWallet} from '~/wallets/cardano/types'
import {deriveRewardAddressFromAddress} from '~/wallets/cardano/utils'
import {CardanoMobileWrapped} from '~/wallets/cardano/wrappedCsl'
import {RawUtxo} from '~/wallets/types/other'
import {asQuantity} from '~/wallets/utils/utils'

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

  // Parse governance certificates and metadata
  const governance = cbor
    ? CardanoMobileWrapped.cslScope((csl) => {
        return parseGovernance(csl, formattedCertificates, cbor)
      })
    : null

  // Detect transaction chaining
  const chainInfo = cbor
    ? CardanoMobileWrapped.cslScope((csl) => {
        return detectChaining(csl, formattedInputs, cbor)
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
              referenceScript = {
                txHash: '', // Transaction hash would be available in real scenario
                txIndex: index,
                scriptHash,
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
  const fee = asQuantity(data?.fee ?? '0')

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
  const internalUtxo = wallet.utxos.find(
    (u) => u.tx_hash === txHash && u.tx_index === txIndex,
  )

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
    amount: asset.amount,
    tokenId: asset.assetId as Portfolio.Token.Id,
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

      // Check for VoteDelegation certificate
      const voteDeleg = cert.asVoteDelegation()
      if (voteDeleg) {
        // VoteDelegation certificates are votes, not proposals
        // For now, we'll create a simplified vote representation
        // In a full implementation, you'd parse the DRep and create proper Vote objects
        const drep = voteDeleg.drep()

        // Extract DRep information
        const drepKind = drep.kind()
        let drepCredential = ''

        if (drepKind === 0) {
          // KeyHash
          const keyHash = drep.toKeyHash()
          if (keyHash) {
            drepCredential = keyHash.toHex()
          }
        } else if (drepKind === 1) {
          // ScriptHash
          const scriptHash = drep.toScriptHash()
          if (scriptHash) {
            drepCredential = scriptHash.toHex()
          }
        }

        if (drepCredential) {
          // Create a simplified vote - in practice, you'd need governance action IDs from metadata
          votes.push({
            voter: {
              type: 'drep',
              credential: drepCredential,
            },
            governanceActionId: {
              txHash: '',
              txIndex: 0,
            },
            votingProcedure: {
              vote: 'yes', // Default - would be parsed from metadata
            },
          })
        }
      }

      // Note: Proposals would typically be in metadata or separate certificate types
      // For now, we'll leave proposals empty as they require more complex parsing
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
): {isChained: boolean; chainOrder?: number; validationResult?: any} | null => {
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
