import {TokenInfo, YoroiNft} from '../../../yoroi-wallets'
import {Fungibility} from '../useCases/ListAmountsToSend/AddToken/SelectTokenFromListScreen'

export const filterByFungibility = ({fungibility, nfts}: {fungibility: Fungibility; nfts: Array<YoroiNft>}) => {
  if (fungibility === 'all') return () => true
  if (fungibility === 'nft')
    return (tokenInfo: TokenInfo) => nfts.some((nft) => nft.fingerprint === tokenInfo.fingerprint)
  if (fungibility === 'ft')
    return (tokenInfo: TokenInfo) => !nfts.some((nft) => nft.fingerprint === tokenInfo.fingerprint)
  return () => true
}
