import {useQuery} from '@tanstack/react-query'

import {useSwap} from './useSwap'
import {useSwapConfigData, processSwapConfig} from './swapConfigUtils'

export const useSwapConfig = () => {
  const {getSwapConfig} = useSwapConfigData()
  const query = useQuery({
    queryKey: ['useSwapConfig'],
    queryFn: () => getSwapConfig(),
  })

  const swapConfig = query.data
  const {tokenInfos} = useSwap()

  const configData = processSwapConfig(swapConfig, tokenInfos)

  return {
    ...query,
    ...configData,
  }
}
