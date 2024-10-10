import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {showErrorDialog} from '../../../kernel/dialogs'
import {errorMessages} from '../../../kernel/i18n/global-messages'
import {logger} from '../../../kernel/logger/logger'
import {useAuth} from '../AuthProvider'
import {PIN_LENGTH} from '../common/constants'
import {useCheckPin} from '../common/hooks'
import {PinInput, PinInputRef} from '../PinInput'

export const PinLoginScreen = () => {
  const pinInputRef = React.useRef<null | PinInputRef>(null)
  const styles = useStyles()
  const intl = useIntl()
  const strings = useStrings()
  const {login} = useAuth()

  const {checkPin, isLoading} = useCheckPin({
    onSuccess: (isValid) => {
      if (isValid) {
        logger.debug(`Auth: Logged in with PIN`)
        login()
      } else {
        logger.error(`Auth: Incorrect PIN`)
        showErrorDialog(errorMessages.incorrectPin, intl)
        pinInputRef.current?.clear()
      }
    },
  })

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <PinInput
        ref={pinInputRef}
        enabled={!isLoading}
        pinMaxLength={PIN_LENGTH}
        title={strings.title}
        onDone={checkPin}
      />
    </SafeAreaView>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
  }
}

const useStyles = () => {
  const {color} = useTheme()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color.bg_color_max,
    },
  })
  return styles
}

const messages = defineMessages({
  title: {
    id: 'components.login.custompinlogin.title',
    defaultMessage: '!!!Enter PIN',
  },
})
