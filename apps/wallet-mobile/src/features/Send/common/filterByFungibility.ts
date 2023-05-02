import {TokenInfo, YoroiNft} from '../../../yoroi-wallets/types'
import {FungibilityFilter} from '../useCases/ListAmountsToSend/AddToken/SelectTokenFromListScreen'

export const filterByFungibility = ({
  fungibilityFilter,
  nfts,
}: {
  fungibilityFilter: FungibilityFilter
  nfts: Array<YoroiNft>
}) => {
  if (fungibilityFilter === 'all') return () => true
  if (fungibilityFilter === 'nft')
    return (tokenInfo: TokenInfo) => nfts.some((nft) => nft.fingerprint === tokenInfo.fingerprint)
  if (fungibilityFilter === 'ft')
    return (tokenInfo: TokenInfo) => !nfts.some((nft) => nft.fingerprint === tokenInfo.fingerprint)
  return () => true
}
