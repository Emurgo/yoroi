import {useSwap} from '@yoroi/swap'
import React from 'react'
import {ScrollView, StyleSheet} from 'react-native'

import {Counter} from '../../../../../common/Counter/Counter'
import {SelectPoolFromList} from '../../../../../common/SelectPool/SelectPoolFromList/SelectPoolFromList'
import {useStrings} from '../../../../../common/strings'

export const SelectPoolFromListScreen = () => {
  const strings = useStrings()
  const {orderData} = useSwap()

  const {pools} = orderData

  const poolCounter = Array.isArray(pools) ? pools.length : 0

  return (
    <>
      <ScrollView>
        <SelectPoolFromList pools={pools} />
      </ScrollView>

      <Counter
        counter={poolCounter}
        unitsText={strings.pools(poolCounter)}
        closingText={strings.available}
        style={styles.counter}
      />
    </>
  )
}

const styles = StyleSheet.create({
  counter: {
    paddingVertical: 16,
  },
})
