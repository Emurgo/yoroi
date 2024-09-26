import * as React from 'react'
import {openSettings} from 'react-native-permissions'

import {Button, ButtonProps} from '../../../../components/Button/Button'
import {useStrings} from '../../common/useStrings'

export const OpenDeviceAppSettingsButton = (props: Omit<ButtonProps, 'title' | 'onPress' | ''>) => {
  const strings = useStrings()
  return <Button onPress={openSettings} title={strings.openAppSettings} {...props} />
}
