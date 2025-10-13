import {useScrollViewContext} from '../context/ScrollViewContext'

export const useScrollView = () => {
  const {scrollViewRef, isScrollBarShown, setIsScrollBarShown} =
    useScrollViewContext()

  return {
    scrollViewRef,
    isScrollBarShown,
    setIsScrollBarShown,
  }
}
