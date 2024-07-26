import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {Button, Spacer, TextInput} from '../../../components'
import {wrappedCsl} from '../../../yoroi-wallets/cardano/wrappedCsl'
import {useQuery} from 'react-query'

type Props = {
  onPressDelegate: (poolHash: string) => void
  disabled?: boolean
}

export const PoolDetailScreen = ({onPressDelegate, disabled = false}: Props) => {
  const strings = useStrings()
  const styles = useStyles()
  const [poolHash, setPoolHash] = React.useState('')

  const {data: isValid} = useIsValidPoolHash(poolHash)

  return (
    <>
      <TextInput
        label={strings.poolHash}
        value={poolHash}
        onChangeText={setPoolHash}
        autoComplete="off"
        testID="nightlyPoolHashInput"
        error={!isValid}
        errorText={!isValid && 'Invalid pool ID. Please retype.'}
      />

      <Spacer fill />

      <Button
        shelleyTheme
        onPress={() => onPressDelegate(poolHash)}
        title={strings.delegate}
        style={styles.button}
        disabled={disabled}
        testID="nightlyDelegateButton"
      />
    </>
  )
}

const useIsValidPoolHash = (poolHash: string) => {
  const queryFn = React.useCallback(() => validatePoolHash(poolHash), [poolHash])
  return useQuery({queryFn})
}

const validatePoolHash = async (poolHash: string) => {
  if (poolHash.length === 0) return false

  const {csl, release} = wrappedCsl()
  try {
    await csl.Ed25519KeyHash.fromBytes(Buffer.from(poolHash, 'hex'))
  } catch {
    return false
  } finally {
    release()
  }
}

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
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
