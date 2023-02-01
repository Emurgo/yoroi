import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, LanguagePicker} from '../../components'
import globalMessages from '../../i18n/global-messages'
import {FirstRunRouteNavigation} from '../../navigation'

export const LanguagePickerScreen = () => {
  const navigation = useNavigation<FirstRunRouteNavigation>()
  const strings = useStrings()

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <LanguagePicker />

      <Actions>
        <Button
          onPress={() => navigation.navigate('accept-terms-of-service')}
          title={strings.next}
          testID="chooseLangButton"
          shelleyTheme
        />
      </Actions>
    </SafeAreaView>
  )
}

const Actions = (props: ViewProps) => <View {...props} style={{padding: 16}} />

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#fff',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    next: intl.formatMessage(globalMessages.next),
  }
}
