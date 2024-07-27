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
  const [poolIdOrHash, setPoolIdOrHash] = React.useState('')

  const {data: isValid} = useIsValidPoolIdOrHash(poolIdOrHash)

  const hasError = !isValid && poolIdOrHash.length > 0

  const handleOnPress = async () => {
    const hash = await normalizeToPoolHash(poolIdOrHash)
    onPressDelegate(hash)
  }

  return (
    <>
      <TextInput
        label={strings.poolHash}
        value={poolIdOrHash}
        onChangeText={setPoolIdOrHash}
        autoComplete="off"
        testID="nightlyPoolHashInput"
        error={hasError}
        errorText={hasError ? 'Invalid pool ID. Please retype.' : ''}
      />

      <Spacer fill />

      <Button
        shelleyTheme
        onPress={handleOnPress}
        title={strings.delegate}
        style={styles.button}
        disabled={disabled}
        testID="nightlyDelegateButton"
      />
    </>
  )
}

const useIsValidPoolIdOrHash = (poolIdOrHash: string) => {
  const queryFn = React.useCallback(() => isValidPoolIdOrHash(poolIdOrHash), [poolIdOrHash])
  return useQuery({queryFn, queryKey: ['isValidPoolIdOrHash', poolIdOrHash]})
}

const isValidPoolIdOrHash = async (poolIdOrHash: string): Promise<boolean> => {
  return (await isValidPoolId(poolIdOrHash)) || (await isValidPoolHash(poolIdOrHash))
}

const normalizeToPoolHash = async (poolIdOrHash: string): Promise<string> => {
  if (await isValidPoolHash(poolIdOrHash)) return poolIdOrHash
  if (await isValidPoolId(poolIdOrHash)) return getPoolHash(poolIdOrHash)
  throw new Error('Invalid pool ID or hash')
}

const getPoolHash = async (poolId: string): Promise<string> => {
  const {csl, release} = wrappedCsl()
  try {
    const hash = await csl.Ed25519KeyHash.fromBech32(poolId)
    return hash.toHex()
  } finally {
    release()
  }
}

const isValidPoolId = async (poolId: string): Promise<boolean> => {
  if (poolId.length === 0) return false
  try {
    await getPoolHash(poolId)
    return true
  } catch (e) {
    return false
  }
}

const isValidPoolHash = async (poolHash: string): Promise<boolean> => {
  if (poolHash.length === 0) return false

  const {csl, release} = wrappedCsl()
  try {
    await csl.Ed25519KeyHash.fromBytes(Buffer.from(poolHash, 'hex'))
    return true
  } catch (e) {
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
