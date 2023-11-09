import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Boundary} from '../../../../../components'
import {useWalletNavigation} from '../../../../../navigation'
import {useSearchOnNavBar} from '../../../../../Search/SearchContext'
import {COLORS} from '../../../../../theme'
import {ButtonGroup} from '../../../common/ButtonGroup/ButtonGroup'
import {useStrings} from '../../../common/strings'
import {CompletedOrders, CompletedOrdersSkeleton} from './CompletedOrders'
import {OpenOrders, OpenOrdersSkeleton} from './OpenOrders'
import {ErrorBoundary} from 'react-error-boundary'
import {ServiceUnavailable} from '../../../common/ServiceUnavailable/ServiceUnavailable'

export const ListOrders = () => {
  const {navigateToTxHistory} = useWalletNavigation()
  const [orderStatusIndex, setOrderStatusIndex] = React.useState(0)

  const strings = useStrings()

  const orderStatusLabels = [strings.openOrders, strings.completedOrders]
  const handleSelectOrderStatus = (index: number) => {
    setOrderStatusIndex(index)
  }

  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.swapTitle,
    isChild: true,
    onBack: navigateToTxHistory,
  })

  return (
    <View style={styles.root}>
      <View style={styles.buttonsGroup}>
        <ButtonGroup labels={orderStatusLabels} onSelect={handleSelectOrderStatus} selected={orderStatusIndex} />
      </View>

      {orderStatusIndex === 0 ? (
        <Boundary loading={{fallback: <OpenOrdersSkeleton />}}>
          <ErrorBoundary
            fallbackRender={({resetErrorBoundary}) => <ServiceUnavailable resetErrorBoundary={resetErrorBoundary} />}
          >
            <OpenOrders />
          </ErrorBoundary>
        </Boundary>
      ) : (
        <Boundary loading={{fallback: <CompletedOrdersSkeleton />}}>
          <ErrorBoundary
            fallbackRender={({resetErrorBoundary}) => <ServiceUnavailable resetErrorBoundary={resetErrorBoundary} />}
          >
            <CompletedOrders />
          </ErrorBoundary>
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
