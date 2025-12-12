import {RawUtxo} from '@yoroi/api'
import {addressVisualDerivationPathMaker} from '@yoroi/blockchains'
import {primaryTokenId} from '@yoroi/portfolio'
import type {ModernUtxo} from '@yoroi/tx'
import {rawUtxoToModernUtxo} from '@yoroi/tx'
import {useSelectedWallet} from '@yoroi/wallet-manager'
import {useWalletEvent} from '@yoroi/wallet-manager'

import {useQuery, useQueryClient} from '@tanstack/react-query'

import {utxoQueryKeys} from '~/common/queries'

export const useUtxoList = () => {
  const {
    wallet,
    meta: {implementation},
  } = useSelectedWallet()
  const {id: walletId} = wallet
  const allUtxos = wallet.allUtxos()
  const externalAddresses = wallet.externalAddresses()
  const internalAddresses = wallet.internalAddresses()
  const getDerivationPath = addressVisualDerivationPathMaker(implementation)
  const queryClient = useQueryClient()

  const queryKey = utxoQueryKeys.list(walletId)
  useWalletEvent(wallet, 'utxos', () =>
    queryClient.invalidateQueries({queryKey}),
  )

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const manualAddresses = await wallet.getManualAddresses()
      return getUtxoList({
        utxos: allUtxos,
        externalAddresses,
        internalAddresses,
        manualAddresses,
        getDerivationPath,
      })
    },
  })

  return {utxoList: query.data, ...query}
}

type UtxoListProps = {
  account?: number // Yoroi only supports account 0 so far
  utxos: RawUtxo[]
  externalAddresses: string[]
  internalAddresses: string[]
  manualAddresses: Array<{
    accountIndex: number
    addressIndex: number
    address: string
    derivationPath: string
    reasons: Array<'used' | 'utxo' | 'airdrop'>
    addedAt: string
  }>
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
  manualAddresses,
  getDerivationPath,
}: UtxoListProps): UtxoList => {
  // Create a map of manual addresses by address string for quick lookup
  const manualAddressMap = new Map(
    manualAddresses.map((ma) => [ma.address, ma]),
  )

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
    // Check if this is a manual address first
    const manualAddress = manualAddressMap.get(address)
    if (manualAddress) {
      // Use stored derivation path for manual address
      const path = manualAddress.derivationPath

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
        externalIndex: -1,
        internalIndex: -1,
        role: -1,
        index: -1,
        isManual: true,
      }
    }

    // Normal address handling
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
      isManual: false,
    }
  })

  // Sort: first external address first, then other external addresses in order, then internal addresses in order, then manual addresses
  result.sort((a, b) => {
    // Manual addresses come last
    if (a.isManual && !b.isManual) return 1
    if (!a.isManual && b.isManual) return -1

    // If both are manual, sort by account index then address index
    if (a.isManual && b.isManual) {
      const aManual = manualAddressMap.get(a.address)
      const bManual = manualAddressMap.get(b.address)
      if (aManual && bManual) {
        if (aManual.accountIndex !== bManual.accountIndex) {
          return aManual.accountIndex - bManual.accountIndex
        }
        return aManual.addressIndex - bManual.addressIndex
      }
      return 0
    }

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
      isManual: _isManual,
      ...item
    }) => item,
  )
}
