import * as React from 'react'

import {useModal} from '../context/ModalContext'

type UseModalKeyboardResizeOptions = {
  defaultHeight: number
  focusedHeight: number
}

export const useModalKeyboardResize = ({
  defaultHeight,
  focusedHeight,
}: UseModalKeyboardResizeOptions) => {
  const {setHeight} = useModal()
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const scheduleHeightChange = React.useCallback(
    (targetHeight: number, delay: number = 150) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setHeight(targetHeight), delay)
    },
    [setHeight],
  )

  const handleInputFocus = React.useCallback(() => {
    scheduleHeightChange(focusedHeight)
  }, [scheduleHeightChange, focusedHeight])

  const handleInputBlur = React.useCallback(() => {
    scheduleHeightChange(defaultHeight)
  }, [scheduleHeightChange, defaultHeight])

  return {
    handleInputFocus,
    handleInputBlur,
    scheduleHeightChange,
  }
}
