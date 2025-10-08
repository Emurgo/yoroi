import * as React from 'react'
import {ScrollView as RNScrollView, ScrollViewProps} from 'react-native'

import {useScrollViewContext} from './context'
import {useFlashAndScroll} from './useFlashAndScroll'

export const ScrollView = React.forwardRef<RNScrollView, Props>(
  ({onLayout, onContentSizeChange, ...rest}, ref) => {
    const [containerHeight, setContainerHeight] = React.useState(0)
    const [contentSize, setContentSize] = React.useState({width: 0, height: 0})
    const {setIsScrollBarShown} = useScrollView()

    const checkScrollability = React.useCallback(() => {
      if (containerHeight === 0 || contentSize.height === 0) {
        return
      }

      const isScrollable = contentSize.height > containerHeight
      setIsScrollBarShown(isScrollable)
    }, [containerHeight, contentSize.height, setIsScrollBarShown])

    React.useEffect(() => {
      checkScrollability()
    }, [checkScrollability])

    return (
      <RNScrollView
        ref={ref}
        onLayout={(event) => {
          const newHeight = Math.trunc(event.nativeEvent.layout.height)
          setContainerHeight(newHeight)
          onLayout?.(event)
        }}
        onContentSizeChange={(contentWidth, contentHeight) => {
          setContentSize({width: contentWidth, height: contentHeight})
          onContentSizeChange?.(contentWidth, contentHeight)
        }}
        {...rest}
      />
    )
  },
)

type Props = ScrollViewProps & {
  onScrollBarChange?: (isScrollBarShown: boolean) => void
}
