import {useTheme} from '@yoroi/theme'
import React from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {StyleSheet, View} from 'react-native'

import {Boundary} from '../../../../../components'
import {useWalletNavigation} from '../../../../../navigation'
import {useSearchOnNavBar} from '../../../../../Search/SearchContext'
import {ButtonGroup} from '../../../common/ButtonGroup/ButtonGroup'
import {ServiceUnavailable} from '../../../common/ServiceUnavailable/ServiceUnavailable'
import {useStrings} from '../../../common/strings'
import {CompletedOrders, CompletedOrdersSkeleton} from './CompletedOrders'
import {OpenOrders, OpenOrdersSkeleton} from './OpenOrders'

export const ListOrders = () => {
  const {navigateToTxHistory} = useWalletNavigation()
  const [orderStatusIndex, setOrderStatusIndex] = React.useState(0)

  const strings = useStrings()
  const styles = useStyles()

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

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme
  const styles = StyleSheet.create({
    buttonsGroup: {
      paddingVertical: 24,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    root: {
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: color.gray.min,
    },
  })
  return styles
}
