import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {BlueCheckbox} from '../../../components/BlueCheckbox/BlueCheckbox'
import {Button} from '../../../components/Button/NewButton'
import {Icon} from '../../../components/Icon'
import {Spacer} from '../../../components/Spacer/Spacer'
import {YoroiLogo} from '../../../components/YoroiLogo/YoroiLogo'
import {useLanguage} from '../../../kernel/i18n'
import {defaultLanguage} from '../../../kernel/i18n/languages'
import {useNavigateTo, useStrings} from '../common'

export const InitialScreen = () => {
  const strings = useStrings()
  const {styles} = useStyles()
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

        <Button title={strings.continue} disabled={!tosAccepted} onPress={onPressContinue} testID="buttonContinue" />
      </ScrollView>
    </SafeAreaView>
  )
}

const LanguagePickRow = ({onPress}: {onPress: () => void}) => {
  const {styles, color} = useStyles()
  const {isDark} = useTheme()
  const {languageCode, supportedLanguages} = useLanguage()
  const language = supportedLanguages.find((lang) => lang.code === languageCode) ?? defaultLanguage

  return (
    <TouchableOpacity onPress={onPress} testID="dropDownLanguagePicker">
      <TextInput
        style={styles.input}
        value={language.label}
        pointerEvents="none"
        editable={false}
        keyboardAppearance={isDark ? 'dark' : 'light'}
      />

      <View style={styles.inputIcon}>
        <Icon.Chevron size={34} direction="down" color={color.el_gray_medium} />
      </View>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    scrollableContentContainer: {
      flexGrow: 1,
    },
    container: {
      flex: 1,
      ...atoms.p_lg,
      backgroundColor: color.bg_color_max,
    },
    title: {
      ...atoms.heading_3_medium,
      textAlign: 'center',
      color: color.gray_900,
    },
    input: {
      color: color.gray_600,
      ...atoms.pl_lg,
      ...atoms.body_1_lg_regular,
      justifyContent: 'center',
      borderColor: color.gray_400,
      borderWidth: 1,
      borderRadius: 8,
      height: 56,
    },
    inputIcon: {
      position: 'absolute',
      right: 0,
      ...atoms.pr_lg,
      ...atoms.pt_sm,
    },
    checkboxText: {
      ...atoms.body_1_lg_regular,
      color: color.gray_max,
    },
    checkboxLink: {
      color: color.primary_800,
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

  return {styles, color}
}
