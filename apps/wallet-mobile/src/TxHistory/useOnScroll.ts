import {useRef} from 'react'
import {NativeScrollEvent, NativeSyntheticEvent, ScrollViewProps} from 'react-native'

const noop = () => undefined
const buffer = 100

type Callbacks = {
  onScrollUp?: ScrollViewProps['onScroll']
  onScrollDown?: ScrollViewProps['onScroll']
}
export const useOnScroll = ({onScrollUp = noop, onScrollDown = noop}: Callbacks) => {
  const previousScrollOffset = useRef(0)

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {nativeEvent} = event
    const topBounce = nativeEvent.contentOffset.y < 0
    const bottomBounce =
      nativeEvent.contentSize.height - nativeEvent.contentOffset.y - nativeEvent.layoutMeasurement.height < 0
    const topReached = nativeEvent.contentOffset.y === 0
    const scrollOffset = nativeEvent.contentOffset.y

    if (topBounce) return // ignore top bounce
    if (bottomBounce) return // ignore bottom bounce

    const scrollUp = scrollOffset < previousScrollOffset.current - buffer
    const scrollDown = scrollOffset > previousScrollOffset.current + buffer

    if (topReached || scrollUp) {
      onScrollUp(event)
    }

    if (scrollDown) {
      onScrollDown(event)
    }

    previousScrollOffset.current = nativeEvent.contentOffset.y
  }

  return onScroll
}
