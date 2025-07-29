import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Text, View} from 'react-native'

import {useBlockGoBack, useWalletNavigation} from '~/kernel/navigation'
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
    <SafeArea style={[a.p_lg, a.flex_1, a.align_center, a.justify_center]}>
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
        {strings.submittedTxTitle}
      </Text>

      <Text
        style={[
          a.body_1_lg_regular,
          a.text_center,
          {maxWidth: 330},
          {color: p.gray_600},
        ]}
      >
        {strings.submittedTxText}
      </Text>

      <Space.Height._2xs fill />

      <Actions>
        <Button
          onPress={resetToTxHistory}
          title={strings.submittedTxButton}
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
