import {useSwap} from '@yoroi/swap'
import React from 'react'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon} from '../../../../../../components/Icon'
import {useSwapTouched} from '../TouchedContext'

export const SwitchTokens = () => {
  const {switchTokens} = useSwap()
  const {switchTouched} = useSwapTouched()

  const handleSwitch = () => {
    switchTokens()
    switchTouched()
  }

  return (
    <TouchableOpacity onPress={handleSwitch}>
      <Icon.Switch size={24} />
    </TouchableOpacity>
  )
}
