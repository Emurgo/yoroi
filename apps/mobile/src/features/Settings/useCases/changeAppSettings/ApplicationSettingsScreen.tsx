import {networkConfigs} from '@yoroi/blockchains'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {ScrollView, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Hr} from '~/ui/Hr/Hr'
import {Space} from '~/ui/Space/Space'

export const ApplicationSettingsScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <ScrollView style={[a.flex_1, {backgroundColor: p.bg_color_max}]}>
      <View style={[a.p_lg, a.gap_lg]}>
        <View style={[a.gap_md]}>
          <Text style={[a.heading_3_medium]}>{strings.settings.applicationSettings.general}</Text>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>{strings.settings.applicationSettings.language}</Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.settings.applicationSettings.language}
            </Text>
          </View>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>{strings.settings.applicationSettings.currency}</Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.settings.applicationSettings.currency}
            </Text>
          </View>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>{strings.settings.applicationSettings.theme}</Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.settings.applicationSettings.theme}
            </Text>
          </View>
        </View>

        <Hr />

        <View style={[a.gap_md]}>
          <Text style={[a.heading_3_medium]}>{strings.settings.applicationSettings.security}</Text>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>{strings.settings.applicationSettings.biometric}</Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.settings.applicationSettings.biometric}
            </Text>
          </View>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>{strings.settings.applicationSettings.pin}</Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.settings.applicationSettings.pin}
            </Text>
          </View>
        </View>

        <Hr />

        <View style={[a.gap_md]}>
          <Text style={[a.heading_3_medium]}>{strings.settings.applicationSettings.privacy}</Text>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>{strings.settings.applicationSettings.analytics}</Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.settings.applicationSettings.analytics}
            </Text>
          </View>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>{strings.settings.applicationSettings.crashReports}</Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.settings.applicationSettings.crashReports}
            </Text>
          </View>
        </View>

        <Hr />

        <View style={[a.gap_md]}>
          <Text style={[a.heading_3_medium]}>{strings.settings.applicationSettings.about}</Text>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>{strings.settings.applicationSettings.version}</Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.settings.applicationSettings.version}
            </Text>
          </View>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>{strings.settings.applicationSettings.terms}</Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.settings.applicationSettings.terms}
            </Text>
          </View>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>{strings.settings.applicationSettings.privacyPolicy}</Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.settings.applicationSettings.privacyPolicy}
            </Text>
          </View>
        </View>

        <Space.Height.lg />

        <Button title={strings.settings.applicationSettings.save} onPress={() => {}} />
      </View>
    </ScrollView>
  )
}
