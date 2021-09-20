// @flow

import React from 'react'
import {Image, TouchableOpacity} from 'react-native'

import copiedIcon from '../../assets/img/icon/copied.png'
import copyIcon from '../../assets/img/icon/copy-ext.png'
import {useCopy} from '../../utils/useCopy'

export type CopyButtonProps = {|
  value: string,
|}

export const CopyButton = ({value}: CopyButtonProps) => {
  const [isCopying, copy] = useCopy()
  return (
    <TouchableOpacity accessibilityRole="button" onPress={() => copy(value)} disabled={isCopying}>
      <Image source={isCopying ? copiedIcon : copyIcon} />
    </TouchableOpacity>
  )
}

export default CopyButton
