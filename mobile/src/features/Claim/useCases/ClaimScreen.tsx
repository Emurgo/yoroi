/**
 * ClaimScreen
 *
 * Dedicated screen for handling claim actions from deep links.
 * Shows confirmation UI and handles claim token flow.
 */
import {useClaim, useClaimTokens} from '@yoroi/claim'
import {useLinks} from '@yoroi/links'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Scan} from '@yoroi/types'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {Platform, ScrollView, Text, View} from 'react-native'

import {useClaimErrorResolver} from '~/features/Claim/common/useClaimErrorResolver'
import {ClaimActionHandler} from '~/features/Links/components/ClaimActionHandler'
import {useNavigateTo} from '~/features/Links/hooks/useNavigationTo'
import {useInfoModal} from '~/features/Scan/common/modals/InfoModal'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'

function getDomain(url: string) {
  try {
    const domain = new URL(url).hostname
    return domain
  } catch (error) {
    return ''
  }
}

const Item = ({label, value}: {label: string; value: string}) => {
  const {atoms: ta} = useTheme()
  return (
    <View style={[a.self_stretch, a.flex_row, a.justify_between]}>
      <Text
        style={[
          a.font_normal,
          a.pr_sm,
          a.body_1_lg_regular,
          ta.text_gray_medium,
        ]}
      >
        {label}
      </Text>

      <Text
        ellipsizeMode="middle"
        numberOfLines={1}
        style={[
          {maxWidth: 240},
          a.font_normal,
          a.body_1_lg_regular,
          ta.text_gray_max,
        ]}
      >
        {value}
      </Text>
    </View>
  )
}

export const ClaimScreen = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const navigation = useNavigation()
  const walletNavigation = useWalletNavigation()
  const {pendingAction, markActionProcessed} = useLinks()
  const {address, scanActionClaim} = useClaim()
  const {openInfoModal} = useInfoModal()
  const navigateTo = useNavigateTo()
  const claimErrorResolver = useClaimErrorResolver()

  const {claimTokens, isPending: isLoading} = useClaimTokens({
    onSuccess: (claimInfo) => {
      logger.info('ClaimScreen: claim successful', {claimInfo})
      markActionProcessed()
      navigateTo.claimShowSuccess()
    },
    onError: (error) => {
      logger.error('ClaimScreen: claim error', {error})
      const claimErrorDialog = claimErrorResolver(error)
      if (claimErrorDialog) {
        openInfoModal({
          title: claimErrorDialog.title,
          message: claimErrorDialog.message,
        })
        markActionProcessed()
      }
    },
  })

  // Get claim action from pendingAction or scanActionClaim
  const claimAction: Scan.ActionClaim | null =
    pendingAction &&
    pendingAction.source === 'cardano' &&
    pendingAction.action.action === 'claim'
      ? (pendingAction.action as Scan.ActionClaim)
      : scanActionClaim || null

  const domain = claimAction ? getDomain(claimAction.url) : ''

  // Handle continue button
  const handleContinue = React.useCallback(() => {
    if (!claimAction) {
      logger.warn('ClaimScreen: no claim action available')
      return
    }
    logger.info('ClaimScreen: user confirmed, claiming tokens')
    claimTokens(claimAction)
  }, [claimAction, claimTokens])

  // Handle cancel button
  const handleCancel = React.useCallback(() => {
    logger.info('ClaimScreen: user cancelled')
    markActionProcessed()
    walletNavigation.resetToTxHistory()
  }, [markActionProcessed, walletNavigation])

  // Handle back navigation - go back to history
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Allow normal navigation
      if (e.data.action.type !== 'GO_BACK') {
        return
      }
      // For back navigation, go to history instead of wallet selection
      e.preventDefault()
      handleCancel()
    })

    return unsubscribe
  }, [navigation, handleCancel])

  // Log when screen mounts
  React.useEffect(() => {
    logger.info('ClaimScreen: mounted', {
      hasPendingAction: !!pendingAction,
      pendingActionSource: pendingAction?.source,
      pendingActionType:
        pendingAction?.source === 'cardano'
          ? pendingAction.action.action
          : pendingAction?.source === 'yoroi'
            ? pendingAction.action.info.useCase
            : undefined,
      hasClaimAction: !!claimAction,
      address,
    })
  }, [pendingAction, claimAction, address])

  if (!claimAction) {
    return (
      <View
        style={[a.flex_1, ta.bg_color_max, a.justify_center, a.align_center]}
      >
        <ClaimActionHandler />
        <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
          {strings.claim.addressSharingWarning}
        </Text>
      </View>
    )
  }

  return (
    <View style={[a.flex_1, ta.bg_color_max]}>
      <ClaimActionHandler />
      <ScrollView style={[a.flex_1]} contentContainerStyle={[a.px_lg, a.py_lg]}>
        <Text
          style={[
            a.font_normal,
            a.text_center,
            a.body_1_lg_regular,
            ta.text_gray_medium,
            a.pb_xl,
          ]}
        >
          {strings.claim.addressSharingWarning}
        </Text>

        <Text
          style={[
            {fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'})},
            ta.text_gray_max,
            a.pb_lg,
          ]}
        >
          {address}
        </Text>

        <Space.Height.lg />

        <Item label={strings.claim.domain} value={domain} />

        <Space.Height.lg />

        <Item label={strings.claim.code} value={claimAction.code} />
      </ScrollView>

      <View style={[a.px_lg, a.pb_lg, a.pt_md]}>
        <View style={[a.flex_row, a.gap_md]}>
          <Button
            size="S"
            type={ButtonType.Secondary}
            title={strings.global.cancel}
            onPress={handleCancel}
            disabled={isLoading}
            style={[a.flex_1]}
          />

          <Button
            size="S"
            title={strings.claim.continue}
            onPress={handleContinue}
            disabled={isLoading}
            style={[a.flex_1]}
          />
        </View>
      </View>
    </View>
  )
}
