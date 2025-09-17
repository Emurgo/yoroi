import {atoms as a} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'
import type {GestureType} from 'react-native-gesture-handler'
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from 'react-native-gesture-handler'
import {runOnJS} from 'react-native-reanimated'
import {SafeAreaView} from 'react-native-safe-area-context'


import {useDismissOrClose} from './hooks'

type Props = {
  content: React.ReactNode
  footer?: React.ReactNode
}

export const ModalContentWrapper = ({content, footer}: Props) => {
  const [scrollY, setScrollY] = React.useState(0)
  const [scrollViewHeight, setScrollViewHeight] = React.useState(0)
  const panRef = React.useRef<GestureType | undefined>(undefined)
  const handleDismissOrClose = useDismissOrClose()


  const panGesture = Gesture.Pan()
    .withRef(panRef)
    .enabled(scrollY <= 0)
    .activeOffsetY([10, 9999])
    .onUpdate((event) => {
      'worklet'
      if (scrollViewHeight > 0 && scrollY <= 0 && event.translationY > 60) {
        runOnJS(handleDismissOrClose)()
      }
    })

  return (
    <SafeAreaView style={[a.flex_1, a.pb_lg]}>
      <GestureDetector gesture={panGesture}>
        <ScrollView
          bounces={false}
          nestedScrollEnabled
          overScrollMode="always"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          contentContainerStyle={[a.flex_grow, a.px_lg]}
          style={[a.flex_1]}
          simultaneousHandlers={panRef}
          onScroll={(e) => {
            const newScrollY = e.nativeEvent.contentOffset.y
            setScrollY(newScrollY)
            if (newScrollY <= -60) handleDismissOrClose()
          }}
          onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
          scrollEventThrottle={16}
        >
          {content}
        </ScrollView>
      </GestureDetector>

      {footer != null && <View style={[a.pt_lg, a.px_lg]}>{footer}</View>}
    </SafeAreaView>
  )
}
