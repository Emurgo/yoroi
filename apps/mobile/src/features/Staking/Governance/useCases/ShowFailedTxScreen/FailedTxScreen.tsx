import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/features/Staking/common/useStrings'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {useNavigateTo} from '../../common/navigation'
import {FailedTxIcon} from '../ReviewTx/illustrations/FailedTxIcon'

export const FailedTxScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const navigateTo = useNavigateTo()

  return (
    <View
      style={[
        a.p_lg,
        a.flex_1,
        a.align_center,
        a.justify_center,
        {backgroundColor: p.bg_color_max},
      ]}
    >
      <Space.Height._2xl />

      <FailedTxIcon />

      <Space.Height._2xl />

      <Space.Height.lg />

      <Text
        style={[
          a.heading_3_medium,
          a.px_sm,
          a.text_center,
          {color: p.gray_max},
        ]}
      >
        {strings.failedTxTitle}
      </Text>

      <Text style={[a.body_1_lg_regular, a.text_center, {color: p.gray_600}]}>
        {strings.failedTxText}
      </Text>

      <Space.Height.sm fill />

      <View style={a.align_stretch}>
        <Button
          onPress={navigateTo.home}
          title={strings.failedTxButton}
          style={a.px_lg}
        />
      </View>
    </View>
  )
}
