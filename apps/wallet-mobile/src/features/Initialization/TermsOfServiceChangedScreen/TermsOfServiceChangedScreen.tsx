import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer, YoroiLogo} from '../../../components'
import {BlueCheckbox} from '../../../components/BlueCheckbox'
import {COLORS} from '../../../theme'
import {useAgreeWithTermsOfService, useNavigateTo, useStrings} from '../common'

export const TermsOfServiceChangedScreen = () => {
  const [tosAccepted, setTosAccepted] = React.useState(false)
  const {agree} = useAgreeWithTermsOfService()

  const onPressContinue = () => {
    agree()
  }

  const onPressTosCheckbox = () => {
    setTosAccepted((checked) => !checked)
  }

  const navigateTo = useNavigateTo()
  const strings = useStrings()

  const onPressLink = () => {
    navigateTo.accepTos()
  }

  return (
    <SafeAreaView style={styles.container}>
      <YoroiLogo />

      <Spacer height={80} />

      <Text style={styles.title}>{strings.title}</Text>

      <Spacer height={24} />

      <Text style={styles.description}>{strings.description}</Text>

      <Spacer height={24} />

      <BlueCheckbox checked={tosAccepted} onPress={onPressTosCheckbox}>
        <Text style={styles.checkboxText}>{`${strings.tosIAgreeWith} `}</Text>

        <TouchableOpacity onPress={onPressLink}>
          <Text style={[styles.checkboxText, styles.checkboxLink]}>{strings.tosAgreement}</Text>
        </TouchableOpacity>
      </BlueCheckbox>

      <Spacer fill />

      <Button title={strings.continue} shelleyTheme disabled={!tosAccepted} onPress={onPressContinue} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    fontFamily: 'Rubik',
    lineHeight: 30,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Rubik',
    lineHeight: 24,
    textAlign: 'center',
  },
  checkboxText: {
    fontFamily: 'Rubik',
    fontSize: 16,
  },
  checkboxLink: {
    color: COLORS.DARK_BLUE,
    textDecorationLine: 'underline',
  },
})
