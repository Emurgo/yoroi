import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {Button, Text, TextInput} from '../../components'

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
      <View style={styles.heading}>
        <Text style={styles.title}>{strings.title}</Text>
      </View>

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
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    content: {
      flex: 1,
      padding: 24,
      backgroundColor: color.gray_c100,
    },
    heading: {
      alignItems: 'center',
      justifyContent: 'center',
      ...atoms.pb_lg,
    },
    title: {
      color: color.primary_c600,
      ...atoms.pb_lg,
      ...atoms.body_1_lg_regular,
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
