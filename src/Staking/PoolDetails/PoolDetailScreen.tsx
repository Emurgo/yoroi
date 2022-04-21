import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {Button, Text, TextInput} from '../../components'
import {COLORS, spacing} from '../../theme'

type Props = {
  onPressDelegate: (poolHash?: string) => void
  disabled?: boolean
}

export const PoolDetailScreen = ({onPressDelegate, disabled = false}: Props) => {
  const strings = useStrings()
  const [poolHash, setPoolHash] = React.useState('')

  return (
    <View style={styles.content}>
      <View style={styles.heading}>
        <Text style={styles.title}>{strings.title}</Text>
      </View>

      <TextInput label={strings.poolHash} value={poolHash} onChangeText={setPoolHash} autoComplete={false} />

      <Button
        outlineOnLight
        outline
        onPress={() => onPressDelegate(poolHash)}
        title={strings.delegate}
        style={styles.button}
        disabled={disabled}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 24,
    backgroundColor: COLORS.LIGHT_GRAY,
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

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
    poolHash: intl.formatMessage(messages.poolHash),
    delegate: intl.formatMessage(messages.delegate),
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
