import * as React from 'react'
import {Keyboard, Platform} from 'react-native'

type Props = {
  onKeyboardChange?: (isOpen: boolean) => void
}

const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

export const useIsKeyboardOpen = ({onKeyboardChange}: Props = {}) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = React.useState(false)

  React.useEffect(() => {
    const showListener = Keyboard.addListener(showEvent, () => {
      setIsKeyboardOpen(true)
      onKeyboardChange?.(true)
    })
    const hideListener = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardOpen(false)
      onKeyboardChange?.(false)
    })

    return () => {
      showListener.remove()
      hideListener.remove()
    }
  }, [onKeyboardChange])

  return isKeyboardOpen
}
