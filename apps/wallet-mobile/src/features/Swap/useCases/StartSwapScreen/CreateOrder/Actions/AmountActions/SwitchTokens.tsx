import React from 'react'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon} from '../../../../../../../components/Icon'
import {useSwapForm} from '../../../../../common/SwapFormProvider'

export const SwitchTokens = () => {
  const {switchTokens} = useSwapForm()

  return (
    <TouchableOpacity onPress={switchTokens}>
      <Icon.Switch size={24} />
    </TouchableOpacity>
  )
}
