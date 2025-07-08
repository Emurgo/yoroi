import type {
  TransactionUnspentOutput,
  WasmModuleProxy,
} from '@emurgo/cross-csl-core'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {addressVisualDerivationPathMaker} from '@yoroi/blockchains'
import {primaryTokenId} from '@yoroi/portfolio'
import {Balance} from '@yoroi/types'

import {
  toAssetNameHex,
  toPolicyId,
} from '../../../../yoroi-wallets/cardano/api/utils'
import {wrappedCsl} from '../../../../yoroi-wallets/cardano/wrappedCsl'
import {useWalletEvent} from '../../../../yoroi-wallets/hooks'
import {RawUtxo} from '../../../../yoroi-wallets/types/other'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'

export const useUtxoList = () => {
  const {
    wallet,
    meta: {implementation},
  } = useSelectedWallet()
  const {id: walletId, utxos, externalAddresses, internalAddresses} = wallet
  const getDerivationPath = addressVisualDerivationPathMaker(implementation)
  const queryClient = useQueryClient()

  const queryKey = ['utxoList', walletId]
  useWalletEvent(wallet, 'utxos', () => queryClient.invalidateQueries(queryKey))

  const query = useQuery({
    suspense: true,
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
  toTransactionUnspentOutputHex: () => Promise<string>
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
      acc[address].push(transformUtxo(cur))
      return acc
    },
    {} as Record<string, Array<Utxo>>,
  )

  return Object.keys(items).map((address) => {
    const externalIndex = externalAddresses.findIndex((v) => v === address)
    const internalIndex = internalAddresses.findIndex((v) => v === address)
    const index = externalIndex >= 0 ? externalIndex : internalIndex
    const role = externalIndex >= 0 ? 0 : 1

    return {
      address,
      path: getDerivationPath({account, role, index}),
      utxos: items[address],
    }
  })
}

const transformUtxo = (utxo: RawUtxo): Utxo => {
  const balance: Balance.Amounts = {}

  if (Number(utxo.amount) > 0)
    balance[primaryTokenId] = utxo.amount as Balance.Quantity

  utxo.assets.forEach((asset) => {
    balance[asset.assetId] = asset.amount as Balance.Quantity
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

async function toTransactionUnspentOutputHex(this: Utxo): Promise<string> {
  const {csl, release} = wrappedCsl()
  try {
    return (await utxoToTransactionUnspentOutput({csl, utxo: this})).toHex()
  } finally {
    release()
  }
}

type UtxoToCsl = {
  csl: WasmModuleProxy
  utxo: Utxo
}

export const utxoToTransactionUnspentOutput = async ({
  csl,
  utxo,
}: UtxoToCsl): Promise<TransactionUnspentOutput> => {
  const input = await csl.TransactionInput.new(
    await csl.TransactionHash.fromHex(utxo.txHash),
    utxo.txIndex,
  )
  const value = await csl.Value.new(
    await csl.BigNum.fromStr(utxo.balance[primaryTokenId] ?? '0'),
  )

  const assetIds = Object.keys(utxo.balance).filter((v) => v !== primaryTokenId)

  if (assetIds.length > 0) {
    const multiAsset = await csl.MultiAsset.new()

    const groupedByPolicyId = assetIds.reduce(
      (acc, cur) => {
        const policyId = toPolicyId(cur)
        acc[policyId] = acc[policyId] ?? []
        acc[policyId].push(cur)
        return acc
      },
      {} as Record<string, Array<string>>,
    )

    for (const policyIdStr of Object.keys(groupedByPolicyId)) {
      const assetGroup = groupedByPolicyId[policyIdStr]
      const policyId = await csl.ScriptHash.fromBytes(
        new Uint8Array(Buffer.from(policyIdStr, 'hex')),
      )
      const assets = await csl.Assets.new()
      for (const asset of assetGroup) {
        const name = await csl.AssetName.new(
          new Uint8Array(Buffer.from(toAssetNameHex(asset), 'hex')),
        )
        const amount = await csl.BigNum.fromStr(utxo.balance[asset])
        await assets.insert(name, amount)
      }
      await multiAsset.insert(policyId, assets)
    }

    await value.setMultiasset(multiAsset)
  }
  const receiver = await csl.Address.fromBech32(utxo.receiver)
  if (!receiver) throw new Error('Invalid receiver')
  const output = await csl.TransactionOutput.new(receiver, value)
  return csl.TransactionUnspentOutput.new(input, output)
}
