import {addressVisualDerivationPathMaker} from '@yoroi/blockchains'
import {primaryTokenId} from '@yoroi/portfolio'
import {Balance} from '@yoroi/types'

import type {
  TransactionUnspentOutput,
  WasmModuleProxy,
} from '@emurgo/cross-csl-core'
import {useQuery, useQueryClient} from '@tanstack/react-query'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useWalletEvent} from '~/features/WalletManager/hooks/useWalletEvent'
import {toAssetNameHex, toPolicyId} from '~/wallets/cardano/api/utils'
import {CardanoMobileWrapped} from '~/wallets/cardano/wrappedCsl'
import {RawUtxo} from '~/wallets/types/other'

export const useUtxoList = () => {
  const {
    wallet,
    meta: {implementation},
  } = useSelectedWallet()
  const {id: walletId, utxos, externalAddresses, internalAddresses} = wallet
  const getDerivationPath = addressVisualDerivationPathMaker(implementation)
  const queryClient = useQueryClient()

  const queryKey = ['utxoList', walletId]
  useWalletEvent(wallet, 'utxos', () =>
    queryClient.invalidateQueries({queryKey}),
  )

  const query = useQuery({
    queryKey,
    queryFn: () =>
      getUtxoList({
        utxos,
        externalAddresses,
        internalAddresses,
        getDerivationPath,
      }),
  })

  return {utxoList: query.data, ...query}
}

type UtxoListProps = {
  account?: number // Yoroi only supports account 0 so far
  utxos: RawUtxo[]
  externalAddresses: string[]
  internalAddresses: string[]
  getDerivationPath: ReturnType<typeof addressVisualDerivationPathMaker>
}

type Utxo = {
  receiver: string
  txHash: string
  txIndex: number
  balance: Balance.Amounts
  toTransactionUnspentOutputHex: () => string
}

export type UtxoList = Array<{
  address: string
  path: string
  utxos: Array<Utxo>
}>

const getUtxoList = ({
  account = 0,
  utxos,
  externalAddresses,
  internalAddresses,
  getDerivationPath,
}: UtxoListProps): UtxoList => {
  const items = utxos.reduce(
    (acc, cur) => {
      const address = cur.receiver
      acc[address] = acc[address] ?? []
      acc[address]!.push(transformUtxo(cur))
      return acc
    },
    {} as Record<string, Array<Utxo>>,
  )

  const result = Object.keys(items).map((address) => {
    const externalIndex = externalAddresses.findIndex((v) => v === address)
    const internalIndex = internalAddresses.findIndex((v) => v === address)
    const index = externalIndex >= 0 ? externalIndex : internalIndex
    const role = externalIndex >= 0 ? 0 : 1

    return {
      address,
      path: getDerivationPath({account, role, index}),
      utxos: items[address] ?? [],
      externalIndex,
      internalIndex,
      role,
      index,
    }
  })

  // Sort: first external address first, then other external addresses in order, then internal addresses in order
  result.sort((a, b) => {
    // First external address (index 0) always comes first
    if (a.externalIndex === 0) return -1
    if (b.externalIndex === 0) return 1

    // External addresses come before internal addresses
    if (a.externalIndex >= 0 && b.externalIndex >= 0) {
      return a.externalIndex - b.externalIndex
    }
    if (a.externalIndex >= 0) return -1
    if (b.externalIndex >= 0) return 1

    // Both are internal addresses, sort by index
    if (a.internalIndex >= 0 && b.internalIndex >= 0) {
      return a.internalIndex - b.internalIndex
    }

    return 0
  })

  // Remove sorting metadata before returning
  return result.map(
    ({
      externalIndex: _externalIndex,
      internalIndex: _internalIndex,
      role: _role,
      index: _index,
      ...item
    }) => item,
  )
}

const transformUtxo = (utxo: RawUtxo): Utxo => {
  const balance: Balance.Amounts = {}

  if (Number(utxo.amount) > 0)
    balance[primaryTokenId] = utxo.amount as Balance.Quantity

  utxo.assets.forEach((asset) => {
    balance[asset.tokenId] = asset.amount as Balance.Quantity
  })

  const transformedUtxo = {
    receiver: utxo.receiver,
    txHash: utxo.tx_hash,
    txIndex: utxo.tx_index,
    balance,
    toTransactionUnspentOutputHex,
  }
  transformedUtxo.toTransactionUnspentOutputHex =
    toTransactionUnspentOutputHex.bind(transformedUtxo)

  return transformedUtxo
}

function toTransactionUnspentOutputHex(this: Utxo): string {
  return CardanoMobileWrapped.cslScope((csl) =>
    utxoToTransactionUnspentOutput({
      csl,
      utxo: this,
    }).toHex(),
  )
}

type UtxoToCsl = {
  csl: WasmModuleProxy
  utxo: Utxo
}

export const utxoToTransactionUnspentOutput = ({
  csl,
  utxo,
}: UtxoToCsl): TransactionUnspentOutput => {
  const input = csl.TransactionInput.new(
    csl.TransactionHash.fromHex(utxo.txHash),
    utxo.txIndex,
  )
  const value = csl.Value.new(
    csl.BigNum.fromStr(utxo.balance[primaryTokenId] ?? '0'),
  )

  const assetIds = Object.keys(utxo.balance).filter((v) => v !== primaryTokenId)

  if (assetIds.length > 0) {
    const multiAsset = csl.MultiAsset.new()

    const groupedByPolicyId = assetIds.reduce(
      (acc, cur) => {
        const policyId = toPolicyId(cur)
        acc[policyId] = acc[policyId] ?? []
        acc[policyId]!.push(cur)
        return acc
      },
      {} as Record<string, Array<string>>,
    )

    for (const policyIdStr of Object.keys(groupedByPolicyId)) {
      const assetGroup = groupedByPolicyId[policyIdStr]
      if (!assetGroup) continue

      const policyId = csl.ScriptHash.fromBytes(
        new Uint8Array(Buffer.from(policyIdStr, 'hex')),
      )
      const assets = csl.Assets.new()
      for (const asset of assetGroup) {
        const name = csl.AssetName.new(
          new Uint8Array(Buffer.from(toAssetNameHex(asset), 'hex')),
        )
        const amount = csl.BigNum.fromStr(utxo.balance[asset] ?? '0')
        assets.insert(name, amount)
      }
      multiAsset.insert(policyId, assets)
    }

    value.setMultiasset(multiAsset)
  }
  const receiver = csl.Address.fromBech32(utxo.receiver)
  if (!receiver) throw new Error('Invalid receiver')
  const output = csl.TransactionOutput.new(receiver, value)
  return csl.TransactionUnspentOutput.new(input, output)
}
