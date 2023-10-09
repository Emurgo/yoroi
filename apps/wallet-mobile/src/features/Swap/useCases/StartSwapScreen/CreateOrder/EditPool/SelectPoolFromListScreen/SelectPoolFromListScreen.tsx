import {useSwap} from '@yoroi/swap'
import React from 'react'
import {ScrollView} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {COLORS} from '../../../../../../../theme'
import {Counter} from '../../../../../common/Counter/Counter'
import {SelectPoolFromList} from '../../../../../common/SelectPool/SelectPoolFromList/SelectPoolFromList'
import {useStrings} from '../../../../../common/strings'

export const SelectPoolFromListScreen = () => {
  const strings = useStrings()
  const {orderData} = useSwap()

  const {pools} = orderData

  const poolCounter = Array.isArray(pools) ? pools.length : 0

  return (
    <SafeAreaView style={{backgroundColor: COLORS.WHITE, paddingBottom: 16}}>
      <ScrollView>
        <SelectPoolFromList pools={pools} />

        <Counter counter={poolCounter} customText={strings.pools(poolCounter)} />
      </ScrollView>
    </SafeAreaView>
  )
}
