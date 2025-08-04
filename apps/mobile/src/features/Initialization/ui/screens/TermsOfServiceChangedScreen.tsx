import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {ScrollView, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useStrings} from '~/kernel/i18n/useStrings'
import {BlueCheckbox} from '~/ui/BlueCheckbox/BlueCheckbox'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'

import {useNavigateTo} from '../../hooks/useNavigateTo'

export const TermsOfServiceChangedScreen = () => {
  const [accepted, setAccepted] = React.useState(false)
  const {atoms: ta, palette: p} = useTheme()
  const navigateTo = useNavigateTo()

  const onPressContinue = () => {
    navigateTo.analyticsChanged()
  }

  const onPressCheckbox = () => {
    setAccepted((checked) => !checked)
  }

  const strings = useStrings()

  const onTosLinkPress = () => {
    navigateTo.readTermsOfService()
  }
  const onPrivacyLinkPress = () => {
    navigateTo.readPrivacyPolicy()
  }

  return (
    <SafeAreaView style={[a.flex_1, a.p_lg, ta.bg_color_max]}>
      <ScrollView bounces={false} contentContainerStyle={a.flex_grow}>
        <Icon.YoroiWallet size={64} />

        <Space.Height.xl />

        <Text style={[a.heading_3_medium, {color: p.gray_900}, a.text_center]}>
          {strings.initialization.title}
        </Text>

        <Space.Height.lg />

        <Text style={[a.body_1_lg_regular, {color: p.gray_800}, a.text_center]}>
          {strings.initialization.description}
        </Text>

        <Space.Height.lg />

        <BlueCheckbox
          checked={accepted}
          spacing={8}
          onPress={onPressCheckbox}
          style={a.align_start}
        >
          <View style={[a.flex, a.flex_row, a.flex_wrap]}>
            <Text
              style={[a.body_1_lg_regular, {color: p.gray_max}]}
            >{`${strings.initialization.tosIAgreeWith} `}</Text>

            <TouchableOpacity onPress={onTosLinkPress}>
              <Text
                style={[
                  a.body_1_lg_regular,
                  {color: p.gray_800, textDecorationLine: 'underline'},
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

            <TouchableOpacity onPress={onPrivacyLinkPress}>
              <Text
                style={[
                  a.body_1_lg_regular,
                  {color: p.gray_800, textDecorationLine: 'underline'},
                ]}
              >
                {strings.initialization.privacyPolicy}
              </Text>
            </TouchableOpacity>
          </View>
        </BlueCheckbox>

        <Button
          title={strings.initialization.continue}
          disabled={!accepted}
          onPress={onPressContinue}
        />
      </ScrollView>
    </SafeAreaView>
  )
}
