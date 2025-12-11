import * as React from 'react'

import {ErrorLogo} from '~/features/Exchange/illustrations/ErrorLogo'
import {useStrings} from '~/kernel/i18n/useStrings'
import {ResultScreen} from '~/ui/ResultScreen/ResultScreen'

export const ErrorScreen = ({onClose}: {onClose?: () => void}) => {
  const strings = useStrings()

  return (
    <ResultScreen
      type="error"
      context="exchange"
      icon={<ErrorLogo />}
      primaryAction={
        onClose
          ? {
              title: strings.global.close,
              onPress: onClose,
            }
          : undefined
      }
    />
  )
}
