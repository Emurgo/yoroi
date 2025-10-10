import {time} from '@yoroi/common'

import * as React from 'react'
import {Keyboard, Platform} from 'react-native'

import {useScrollViewContext} from './context'

export const useFlashAndScroll = () => {
  const {scrollViewRef} = useScrollViewContext()

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
  }, [scrollViewRef])

  return scrollViewRef
}
