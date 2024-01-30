import React from 'react'
import {ScrollView as RNScrollView, ScrollViewProps, View} from 'react-native'

export const ScrollView = ({
  children,
  onScrollBarChange,
  ...props
}: ScrollViewProps & {
  onScrollBarChange?: (isScrollBarShown: boolean) => void
  ref?: React.MutableRefObject<RNScrollView | null>
}) => {
  const [wrapperHeight, setWrapperHeight] = React.useState(0)

  return (
    <RNScrollView
      onLayout={(event) => {
        if (!onScrollBarChange) return

        const {height} = event.nativeEvent.layout

        const shouldChange = wrapperHeight > Math.trunc(height)
        onScrollBarChange(shouldChange)
        props.onLayout?.(event)
      }}
      {...props}
    >
      <View onLayout={(event) => setWrapperHeight(Math.trunc(event.nativeEvent.layout.height))}>{children}</View>
    </RNScrollView>
  )
}
