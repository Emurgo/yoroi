import React from 'react'
import {Image, TouchableOpacity} from 'react-native'

import copiedIcon from '../assets/img/icon/copied.png'
import copyIcon from '../assets/img/icon/copy-ext.png'
import {useCopy} from '../legacy/useCopy'

export type CopyButtonProps = {
  value: string
  onCopy?: () => void
}

export const CopyButton = ({value, onCopy}: CopyButtonProps) => {
  const [isCopying, copy] = useCopy()

  return (
    <TouchableOpacity
      onPress={() => {
        copy(value)
        onCopy?.()
      }}
      disabled={isCopying}
    >
      <Image source={isCopying ? copiedIcon : copyIcon} />
    </TouchableOpacity>
  )
}
