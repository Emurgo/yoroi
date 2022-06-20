import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {LanguagePicker} from '../../components'

export const ChangeLanguageScreen = () => {
  const strings = useStrings()
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <LanguagePicker buttonLabel={strings.buttonLabel.toLocaleUpperCase()} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#fff',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    buttonLabel: intl.formatMessage(messages.buttonLabel),
  }
}

const messages = defineMessages({
  buttonLabel: {
    id: 'components.settings.languagepicker.buttonLabel',
    defaultMessage: '!!!Apply',
  },
})
