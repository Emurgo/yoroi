import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

export const TabsGradient = ({children}: React.PropsWithChildren) => {
  const {styles} = useStyles()
  const [enableStartGradient, setEnableStartGradient] = React.useState(false)
  const [enableEndGradient, setEnableEndGradient] = React.useState(false)

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {x} = event.nativeEvent.contentOffset
    setEnableStartGradient(x > 0)
    setEnableEndGradient(x < event.nativeEvent.contentSize.width - event.nativeEvent.layoutMeasurement.width)
  }

  return (
    <View style={styles.scrollGradientContainer}>
      {enableStartGradient ? (
        <LinearGradient
          colors={['#FFFFFF', '#FFFFFF00']}
          style={styles.startGradientContainer}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        />
      ) : null}

      <ScrollView
        onScroll={handleScroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}
      >
        {children}
      </ScrollView>

      {enableEndGradient ? (
        <LinearGradient
          colors={['#FFFFFF00', '#FFFFFF']}
          style={styles.endGradientContainer}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        />
      ) : null}
    </View>
  )
}

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    startGradientContainer: {
      ...atoms.absolute,
      top: 0,
      width: 40,
      height: 40,
      start: 0,
      zIndex: 2,
    },
    endGradientContainer: {
      ...atoms.absolute,
      top: 0,
      width: 40,
      height: 40,
      end: 0,
      zIndex: 2,
    },
    scrollGradientContainer: {
      ...atoms.relative,
      ...atoms.align_center,
      ...atoms.flex_row,
    },
    scrollContainer: {
      ...atoms.gap_2xs,
      zIndex: 1,
    },
  })

  return {styles} as const
}
