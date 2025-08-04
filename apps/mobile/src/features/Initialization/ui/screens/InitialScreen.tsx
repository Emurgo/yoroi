import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {ScrollView, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useLanguage} from '~/kernel/i18n/LanguageProvider'
import {LanguageRecord, supportedLanguages} from '~/kernel/i18n/localization'
import {useStrings} from '~/kernel/i18n/useStrings'
import {BlueCheckbox} from '~/ui/BlueCheckbox/BlueCheckbox'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'

import {useNavigateTo} from '../../hooks/useNavigateTo'

export const InitialScreen = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const navigateTo = useNavigateTo()
  const [tosAccepted, setTosAccepted] = React.useState(false)

  const onTosLinkPress = () => {
    navigateTo.readTermsOfService()
  }

  const onPrivacyLinkPress = () => {
    navigateTo.readPrivacyPolicy()
  }

  const onLanguageChange = React.useCallback(
    () => setTosAccepted(false),
    [setTosAccepted],
  )

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
    <SafeAreaView style={[a.flex_1, a.p_lg, ta.bg_color_max]}>
      <ScrollView bounces={false} contentContainerStyle={a.flex_grow}>
        <Icon.YoroiWallet size={64} />

        <Space.Height.xl />

        <Text style={[a.heading_3_medium, a.text_center, {color: p.gray_900}]}>
          {strings.initialization.languagePickerTitle}
        </Text>

        <Space.Height.lg />

        <LanguagePickRow onPress={onPressLanguagePick} />

        <Space.Height.lg />

        <BlueCheckbox
          checked={tosAccepted}
          spacing={8}
          onPress={onPressTosCheckbox}
          style={a.align_start}
        >
          <View style={[a.flex, a.flex_row, a.flex_wrap]}>
            <Text
              style={[a.body_1_lg_regular, {color: p.gray_max}]}
            >{`${strings.initialization.tosIAgreeWith} `}</Text>

            <TouchableOpacity onPress={onTosLinkPress} testID="linkToS">
              <Text
                style={[
                  a.body_1_lg_regular,
                  {color: p.primary_800, textDecorationLine: 'underline'},
                ]}
              >
                {strings.initialization.tosAgreement}
              </Text>
            </TouchableOpacity>

            <Text
              style={[a.body_1_lg_regular, {color: p.gray_max}]}
            >{` `}</Text>

            <Text style={[a.body_1_lg_regular, {color: p.gray_max}]}>
              {strings.initialization.tosAnd}
            </Text>

            <Text
              style={[a.body_1_lg_regular, {color: p.gray_max}]}
            >{` `}</Text>

            <TouchableOpacity
              onPress={onPrivacyLinkPress}
              testID="linkPrivacyPolicy"
            >
              <Text
                style={[
                  a.body_1_lg_regular,
                  {color: p.primary_800, textDecorationLine: 'underline'},
                ]}
              >
                {strings.initialization.privacyPolicy}
              </Text>
            </TouchableOpacity>
          </View>
        </BlueCheckbox>

        <Button
          title={strings.initialization.continue}
          disabled={!tosAccepted}
          onPress={onPressContinue}
          testID="buttonContinue"
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const LanguagePickRow = ({onPress}: {onPress: () => void}) => {
  const {isDark, palette: p} = useTheme()
  const {languageCode} = useLanguage()
  const language = supportedLanguages.find(
    (lang) => lang.code === languageCode,
  ) as LanguageRecord

  return (
    <TouchableOpacity onPress={onPress} testID="dropDownLanguagePicker">
      <TextInput
        style={[
          {
            color: p.gray_600,
            borderColor: p.gray_400,
            borderWidth: 1,
            borderRadius: 8,
            height: 56,
          },
          a.pl_lg,
          a.body_1_lg_regular,
          a.justify_center,
        ]}
        value={language.label}
        pointerEvents="none"
        editable={false}
        keyboardAppearance={isDark ? 'dark' : 'light'}
      />

      <View style={[a.absolute, a.pr_lg, a.pt_sm, {right: 0}]}>
        <Icon.Chevron size={34} direction="down" color={p.el_gray_medium} />
      </View>
    </TouchableOpacity>
  )
}
