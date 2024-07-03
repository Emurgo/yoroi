import {useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Counter} from '../../../../../common/Counter/Counter'
import {SelectPoolFromList} from '../../../../../common/SelectPool/SelectPoolFromList/SelectPoolFromList'
import {useStrings} from '../../../../../common/strings'

export const SelectPoolFromListScreen = () => {
  const strings = useStrings()
  const {orderData} = useSwap()
  const styles = useStyles()

  const {pools} = orderData

  const poolCounter = Array.isArray(pools) ? pools.length : 0

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <ScrollView>
        <SelectPoolFromList pools={pools} />
      </ScrollView>

      <Counter counter={poolCounter} unitsText={strings.pools(poolCounter)} closingText={strings.available} />
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color} = useTheme()

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.gray_cmin,
    },
  })

  return styles
}
