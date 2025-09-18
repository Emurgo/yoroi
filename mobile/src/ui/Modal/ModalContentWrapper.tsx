import {atoms as a} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from 'react-native-gesture-handler'
import {runOnJS} from 'react-native-reanimated'
import {SafeAreaView} from 'react-native-safe-area-context'

import {DISMISS_THRESHOLD} from './ModalScreen'
import {useDismissOrClose} from './hooks'

type Props = {
  content: React.ReactNode
  footer?: React.ReactNode
}

export const ModalContentWrapper = ({content, footer}: Props) => {
  const [scrollY, setScrollY] = React.useState(0)
  const scrollViewRef = React.useRef<ScrollView>(null)
  const handleDismissOrClose = useDismissOrClose()

  const tryDismiss = React.useCallback(() => {
    if (scrollY <= 0) handleDismissOrClose()
  }, [scrollY, handleDismissOrClose])

  const nativeGesture = Gesture.Native()
  const tapGesture = Gesture.Tap().maxDeltaX(10).maxDeltaY(10).maxDuration(250) // to detect tap on the scroll view
  const panToDismiss = Gesture.Pan()
    .enabled(scrollY <= 0)
    .activeOffsetY([24, 9999])
    .minDistance(24)
    .onEnd((event) => {
      'worklet'
      if (event.translationY > DISMISS_THRESHOLD) {
        runOnJS(tryDismiss)()
      }
    })

  const gesture = Gesture.Simultaneous(
    nativeGesture,
    Gesture.Exclusive(tapGesture, panToDismiss),
  )

  React.useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.flashScrollIndicators()
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <SafeAreaView style={[a.flex_1, a.pb_lg]}>
      <GestureDetector gesture={gesture}>
        <ScrollView
          ref={scrollViewRef}
          bounces={false}
          nestedScrollEnabled
          overScrollMode="never"
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator
          contentContainerStyle={[a.flex_grow, a.px_lg]}
          style={[a.flex_1]}
          removeClippedSubviews={false}
          onScroll={(e) => {
            const newScrollY = e.nativeEvent.contentOffset.y
            setScrollY(newScrollY)
          }}
          scrollEventThrottle={16}
          onMomentumScrollEnd={() => {
            if (scrollY <= 0) handleDismissOrClose()
          }}
        >
          <View style={[{pointerEvents: 'box-none'}, [a.flex_grow]]}>
            {content}
          </View>
        </ScrollView>
      </GestureDetector>

      {footer != null && <View style={[a.pt_lg, a.px_lg]}>{footer}</View>}
    </SafeAreaView>
  )
}
