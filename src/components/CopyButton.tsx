import React from 'react'
import {TouchableOpacity} from 'react-native'

import {Icon} from '../components'
import {useCopy} from '../legacy/useCopy'
import {COLORS} from '../theme'

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
      testID="copyButton"
    >
      {isCopying ? <Icon.CopySuccess size={26} color={COLORS.GRAY} /> : <Icon.Copy size={26} color={COLORS.GRAY} />}
    </TouchableOpacity>
  )
}
