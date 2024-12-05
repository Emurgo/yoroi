import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, View} from 'react-native'

import {Button} from '../../../components/Button/Button'
import {SafeArea} from '../../../components/SafeArea'
import {Space} from '../../../components/Space/Space'
import {Spacer} from '../../../components/Spacer/Spacer'
import {FailedTxIcon} from '../../../features/ReviewTx/illustrations/FailedTxIcon'
import {useBlockGoBack} from '../../../kernel/navigation'
import {useNavigateTo} from '../Dashboard'

export const FailedTxScreen = () => {
  useBlockGoBack()
  const {styles} = useStyles()
  const strings = useStrings()
  const navigateTo = useNavigateTo()

  return (
    <SafeArea style={styles.root}>
      <Spacer height={144} />

      <FailedTxIcon />

      <Space height="_2xl" />

      <Space height="lg" />

      <Text style={styles.title}>{strings.failedTxTitle}</Text>

      <Text style={styles.text}>{strings.failedTxText}</Text>

      <Space fill />

      <Actions>
        <Button onPress={navigateTo.stakingCenter} title={strings.failedTxButton} style={styles.button} />
      </Actions>
    </SafeArea>
  )
}

const Actions = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()

  return <View style={styles.actions}>{children}</View>
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_max,
      ...atoms.p_lg,
      ...atoms.flex_1,
      ...atoms.align_center,
      ...atoms.justify_center,
    },
    title: {
      color: color.gray_max,
      ...atoms.heading_3_medium,
      ...atoms.px_sm,
      ...atoms.text_center,
    },
    text: {
      color: color.gray_600,
      ...atoms.body_1_lg_regular,
      ...atoms.text_center,
    },
    button: {
      ...atoms.px_lg,
    },
    actions: {
      alignSelf: 'stretch',
    },
  })
  return {styles} as const
}

const useStrings = () => {
  const intl = useIntl()

  return {
    failedTxTitle: intl.formatMessage(messages.failedTxTitle),
    failedTxText: intl.formatMessage(messages.failedTxText),
    failedTxButton: intl.formatMessage(messages.failedTxButton),
  }
}

const messages = defineMessages({
  failedTxTitle: {
    id: 'components.delegation.failedTx.title',
    defaultMessage: '!!!Transaction error',
  },
  failedTxText: {
    id: 'components.delegation.failedTx.text',
    defaultMessage: '!!!Your transaction has not been processed properly due to technical issues.',
  },
  failedTxButton: {
    id: 'components.delegation.failedTx.button',
    defaultMessage: '!!!Try again',
  },
})
