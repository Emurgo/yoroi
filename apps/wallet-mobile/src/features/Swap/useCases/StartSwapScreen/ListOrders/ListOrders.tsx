import {useFocusEffect} from '@react-navigation/native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Boundary} from '../../../../../components'
import {useMetrics} from '../../../../../metrics/metricsManager'
import {useSearchOnNavBar} from '../../../../../Search/SearchContext'
import {COLORS} from '../../../../../theme'
import {ButtonGroup} from '../../../common/ButtonGroup/ButtonGroup'
import {useStrings} from '../../../common/strings'
import {CompletedOrders, CompletedOrdersSkeleton} from './CompletedOrders'
import {OpenOrders, OpenOrdersSkeleton} from './OpenOrders'

export const ListOrders = () => {
  const [orderStatusIndex, setOrderStatusIndex] = React.useState(0)

  const strings = useStrings()
  const {track} = useMetrics()

  const orderStatusLabels = [strings.openOrders, strings.completedOrders]
  const handleSelectOrderStatus = (index: number) => {
    setOrderStatusIndex(index)
  }

  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.swapTitle,
  })

  useFocusEffect(
    React.useCallback(() => {
      console.log('swapConfirmedPageViewed')
      track.swapConfirmedPageViewed()
    }, [track]),
  )

  return (
    <View style={styles.keyboard}>
      <View style={styles.buttonsGroup}>
        <ButtonGroup labels={orderStatusLabels} onSelect={handleSelectOrderStatus} selected={orderStatusIndex} />
      </View>

      {orderStatusIndex === 0 ? (
        <Boundary loading={{fallback: <OpenOrdersSkeleton />}}>
          <OpenOrders />
        </Boundary>
      ) : (
        <Boundary loading={{fallback: <CompletedOrdersSkeleton />}}>
          <CompletedOrders />
        </Boundary>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  buttonsGroup: {
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  keyboard: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.WHITE,
  },
})
