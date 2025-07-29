import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useSwap} from '~/features/Swap/common/SwapProvider'
import {useStrings} from '~/features/Swap/common/useStrings'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {SuccessfulTxIcon} from '~/ui/SuccessfulTxIcon/SuccessfulTxIcon'
import {useNavigateTo} from '../../common/navigation'

export const SubmittedTxScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const navigateTo = useNavigateTo()
  const swapForm = useSwap()

  const handleOnPress = () => {
    swapForm.action({type: 'ResetForm'})
    navigateTo.resetToStartSwap()
  }

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
        {strings.submittedTxScreenTitle}
      </Text>

      <Text
        style={[
          a.body_1_lg_regular,
          a.text_center,
          {color: p.gray_600, maxWidth: 330},
        ]}
      >
        {strings.submittedTxScreenText}
      </Text>

      <Space.Height._2xs fill />

      <Actions>
        <Button
          onPress={handleOnPress}
          title={strings.submittedTxScreenButton}
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
