import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useNavigateTo} from '~/features/Staking/Governance/common/navigation'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useBlockGoBack} from '~/kernel/navigation/hooks/useBlockGoBack'
import {Button} from '~/ui/Button/Button'
import {FailedTxIcon} from '~/ui/FailedTxIcon/FailedTxIcon'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'

export const FailedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const {palette: p} = useTheme()
  const navigateTo = useNavigateTo()

  return (
    <SafeArea
      style={[
        {backgroundColor: p.bg_color_max},
        a.p_lg,
        a.flex_1,
        a.align_center,
        a.justify_center,
      ]}
    >
      <View style={{height: 144}} />

      <FailedTxIcon />

      <Space.Height.lg />

      <Text
        style={[
          {color: p.gray_max},
          a.heading_3_medium,
          a.px_sm,
          a.text_center,
        ]}
      >
        {strings.staking.failedTxTitle}
      </Text>

      <Text style={[{color: p.gray_600}, a.body_1_lg_regular, a.text_center]}>
        {strings.staking.failedTxText}
      </Text>

      <Space.Height._2xs fill />

      <Actions>
        <Button
          onPress={navigateTo.home}
          title={strings.staking.failedTxButton}
          style={a.px_lg}
        />
      </Actions>
    </SafeArea>
  )
}

const Actions = ({children}: {children: React.ReactNode}) => {
  const {palette: p} = useTheme()
  return (
    <View style={[a.self_stretch, a.border_t, {borderTopColor: p.gray_200}]}>
      {children}
    </View>
  )
}
