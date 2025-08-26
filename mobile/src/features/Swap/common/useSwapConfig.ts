import {getSwapConfigApiMaker} from '@yoroi/swap'

import {useQuery} from '@tanstack/react-query'

import {processSwapConfig} from './swapConfigUtils'
import {useSwap} from './useSwap'

const getSwapConfig = getSwapConfigApiMaker()
export const useSwapConfig = () => {
  const {tokenInfos} = useSwap()
  const query = useQuery({
    queryKey: ['useSwapConfig'],
    queryFn: () => getSwapConfig(),
  })

  const swapConfig = query.data
  const configData = processSwapConfig(swapConfig ?? {}, tokenInfos)

  return {
    ...query,
    ...configData,
  }
}
