import {TokenIdSchema} from '@yoroi/portfolio'
import React from 'react'
import {View} from 'react-native'
import {z} from 'zod'

import {Loading} from '../../../../components/Loading/Loading'
import {SwapTokenRoutes, useParams} from '../../../../kernel/navigation'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useNavigateToSwap} from '../../common/useNavigateToSwap'

type Params = SwapTokenRoutes['swap-nav-token']
const isTokenIdParam = (data: unknown): data is Params => {
  return z
    .object({
      tokenId: TokenIdSchema,
    })
    .safeParse(data).success
}
export const NavToToken = () => {
  const {tokenId} = useParams<Params>(isTokenIdParam)

  const {
    wallet: {balances},
  } = useSelectedWallet()
  const tokenAmount = balances.records.get(tokenId)

  const {handleOnSwap} = useNavigateToSwap()

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      handleOnSwap(tokenAmount?.info)
    }, 250)
    return () => clearTimeout(timeout)
  }, [handleOnSwap, tokenAmount?.info, tokenId])

  return (
    <View>
      <Loading />
    </View>
  )
}
