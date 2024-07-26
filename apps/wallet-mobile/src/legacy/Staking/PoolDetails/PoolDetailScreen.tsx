import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {Button, TextInput} from '../../../components'

type Props = {
  onPressDelegate: (poolHash: string) => void
  disabled?: boolean
}

export const PoolDetailScreen = ({onPressDelegate, disabled = false}: Props) => {
  const strings = useStrings()
  const styles = useStyles()
  const [poolHash, setPoolHash] = React.useState('')

  return (
    <View style={styles.content}>
      <TextInput
        label={strings.poolHash}
        value={poolHash}
        onChangeText={setPoolHash}
        autoComplete="off"
        testID="nightlyPoolHashInput"
      />

      <Button
        outlineOnLight
        outline
        onPress={() => onPressDelegate(poolHash)}
        title={strings.delegate}
        style={styles.button}
        disabled={disabled}
        testID="nightlyDelegateButton"
      />
    </View>
  )
}

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    content: {
      flex: 1,
      ...atoms.p_xl,
    },
    button: {
      ...atoms.p_sm,
    },
  })
  return styles
}

const useStrings = () => {
  const intl = useIntl()

  return {
    poolHash: intl.formatMessage(messages.poolHash),
    delegate: intl.formatMessage(messages.delegate),
  }
}

const messages = defineMessages({
  delegate: {
    id: 'components.stakingcenter.confirmDelegation.delegateButtonLabel',
    defaultMessage: '!!!Delegate',
  },
  poolHash: {
    id: 'global.staking.stakePoolHash',
    defaultMessage: '!!!Stake pool hash',
  },
})
