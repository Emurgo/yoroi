// @flow

import React, {useCallback} from 'react'
import {TouchableOpacity, Image} from 'react-native'

import {useCopy} from '../../utils/useCopy'
import copyIcon from '../../assets/img/icon/copy-ext.png'
import copiedIcon from '../../assets/img/icon/copied.png'

export type CopyButtonProps = {|
  value: string,
|}

export const CopyButton = ({value}: CopyButtonProps) => {
  const [isCopying, copy] = useCopy()
  const copyHandler = useCallback(() => {
    copy(value)
  }, [copy, value])
  return (
    <TouchableOpacity accessibilityRole="button" onPress={copyHandler} disabled={isCopying}>
      <Image source={isCopying ? copiedIcon : copyIcon} />
    </TouchableOpacity>
  )
}

export default CopyButton
