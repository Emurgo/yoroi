import * as React from 'react'
import {openSettings} from 'react-native-permissions'

import {Button, ButtonProps} from '../../../../components'
import {useStrings} from '../../common/useStrings'

export const OpenDeviceAppSettingsButton = (props: Omit<ButtonProps, 'title' | 'onPress' | 'shelleyTheme'>) => {
  const strings = useStrings()
  return <Button onPress={openSettings} title={strings.openAppSettings} shelleyTheme {...props} />
}
