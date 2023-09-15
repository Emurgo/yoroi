import {usePoolsByPair, useSwap} from '@yoroi/swap'
import React from 'react'
import {ScrollView} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {COLORS} from '../../../../../../../theme'
import {Counter} from '../../../../../common/Counter/Counter'
import {SelectPoolFromList} from '../../../../../common/SelectPool/SelectPoolFromList/SelectPoolFromList'
import {useStrings} from '../../../../../common/strings'

export const SelectPoolFromListScreen = () => {
  const strings = useStrings()
  const {createOrder} = useSwap()

  const {poolList} = usePoolsByPair({
    tokenA: createOrder.amounts.sell.tokenId,
    tokenB: createOrder.amounts.buy.tokenId,
  })

  return (
    <SafeAreaView style={{backgroundColor: COLORS.WHITE, paddingBottom: 16}}>
      <ScrollView>
        <SelectPoolFromList data={poolList} />

        <Counter
          counter={Array.isArray(poolList) ? poolList.length : 0}
          customText={strings.pools(Array.isArray(poolList) ? poolList.length : 0)}
        />
      </ScrollView>
    </SafeAreaView>
  )
}
