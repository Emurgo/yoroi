import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, View} from 'react-native'

import {Button} from '../../../ui/Button/Button'
import {SafeArea} from '../../../ui/SafeArea/SafeArea'
import {Space} from '../../../ui/Space/Space'
import {Spacer} from '../../../ui/Space/Space'
import {FailedTxIcon} from '../../../ui/FailedTxIcon/FailedTxIcon'
import {useBlockGoBack, useWalletNavigation} from '../../../kernel/navigation'

export const FailedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const {color} = useTheme()

  const {resetToTxHistory} = useWalletNavigation()

  return (
    <SafeArea style={styles.root}>
      <Spacer height={144} />

      <FailedTxIcon />

      <Space height="_2xl" />

      <Space height="lg" />

      <Text style={[styles.title, {color: color.gray_max}]}>{strings.failedTxTitle}</Text>

      <Text style={[styles.text, {color: color.gray_600}]}>{strings.failedTxText}</Text>

      <Space fill />

      <Actions>
        <Button
          onPress={resetToTxHistory}
          title={strings.failedTxButton}
          style={styles.button}
        />
      </Actions>
    </SafeArea>
  )
}

const Actions = ({children}: {children: React.ReactNode}) => {
  const {color} = useTheme()

  return <View style={[styles.actions, {borderTopColor: color.gray_200}]}>{children}</View>
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
  },
  button: {
    ...a.px_lg,
  },
  actions: {
    alignSelf: 'stretch',
    borderTopWidth: 1,
  },
})

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
    defaultMessage:
      '!!!Your transaction has not been processed properly due to technical issues.',
  },
  failedTxButton: {
    id: 'components.delegation.failedTx.button',
    defaultMessage: '!!!Try again',
  },
})