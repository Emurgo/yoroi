import {useNfts} from '../hooks'
import {useSearch} from '../Search'
import {useSelectedWallet} from '../SelectedWallet'

export const useFilteredNfts = () => {
  const {search} = useSearch()
  const searchTermLowerCase = search.toLowerCase()
  const wallet = useSelectedWallet()
  const {nfts, isLoading, refetch, isRefetching, isError} = useNfts(wallet)
  const filteredNfts =
    searchTermLowerCase.length > 0 && nfts.length > 0
      ? nfts.filter((n) => n.name.toLowerCase().includes(searchTermLowerCase))
      : nfts
  return {filteredNfts, isLoading, refetch, isRefetching, isError, search} as const
}
