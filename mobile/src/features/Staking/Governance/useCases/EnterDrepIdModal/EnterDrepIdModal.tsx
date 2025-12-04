import {CardanoMobile} from '@yoroi/cardano-wallet'
import {isAdaHandleDomain, useResolverDRepId} from '@yoroi/resolver'
import {parseDrepId, useIsValidDRepID, getYoroiDrepIdHex} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'
import {isNonNullable} from '@yoroi/common'

import * as React from 'react'
import {Alert, Linking, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'
import {TextInput} from '~/ui/TextInput/TextInput'
import {YoroiDrepCard} from '~/features/Staking/Governance/common/YoroiDrepCard/YoroiDrepCard'

export type Props = {
  onSubmit?: (options: {
    type: 'key' | 'script'
    hash: string
    CIP105: boolean
  }) => void
  initialDrepId?: string
}

export const HEIGHT_WITH_CARD = 660
export const HEIGHT_WITHOUT_CARD = 350

const FIND_DREPS_LINKS: Record<Chain.SupportedNetworks, string> = {
  [Chain.Network.Preprod]: 'https://preprod.cexplorer.io/drep',
  [Chain.Network.Mainnet]: 'https://beta.cexplorer.io/drep',
  [Chain.Network.Preview]: 'https://preview.cexplorer.io/drep',
}

const shortenDRepId = (id: string) => {
  if (id.length > 20) {
    return id.substring(0, 10) + '...' + id.substring(id.length - 10)
  }
  return id
}

export const EnterDrepIdModal = ({onSubmit, initialDrepId}: Props) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const {closeModal, setHeight} = useModal()
  const {wallet} = useSelectedWallet()
  const network = wallet.networkManager.network

  const [showCard, setShowCard] = React.useState(true)
  const [drepId, setDrepId] = React.useState(initialDrepId ?? '')
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  // Update drepId when initialDrepId changes
  React.useEffect(() => {
    if (initialDrepId !== undefined && initialDrepId !== null) {
      setDrepId(initialDrepId)
    }
  }, [initialDrepId])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const scheduleHeightChange = (height: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setHeight(height), 150)
  }

  const handleFocus = () => {
    setShowCard(false)
    scheduleHeightChange(HEIGHT_WITHOUT_CARD)
  }

  const handleBlur = () => {
    if (drepId.length === 0) {
      setShowCard(true)
      scheduleHeightChange(HEIGHT_WITH_CARD)
    }
  }

  const handleDrepIdChange = (text: string) => {
    setDrepId(text)
  }

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

  const {error, isFetched, isFetching} = useIsValidDRepID(resolvedDrepId, {
    retry: false,
    enabled: resolvedDrepId.length > 0 && !isResolvingHandle,
  })

  const noDrepForHandle =
    isHandle &&
    !isResolvingHandle &&
    drepInfo === null &&
    !handleResolutionError
  const displayError = noDrepForHandle
    ? 'This ADA handle does not have a DRep associated with it'
    : handleResolutionError?.message || error?.message
  const isLoading = isResolvingHandle || isFetching
  const isSubmitDisabled =
    isNonNullable(error) ||
    drepId.length === 0 ||
    !isFetched ||
    isLoading ||
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
    } catch {
      Alert.alert(strings.global.error, strings.staking.invalidDRepId)
    }
  }

  const handleFindDRepLink = () => Linking.openURL(FIND_DREPS_LINKS[network])

  const handleDelegateToYoroi = () => {
    onSubmit?.({hash: getYoroiDrepIdHex(network), type: 'key', CIP105: false})
    closeModal()
  }

  return (
    <Modal.Content>
      <Space.Height.sm />

      <Description />

      <Space.Height.lg />

      <TextInput
        value={drepId}
        onChangeText={handleDrepIdChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
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

      {showCard && (
        <FindDRepSection
          onLinkPress={handleFindDRepLink}
          onDelegateToYoroi={handleDelegateToYoroi}
        />
      )}

      <Space.Height.sm fill />

      <Button
        title={strings.staking.confirm}
        disabled={isSubmitDisabled}
        onPress={handleSubmit}
      />
    </Modal.Content>
  )
}

const Description = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  return (
    <Text style={[a.text_center, a.body_1_lg_regular, ta.text_gray_medium]}>
      {strings.staking.enterDrepIDInfo}
    </Text>
  )
}

type FindDRepSectionProps = {
  onLinkPress: () => void
  onDelegateToYoroi: () => void
}

const FindDRepSection = ({
  onLinkPress,
  onDelegateToYoroi,
}: FindDRepSectionProps) => {
  const strings = useStrings()
  const {atoms: ta, palette} = useTheme()

  return (
    <>
      <Space.Height.lg />

      <View style={[a.flex_row, a.justify_center, a.flex_wrap]}>
        <Text style={[a.body_1_lg_regular, ta.text_gray_medium, a.text_center]}>
          {strings.staking.dontHaveAnID}{' '}
        </Text>

        <Text
          style={[
            a.body_1_lg_regular,
            {color: palette.primary_500, textDecorationLine: 'underline'},
          ]}
          onPress={onLinkPress}
        >
          {strings.staking.findDRepHere}
        </Text>
      </View>

      <Space.Height.xs />

      <Text style={[a.body_1_lg_regular, ta.text_gray_medium, a.text_center]}>
        {strings.staking.orDelegateToYoroiDrepBelow}
      </Text>

      <Space.Height.lg />

      <YoroiDrepCard
        onDelegate={onDelegateToYoroi}
        truncateId
        variant="plain"
      />
    </>
  )
}
