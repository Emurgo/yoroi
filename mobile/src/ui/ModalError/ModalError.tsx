import {
  AdaAppClosedError,
  BluetoothDisabledError,
  GeneralConnectionError,
  LedgerUserError,
  RejectedByUserError,
} from '@yoroi/cardano-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'

type Props = {
  error: Error
  resetErrorBoundary?: () => void
  onCancel?: () => void
}

export const ModalError = ({error, resetErrorBoundary, onCancel}: Props) => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {closeModal} = useModal()
  const message = getErrorMessage(error, strings)

  const handleCancel = React.useCallback(() => {
    if (onCancel) {
      onCancel()
    } else {
      closeModal()
    }
  }, [onCancel, closeModal])

  return (
    <>
      <View style={[a.flex_grow, a.align_center, a.justify_center]}>
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

      <View style={[a.flex_row, a.align_center, a.justify_center]}>
        <Button
          size="S"
          type={ButtonType.Secondary}
          onPress={handleCancel}
          title={strings.global.cancel}
          disabled={false}
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

const getErrorMessage = (
  error: Error,
  strings: ReturnType<typeof useStrings>,
): string => {
  if (error instanceof RejectedByUserError) {
    return strings.ledgerMessages.rejectedByUserError
  }

  if (error instanceof BluetoothDisabledError) {
    return strings.ledgerMessages.bluetoothDisabledError
  }

  if (error instanceof LedgerUserError) {
    return strings.ledgerMessages.connectionError
  }

  if (error instanceof GeneralConnectionError) {
    return strings.ledgerMessages.connectionError
  }

  if (error instanceof AdaAppClosedError) {
    return strings.ledgerMessages.appOpened
  }

  return `${strings.global.error}: ${error.message}`
}
