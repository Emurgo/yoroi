import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button} from '../../../ui/Button/Button'
import {SafeArea} from '../../../ui/SafeArea/SafeArea'
import {Space, Spacer} from '../../../ui/Space/Space'
import {SuccessfulTxIcon} from '../../../ui/SuccessfulTxIcon/SuccessfulTxIcon'
import {useNavigateTo} from '../../common/navigation'
import {useStrings} from '../../common/strings'
import {useSwap} from '../../common/SwapProvider'

export const SubmittedTxScreen = () => {
  const strings = useStrings()
  const {color} = useTheme()
  const navigateTo = useNavigateTo()
  const swapForm = useSwap()

  const handleOnPress = () => {
    swapForm.action({type: 'ResetForm'})
    navigateTo.resetToStartSwap()
  }

  return (
    <SafeArea style={[styles.root, {backgroundColor: color.bg_color_max}]}>
      <Spacer height={144} />

      <SuccessfulTxIcon />

      <Space height="_2xl" />

      <Space height="lg" />

      <Text style={[styles.title, {color: color.gray_max}]}>
        {strings.submittedTxScreenTitle}
      </Text>

      <Text style={[styles.text, {color: color.gray_600}]}>
        {strings.submittedTxScreenText}
      </Text>

      <Space fill />

      <Actions>
        <Button
          onPress={handleOnPress}
          title={strings.submittedTxScreenButton}
          style={styles.button}
        />
      </Actions>
    </SafeArea>
  )
}

const Actions = ({children}: {children: React.ReactNode}) => {
  const {color} = useTheme()

  return (
    <View style={[styles.actions, {borderTopColor: color.gray_200}]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    ...a.p_lg,
    ...a.flex_1,
    ...a.align_center,
    ...a.justify_center,
  },
  title: {
    ...a.heading_3_medium,
    ...a.px_sm,
    ...a.text_center,
  },
  text: {
    ...a.body_1_lg_regular,
    ...a.text_center,
    maxWidth: 330,
  },
  button: {
    ...a.px_lg,
  },
  actions: {
    alignSelf: 'stretch',
    borderTopWidth: 1,
  },
})
