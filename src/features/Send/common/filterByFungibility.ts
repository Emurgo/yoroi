import {TokenInfo, YoroiNft} from '../../../yoroi-wallets'
import {FungibilityFilter} from '../useCases/ListAmountsToSend/AddToken/SelectTokenFromListScreen'

export const filterByFungibility = ({fungibility, nfts}: {fungibility: FungibilityFilter; nfts: Array<YoroiNft>}) => {
  if (fungibility === 'all') return () => true
  if (fungibility === 'nft')
    return (tokenInfo: TokenInfo) => nfts.some((nft) => nft.fingerprint === tokenInfo.fingerprint)
  if (fungibility === 'ft')
    return (tokenInfo: TokenInfo) => !nfts.some((nft) => nft.fingerprint === tokenInfo.fingerprint)
  return () => true
}
