import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useBlockGoBack, useWalletNavigation} from '~/kernel/navigation/hooks'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {SuccessfulTxIcon} from '~/ui/SuccessfulTxIcon/SuccessfulTxIcon'

export const SubmittedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {resetToTxHistory} = useWalletNavigation()

  return (
    <SafeArea
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

      <Space.Height.lg />

      <Text
        style={[
          a.heading_3_medium,
          a.px_sm,
          a.text_center,
          {color: p.gray_max},
        ]}
      >
        {strings.txReview.submittedTxTitle}
      </Text>

      <Text
        style={[
          a.body_1_lg_regular,
          a.text_center,
          {color: p.gray_600, maxWidth: 330},
        ]}
      >
        {strings.txReview.submittedTxText}
      </Text>

      <Space.Height._2xs fill />

      <Actions>
        <Button
          onPress={resetToTxHistory}
          title={strings.txReview.submittedTxButton}
          style={[a.px_lg]}
        />
      </Actions>
    </SafeArea>
  )
}

const Actions = ({children}: {children: React.ReactNode}) => {
  const {palette: p} = useTheme()

  return (
    <View
      style={[
        {alignSelf: 'stretch', borderTopWidth: 1, borderTopColor: p.gray_200},
      ]}
    >
      {children}
    </View>
  )
}
