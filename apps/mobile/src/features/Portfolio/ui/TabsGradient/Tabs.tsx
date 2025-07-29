import {atoms as a} from '@yoroi/theme'
import * as React from 'react'
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

export const TabsGradient = ({children}: React.PropsWithChildren) => {
  const [enableStartGradient, setEnableStartGradient] = React.useState(false)
  const [enableEndGradient, setEnableEndGradient] = React.useState(false)

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {x} = event.nativeEvent.contentOffset
    setEnableStartGradient(x > 0)
    setEnableEndGradient(
      x <
        event.nativeEvent.contentSize.width -
          event.nativeEvent.layoutMeasurement.width,
    )
  }

  return (
    <View style={[a.relative, a.align_center, a.flex_row]}>
      {enableStartGradient ? (
        <LinearGradient
          colors={['#FFFFFF', '#FFFFFF00']}
          style={[
            a.absolute,
            {top: 0, width: 40, height: 40, start: 0, zIndex: 2},
          ]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        />
      ) : null}

      <ScrollView
        onScroll={handleScroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[a.gap_2xs, {zIndex: 1}]}
      >
        {children}
      </ScrollView>

      {enableEndGradient ? (
        <LinearGradient
          colors={['#FFFFFF00', '#FFFFFF']}
          style={[
            a.absolute,
            {top: 0, width: 40, height: 40, end: 0, zIndex: 2},
          ]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        />
      ) : null}
    </View>
  )
}
