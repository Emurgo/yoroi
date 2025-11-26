import {atoms as a, useTheme} from '@yoroi/theme'

import {useRoute} from '@react-navigation/native'
import * as React from 'react'
import {ScrollView as RNScrollView, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {TxHistoryRoutes} from '~/kernel/navigation/types'
import {Copiable} from '~/ui/Copiable/Copiable'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'

export const MessageSigningResultScreen = () => {
  const strings = useStrings()
  const {palette: p, atoms: ta} = useTheme()
  const route = useRoute()
  const {signature, key} =
    (route.params as TxHistoryRoutes['message-signing-result']) || {}

  if (!signature || !key) {
    return (
      <SafeArea>
        <ScrollView contentContainerStyle={[a.px_lg, a.pb_lg]}>
          <Space.Height.lg />
          <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
            {strings.transactions.messageSigning.error}
          </Text>
        </ScrollView>
      </SafeArea>
    )
  }

  return (
    <SafeArea>
      <ScrollView contentContainerStyle={[a.px_lg, a.pb_lg]}>
        <Space.Height.lg />

        <View style={[a.gap_lg]}>
          <View style={[a.gap_md]}>
            <View style={[a.flex_row, a.justify_between, a.align_center]}>
              <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
                {
                  strings.transactions.messageSigning
                    .messageSigningSignatureLabel
                }
              </Text>
              <Copiable
                text={signature}
                feedback={
                  strings.transactions.messageSigning.messageSigningCopied
                }
              />
            </View>
            <Space.Height.sm />
            <View
              style={[{backgroundColor: p.bg_color_min}, a.rounded_sm, a.p_lg]}
            >
              <RNScrollView
                bounces={false}
                style={[a.flex_1]}
                showsVerticalScrollIndicator={true}
              >
                <Text
                  style={[
                    a.body_2_md_regular,
                    {color: p.text_gray_medium, fontFamily: 'monospace'},
                  ]}
                >
                  {signature}
                </Text>
              </RNScrollView>
            </View>
            <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
              {
                strings.transactions.messageSigning
                  .messageSigningSignatureDescription
              }
            </Text>
          </View>

          <Space.Height.lg />

          <View style={[a.gap_md]}>
            <View style={[a.flex_row, a.justify_between, a.align_center]}>
              <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
                {strings.transactions.messageSigning.messageSigningKeyLabel}
              </Text>
              <Copiable
                text={key}
                feedback={
                  strings.transactions.messageSigning.messageSigningCopied
                }
              />
            </View>
            <Space.Height.sm />
            <View
              style={[{backgroundColor: p.bg_color_min}, a.rounded_sm, a.p_lg]}
            >
              <RNScrollView
                bounces={false}
                style={[a.flex_1]}
                showsVerticalScrollIndicator={true}
              >
                <Text
                  style={[
                    a.body_2_md_regular,
                    {color: p.text_gray_medium, fontFamily: 'monospace'},
                  ]}
                >
                  {key}
                </Text>
              </RNScrollView>
            </View>
            <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
              {strings.transactions.messageSigning.messageSigningKeyDescription}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeArea>
  )
}
