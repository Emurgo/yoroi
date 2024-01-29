import React from 'react'
import {ScrollView as RNScrollView, ScrollViewProps, View} from 'react-native'

export const ScrollView = ({
  children,
  onScrollBarChange,
  ...props
}: ScrollViewProps & {onScrollBarChange?: (isScrollBarShown: boolean) => void}) => {
  const [wrapperHeight, setWrapperHeight] = React.useState(0)

  return (
    <RNScrollView
      onLayout={(event) => {
        if (!onScrollBarChange) return

        const {height} = event.nativeEvent.layout

        if (wrapperHeight > Math.trunc(height)) onScrollBarChange(true)
        else onScrollBarChange(false)
      }}
      {...props}
    >
      <View onLayout={(event) => setWrapperHeight(Math.trunc(event.nativeEvent.layout.height))}>{children}</View>
    </RNScrollView>
  )
}
