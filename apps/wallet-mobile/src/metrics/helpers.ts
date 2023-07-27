import {Balance} from '@yoroi/types'

type AssetList = {
  tokens: Balance.TokenInfo[]
  amounts: Balance.Amounts
}

export const assetsToSendProperties = ({tokens, amounts}: AssetList) => {
  const limitedAssets = tokens.length < 30 ? tokens : tokens.slice(0, 30)
  const isNft = ({kind}) => kind === 'nft'
  const isFT = ({kind}) => kind === 'ft'
  const summary = ({name, id}) => ({name, amount: amounts[id]})
  return {
    asset_count: tokens.length,
    nfts: limitedAssets.filter(isNft).map(summary),
    tokens: limitedAssets.filter(isFT).map(summary),
  }
}
