import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {ClipPath, Defs, G, Path, Rect, Svg} from 'react-native-svg'

import {Button, Icon, Spacer, TextInput, YoroiLogo} from '../../../components'
import {useLanguage} from '../../../i18n'
import {COLORS, lightPalette} from '../../../theme'
import {useNavigateTo} from '../common/navigation'
import {useStrings} from '../common/strings'

export const InitialScreen = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const [tosAccepted, setTosAccepted] = React.useState(false)

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
      <YoroiLogo />

      <Spacer height={80} />

      <Text style={styles.title}>{strings.selectLanguage}</Text>

      <Spacer height={24} />

      <LanguagePickRow onPress={onPressLanguagePick} />

      <Spacer height={8} />

      <CheckBoxRow checked={tosAccepted} onPress={onPressTosCheckbox} />

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

const CheckBoxRow = ({checked, onPress}: {checked: boolean; onPress: () => void}) => {
  const navigateTo = useNavigateTo()
  const strings = useStrings()

  const onPresslink = () => {
    navigateTo.accepTos()
  }

  return (
    <TouchableOpacity style={styles.checkboxRow} onPress={onPress}>
      {checked ? <CheckboxChecked /> : <CheckboxNotChecked />}

      <Spacer width={15} />

      <View style={{flexDirection: 'row'}}>
        <Text style={styles.checkboxText}>{`${strings.tosIAgreeWith} `}</Text>

        <TouchableOpacity onPress={onPresslink}>
          <Text style={[styles.checkboxText, styles.checkboxLink]}>{strings.tosAgreement}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const CheckboxChecked = (props) => {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <G clipPath="url(#clip0_6368_1632)">
        <Rect y={0.000671387} width={16} height={16} rx={2} fill="#4B6DDE" />

        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.857 11L4 8.123l.806-.812L6.857 9.37l4.337-4.37.806.817-5.143 5.183z"
          fill="#fff"
        />
      </G>

      <Defs>
        <ClipPath id="clip0_6368_1632">
          <Rect y={0.000671387} width={16} height={16} rx={2} fill="#fff" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

const CheckboxNotChecked = (props) => {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <G clipPath="url(#clip0_6368_454)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1zM2 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H2z"
          fill="#383E54"
        />
      </G>

      <Defs>
        <ClipPath id="clip0_6368_454">
          <Rect y={0.000610352} width={16} height={16} rx={2} fill="#fff" />
        </ClipPath>
      </Defs>
    </Svg>
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
