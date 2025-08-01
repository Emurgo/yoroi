import * as React from 'react'
import {openSettings} from 'react-native-permissions'

import {Button, ButtonProps} from '~/ui/Button/Button'
import {useStrings} from '~/kernel/i18n/useStrings'

export const OpenDeviceAppSettingsButton = (
  props: Omit<ButtonProps, 'title' | 'onPress'>,
) => {
  const strings = useStrings()
  return (
    <Button
      onPress={() => openSettings()}
      title={strings.openAppSettings}
      {...props}
    />
  )
}
