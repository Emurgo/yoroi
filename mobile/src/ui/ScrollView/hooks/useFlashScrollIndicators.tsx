import {time} from '@yoroi/common'

import * as React from 'react'

import {useScrollViewContext} from '../context/ScrollViewContext'

export const useFlashScrollIndicators = () => {
  const {scrollViewRef} = useScrollViewContext()

  React.useLayoutEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.flashScrollIndicators()
    }, time.seconds(0.3))
  }, [scrollViewRef])
}
