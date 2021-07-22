// @flow

import React, {useCallback} from 'react'
import {TouchableOpacity, Image} from 'react-native'

import {useCopy} from '../../utils/useCopy'
import copyIcon from '../../assets/img/icon/copy-ext.png'
import copiedIcon from '../../assets/img/icon/copied.png'

export type CopyProps = {|
  value: string,
|}

export const CopyView = ({value}: CopyProps) => {
  const [isCopying, copy] = useCopy()
  const _copyHandler = useCallback(() => {
    copy(value)
  }, [copy, value])
  return (
    <TouchableOpacity accessibilityRole="button" onPress={_copyHandler} disabled={isCopying}>
      <Image source={isCopying ? copiedIcon : copyIcon} />
    </TouchableOpacity>
  )
}

export default CopyView
