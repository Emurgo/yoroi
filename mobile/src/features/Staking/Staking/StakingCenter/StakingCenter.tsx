import {atoms as a, useTheme} from '@yoroi/theme'

import {useFocusEffect} from '@react-navigation/native'
import {useQueryClient} from '@tanstack/react-query'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {WebView, WebViewMessageEvent} from 'react-native-webview'

import {useStakingTx} from '~/features/Dashboard/ui/shared/StakePoolInfos'
import {useReviewTx} from '~/features/ReviewTx/common/ReviewTxProvider'
import {PoolDetailScreen} from '~/features/Staking/Staking/PoolDetails/PoolDetailScreen'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {showConfirmationDialog, showErrorDialog} from '~/kernel/dialogs'
import {useLanguage} from '~/kernel/i18n/LanguageProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {LoadingOverlay} from '~/ui/LoadingOverlay/LoadingOverlay'
import {Space} from '~/ui/Space/Space'

export const StakingCenter = () => {
  const strings = useStrings()
  const {isDark, atoms: ta} = useTheme()
  const queryClient = useQueryClient()

  const {languageCode} = useLanguage()
  const {wallet, meta} = useSelectedWallet()
  const {walletManager} = useWalletManager()
  const {track} = useMetrics()
  const intl = useIntl()
  const {plate} = walletManager.checksum(wallet.publicKeyHex)
  const {navigateToTxReview} = useWalletNavigation()
  const {unsignedTxChanged} = useReviewTx()

  const [selectedPoolId, setSelectedPoolId] = React.useState<string | null>(
    null,
  )
  const [isContentLoaded, setIsContentLoaded] = React.useState(false)
  const [url, setUrl] = React.useState<null | string>(null)
  const [showLoadingModal, setShowLoadingModal] = React.useState(false)

  useFocusEffect(
    React.useCallback(() => {
      track.stakingCenterPageViewed()
    }, [track]),
  )

  useFocusEffect(
    React.useCallback(() => {
      setUrl(prepareStakingURL(languageCode, plate))
      return () => {
        setUrl(null) // force rerender, so the list's CTAs are reset
        setSelectedPoolId(null) // any pool can be reselected once go back from signing
      }
    }, [languageCode, plate]),
  )

  const onSuccess = React.useCallback(() => {
    queryClient.resetQueries({queryKey: [wallet.id, 'stakingInfo']})
    track.stakingCenterDelegationSubmitted()
  }, [queryClient, wallet.id, track])

  const onError = React.useCallback(() => {
    setSelectedPoolId(null)
    queryClient.resetQueries({queryKey: [wallet.id, 'stakingInfo']})
  }, [queryClient, wallet.id])

  const {stakingTx} = useStakingTx(
    {wallet, poolId: selectedPoolId ?? undefined, meta},
    {queryKey: [wallet.id, 'stakingTx'], enabled: selectedPoolId != null},
  )

  React.useEffect(() => {
    if (!stakingTx) return
    if (selectedPoolId == null) return
    track.stakingCenterDelegationInitiated()
    unsignedTxChanged(stakingTx)
    navigateToTxReview({onSuccess, onError})
  }, [
    stakingTx,
    selectedPoolId,
    track,
    unsignedTxChanged,
    navigateToTxReview,
    onSuccess,
    onError,
  ])

  const handleOnMessage = async (event: WebViewMessageEvent) => {
    const selectedPoolHashes = JSON.parse(decodeURI(event.nativeEvent.data))
    if (!Array.isArray(selectedPoolHashes) || selectedPoolHashes.length < 1) {
      await showErrorDialog(
        // LEGACY
        {
          title: {
            id: 'components.stakingcenter.noPoolDataDialog.title',
            defaultMessage: strings.staking.noPoolDataDialog.title,
          },
          message: {
            id: 'components.stakingcenter.noPoolDataDialog.message',
            defaultMessage: strings.staking.noPoolDataDialog.message,
          },
        },
        intl,
      )
      return
    }
    logger.debug('selected pools from explorer', {selectedPoolHashes})

    // Show confirmation dialog before proceeding
    const confirmed = await showConfirmationDialog(
      {
        title: {
          id: 'components.stakingcenter.confirmDelegation.title',
          defaultMessage: strings.staking.confirmDelegation.title,
        },
        message: {
          id: 'components.stakingcenter.confirmDelegation.message',
          defaultMessage: strings.staking.confirmDelegation.message,
        },
        btnYesLabel: {
          id: 'components.stakingcenter.confirmDelegation.delegateButtonLabel',
          defaultMessage: strings.staking.confirmDelegation.delegateButtonLabel,
        },
        btnNoLabel: {
          id: 'global.cancel',
          defaultMessage: strings.staking.confirmDelegation.cancelButtonLabel,
        },
      },
      intl,
    )
    if (confirmed === 'Yes') {
      setShowLoadingModal(true)
      setSelectedPoolId(selectedPoolHashes[0])
    }
  }

  const shouldDisplayPoolIDInput = !wallet.isMainnet
  const shouldDisplayPoolList = wallet.isMainnet && url != null

  return (
    <SafeAreaView
      edges={['right', 'bottom', 'left']}
      style={[a.flex_1, a.px_lg, ta.bg_color_max]}
    >
      {shouldDisplayPoolIDInput && (
        <PoolDetailScreen onPressDelegate={setSelectedPoolId} />
      )}

      {shouldDisplayPoolList && (
        <View style={a.flex_1}>
          <Space.Height.sm />

          <WebView
            style={{opacity: isContentLoaded ? 1 : 0}}
            originWhitelist={['*']}
            androidLayerType="software"
            source={{uri: url}}
            onMessage={(event) => handleOnMessage(event)}
            onLoadEnd={() => setTimeout(() => setIsContentLoaded(true), 250)}
            {...(isDark && {
              injectedJavaScript: `
              document.documentElement.style.overscrollBehavior = 'none'
              document.body.style.backgroundColor = "#222"
              document.body.style.filter = "invert(0.9) hue-rotate(180deg)"
              document.body.style.caretColor = "#FFFFFF"
              setTimeout(() =>
                [...document.images].forEach(i => i.style = 'filter:invert(1) hue-rotate(180deg)')
              , 1000)
            `,
            })}
          />
        </View>
      )}

      {showLoadingModal && (
        <LoadingOverlay
          isLoading
          content={
            <View
              style={[a.p_lg, ta.bg_color_max, a.rounded_md, a.align_center]}
            >
              <Text style={[a.body_1_lg_regular, ta.text_primary_max, a.pb_sm]}>
                {strings.staking.loading}
              </Text>
              <Text style={[a.body_1_lg_regular, ta.text_primary_max]}>
                {strings.staking.processingDelegation}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

const prepareStakingURL = (locale: string, plate: string): string => {
  // source=mobile is constant and already included
  let finalURL = 'https://adapools.yoroiwallet.com/?source=mobile'

  const lang = locale.slice(0, 2)
  finalURL += `&lang=${lang}`

  finalURL += `&bias=${plate}`

  return finalURL
}
