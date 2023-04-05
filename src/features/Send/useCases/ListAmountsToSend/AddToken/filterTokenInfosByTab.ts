import {TokenInfo, YoroiNft} from '../../../../../yoroi-wallets'
import {Tabs} from './SelectTokenFromListScreen'

export const filterTokenInfosByTab = ({
  nfts,
  activeTab,
  tokenInfos,
}: {
  nfts: YoroiNft[]
  activeTab: Tabs
  tokenInfos: TokenInfo[]
}) => {
  if (activeTab === 'nfts') {
    return tokenInfos.filter((tokenInfo) => nfts.some((nft) => nft.fingerprint === tokenInfo.fingerprint))
  } else if (activeTab === 'tokens') {
    return tokenInfos.filter((tokenInfo) => !nfts.some((nft) => nft.fingerprint === tokenInfo.fingerprint))
  }

  return tokenInfos
}
