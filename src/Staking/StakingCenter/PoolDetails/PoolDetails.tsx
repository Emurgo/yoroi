import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {Button, Text, TextInput} from '../../../../legacy/components/UiKit'
import {COLORS, spacing} from '../../../../legacy/styles/config'

type Props = {
  onPressDelegate: (poolHash?: string) => void
  disabled?: boolean
}

export const PoolDetails = ({onPressDelegate, disabled = false}: Props) => {
  const strings = useStrings()
  const delegateButtonTitle = strings.delegate
  const title = strings.title
  const poolLabel = strings.poolHash
  const [poolHash, setPoolHash] = React.useState('')

  return (
    <View style={styles.content}>
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <TextInput label={poolLabel} value={poolHash} onChangeText={setPoolHash} />
      <Button
        outlineOnLight
        outline
        onPress={() => onPressDelegate(poolHash)}
        title={delegateButtonTitle}
        style={styles.button}
        disabled={disabled}
      />
    </View>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    delegate: intl.formatMessage(messages.delegate),
    title: intl.formatMessage(messages.title),
    poolHash: intl.formatMessage(messages.poolHash),
  }
}

const messages = defineMessages({
  delegate: {
    id: 'components.stakingcenter.confirmDelegation.delegateButtonLabel',
    defaultMessage: '!!!Delegate',
  },
  title: {
    id: 'components.stakingcenter.pooldetailscreen.title',
    defaultMessage: '!!!Nightly delegation',
  },
  poolHash: {
    id: 'global.staking.stakePoolHash',
    defaultMessage: '!!!Stake pool hash',
  },
})

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 24,
  },
  heading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.paragraphBottomMargin,
  },
  title: {
    fontSize: 16,
    color: COLORS.SHELLEY_BLUE,
    paddingBottom: spacing.paragraphBottomMargin,
  },
  button: {
    padding: 8,
  },
})
