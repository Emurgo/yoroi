import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, View} from 'react-native'

import {Button} from '../../../ui/Button/Button'
import {SafeArea} from '../../../ui/SafeArea/SafeArea'
import {Space} from '../../../ui/Space/Space'
import {Spacer} from '../../../ui/Space/Space'
import {SuccessfulTxIcon} from '../../../ui/SuccessfulTxIcon/SuccessfulTxIcon'
import {useBlockGoBack, useWalletNavigation} from '../../../kernel/navigation'

export const SubmittedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const {color} = useTheme()
  const {resetToTxHistory} = useWalletNavigation()

  return (
    <SafeArea style={styles.root}>
      <Spacer height={144} />

      <SuccessfulTxIcon />

      <Space height="_2xl" />

      <Space height="lg" />

      <Text style={[styles.title, {color: color.gray_max}]}>{strings.submittedTxTitle}</Text>

      <Text style={[styles.text, {color: color.gray_600}]}>{strings.submittedTxText}</Text>

      <Space fill />

      <Actions>
        <Button
          onPress={resetToTxHistory}
          title={strings.submittedTxButton}
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

const useStrings = () => {
  const intl = useIntl()

  return {
    submittedTxTitle: intl.formatMessage(messages.submittedTxTitle),
    submittedTxText: intl.formatMessage(messages.submittedTxText),
    submittedTxButton: intl.formatMessage(messages.submittedTxButton),
  }
}

const messages = defineMessages({
  submittedTxTitle: {
    id: 'components.delegation.submittedTx.title',
    defaultMessage: '!!!Transaction signed',
  },
  submittedTxText: {
    id: 'components.delegation.submittedTx.text',
    defaultMessage: `!!!It will show up in the transaction list once it's confirmed by the network.`,
  },
  submittedTxButton: {
    id: 'components.delegation.submittedTx.button',
    defaultMessage: '!!!Close',
  },
})