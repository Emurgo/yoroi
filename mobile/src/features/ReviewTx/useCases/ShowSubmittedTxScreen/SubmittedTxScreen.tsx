import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useBlockGoBack} from '~/kernel/navigation/hooks/useBlockGoBack'
import {useUnsafeParams} from '~/kernel/navigation/hooks/useUnsafeParams'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {ReviewTxRoutes} from '~/kernel/navigation/types'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {SuccessfulTxIcon} from '~/ui/SuccessfulTxIcon/SuccessfulTxIcon'

export const SubmittedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const {palette: p, atoms: ta} = useTheme()
  const {resetToTxHistory} = useWalletNavigation()

  // Try to get parameters from different possible route types
  const reviewTxParams =
    useUnsafeParams<NonNullable<ReviewTxRoutes['review-tx-submitted-tx']>>()
  const governanceParams = useUnsafeParams<{
    title?: string
    message?: string
    buttonTitle?: string
  }>()

  const title = reviewTxParams?.title || governanceParams?.title
  const message = reviewTxParams?.message || governanceParams?.message
  const buttonTitle =
    reviewTxParams?.buttonTitle || governanceParams?.buttonTitle

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
        {title || strings.txReview.submittedTxTitle}
      </Text>

      <Text
        style={[
          {color: p.gray_600, maxWidth: 330},
          a.body_1_lg_regular,
          a.text_center,
        ]}
      >
        {message || strings.txReview.submittedTxText}
      </Text>

      <Space.Height._2xs fill />

      <Actions>
        <Button
          onPress={resetToTxHistory}
          title={buttonTitle || strings.txReview.submittedTxButton}
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
