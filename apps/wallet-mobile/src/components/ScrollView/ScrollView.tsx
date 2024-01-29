import React from 'react'
import {
  Keyboard,
  KeyboardEvent,
  ScrollView as RNScrollView,
  ScrollViewProps /* useWindowDimensions */,
} from 'react-native'

export const ScrollView = ({
  children,
  onScrollBarChange,
  ...props
}: ScrollViewProps & {onScrollBarChange?: (isScrollBarShown: boolean) => void}) => {
  // const {height: deviceHeight} = useWindowDimensions()
  /* const keyboardHeight = useKeyboard() */
  const [viewHeight, setViewHeight] = React.useState(0)

  return (
    <RNScrollView
      onLayout={(event) => {
        if (!onScrollBarChange) return

        const {height: newViewHeight} = event.nativeEvent.layout

        console.log('newViewHeight', newViewHeight)
        console.log('viewHeight', viewHeight)

        if (viewHeight === 0) {
          setViewHeight(newViewHeight)
          return
        }

        if (newViewHeight < viewHeight) {
          onScrollBarChange(true)
        } else onScrollBarChange(false)

        setViewHeight(newViewHeight)
      }}
      {...props}
    >
      {children}
    </RNScrollView>
  )
}

const useKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = React.useState(0)

  React.useEffect(() => {
    const onKeyboardDidShow = (e: KeyboardEvent) => {
      setKeyboardHeight(e.endCoordinates.height)
    }

    const onKeyboardDidHide = () => {
      setKeyboardHeight(0)
    }

    const showSubscription = Keyboard.addListener('keyboardDidShow', onKeyboardDidShow)
    const hideSubscription = Keyboard.addListener('keyboardDidHide', onKeyboardDidHide)
    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  return keyboardHeight
}
