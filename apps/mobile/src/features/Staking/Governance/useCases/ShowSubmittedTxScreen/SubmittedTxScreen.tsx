import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {SuccessfulTxIcon} from '../ReviewTx/illustrations/SuccessfulTxIcon'

export const SubmittedTxScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const navigateTo = useWalletNavigation()

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

      <SuccessfulTxIcon />

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
        {strings.staking.submittedTxTitle}
      </Text>

      <Text style={[a.body_1_lg_regular, a.text_center, {color: p.gray_600}]}>
        {strings.staking.submittedTxText}
      </Text>

      <Space.Height.sm fill />

      <View style={a.align_stretch}>
        <Button
          onPress={navigateTo.navigateToTxHistory}
          title={strings.staking.submittedTxButton}
          style={a.px_lg}
        />
      </View>
    </View>
  )
}
