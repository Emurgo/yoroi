import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {ClipPath, Defs, G, Path, Rect, Svg} from 'react-native-svg'

import {Button, Icon, Spacer, TextInput, YoroiLogo} from '../../../components'
import {useLanguage} from '../../../i18n'
import {COLORS, lightPalette} from '../../../theme'
import {useNavigateTo} from '../common/navigation'
import {useStrings} from '../common/strings'
import {useAgreeWithTermsOfService} from '../common/terms'
import {BlueCheckbox} from '../../../components/BlueCheckbox'

export const InitialScreen = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const {addSubscription} = useLanguage()
  const [tosAccepted, setTosAccepted] = React.useState(false)
  const {agree} = useAgreeWithTermsOfService()

  const onPressLink = () => {
    navigateTo.accepTos()
  }

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

  React.useEffect(() => {
    addSubscription(() => setTosAccepted(false))
  }, [addSubscription])

  return (
    <SafeAreaView style={styles.container}>
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

      <Button title="continue" shelleyTheme disabled={!tosAccepted} onPress={onPressContinue} />
    </SafeAreaView>
  )
}

const LanguagePickRow = ({onPress}: {onPress: () => void}) => {
  const {languageCode, supportedLanguages} = useLanguage()
  const language = supportedLanguages.find((lang) => lang.code === languageCode) ?? supportedLanguages['en-US']

  return (
    <TouchableOpacity onPress={onPress}>
      <TextInput
        style={{color: lightPalette.gray['600'], fontWeight: '400', paddingLeft: 8}}
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
