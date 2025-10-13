import * as React from 'react'
import {Keyboard} from 'react-native'

import {isAndroid} from '~/kernel/constants'

import {useScrollViewContext} from '../context/ScrollViewContext'

export const useScrollToEnd = () => {
  const {scrollViewRef} = useScrollViewContext()

  React.useLayoutEffect(() => {
    const event = isAndroid ? 'keyboardDidShow' : 'keyboardWillShow'

    const showSubscription = Keyboard.addListener(event, () => {
      scrollViewRef.current?.scrollToEnd()
    })

    return () => {
      showSubscription.remove()
    }
  }, [scrollViewRef])
}
