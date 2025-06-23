import React from 'react'
import {Keyboard, Platform, ScrollView} from 'react-native'

export const useFlashAndScroll = () => {
  const scrollViewRef = React.useRef<ScrollView | null>(null)

  React.useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.flashScrollIndicators()
    }, 500)

    const event = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow'

    const showSubscription = Keyboard.addListener(event, () => {
      scrollViewRef.current?.scrollToEnd()
    })

    return () => {
      showSubscription.remove()
    }
  }, [])

  return scrollViewRef
}
