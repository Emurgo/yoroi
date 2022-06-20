import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {LanguagePicker} from '../../components'
import {FirstRunRouteNavigation} from '../../navigation'

export const LanguagePickerScreen = () => {
  const navigation = useNavigation<FirstRunRouteNavigation>()
  const strings = useStrings()

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <LanguagePicker
        buttonLabel={strings.buttonLabel}
        onPressConfirmButtonCallback={() => navigation.navigate('accept-terms-of-service')}
        noWarningMessage
      />
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
    id: 'components.firstRun.languagepicker.buttonLabel',
    defaultMessage: '!!!Next',
  },
})
