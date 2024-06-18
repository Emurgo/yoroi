import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Animated, NativeScrollEvent, NativeSyntheticEvent, StyleSheet} from 'react-native'

import {Spacer} from '../../../../components'
import {Tab, Tabs} from '../../../../components/Tabs'
import {useStrings} from '../../common/useStrings'
import {PortfolioTokenAction} from './PortfolioTokenAction'
import {PortfolioTokenBalance} from './PortfolioTokenBalance/PortfolioTokenBalance'
import {PortfolioTokenChart} from './PortfolioTokenChart/PortfolioTokenChart'
import {PortfolioTokenInfo} from './PortfolioTokenInfo/PortfolioTokenInfo'
import {useTokenDetailTransactions} from './PortfolioTokenInfo/Transactions'
import {PortfolioTokenLayout} from './PortfolioTokenLayout'

const HEADER_HEIGHT = 304
export type ActiveTab = 'performance' | 'overview' | 'transactions'
export const PortfolioTokenDetailsScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  const [activeTab, setActiveTab] = React.useState<ActiveTab>('performance')
  const [isStickyTab, setIsStickyTab] = React.useState(false)

  const handleChangeTab = (value: ActiveTab) => {
    React.startTransition(() => {
      setActiveTab(value)
    })
  }

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y
    setIsStickyTab(offsetY > HEADER_HEIGHT)
  }

  const {getSectionListProps, loadingView} = useTokenDetailTransactions({
    active: activeTab === 'transactions',
  })

  const renderTabs = React.useMemo(() => {
    return (
      <Tabs style={styles.tabs}>
        <Tab
          style={styles.tab}
          active={activeTab === 'performance'}
          onPress={() => handleChangeTab('performance')}
          label={strings.performance}
        />

        <Tab
          style={styles.tab}
          active={activeTab === 'overview'}
          onPress={() => handleChangeTab('overview')}
          label={strings.overview}
        />

        <Tab
          style={styles.tab}
          active={activeTab === 'transactions'}
          onPress={() => handleChangeTab('transactions')}
          label={strings.transactions}
        />
      </Tabs>
    )
  }, [activeTab, strings.overview, strings.performance, strings.transactions, styles.tab, styles.tabs])

  return (
    <PortfolioTokenLayout
      topContent={
        <Animated.View style={[styles.tabsSticky, isStickyTab ? styles.tabsStickyActive : styles.tabsStickyInactive]}>
          {renderTabs}
        </Animated.View>
      }
      onScroll={onScroll}
      ListHeaderComponent={
        <>
          <Animated.View style={styles.header}>
            <Spacer height={16} />

            <PortfolioTokenBalance />

            <Spacer height={16} />

            <PortfolioTokenChart />

            <Spacer height={16} />
          </Animated.View>

          <Animated.View>{renderTabs}</Animated.View>

          <PortfolioTokenInfo activeTab={activeTab} />
        </>
      }
      ListFooterComponent={loadingView}
      {...getSectionListProps}
    >
      <PortfolioTokenAction />
    </PortfolioTokenLayout>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    header: {
      overflow: 'hidden',
      height: HEADER_HEIGHT,
      ...atoms.px_lg,
    },
    tabsSticky: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      zIndex: 10,
    },
    tabsStickyActive: {
      opacity: 1,
      display: 'flex',
    },
    tabsStickyInactive: {
      opacity: 0,
      display: 'none',
    },
    tabs: {
      ...atoms.justify_between,
      ...atoms.px_lg,
      backgroundColor: color.gray_cmin,
    },
    tab: {
      flex: 0,
    },
  })

  return {styles} as const
}
