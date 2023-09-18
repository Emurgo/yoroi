import {Portfolio} from '@yoroi/types'

import {FungibilityFilter} from '../useCases/ListAmountsToSend/AddToken/SelectTokenFromListScreen'

export const filterByFungibility = ({fungibilityFilter}: {fungibilityFilter: FungibilityFilter}) => {
  if (fungibilityFilter === 'all') return () => true
  if (fungibilityFilter === 'nft') return (tokenInfo: Portfolio.TokenInfo) => tokenInfo.kind === 'nft'
  if (fungibilityFilter === 'ft') return (tokenInfo: Portfolio.TokenInfo) => tokenInfo.kind === 'ft'
  return () => true
}
