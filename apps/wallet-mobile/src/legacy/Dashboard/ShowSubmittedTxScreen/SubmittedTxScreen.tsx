import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, View} from 'react-native'

import {Button} from '../../../components/Button/Button'
import {SafeArea} from '../../../components/SafeArea'
import {Space} from '../../../components/Space/Space'
import {Spacer} from '../../../components/Spacer/Spacer'
import {SuccessfulTxIcon} from '../../../features/ReviewTx/illustrations/SuccessfulTxIcon'
import {useBlockGoBack} from '../../../kernel/navigation'
import {useNavigateTo} from '../Dashboard'

export const SubmittedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const {styles} = useStyles()
  const navigateTo = useNavigateTo()

  return (
    <SafeArea style={styles.root}>
      <Spacer height={144} />

      <SuccessfulTxIcon />

      <Space height="_2xl" />

      <Space height="lg" />

      <Text style={styles.title}>{strings.submittedTxTitle}</Text>

      <Text style={styles.text}>{strings.submittedTxText}</Text>

      <Space fill />

      <Actions>
        <Button onPress={navigateTo.submittedTx} title={strings.submittedTxButton} style={styles.button} />
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
      maxWidth: 330,
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
    defaultMessage: '!!!Check this transaction in the list of wallet transactions.',
  },
  submittedTxButton: {
    id: 'components.delegation.submittedTx.button',
    defaultMessage: '!!!Close',
  },
})
