// @flow

import {useEffect, useState} from 'react'
import Clipboard from '@react-native-community/clipboard'

const MESSAGE_TIMEOUT = 1500

export const useCopy = () => {
  const [copying, setCopying] = useState<string>('')

  useEffect(() => {
    const isCopying = !!copying
    if (isCopying) {
      const timeout = setTimeout(() => {
        clearTimeout(timeout)
        Clipboard.setString(copying)
        setCopying('')
      }, MESSAGE_TIMEOUT)
    }
  }, [copying, setCopying])

  return [!!copying, setCopying]
}
