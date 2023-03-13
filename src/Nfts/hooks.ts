import {useSearch} from '../Search'
import {useSelectedWallet} from '../SelectedWallet'
import {useNftModerationStatus, useNfts} from '../yoroi-wallets'
import {YoroiWallet} from '../yoroi-wallets'

export const useFilteredNfts = () => {
  const {search} = useSearch()
  const searchTermLowerCase = search.toLowerCase()
  const wallet = useSelectedWallet()
  const {nfts, isLoading, refetch, isRefetching, isError} = useNfts(wallet)
  const filteredNfts =
    searchTermLowerCase.length > 0 && nfts.length > 0
      ? nfts.filter((n) => n.name.toLowerCase().includes(searchTermLowerCase))
      : nfts
  const sortedNfts = filteredNfts.sort((a, b) => a.name.localeCompare(b.name))

  return {nfts: sortedNfts, isLoading, refetch, isRefetching, isError, search} as const
}

export const useModeratedNftImage = ({wallet, fingerprint}: {wallet: YoroiWallet; fingerprint: string}) => {
  return useNftModerationStatus(
    {wallet, fingerprint},
    {refetchInterval: (moderationStatus) => (moderationStatus === 'pending' ? REFETCH_TIME_IN_MS : false)},
  )
}

const REFETCH_TIME_IN_MS = 3000
