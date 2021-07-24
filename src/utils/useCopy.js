// @flow

import {useEffect, useState} from 'react'
import Clipboard from '@react-native-community/clipboard'

const MESSAGE_TIMEOUT = 1500

export const useCopy = () => {
  const [copying, setCopying] = useState<string>('')

  useEffect(() => {
    const isCopying = !!copying
    let timeout
    if (isCopying) {
      Clipboard.setString(copying)
      timeout = setTimeout(() => {
        setCopying('')
      }, MESSAGE_TIMEOUT)
    }
    return () => clearTimeout(timeout)
  }, [copying, setCopying])

  return [!!copying, setCopying]
}
