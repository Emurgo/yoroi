import {dexhunterApiMaker, useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {useQuery} from 'react-query'

import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'

export const DexhunterPlayground = () => {
  const {styles} = useStyles()
  const {wallet} = useSelectedWallet()
  const {orderData} = useSwap()

  const dexhunterApi = React.useMemo(() => {
    return dexhunterApiMaker({network: wallet.networkManager.network})
  }, [wallet.networkManager.network])

  const {data} = useQuery({
    queryKey: [wallet.id, 'dexhunterPlayground', orderData.bestPoolCalculation?.pool.poolId],
    retry: false,
    staleTime: 0,
    cacheTime: 0,
    queryFn: async () => {
      return Promise.all([
        orderData.amounts.buy &&
          orderData.amounts.sell &&
          dexhunterApi.averagePrice({
            tokenInId: orderData.amounts.buy?.info.id,
            tokenOutId: orderData.amounts.sell?.info.id,
          }),
        orderData.amounts.buy &&
          orderData.amounts.sell &&
          dexhunterApi.estimate({
            amountIn: Number(orderData.amounts.sell.quantity),
            tokenIn: orderData.amounts.sell.info.id,
            tokenOut: orderData.amounts.buy.info.id,
          }),
      ])
    },
  })

  return (
    <View style={styles.column}>
      <Text style={styles.label}>Dexhunter Avg Price && Estimate</Text>

      <Text style={styles.sheetContent}>{JSON.stringify(data, null, 2)}</Text>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    column: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    label: {
      ...atoms.body_1_lg_regular,
      color: color.gray_600,
    },
    sheetContent: {
      ...atoms.body_1_lg_regular,
      ...atoms.px_lg,
      color: color.gray_900,
    },
  })

  const colors = {
    icon: color.gray_max,
  }

  return {styles, colors}
}
