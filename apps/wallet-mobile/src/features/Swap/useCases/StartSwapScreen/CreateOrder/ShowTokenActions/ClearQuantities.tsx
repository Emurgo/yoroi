import {useSwap} from '@yoroi/swap'
import React from 'react'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon} from '../../../../../../components/Icon'

export const ClearQuantities = () => {
  const {switchTokens} = useSwap()

  return (
    <TouchableOpacity onPress={switchTokens}>
      <Icon.Switch size={24} />
    </TouchableOpacity>
  )
}
