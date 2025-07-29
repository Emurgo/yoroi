import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Text, View} from 'react-native'

import {useBlockGoBack, useWalletNavigation} from '~/kernel/navigation'
import {Button} from '~/ui/Button/Button'
import {FailedTxIcon} from '~/ui/FailedTxIcon/FailedTxIcon'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'

export const FailedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const {palette: p} = useTheme()

  const {resetToTxHistory} = useWalletNavigation()

  return (
    <SafeArea style={[a.p_lg, a.flex_1, a.align_center, a.justify_center]}>
      <Space.Height._2xl />

      <FailedTxIcon />

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
        {strings.failedTxTitle}
      </Text>

      <Text style={[a.body_1_lg_regular, a.text_center, {color: p.gray_600}]}>
        {strings.failedTxText}
      </Text>

      <Space.Height._2xs fill />

      <Actions>
        <Button
          onPress={resetToTxHistory}
          title={strings.failedTxButton}
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
        {alignSelf: 'stretch', borderTopWidth: 1},
        {borderTopColor: p.gray_200},
      ]}
    >
      {children}
    </View>
  )
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
    defaultMessage:
      '!!!Your transaction has not been processed properly due to technical issues.',
  },
  failedTxButton: {
    id: 'components.delegation.failedTx.button',
    defaultMessage: '!!!Try again',
  },
})
