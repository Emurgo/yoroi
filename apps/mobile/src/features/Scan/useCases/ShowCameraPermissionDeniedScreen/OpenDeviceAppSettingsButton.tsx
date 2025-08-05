import * as React from 'react'
import {Linking} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonProps} from '~/ui/Button/Button'

export const OpenDeviceAppSettingsButton = (
  props: Omit<ButtonProps, 'title' | 'onPress'>,
) => {
  const strings = useStrings()
  return (
    <Button
      onPress={() => Linking.openSettings()}
      title={strings.openAppSettings}
      {...props}
    />
  )
}
