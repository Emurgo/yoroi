// @flow

import React from 'react'
import {TouchableOpacity, Image} from 'react-native'

import {useCopy} from '../../utils/useCopy'
import copyIcon from '../../assets/img/icon/copy-ext.png'
import copiedIcon from '../../assets/img/icon/copied.png'

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
