import {addressVisualDerivationPathMaker} from '@yoroi/blockchains'
import {primaryTokenId} from '@yoroi/portfolio'
import type {ModernUtxo} from '@yoroi/tx'
import {rawUtxoToModernUtxo} from '@yoroi/tx'

import {useQuery, useQueryClient} from '@tanstack/react-query'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useWalletEvent} from '~/features/WalletManager/hooks/useWalletEvent'
import {utxoQueryKeys} from '~/queries'
import {RawUtxo} from '~/wallets/types/other'

export const useUtxoList = () => {
  const {
    wallet,
    meta: {implementation},
  } = useSelectedWallet()
  const {id: walletId, allUtxos, externalAddresses, internalAddresses} = wallet
  const getDerivationPath = addressVisualDerivationPathMaker(implementation)
  const queryClient = useQueryClient()

  const queryKey = utxoQueryKeys.list(walletId)
  useWalletEvent(wallet, 'utxos', () =>
    queryClient.invalidateQueries({queryKey}),
  )

  const query = useQuery({
    queryKey,
    queryFn: () =>
      getUtxoList({
        utxos: allUtxos,
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

export type UtxoList = Array<{
  address: string
  path: string
  utxos: Array<ModernUtxo>
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
      acc[address]!.push(cur)
      return acc
    },
    {} as Record<string, Array<RawUtxo>>,
  )

  const result = Object.keys(items).map((address) => {
    const externalIndex = externalAddresses.findIndex((v) => v === address)
    const internalIndex = internalAddresses.findIndex((v) => v === address)
    const index = externalIndex >= 0 ? externalIndex : internalIndex
    const role = externalIndex >= 0 ? 0 : 1
    const path = getDerivationPath({account, role, index})

    // Transform UTXOs
    const transformedUtxos = items[address]!.map((utxo) =>
      rawUtxoToModernUtxo(
        utxo,
        undefined, // addressing - not needed for display
        undefined, // derivationPath - not needed for display
        primaryTokenId,
      ),
    )

    return {
      address,
      path,
      utxos: transformedUtxos,
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
