import {atoms as a} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useQuery} from '@tanstack/react-query'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {TextInput} from '~/ui/TextInput/TextInput'
import {
  isValidPoolIdOrHash,
  normalizeToPoolHash,
} from '~/wallets/cardano/delegationUtils'

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
      <View>
        <Text style={[a.body_1_lg_medium]}>
          {strings.staking.poolDetails.disclaimerTitle}
        </Text>
        <Space.Height.xs />
        <Text style={[a.body_2_md_regular]}>
          {strings.staking.poolDetails.disclaimerText}
        </Text>
      </View>

      <Space.Height.lg />

      <TextInput
        label={strings.staking.poolDetails.poolID}
        value={poolIdOrHash}
        onChangeText={setPoolIdOrHash}
        autoComplete="off"
        testID="nightlyPoolHashInput"
        error={hasError}
        errorText={hasError ? strings.staking.poolDetails.invalidPoolID : ''}
      />

      <View style={a.flex_1} />

      <Button
        onPress={handleOnPress}
        title={strings.staking.poolDetails.next}
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
