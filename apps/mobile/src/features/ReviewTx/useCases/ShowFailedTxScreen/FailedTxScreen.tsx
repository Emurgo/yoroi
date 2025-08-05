import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useBlockGoBack, useWalletNavigation} from '~/kernel/navigation/hooks'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {FailedTxIcon} from '../illustrations/FailedTxIcon'

export const FailedTxScreen = () => {
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

      <FailedTxIcon />

      <Space.Height.lg />

      <Text
        style={[
          a.heading_3_medium,
          a.px_sm,
          a.text_center,
          {color: p.gray_max},
        ]}
      >
        {strings.txReview.failedTxTitle}
      </Text>

      <Text style={[a.body_1_lg_regular, a.text_center, {color: p.gray_600}]}>
        {strings.txReview.failedTxText}
      </Text>

      <Space.Height._2xs fill />

      <Actions>
        <Button
          onPress={resetToTxHistory}
          title={strings.txReview.failedTxButton}
          style={[a.px_lg]}
        />
      </Actions>
    </SafeArea>
  )
}

const Actions = ({children}: {children: React.ReactNode}) => {
  return <View style={{alignSelf: 'stretch'}}>{children}</View>
}
