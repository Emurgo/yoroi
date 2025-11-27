import {isAdaHandleDomain, useResolverDRepId} from '@yoroi/resolver'
import {parseDrepId, useIsValidDRepID} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Alert, Linking, Text, View} from 'react-native'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'
import {TextInput} from '~/ui/TextInput/TextInput'
import {CardanoMobile} from '~/wallets/wallets'

export type Props = {
  onSubmit?: (options: {
    type: 'key' | 'script'
    hash: string
    CIP105: boolean
  }) => void
  initialDrepId?: string
}

const FIND_DREPS_LINK = ''

export const EnterDrepIdModal = ({onSubmit, initialDrepId}: Props) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const {wallet} = useSelectedWallet()
  const [drepId, setDrepId] = React.useState(initialDrepId ?? '')

  // Update drepId when initialDrepId changes
  React.useEffect(() => {
    if (initialDrepId !== undefined && initialDrepId !== null) {
      setDrepId(initialDrepId)
    }
  }, [initialDrepId])

  // Trim whitespace from input, ensure drepId is always a string
  const trimmedDrepId = (drepId ?? '').trim()

  // Check if input is an ADA handle
  const isHandle = isAdaHandleDomain(trimmedDrepId)

  // Resolve ADA handle to DRep ID
  const {
    drepInfo,
    isLoading: isResolvingHandle,
    error: handleResolutionError,
  } = useResolverDRepId({
    resolve: trimmedDrepId,
    isMainnet: wallet.isMainnet,
    enabled: isHandle,
  })

  // Use the resolved DRep ID or the direct input
  const resolvedDrepId = React.useMemo(() => {
    if (isHandle && drepInfo?.hex) {
      return drepInfo.hex
    }
    return trimmedDrepId
  }, [isHandle, drepInfo, trimmedDrepId])

  const {error, isFetched, isFetching} = useIsValidDRepID(resolvedDrepId, {
    retry: false,
    enabled: resolvedDrepId.length > 0 && !isResolvingHandle,
  })

  const handleOnPress = () => {
    try {
      let hash: string
      let type: 'key' | 'script'

      if (isHandle && drepInfo) {
        hash = drepInfo.hex
        type = drepInfo.cred === 'key' ? 'key' : 'script'
      } else {
        const parsed = parseDrepId(resolvedDrepId, CardanoMobile)
        hash = parsed.hash
        type = parsed.type
      }

      // CIP105 flag indicates if user entered deprecated CIP-105 format (58-char hex starting with 22/23)
      // For handles, this should be false since user didn't enter CIP-105 format directly
      const isCIP105Format =
        !isHandle && !error && /^(22|23)[0-9a-fA-F]{56}$/.test(trimmedDrepId)

      // Modal will be closed by the parent component after async operations
      onSubmit?.({hash, type, CIP105: isCIP105Format})
    } catch (e) {
      Alert.alert(strings.global.error, strings.staking.invalidDRepId)
    }
  }

  const handleOnLinkPress = () => {
    Linking.openURL(FIND_DREPS_LINK)
  }

  const noDrepForHandle =
    isHandle &&
    !isResolvingHandle &&
    drepInfo === null &&
    !handleResolutionError
  const displayError = noDrepForHandle
    ? 'This ADA handle does not have a DRep associated with it'
    : handleResolutionError?.message || error?.message
  const isLoading = isResolvingHandle || isFetching
  const canSubmit =
    drepId.length > 0 &&
    !isLoading &&
    !displayError &&
    (isHandle ? drepInfo !== null : isFetched)

  return (
    <Modal.Content>
      <Space.Height.sm />

      <Text style={[a.text_center, a.body_1_lg_regular, ta.text_gray_medium]}>
        {strings.staking.enterDrepIDInfo}
      </Text>

      {FIND_DREPS_LINK.length > 0 && (
        <>
          <Space.Height.lg />

          <Text
            style={[
              a.text_center,
              a.body_1_lg_regular,
              {color: p.primary_500, textDecorationLine: 'underline'},
            ]}
            onPress={handleOnLinkPress}
          >
            {strings.staking.findDRepHere}
          </Text>
        </>
      )}

      <Space.Height.lg />

      <TextInput
        value={drepId}
        onChangeText={(text) => setDrepId(text)}
        multiline
        errorDelay={1000}
        errorText={displayError}
        label={strings.staking.drepID}
        numberOfLines={2}
        focusable
        containerStyle={{minHeight: 80}}
        renderComponentStyle={{
          ...a.pt_lg,
          ...a.pb_lg,
          ...a.pl_lg,
          ...a.pr_lg,
          ...a.body_1_lg_regular,
          minHeight: 70,
        }}
      />

      {isHandle && drepInfo && (
        <>
          <Space.Height.sm />

          <View style={[a.flex_row, a.justify_between, a.px_lg]}>
            <Text style={[a.body_3_sm_regular, ta.text_gray_max]}>
              Resolved DRep ID:
            </Text>

            <Text
              style={[a.body_3_sm_regular, ta.text_gray_medium]}
              numberOfLines={1}
            >
              {shortenDRepId(drepInfo.cip_129)}
            </Text>
          </View>
        </>
      )}

      <Space.Height.sm fill />

      <Button
        title={strings.staking.confirm}
        disabled={!canSubmit}
        onPress={handleOnPress}
      />
    </Modal.Content>
  )
}

const shortenDRepId = (id: string) => {
  if (id.length > 20) {
    return id.substring(0, 10) + '...' + id.substring(id.length - 10)
  }
  return id
}
