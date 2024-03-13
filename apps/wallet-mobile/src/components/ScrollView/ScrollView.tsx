import React from 'react'
import {ScrollView as RNScrollView, ScrollViewProps, View} from 'react-native'

import {useFlashAndScroll} from '../../features/Send/common/useFlashAndScroll'

type Props = ScrollViewProps & {
  onScrollBarChange?: (isScrollBarShown: boolean) => void
  children: React.ReactNode
}

export const ScrollView = React.forwardRef<RNScrollView, Props>(({children, onScrollBarChange, ...props}, ref) => {
  const [wrapperHeight, setWrapperHeight] = React.useState(0)

  return (
    <RNScrollView
      ref={ref}
      onLayout={(event) => {
        if (onScrollBarChange) {
          const {height} = event.nativeEvent.layout

          const shouldChange = wrapperHeight > Math.trunc(height)
          onScrollBarChange(shouldChange)
        }
        props.onLayout?.(event)
      }}
      {...props}
    >
      <View onLayout={(event) => setWrapperHeight(Math.trunc(event.nativeEvent.layout.height))}>{children}</View>
    </RNScrollView>
  )
})

export const useScrollView = () => {
  const scrollViewRef = useFlashAndScroll()
  const [isScrollBarShown, setIsScrollBarShown] = React.useState(false)

  return {
    scrollViewRef,
    isScrollBarShown,
    setIsScrollBarShown,
  }
}
