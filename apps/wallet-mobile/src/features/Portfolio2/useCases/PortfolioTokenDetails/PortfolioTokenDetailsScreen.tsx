import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Animated, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Spacer} from '../../../../components'
import {Tab, Tabs} from '../../../../components/Tabs'
import {useStrings} from '../../common/useStrings'
import {PortfolioTokenAction} from './PortfolioTokenAction'
import {PortfolioTokenBalance} from './PortfolioTokenBalance/PortfolioTokenBalance'
import {PortfolioTokenChart} from './PortfolioTokenChart/PortfolioTokenChart'
import {PortfolioTokenInfo} from './PortfolioTokenInfo/PortfolioTokenInfo'

const HEADER_HEIGHT = 304
export type ActiveTab = 'performance' | 'overview' | 'transactions'
export const PortfolioTokenDetailsScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const scrollY = React.useRef(new Animated.Value(0)).current

  const [activeTab, setActiveTab] = React.useState<ActiveTab>('performance')

  // Animation for header opacity
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  })

  // Calculate the header's height based on scroll position and header height
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, HEADER_HEIGHT],
    extrapolate: 'clamp',
  })

  const invertHeaderHeight = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [HEADER_HEIGHT, 0],
    extrapolate: 'clamp',
  })

  const onScroll = Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {
    useNativeDriver: false,
  })

  /**
   * Prevent blank space because of tab scroll event unmounted
   */
  const handleTabChange = () => {
    scrollY.setValue(0)
  }

  const handleChangeTab = (value: ActiveTab) =>
    React.startTransition(() => {
      setActiveTab(value)
      handleTabChange()
    })

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <Animated.View style={{opacity: headerOpacity, height: invertHeaderHeight}}>
        <Animated.View
          style={[
            styles.header,
            styles.headerInvisible,
            // isScrolled ? styles.headerInvisible : styles.headerVisible,
          ]}
        >
          <Spacer height={16} />

          <PortfolioTokenBalance />

          <Spacer height={16} />

          <PortfolioTokenChart />

          <Spacer height={16} />
        </Animated.View>
      </Animated.View>

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

      <PortfolioTokenInfo
        activeTab={activeTab}
        onScroll={onScroll}
        offsetTopContent={<Animated.View style={{paddingTop: headerHeight ?? 0}} />}
      />

      <PortfolioTokenAction />
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      backgroundColor: color.gray_cmin,
    },
    header: {
      overflow: 'hidden',
      height: HEADER_HEIGHT,
      ...atoms.px_lg,
    },
    headerInvisible: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
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
