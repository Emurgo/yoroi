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
          title={strings.cancel}
        />

        <Space.Width.lg />

        <Button
          size="S"
          onPress={resetErrorBoundary}
          title={strings.tryAgain}
        />
      </View>
    </>
  )
}

const getErrorMessage = (
  error: Error,
  strings: Record<
    | 'error'
    | 'rejectedByUser'
    | 'bluetoothDisabledError'
    | 'ledgerUserError'
    | 'ledgerGeneralConnectionError'
    | 'ledgerBluetoothDisabledError'
    | 'ledgerAdaAppNeedsToBeOpenError',
    string
  >,
): string => {
  if (error instanceof RejectedByUserError) {
    return strings.rejectedByUser
  }

  if (error instanceof BluetoothDisabledError) {
    return strings.bluetoothDisabledError
  }

  if (error instanceof LedgerUserError) {
    return strings.ledgerUserError
  }

  if (error instanceof GeneralConnectionError) {
    return strings.ledgerGeneralConnectionError
  }

  if (error instanceof BluetoothDisabledError) {
    return strings.ledgerBluetoothDisabledError
  }

  if (error instanceof AdaAppClosedError) {
    return strings.ledgerAdaAppNeedsToBeOpenError
  }

  return `${strings.error}: ${error.message}`
}
