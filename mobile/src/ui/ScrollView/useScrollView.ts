import {useScrollViewContext} from './context'

export const useScrollView = () => {
  const {scrollViewRef, isScrollBarShown, setIsScrollBarShown} =
    useScrollViewContext()

  return {
    scrollViewRef,
    isScrollBarShown,
    setIsScrollBarShown,
  }
}
