import {CardanoMobile} from '@yoroi/cardano-wallet'
import {isNonNullable} from '@yoroi/common'
import {isAdaHandleDomain, useResolverDRepId} from '@yoroi/resolver'
import {getYoroiDrepIdHex, parseDrepId, useIsValidDRepID} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import * as React from 'react'
import {Alert, Linking, Text, View} from 'react-native'
import {v4 as uuid} from 'uuid'

import {useBrowser} from '~/features/Discover/common/BrowserProvider'
import {CEXPLORER_DREP_URLS} from '~/features/Staking/Governance/common/drep'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
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

const GOVTOOLS_URL = 'https://gov.tools/'
const YOROI_DREP = [
  'drep1ygr9tuapcanc3kpeyy4dc3vmrz9cfe5q7v9wj3x9j0ap3tswtre9j',
  'drep1qe2l8gw8v7ydswfp9twytxcc3wzwdq8npt55f3vnlgv2u8sx3nt',
  '220655f3a1c76788d839212adc459b188b84e680f30ae944c593fa18ae',
]

export const HEIGHT_DEFAULT = 460
export const HEIGHT_PREFILLED = 380
export const HEIGHT_INPUT_FOCUSED = 440

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
  const {addTabAndSetActive} = useBrowser()
  const walletNavigation = useWalletNavigation()

  const [drepId, setDrepId] = React.useState(initialDrepId ?? '')
  const [isYoroiDrep, setIsYoroiDrep] = React.useState<boolean>(
    initialDrepId != null && YOROI_DREP.includes(initialDrepId.trim()),
  )

  // Track if we've already set initialDrepId to prevent overriding user input
  const hasSetInitialDrepIdRef = React.useRef(false)

  const {
    handleInputFocus: defaultHandleInputFocus,
    handleInputBlur: defaultHandleInputBlur,
  } = useModalKeyboardResize({
    defaultHeight: HEIGHT_DEFAULT,
    focusedHeight: HEIGHT_INPUT_FOCUSED,
  })

  const handleDrepIdChange = React.useCallback((text: string) => {
    setDrepId(text)
    setIsYoroiDrep(YOROI_DREP.includes(text.trim()))
  }, [])

  const handleInputFocus = React.useCallback(() => {
    defaultHandleInputFocus()
  }, [defaultHandleInputFocus])

  const handleInputBlur = React.useCallback(() => {
    defaultHandleInputBlur()
  }, [defaultHandleInputBlur])

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
  const displayError = isYoroiDrep
    ? strings.staking.delegationFailedYoroi
    : noDrepForHandle
      ? strings.staking.noDrepForHandle
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
    (isHandle && drepInfo === null) ||
    isYoroiDrep

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

      if (hash === getYoroiDrepIdHex(network)) {
        setIsYoroiDrep(true)
        return
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

  const handleFindDRepPress = () => {
    Linking.openURL(CEXPLORER_DREP_URLS[network])
  }

  const handleGovtoolsPress = () => {
    const tabId = uuid()
    addTabAndSetActive(GOVTOOLS_URL, tabId)
    closeModal()
    walletNavigation.navigateToDiscoverBrowserDapp()
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
          style={[a.body_1_lg_regular, {color: p.primary_500}]}
          onPress={handleFindDRepPress}
        >
          {strings.staking.findDRepHere}
        </Text>
      </View>

      <Space.Height.sm />

      <Text style={[a.body_1_lg_regular, ta.text_gray_medium, a.text_center]}>
        {strings.staking.connectToGovtools({
          link: (text) => (
            <Text style={{color: p.primary_500}} onPress={handleGovtoolsPress}>
              {text}
            </Text>
          ),
        })}
      </Text>

      <Space.Height.sm fill />

      <Button
        title={strings.staking.confirm}
        disabled={isSubmitDisabled}
        onPress={handleSubmit}
      />
    </Modal.Content>
  )
}
