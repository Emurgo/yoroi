import {padding, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Icon, Spacer, YoroiLogo} from '../../../components'
import {BlueCheckbox} from '../../../components/BlueCheckbox'
import {useLanguage} from '../../../i18n'
import {defaultLanguage} from '../../../i18n/languages'
import {useNavigateTo, useStrings} from '../common'

export const InitialScreen = () => {
  const strings = useStrings()
  const styles = useStyles()
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
  const styles = useStyles()
  const {languageCode, supportedLanguages} = useLanguage()
  const language = supportedLanguages.find((lang) => lang.code === languageCode) ?? defaultLanguage

  return (
    <TouchableOpacity onPress={onPress} testID="dropDownLanguagePicker">
      <TextInput style={styles.input} value={language.label} pointerEvents="none" editable={false} />

      <View style={styles.inputIcon}>
        <Icon.Chevron size={34} direction="down" />
      </View>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme
  const styles = StyleSheet.create({
    scrollableContentContainer: {
      flexGrow: 1,
    },
    container: {
      flex: 1,
      ...padding['l'],
      backgroundColor: color.gray.min,
    },
    title: {
      ...typography['heading-3-medium'],
      textAlign: 'center',
      color: color.gray[900],
    },
    input: {
      color: color.gray[600],
      ...padding['l-l'],
      ...typography['body-1-l-regular'],
      justifyContent: 'center',
      borderColor: color.gray[400],
      borderWidth: 1,
      borderRadius: 8,
      height: 56,
    },
    inputIcon: {
      position: 'absolute',
      right: 0,
      ...padding['r-l'],
      ...padding['t-s'],
    },
    checkboxText: {
      ...typography['body-1-l-regular'],
      color: color.gray.max,
    },
    checkboxLink: {
      color: color.primary[800],
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

  return styles
}
