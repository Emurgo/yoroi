import * as React from 'react'
import {Platform, StyleSheet, Text, TouchableOpacity} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Icon, Spacer, StatusBar, TextInput, YoroiLogo} from '../../../components'
import {BlueCheckbox} from '../../../components/BlueCheckbox'
import {useLanguage} from '../../../i18n'
import {COLORS} from '../../../theme'
import {useAgreeWithTermsOfService, useNavigateTo, useStrings} from '../common'

export const InitialScreen = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const [tosAccepted, setTosAccepted] = React.useState(false)
  const {agree} = useAgreeWithTermsOfService()

  const onPressLink = () => {
    navigateTo.accepTos()
  }

  const onLanguageChange = React.useCallback(() => setTosAccepted(false), [setTosAccepted])

  useLanguage({
    onChange: onLanguageChange,
  })

  const onPressContinue = () => {
    agree()
    navigateTo.analytics()
  }

  const onPressLanguagePick = () => {
    navigateTo.languagePick()
  }

  const onPressTosCheckbox = () => {
    setTosAccepted((checked) => !checked)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar type="dark" />

      <YoroiLogo />

      <Spacer height={80} />

      <Text style={styles.title}>{strings.selectLanguage}</Text>

      <Spacer height={24} />

      <LanguagePickRow onPress={onPressLanguagePick} />

      <Spacer height={8} />

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

const LanguagePickRow = ({onPress}: {onPress: () => void}) => {
  const {languageCode, supportedLanguages} = useLanguage()
  const language = supportedLanguages.find((lang) => lang.code === languageCode) ?? supportedLanguages['en-US']

  return (
    <TouchableOpacity onPress={onPress}>
      <TextInput
        style={styles.input}
        value={language.label}
        right={<Icon.Chevron size={34} direction="down" />}
        pointerEvents="none"
        disabled
      />
    </TouchableOpacity>
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
    color: '#242838',
  },
  input: Platform.select({
    android: {
      color: '#6B7384',
      fontWeight: '400',
      paddingLeft: 8,
      justifyContent: 'center',
      borderColor: '#A7AFC0',
      borderWidth: 1,
      borderRadius: 10,
    },
    default: {
      color: '#6B7384',
      fontWeight: '400',
      paddingLeft: 8,
      justifyContent: 'center',
    },
  }),

  checkboxText: {
    fontFamily: 'Rubik',
    fontSize: 16,
  },
  checkboxLink: {
    color: COLORS.DARK_BLUE,
    textDecorationLine: 'underline',
  },
})
