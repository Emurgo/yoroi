import {useScrollViewContext} from './context'
import {useFlashAndScroll} from './useFlashAndScroll'

export const useScrollView = () => {
  const scrollViewRef = useFlashAndScroll()
  const {isScrollBarShown, setIsScrollBarShown} = useScrollViewContext()

  return {
    scrollViewRef,
    isScrollBarShown,
    setIsScrollBarShown,
  }
}
