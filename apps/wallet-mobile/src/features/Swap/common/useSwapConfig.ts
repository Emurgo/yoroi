import {getSwapConfigApiMaker} from '@yoroi/swap'
import {useQuery} from 'react-query'

import {usePortfolioTokenInfos} from '../../Portfolio/common/hooks/usePortfolioTokenInfos'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useSwap} from './SwapProvider'

export const useSwapConfig = () => {
  const getSwapConfig = getSwapConfigApiMaker()
  const query = useQuery({
    suspense: true,
    queryKey: ['useSwapConfig'],
    queryFn: () => getSwapConfig(),
  })

  const swapConfig = query.data

  const {wallet} = useSelectedWallet()

  const {data} = usePortfolioTokenInfos({wallet, tokenIds: [swapConfig?.initialPair.tokenOut ?? '.']}, {suspense: true})

  const candidateTokenInfo = swapConfig?.initialPair.tokenOut ? data?.get(swapConfig?.initialPair.tokenOut) : undefined

  const {tokenInfos} = useSwap()

  const tokenOutId = candidateTokenInfo && tokenInfos.has(candidateTokenInfo.id) ? candidateTokenInfo.id : undefined

  return {
    ...query,
    swapConfig,
    tokenOutId,
  }
}
