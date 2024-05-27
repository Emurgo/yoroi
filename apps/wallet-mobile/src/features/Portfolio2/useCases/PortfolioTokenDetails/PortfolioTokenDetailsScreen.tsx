/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable react-native/no-raw-text */
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Animated, NativeScrollEvent, NativeSyntheticEvent, StyleSheet} from 'react-native'

import {Spacer} from '../../../../components'
import {PortfolioTokenAction} from './PortfolioTokenAction'
import {PortfolioTokenBalance} from './PortfolioTokenBalance/PortfolioTokenBalance'
import {PortfolioTokenChart} from './PortfolioTokenChart/PortfolioTokenChart'
import {PortfolioTokenInfo} from './PortfolioTokenInfo/PortfolioTokenInfo'

const HEADER_HEIGHT = 304

export const PortfolioTokenDetailsScreen = () => {
  const {styles} = useStyles()
  const scrollY = React.useRef(new Animated.Value(0)).current

  const [isScrolled, setIsScrolled] = React.useState(false)

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
    listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentScrollPosition = event.nativeEvent.contentOffset.y
      setIsScrolled(currentScrollPosition > HEADER_HEIGHT)
    },
  })

  /**
   * Prevent blank space because of tab scroll event unmounted
   */
  const handleTabChange = () => {
    scrollY.setValue(0)
  }

  return (
    <Animated.View style={styles.root}>
      <Animated.View
        style={[
          styles.header,
          isScrolled ? styles.headerInvisible : styles.headerVisible,
          {opacity: headerOpacity, height: invertHeaderHeight},
        ]}
      >
        <Spacer height={16} />

        <PortfolioTokenBalance />

        <Spacer height={16} />

        <PortfolioTokenChart />

        <Spacer height={16} />
      </Animated.View>

      <PortfolioTokenInfo
        onTabChange={handleTabChange}
        onScroll={onScroll}
        offsetTopContent={<Animated.View style={{height: headerHeight ?? 0}} />}
      />

      <PortfolioTokenAction />
    </Animated.View>
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
    headerVisible: {
      position: 'relative',
    },
    headerInvisible: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
    },
  })

  return {styles} as const
}
