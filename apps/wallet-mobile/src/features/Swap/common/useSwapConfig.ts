import {getSwapConfigApiMaker, useSwapTokensOnlyVerified} from '@yoroi/swap'
import {useQuery} from 'react-query'

import {usePortfolioTokenInfos} from '../../Portfolio/common/hooks/usePortfolioTokenInfos'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'

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

  const validTokenInfos = useSwapTokensOnlyVerified()

  const buyTokenInfo =
    candidateTokenInfo && validTokenInfos.some(({id}) => id === candidateTokenInfo.id) ? candidateTokenInfo : undefined

  return {
    ...query,
    swapConfig,
    buyTokenInfo,
  }
}
