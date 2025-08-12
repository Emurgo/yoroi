import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {
  AdaAppClosedError,
  BluetoothDisabledError,
  GeneralConnectionError,
  LedgerUserError,
  RejectedByUserError,
} from '~/wallets/hw/hw'

type Props = {
  error: Error
  resetErrorBoundary?: () => void
  onCancel?: () => void
}

export const ModalError = ({error, resetErrorBoundary, onCancel}: Props) => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const message = getErrorMessage(error, strings)

  return (
    <>
      <View style={[a.px_lg, a.flex_grow, a.align_center, a.justify_center]}>
        <View>
          <Icon.Danger color={p.sys_magenta_500} size={42} />
        </View>

        <Text
          style={[
            a.body_1_lg_regular,
            a.text_center,
            {color: p.sys_magenta_500},
          ]}
        >
          {message}
        </Text>
      </View>

      <View style={[a.flex_row, a.align_center, a.justify_center, a.p_lg]}>
        <Button
          size="S"
          type={ButtonType.Secondary}
          onPress={onCancel}
          title={strings.global.cancel}
        />

        <Space.Width.lg />

        <Button
          size="S"
          onPress={resetErrorBoundary}
          title={strings.ui.tryAgain}
        />
      </View>
    </>
  )
}

const getErrorMessage = (error: Error, strings: any): string => {
  if (error instanceof RejectedByUserError) {
    return strings.global.ledgerMessages.rejectedByUserError
  }

  if (error instanceof BluetoothDisabledError) {
    return strings.global.ledgerMessages.bluetoothDisabledError
  }

  if (error instanceof LedgerUserError) {
    return strings.global.ledgerMessages.connectionError
  }

  if (error instanceof GeneralConnectionError) {
    return strings.global.ledgerMessages.connectionError
  }

  if (error instanceof BluetoothDisabledError) {
    return strings.global.ledgerMessages.bluetoothDisabledError
  }

  if (error instanceof AdaAppClosedError) {
    return strings.global.ledgerMessages.appOpened
  }

  return `${strings.global.error}: ${error.message}`
}
