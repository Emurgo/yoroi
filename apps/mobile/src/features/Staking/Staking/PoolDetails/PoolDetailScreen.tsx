import {useQuery} from '@tanstack/react-query'
import {atoms as a} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {View} from 'react-native'

import {Button} from '../../../../ui/Button/Button'
import {Space} from '../../../../ui/Space/Space'
import {TextInput} from '../../../../ui/TextInput/TextInput'
import {GradientWarning} from '../../../components/ChainWarning/GradientWarning'
import {
  isValidPoolIdOrHash,
  normalizeToPoolHash,
} from '../../../wallets/cardano/delegationUtils'

type Props = {
  onPressDelegate: (poolHash: string) => void
  disabled?: boolean
}

export const PoolDetailScreen = ({
  onPressDelegate,
  disabled = false,
}: Props) => {
  const strings = useStrings()
  const [poolIdOrHash, setPoolIdOrHash] = React.useState('')

  const {data: isValid} = useIsValidPoolIdOrHash(poolIdOrHash)

  const hasError = !isValid && poolIdOrHash.length > 0

  const handleOnPress = async () => {
    const hash = await normalizeToPoolHash(poolIdOrHash)
    onPressDelegate(hash)
  }

  return (
    <>
      <GradientWarning
        title={strings.disclaimerTitle}
        description={strings.disclaimerText}
      />

      <Space.Height.lg />

      <TextInput
        label={strings.poolID}
        value={poolIdOrHash}
        onChangeText={setPoolIdOrHash}
        autoComplete="off"
        testID="nightlyPoolHashInput"
        error={hasError}
        errorText={hasError ? strings.invalidPoolID : ''}
      />

      <View style={a.flex_1} />

      <Button
        onPress={handleOnPress}
        title={strings.next}
        style={a.p_sm}
        disabled={disabled || hasError || poolIdOrHash.length === 0}
        testID="nightlyDelegateButton"
      />
    </>
  )
}

const useIsValidPoolIdOrHash = (poolIdOrHash: string) => {
  const queryFn = React.useCallback(
    () => isValidPoolIdOrHash(poolIdOrHash),
    [poolIdOrHash],
  )
  return useQuery({queryFn, queryKey: ['isValidPoolIdOrHash', poolIdOrHash]})
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
