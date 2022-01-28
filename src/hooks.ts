import * as React from 'react'
import {useSelector} from 'react-redux'

import {availableAssetsSelector, tokenInfoSelector} from '../legacy/selectors'
import {Token} from './types/cardano'

export const useTokenInfos = () => {
  const availableAssets = useSelector(availableAssetsSelector) as Record<string, Token>
  const tokenInfos = useSelector(tokenInfoSelector)

  return React.useMemo(() => ({...availableAssets, ...tokenInfos}), [availableAssets, tokenInfos])
}

export const useTokenInfo = (tokenId: string) => {
  const tokenInfo = useTokenInfos()[tokenId]

  if (!tokenInfo) throw new Error('Missing tokenInfo')

  return tokenInfo
}
