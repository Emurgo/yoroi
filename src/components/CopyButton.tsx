import React from 'react'
import {Image, TouchableOpacity} from 'react-native'

import copiedIcon from '../../legacy/assets/img/icon/copied.png'
import copyIcon from '../../legacy/assets/img/icon/copy-ext.png'
import {useCopy} from '../../legacy/utils/useCopy'

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
