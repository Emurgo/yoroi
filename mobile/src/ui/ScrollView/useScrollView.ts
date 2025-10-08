import { useScrollViewContext } from './context'
import { useFlashAndScroll } from './useFlashAndScroll'

export const useScrollView = () => {
  useFlashAndScroll()
  const {scrollViewRef, isScrollBarShown, setIsScrollBarShown} =
    useScrollViewContext()

  return {
    scrollViewRef,
    isScrollBarShown,
    setIsScrollBarShown,
  }
}
