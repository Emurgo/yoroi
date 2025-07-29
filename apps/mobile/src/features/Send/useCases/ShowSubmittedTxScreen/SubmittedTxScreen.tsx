import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/features/Send/common/useStrings'
import {useBlockGoBack, useWalletNavigation} from '~/kernel/navigation'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {SuccessfulTxIcon} from '../ReviewTx/illustrations/SuccessfulTxIcon'

export const SubmittedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {resetToTxHistory} = useWalletNavigation()

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
      <Space.Height._2xl />

      <SuccessfulTxIcon />

      <Space.Height._2xl />

      <Space.Height.lg />

      <Text
        style={[
          {color: p.gray_max},
          a.heading_3_medium,
          a.px_sm,
          a.text_center,
        ]}
      >
        {strings.submittedTxTitle}
      </Text>

      <Text
        style={[
          {color: p.gray_600},
          a.body_1_lg_regular,
          a.text_center,
          {maxWidth: 330},
        ]}
      >
        {strings.submittedTxText}
      </Text>

      <Space.Height._2xs fill />

      <Actions>
        <Button
          onPress={resetToTxHistory}
          title={strings.submittedTxButton}
          style={[a.px_lg]}
        />
      </Actions>
    </SafeArea>
  )
}

const Actions = ({children}: {children: React.ReactNode}) => {
  return <View style={{alignSelf: 'stretch'}}>{children}</View>
}
