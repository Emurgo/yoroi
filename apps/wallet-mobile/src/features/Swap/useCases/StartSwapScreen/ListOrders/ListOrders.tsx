import {useOrderByStatusCompleted, useOrderByStatusOpen} from '@yoroi/swap'
import React, {useState} from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary} from '../../../../../components'
import {useSearch, useSearchOnNavBar} from '../../../../../Search/SearchContext'
import {COLORS} from '../../../../../theme'
import {ButtonGroup} from '../../../common/ButtonGroup/ButtonGroup'
import {Counter} from '../../../common/Counter/Counter'
import {useStrings} from '../../../common/strings'
import {ClosedOrders, ClosedOrdersSkeleton} from './ClosedOrders'
import {mapOrders} from './mapOrders'
import {OpenOrders, OpenOrdersSkeleton} from './OpenOrders'

export const ListOrders = () => {
  const strings = useStrings()

  const [orderStatusIndex, setOrderStatusIndex] = useState<number>(0)
  // TODO: @SorinC6: is it completed or closed orders?
  const orderStatusLabels = [strings.openOrders, strings.completedOrders]
  const handleSelectOrderStatus = (index: number) => {
    setOrderStatusIndex(index)
  }

  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.swapTitle,
  })

  const {search} = useSearch()

  const openOrdersData = useOrderByStatusOpen({
    onError: (err) => {
      console.log(err)
    },
  })

  const closedOrdersData = useOrderByStatusCompleted({
    onError: (err) => {
      console.log(err)
    },
  })

  const openOrders = mapOrders(openOrdersData).filter(
    ({assetFromLabel, assetToLabel}) =>
      assetFromLabel.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      assetToLabel.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  )

  const closedOrders = mapOrders(closedOrdersData).filter(
    ({assetFromLabel, assetToLabel}) =>
      assetFromLabel.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      assetToLabel.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  )

  console.log('openOrders', openOrders)

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <ScrollView style={styles.keyboard}>
        <View style={styles.buttonsGroup}>
          <ButtonGroup labels={orderStatusLabels} onSelect={handleSelectOrderStatus} selected={orderStatusIndex} />
        </View>

        <>
          {orderStatusIndex === 0 ? (
            <Boundary loading={{fallback: <OpenOrdersSkeleton />}}>
              <OpenOrders orders={openOrders} />
            </Boundary>
          ) : (
            <Boundary loading={{fallback: <ClosedOrdersSkeleton />}}>
              <ClosedOrders orders={closedOrders} />
            </Boundary>
          )}
        </>
      </ScrollView>

      <Counter
        counter={orderStatusIndex === 0 ? openOrders.length : closedOrders.length}
        customText={orderStatusIndex === 0 ? strings.listOpenOrders : strings.listCompletedOrders}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  buttonsGroup: {
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  keyboard: {
    flex: 1,
  },
})
