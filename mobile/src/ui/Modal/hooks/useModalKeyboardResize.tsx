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
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleInputFocus = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setHeight(focusedHeight), 150)
  }, [setHeight, focusedHeight])

  const handleInputBlur = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setHeight(defaultHeight), 150)
  }, [setHeight, defaultHeight])

  return {
    handleInputFocus,
    handleInputBlur,
  }
}
