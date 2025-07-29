import {useHeaderHeight} from '@react-navigation/elements'
import {useFocusEffect} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {LayoutAnimation, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {useStrings} from '~/features/Transactions/common/useStrings'
import {useGetImportantAlertsModal} from '~/features/Notifications/common/GetImportantAlertsModal'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Space} from '~/ui/Space/Space'
import {useSync} from '~/wallets/hooks'
import infoIcon from '../assets/img/icon/info-light-green.png'
import {useBuyCryptoBanner} from '../Exchange/common/useBuyCryptoBanner'
import {usePoolTransitionModal} from '../legacy/Staking/PoolTransition/usePoolTransitionModal'
import {useGovernanceBanner} from '../Staking/Governance/useCases/useGovernanceBanner'
import {TxList} from '../TxList/TxList'
import {useUtxoConsolidationBanner} from '../UtxoConsolidation/useUtxoConsolidationBanner'
import {UtxoListButton} from '../UtxoList/UtxoListButton'
import {ActionsBanner} from './ActionsBanner'
import {BalanceBanner} from './BalanceBanner'
import {CollapsibleHeader} from './CollapsibleHeader'
import {LockedDeposit} from './LockedDeposit'
import {useOnScroll} from './useOnScroll'
import {WarningBanner} from './WarningBanner'

export const TxHistory = () => {
  useGovernanceBanner()
  useBuyCryptoBanner()
  useUtxoConsolidationBanner()

  const strings = useStrings()
  const {atoms: ta, palette: p, isDark} = useTheme()

  const {track} = useMetrics()
  useGetImportantAlertsModal({enabled: true})

  useFocusEffect(
    React.useCallback(() => {
      track.transactionsPageViewed()
    }, [track]),
  )

  const {wallet, meta} = useSelectedWallet()
  const [showWarning, setShowWarning] = React.useState(
    meta.implementation === 'cardano-bip44',
  )
  const headerHeight = useHeaderHeight()

  const {sync, isLoading: isLoadingWallet} = useSync(wallet)
  const {isLoading: isLoadingPoolTransition} = usePoolTransitionModal()
  const isLoading = isLoadingWallet || isLoadingPoolTransition

  const [expanded, setExpanded] = React.useState(true)
  const onScroll = useOnScroll({
    onScrollUp: () => setExpanded(true),
    onScrollDown: () => setExpanded(false),
  })

  const handleOnRefresh = () => sync()

  return (
    <LinearGradient
      colors={
        isDark
          ? [
              'rgba(19, 57, 54, 1)',
              'rgba(20, 24, 58, 1)',
              'rgba(22, 25, 45, 1)',
            ]
          : p.bg_gradient_1
      } // it fixes a weird bug
      start={{x: isDark ? 0.5 : 0.5, y: isDark ? 0 : 0.5}}
      end={{x: isDark ? 0 : 0, y: isDark ? 0.5 : 0}}
      style={{flex: 1}}
    >
      <Space.Height._2xs height={headerHeight} />

      <CollapsibleHeader expanded={expanded}>
        <BalanceBanner />

        <ActionsBanner disabled={isLoading} />
      </CollapsibleHeader>

      <View
        style={[
          a.flex_1,
          ta.bg_color_max,
          {
            paddingTop: 8,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          },
        ]}
      >
        <UtxoListButton />

        <Space.Height.lg />

        <Text
          style={[a.body_1_lg_medium, {color: p.gray_900, textAlign: 'center'}]}
        >
          {strings.title}
        </Text>

        <Space.Height.xl />

        <LockedDeposit />

        <Space.Height.md />

        {meta.implementation === 'cardano-bip44' && showWarning && (
          <WarningBanner
            title={strings.warningTitle.toUpperCase()}
            icon={infoIcon}
            message={strings.warningMessage}
            showCloseIcon
            onRequestClose={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut,
              )
              setShowWarning(false)
            }}
            style={{position: 'absolute', zIndex: 2, bottom: 0}}
          />
        )}

        <TxList
          onScroll={onScroll}
          refreshing={isLoading}
          onRefresh={handleOnRefresh}
        />
      </View>
    </LinearGradient>
  )
}
