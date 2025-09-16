import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useBlockGoBack} from '~/kernel/navigation/hooks/useBlockGoBack'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {SuccessfulTxIcon} from '~/ui/SuccessfulTxIcon/SuccessfulTxIcon'

export const SubmittedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const {palette: p, atoms: ta} = useTheme()
  const {resetToTxHistory} = useWalletNavigation()

  return (
    <SafeArea
      style={[
        ta.bg_color_max,
        a.p_lg,
        a.flex_1,
        a.align_center,
        a.justify_center,
      ]}
    >
      <View style={{height: 144}} />

      <SuccessfulTxIcon />

      <Space.Height.lg />

      <Text
        style={[
          {color: p.gray_max},
          a.heading_3_medium,
          a.px_sm,
          a.text_center,
        ]}
      >
        {strings.staking.submittedTxTitle}
      </Text>

      <Text
        style={[
          {color: p.gray_600, maxWidth: 330},
          a.body_1_lg_regular,
          a.text_center,
        ]}
      >
        {strings.staking.submittedTxText}
      </Text>

      <Space.Height._2xs fill />

      <Actions>
        <Button
          onPress={resetToTxHistory}
          title={strings.staking.submittedTxButton}
          style={a.px_lg}
        />
      </Actions>
    </SafeArea>
  )
}

const Actions = ({children}: React.PropsWithChildren) => {
  const {palette: p} = useTheme()
  return (
    <View style={[a.self_stretch, a.border_t, {borderTopColor: p.gray_200}]}>
      {children}
    </View>
  )
}
