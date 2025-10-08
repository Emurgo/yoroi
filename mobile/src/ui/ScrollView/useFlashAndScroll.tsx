import {time} from '@yoroi/common'

import * as React from 'react'
import {Keyboard, Platform, ScrollView} from 'react-native'

export const useFlashAndScroll = () => {
  const scrollViewRef = React.useRef<ScrollView | null>(null)

  React.useLayoutEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.flashScrollIndicators()
    }, time.seconds(0.3))

    const event =
      Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow'

    const showSubscription = Keyboard.addListener(event, () => {
      scrollViewRef.current?.scrollToEnd()
    })

    return () => {
      showSubscription.remove()
    }
  }, [])

  return scrollViewRef
}
