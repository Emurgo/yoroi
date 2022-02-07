import {useRef} from 'react'
import {NativeScrollEvent, NativeSyntheticEvent} from 'react-native'

export const useOnScroll = ({onScrollUp, onScrollDown}) => {
  const scrollOffset = useRef(0)

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {nativeEvent} = event
    const topBounce = nativeEvent.contentOffset.y <= 0
    const bottomBounce =
      nativeEvent.contentSize.height - nativeEvent.contentOffset.y - nativeEvent.layoutMeasurement.height <= 0

    if (topBounce) return // ignore top bounce
    if (bottomBounce) return // ignore bottom bounce

    const scrollUp = nativeEvent.contentOffset.y > scrollOffset.current
    const scrollDown = nativeEvent.contentOffset.y < scrollOffset.current

    if (scrollUp) {
      onScrollUp(event)
    }

    if (scrollDown) {
      onScrollDown(event)
    }

    scrollOffset.current = nativeEvent.contentOffset.y
  }

  return onScroll
}
