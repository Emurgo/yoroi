import React from 'react'
import {Keyboard, ScrollView} from 'react-native'

export const useFlashAndScroll = () => {
  const scrollViewRef = React.useRef<ScrollView | null>(null)

  React.useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.flashScrollIndicators()
    }, 500)

    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      scrollViewRef.current?.scrollToEnd()
    })

    return () => {
      showSubscription.remove()
    }
  }, [])

  return scrollViewRef
}
