import {useTheme} from '@yoroi/theme'
import React from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {StyleSheet, View} from 'react-native'

import {Boundary} from '../../../../components/Boundary/Boundary'
import {Button, ButtonType} from '../../../../components/Button/Button'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {useSearchOnNavBar} from '../../../Search/SearchContext'
import {ServiceUnavailable} from '../../common/ServiceUnavailable/ServiceUnavailable'
import {useStrings} from '../../common/strings'
// import {CompletedOrders, CompletedOrdersSkeleton} from './CompletedOrders'
// import {OpenOrders, OpenOrdersSkeleton} from './OpenOrders'
// TODO
const CompletedOrders = () => null
const CompletedOrdersSkeleton = () => null
const OpenOrders = () => null
const OpenOrdersSkeleton = () => null

export const ListOrders = () => {
  const {navigateToTxHistory} = useWalletNavigation()
  const [filter, setFilter] = React.useState<'open' | 'completed'>('open')

  const strings = useStrings()
  const styles = useStyles()

  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.swapTitle,
    isChild: true,
    onBack: navigateToTxHistory,
  })

  return (
    <View style={styles.root}>
      <View style={styles.group}>
        <View>
          <Button
            onPress={() => setFilter('open')}
            type={ButtonType.SecondaryText}
            title={strings.openOrders}
            size="S"
            {...(filter === 'open' && {style: styles.activeButton})}
          />
        </View>

        <View>
          <Button
            onPress={() => setFilter('completed')}
            type={ButtonType.SecondaryText}
            title={strings.completedOrders}
            size="S"
            {...(filter === 'completed' && {style: styles.activeButton})}
          />
        </View>
      </View>

      {filter === 'open' ? (
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
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    group: {
      ...atoms.flex_row,
      ...atoms.gap_md,
    },
    root: {
      ...atoms.flex_1,
      ...atoms.justify_between,
      ...atoms.p_lg,
      backgroundColor: color.bg_color_max,
    },
    activeButton: {
      backgroundColor: color.el_gray_min,
    },
  })
  return styles
}
