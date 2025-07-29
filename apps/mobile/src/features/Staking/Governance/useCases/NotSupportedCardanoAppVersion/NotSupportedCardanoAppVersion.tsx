import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/features/Staking/common/useStrings'
import {useWalletNavigation} from '~/kernel/navigation'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {BrokenImage} from '../illustrations/BrokenImage'

export const NotSupportedCardanoAppVersion = () => {
  const strings = useStrings()
  const {resetToTxHistory} = useWalletNavigation()
  const {palette: p} = useTheme()

  const handleOnPress = () => {
    resetToTxHistory()
  }

  return (
    <View
      style={[
        a.justify_center,
        a.flex_col,
        a.flex_1,
        {backgroundColor: p.bg_color_max},
      ]}
    >
      <Space.Height._2xl />

      <View style={[a.px_lg, a.align_center]}>
        <BrokenImage />
      </View>

      <Space.Height.lg />

      <View style={[a.px_lg, a.align_center]}>
        <Text style={[a.heading_3_medium, a.text_center, {color: p.gray_max}]}>
          {strings.notSupportedVersionTitle}
        </Text>
      </View>

      <View style={[a.px_lg, a.align_center]}>
        <Text style={[a.body_2_md_regular, a.text_center, {color: p.gray_600}]}>
          {strings.notSupportedVersionDescription}
        </Text>
      </View>

      <Space.Height.sm fill />

      <View style={a.p_lg}>
        <Button
          title={strings.notSupportedVersionButton}
          onPress={handleOnPress}
        />
      </View>
    </View>
  )
}
