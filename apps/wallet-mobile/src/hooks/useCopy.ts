import Clipboard from '@react-native-clipboard/clipboard'
import {useEffect, useState} from 'react'

const MESSAGE_TIMEOUT = 1500

export const useCopy = () => {
  const [text, setText] = useState<string>('')

  useEffect(() => {
    const isCopying = !!text

    let timeout: ReturnType<typeof setTimeout> | undefined
    if (isCopying) {
      Clipboard.setString(text)
      timeout = setTimeout(() => setText(''), MESSAGE_TIMEOUT)
    }

    return () => clearTimeout(timeout)
  }, [text])

  return [!!text, setText, text] as const
}
