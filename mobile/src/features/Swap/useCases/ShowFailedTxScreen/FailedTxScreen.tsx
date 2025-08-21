import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {FailedTxIcon} from '~/ui/FailedTxIcon/FailedTxIcon'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'

import {useNavigateTo} from '../../common/navigation'

export const FailedTxScreen = () => {
  const strings = useStrings()
  const {palette: p, atoms: ta} = useTheme()
  const navigationTo = useNavigateTo()

  return (
    <SafeArea
      style={[
        a.p_lg,
        a.flex_1,
        a.align_center,
        a.justify_center,
        ta.bg_color_max,
      ]}
    >
      <Space.Height.xl />

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
        {strings.swap.failedTxTitle}
      </Text>

      <Text
        style={[
          a.body_1_lg_regular,
          a.text_center,
          {maxWidth: 330, color: p.gray_600},
        ]}
      >
        {strings.swap.failedTxText}
      </Text>

      <View style={a.flex_1} />

      <Actions>
        <Button
          onPress={navigationTo.startSwap}
          title={strings.swap.failedTxButton}
          style={a.px_lg}
        />
      </Actions>
    </SafeArea>
  )
}

const Actions = ({children}: {children: React.ReactNode}) => {
  const {palette: p} = useTheme()

  return (
    <View style={[a.border_t, a.self_stretch, {borderTopColor: p.gray_200}]}>
      {children}
    </View>
  )
}
