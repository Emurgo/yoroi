import {usePoolsByPair, useSwap} from '@yoroi/swap'
import React from 'react'
import {ScrollView} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Counter} from '../../../../../common/Counter/Counter'
import {SelectPoolFromList} from '../../../../../common/SelectPool/SelectPoolFromList/SelectPoolFromList'

export const SelectPoolFromListScreen = () => {
  const {createOrder} = useSwap()

  const {poolList} = usePoolsByPair({
    tokenA: createOrder.amounts.sell.tokenId,
    tokenB: createOrder.amounts.buy.tokenId,
  })

  return (
    <SafeAreaView>
      <ScrollView>
        <SelectPoolFromList data={poolList !== undefined ? poolList : undefined} />

        <Counter counter={poolList !== undefined ? poolList.length : 0} />
      </ScrollView>
    </SafeAreaView>
  )
}
