import {CardanoMobile} from '@yoroi/cardano-wallet'
import {isNonNullable} from '@yoroi/common'
import {isAdaHandleDomain, useResolverDRepId} from '@yoroi/resolver'
import {parseDrepId, useIsValidDRepID} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import * as React from 'react'
import {Alert, Linking, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {useModalKeyboardResize} from '~/ui/Modal/hooks/useModalKeyboardResize'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'
import {TextInput} from '~/ui/TextInput/TextInput'

export type Props = {
  onSubmit?: (options: {
    type: 'key' | 'script'
    hash: string
    CIP105: boolean
  }) => void
  initialDrepId?: string
}

const FIND_DREPS_LINKS: Record<Chain.SupportedNetworks, string> = {
  [Chain.Network.Preprod]: 'https://preprod.cexplorer.io/drep',
  [Chain.Network.Mainnet]: 'https://cexplorer.io/drep',
}

export const HEIGHT_DEFAULT = 420
export const HEIGHT_PREFILLED = 340
export const HEIGHT_INPUT_FOCUSED = 400

const shortenDRepId = (id: string) => {
  if (id.length > 20) {
    return id.substring(0, 10) + '...' + id.substring(id.length - 10)
  }
  return id
}

export const EnterDrepIdModal = ({onSubmit, initialDrepId}: Props) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const {closeModal} = useModal()
  const {wallet} = useSelectedWallet()
  const network = wallet.networkManager.network

  const [drepId, setDrepId] = React.useState(initialDrepId ?? '')

  // Track if we've already set initialDrepId to prevent overriding user input
  const hasSetInitialDrepIdRef = React.useRef(false)

  const {
    handleInputFocus: defaultHandleInputFocus,
    handleInputBlur: defaultHandleInputBlur,
  } = useModalKeyboardResize({
    defaultHeight:
      initialDrepId != null && initialDrepId.length > 0
        ? HEIGHT_PREFILLED
        : HEIGHT_DEFAULT,
    focusedHeight: HEIGHT_INPUT_FOCUSED,
  })

  const handleDrepIdChange = React.useCallback((text: string) => {
    setDrepId(text)
  }, [])

  const handleInputFocus = React.useCallback(() => {
    defaultHandleInputFocus()
  }, [defaultHandleInputFocus])

  const handleInputBlur = React.useCallback(() => {
    defaultHandleInputBlur()
  }, [defaultHandleInputBlur])

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
  // For handles, use cip_129 (bech32 format) for validation since parseDrepId expects bech32 format
  const resolvedDrepId = React.useMemo(() => {
    if (isHandle && drepInfo?.cip_129) {
      return drepInfo.cip_129
    }
    return trimmedDrepId
  }, [isHandle, drepInfo, trimmedDrepId])

  const {
    error,
    isFetching,
    isSuccess,
    isPending,
    data: isValidDRep,
    refetch,
  } = useIsValidDRepID(resolvedDrepId, {
    retry: false,
    enabled: resolvedDrepId.length > 0 && !isResolvingHandle,
    refetchOnMount: 'always',
  })

  // Update drepId when initialDrepId is provided (only once).
  React.useEffect(() => {
    if (
      initialDrepId !== undefined &&
      initialDrepId !== null &&
      !hasSetInitialDrepIdRef.current
    ) {
      hasSetInitialDrepIdRef.current = true
      handleDrepIdChange(initialDrepId)
    }
  }, [initialDrepId, handleDrepIdChange])

  // Ensure validation runs when resolvedDrepId changes (including when initialDrepId is set)
  // React Query should automatically run when enabled becomes true, but we ensure it runs
  React.useEffect(() => {
    const queryEnabled = resolvedDrepId.length > 0 && !isResolvingHandle

    // If query is enabled but hasn't succeeded yet and isn't currently running, trigger it
    // Check isPending to see if query is waiting to start
    // Don't refetch if there's an error - user needs to fix input first
    if (
      queryEnabled &&
      !isSuccess &&
      !isFetching &&
      !isPending &&
      !isNonNullable(error)
    ) {
      // Use a small delay to ensure React Query has processed the enabled state change
      const timer = setTimeout(() => {
        // Only refetch if still needed (query might have started automatically)
        // Also check error again in case it was set during the delay
        if (!isSuccess && !isFetching && !isPending && !isNonNullable(error)) {
          refetch().catch(() => {
            // Silently handle refetch errors
          })
        }
      }, 200)

      return () => {
        clearTimeout(timer)
      }
    }
    return undefined
  }, [
    resolvedDrepId,
    isResolvingHandle,
    isSuccess,
    isFetching,
    isPending,
    error,
    refetch,
  ])

  const noDrepForHandle =
    isHandle &&
    !isResolvingHandle &&
    drepInfo === null &&
    !handleResolutionError
  const displayError = noDrepForHandle
    ? 'This ADA handle does not have a DRep associated with it'
    : handleResolutionError?.message || error?.message
  const isLoading = isResolvingHandle || isFetching

  // Button is enabled when:
  // - DRep ID is entered
  // - Not currently loading/resolving
  // - Validation has succeeded (isSuccess && data === true)
  // - No errors
  // - If it's a handle, we have drepInfo
  // Use isSuccess instead of isFetched because isSuccess is true when validation succeeds,
  // while isFetched can be true even if validation failed
  const isSubmitDisabled =
    drepId.length === 0 ||
    isLoading ||
    isNonNullable(error) ||
    !(isSuccess && isValidDRep === true) ||
    (isHandle && drepInfo === null)

  const handleSubmit = () => {
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

      onSubmit?.({hash, type, CIP105: isCIP105Format})
      closeModal()
    } catch (e) {
      Alert.alert(strings.global.error, strings.staking.invalidDRepId)
    }
  }

  const handleOnLinkPress = () => {
    Linking.openURL(FIND_DREPS_LINKS[network])
  }

  return (
    <Modal.Content>
      <Space.Height.sm />

      <Text style={[a.text_center, a.body_1_lg_regular, ta.text_gray_medium]}>
        {strings.staking.enterDrepIDInfo}
      </Text>

      <Space.Height.lg />

      <TextInput
        value={drepId}
        onChangeText={handleDrepIdChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
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
              {strings.staking.resolvedDrepId}
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

      <Space.Height.lg />

      <View style={[a.flex_row, a.justify_center, a.flex_wrap]}>
        <Text style={[a.body_1_lg_regular, ta.text_gray_medium, a.text_center]}>
          {strings.staking.dontHaveAnID}{' '}
        </Text>

        <Text
          style={[
            a.body_1_lg_regular,
            {color: p.primary_500, textDecorationLine: 'underline'},
          ]}
          onPress={handleOnLinkPress}
        >
          {strings.staking.findDRepHere}
        </Text>
      </View>

      <Space.Height.sm fill />

      <Button
        title={strings.staking.confirm}
        disabled={isSubmitDisabled}
        onPress={handleSubmit}
      />
    </Modal.Content>
  )
}
