import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Boundary} from '../../../../../components'
import {useSearchOnNavBar} from '../../../../../Search/SearchContext'
import {COLORS} from '../../../../../theme'
import {useOverridePreviousRoute} from '../../../../../utils/navigation'
import {ButtonGroup} from '../../../common/ButtonGroup/ButtonGroup'
import {useStrings} from '../../../common/strings'
import {CompletedOrders, CompletedOrdersSkeleton} from './CompletedOrders'
import {OpenOrders, OpenOrdersSkeleton} from './OpenOrders'

export const ListOrders = () => {
  const [orderStatusIndex, setOrderStatusIndex] = React.useState(0)

  const strings = useStrings()

  const orderStatusLabels = [strings.openOrders, strings.completedOrders]
  const handleSelectOrderStatus = (index: number) => {
    setOrderStatusIndex(index)
  }

  useOverridePreviousRoute('history-list')

  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.swapTitle,
    isChild: true,
  })

  return (
    <View style={styles.root}>
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
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  root: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: COLORS.WHITE,
  },
})
