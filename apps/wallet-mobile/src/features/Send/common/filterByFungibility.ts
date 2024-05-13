import {Balance} from '@yoroi/types'

export const filterByFungibility = ({fungibilityFilter}: {fungibilityFilter: 'all' | 'ft' | 'nft'}) => {
  if (fungibilityFilter === 'all') return () => true
  if (fungibilityFilter === 'nft') return (tokenInfo: Balance.TokenInfo) => tokenInfo.kind === 'nft'
  if (fungibilityFilter === 'ft') return (tokenInfo: Balance.TokenInfo) => tokenInfo.kind === 'ft'
  return () => true
}
