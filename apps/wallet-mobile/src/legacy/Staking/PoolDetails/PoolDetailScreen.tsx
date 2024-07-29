import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import {useQuery} from 'react-query'

import {Button, Spacer, Text, TextInput} from '../../../components'
import {wrappedCsl} from '../../../yoroi-wallets/cardano/wrappedCsl'

type Props = {
  onPressDelegate: (poolHash: string) => void
  disabled?: boolean
}

export const PoolDetailScreen = ({onPressDelegate, disabled = false}: Props) => {
  const strings = useStrings()
  const styles = useStyles()
  const [poolIdOrHash, setPoolIdOrHash] = React.useState('')
  const {isDark, color} = useTheme()

  const {data: isValid} = useIsValidPoolIdOrHash(poolIdOrHash)

  const hasError = !isValid && poolIdOrHash.length > 0

  const handleOnPress = async () => {
    const hash = await normalizeToPoolHash(poolIdOrHash)
    onPressDelegate(hash)
  }

  return (
    <>
      <LinearGradient
        colors={isDark ? ['rgba(19, 57, 54, 1)', 'rgba(20, 24, 58, 1)', 'rgba(22, 25, 45, 1)'] : color.bg_gradient_1} // it fixes a weird bug
        start={{x: isDark ? 0.5 : 0.5, y: isDark ? 0 : 0.5}}
        end={{x: isDark ? 0 : 0, y: isDark ? 0.5 : 0}}
        style={styles.disclaimer}
      >
        <Text style={styles.title}>{strings.disclaimerTitle}</Text>

        <Text style={styles.description}>{strings.disclaimerText}</Text>
      </LinearGradient>

      <Spacer height={24} />

      <TextInput
        label={strings.poolID}
        value={poolIdOrHash}
        onChangeText={setPoolIdOrHash}
        autoComplete="off"
        testID="nightlyPoolHashInput"
        error={hasError}
        errorText={hasError ? strings.invalidPoolID : ''}
      />

      <Spacer fill />

      <Button
        shelleyTheme
        onPress={handleOnPress}
        title={strings.next}
        style={styles.button}
        disabled={disabled || hasError || poolIdOrHash.length === 0}
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
  const [validPoolId, validPoolHash] = await Promise.all([isValidPoolId(poolIdOrHash), isValidPoolHash(poolIdOrHash)])
  return validPoolId || validPoolHash
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
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    button: {
      ...atoms.p_sm,
    },
    disclaimer: {
      ...atoms.px_lg,
      ...atoms.py_md,
      ...atoms.gap_sm,
      overflow: 'hidden',
      borderRadius: 8,
    },
    title: {
      ...atoms.body_1_lg_medium,
      ...atoms.font_semibold,
      color: color.gray_cmax,
    },
    description: {
      ...atoms.body_2_md_regular,
      ...atoms.font_normal,
      color: color.gray_c900,
    },
  })
  return styles
}

const useStrings = () => {
  const intl = useIntl()

  return {
    poolHash: intl.formatMessage(messages.poolHash),
    delegate: intl.formatMessage(messages.delegate),
    poolID: intl.formatMessage(messages.poolID),
    invalidPoolID: intl.formatMessage(messages.invalidPoolID),
    next: intl.formatMessage(messages.next),
    disclaimerTitle: intl.formatMessage(messages.disclaimerTitle),
    disclaimerText: intl.formatMessage(messages.disclaimerText),
  }
}

const messages = defineMessages({
  delegate: {
    id: 'components.stakingcenter.confirmDelegation.delegateButtonLabel',
    defaultMessage: '!!!Delegate',
  },
  next: {
    id: 'global.next',
    defaultMessage: '!!!Next',
  },
  poolHash: {
    id: 'global.staking.stakePoolHash',
    defaultMessage: '!!!Stake pool hash',
  },
  poolID: {
    id: 'global.staking.stakePoolID',
    defaultMessage: '!!!Enter test stake pool ID',
  },
  invalidPoolID: {
    id: 'global.staking.invalidPoolID',
    defaultMessage: '!!!Invalid pool ID. Please retype.',
  },
  disclaimerTitle: {
    id: 'components.stakingcenter.poolDetails.disclaimerTitle',
    defaultMessage: '!!!Stake test ADA and support Yoroi 💥',
  },
  disclaimerText: {
    id: 'components.stakingcenter.poolDetails.disclaimerText',
    defaultMessage:
      "!!!Experience the mechanism of staking firsthand and help us improve Yoroi's functionality and user experience.",
  },
})
