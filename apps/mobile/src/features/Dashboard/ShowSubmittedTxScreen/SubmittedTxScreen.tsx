import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {ScrollView, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'

export const SubmittedTxScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <View style={[a.flex_1, {backgroundColor: p.bg_color_max}]}>
      <ScrollView style={[a.flex_1, a.p_lg]}>
        <View style={[a.flex_1, a.align_center, a.justify_center]}>
          <Text style={[a.heading_2_lg_bold, {color: p.text_gray_max}]}>
            {strings.transactions.submitted.submittedTxTitle}
          </Text>

          <Space.Height.lg />

          <Text style={[a.body_1_lg_regular, {color: p.text_gray_max}]}>
            {strings.transactions.submitted.submittedTxText}
          </Text>

          <Space.Height.xl />

          <Button
            title={strings.transactions.submitted.submittedTxButton}
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </View>
  )
}
