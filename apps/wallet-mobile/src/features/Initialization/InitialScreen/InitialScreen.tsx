import * as React from 'react'
import {ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Icon, Spacer, StatusBar, YoroiLogo} from '../../../components'
import {BlueCheckbox} from '../../../components/BlueCheckbox'
import {useLanguage} from '../../../i18n'
import {COLORS} from '../../../theme'
import {useNavigateTo, useStrings} from '../common'

export const InitialScreen = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const [tosAccepted, setTosAccepted] = React.useState(false)

  const onTosLinkPress = () => {
    navigateTo.readTermsOfService()
  }

  const onPrivacyLinkPress = () => {
    navigateTo.readPrivacyPolicy()
  }

  const onLanguageChange = React.useCallback(() => setTosAccepted(false), [setTosAccepted])

  useLanguage({
    onChange: onLanguageChange,
  })

  const onPressContinue = () => {
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
      <ScrollView bounces={false} contentContainerStyle={styles.scrollableContentContainer}>
        <StatusBar type="dark" />

        <YoroiLogo />

        <Spacer height={80} />

        <Text style={styles.title}>{strings.languagePickerTitle}</Text>

        <Spacer height={35} />

        <LanguagePickRow onPress={onPressLanguagePick} />

        <Spacer height={30} />

        <BlueCheckbox checked={tosAccepted} spacing={8} onPress={onPressTosCheckbox} style={styles.checkbox}>
          <View style={styles.checkboxRow}>
            <Text style={styles.checkboxText}>{`${strings.tosIAgreeWith} `}</Text>

            <TouchableOpacity onPress={onTosLinkPress} testID="linkToS">
              <Text style={[styles.checkboxText, styles.checkboxLink]}>{strings.tosAgreement}</Text>
            </TouchableOpacity>

            <Text style={styles.checkboxText}>{` `}</Text>

            <Text style={styles.checkboxText}>{strings.tosAnd}</Text>

            <Text style={styles.checkboxText}>{` `}</Text>

            <TouchableOpacity onPress={onPrivacyLinkPress} testID="linkPrivacyPolicy">
              <Text style={[styles.checkboxText, styles.checkboxLink]}>{strings.privacyPolicy}</Text>
            </TouchableOpacity>
          </View>
        </BlueCheckbox>

        <Spacer fill />

        <Button
          title={strings.continue}
          shelleyTheme
          disabled={!tosAccepted}
          onPress={onPressContinue}
          testID="buttonContinue"
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const LanguagePickRow = ({onPress}: {onPress: () => void}) => {
  const {languageCode, supportedLanguages} = useLanguage()
  const language = supportedLanguages.find((lang) => lang.code === languageCode) ?? supportedLanguages['en-US']

  return (
    <TouchableOpacity onPress={onPress} testID="dropDownLanguagePicker">
      <TextInput style={styles.input} value={language.label} pointerEvents="none" editable={false} />

      <View style={styles.inputIcon}>
        <Icon.Chevron size={34} direction="down" />
      </View>
    </TouchableOpacity>
  )
}
const styles = StyleSheet.create({
  scrollableContentContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    fontFamily: 'Rubik-Bold',
    lineHeight: 30,
    textAlign: 'center',
    color: '#242838',
  },
  input: {
    color: '#6B7384',
    fontWeight: '400',
    paddingLeft: 16,
    justifyContent: 'center',
    borderColor: '#A7AFC0',
    borderWidth: 1,
    borderRadius: 8,
    height: 56,
    fontSize: 16,
  },
  inputIcon: {
    position: 'absolute',
    right: 0,
    paddingRight: 16,
    paddingTop: 8,
  },
  checkboxText: {
    fontFamily: 'Rubik',
    fontSize: 16,
    color: '#000000',
  },
  checkboxLink: {
    color: COLORS.DARK_BLUE,
    textDecorationLine: 'underline',
  },
  checkbox: {
    alignItems: 'flex-start',
  },
  checkboxRow: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
})
