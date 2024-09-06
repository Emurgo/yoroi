import {useTheme} from '@yoroi/theme'
import React from 'react'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon} from '../../../../../../../components/Icon'
import {useSwapForm} from '../../../../../common/SwapFormProvider'

export const SwitchTokens = () => {
  const {switchTokens} = useSwapForm()
  const {color} = useTheme()

  return (
    <TouchableOpacity onPress={switchTokens}>
      <Icon.Switch size={24} color={color.text_primary_medium} />
    </TouchableOpacity>
  )
}
