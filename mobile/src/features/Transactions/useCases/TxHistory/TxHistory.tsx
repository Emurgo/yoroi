import {atoms as a, useTheme} from '@yoroi/theme'
import {useSelectedWallet, useSync} from '@yoroi/wallet-manager'

import {useNavigation} from '@react-navigation/native'
import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {BackHandler, Platform, Text, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {useAirdropBanner} from '~/features/Airdrop/common/useAirdropBanner'
import {useBuyCryptoBanner} from '~/features/Exchange/common/useBuyCryptoBanner'
import {useRequestSystemNotifications} from '~/features/Notifications/common/tools'
import {useEarnRewardsBanner} from '~/features/Staking/Governance/useCases/EarnRewardsBanner/useEarnRewardsBanner'
import {useGovernanceBanner} from '~/features/Staking/Governance/useCases/useGovernanceBanner'
import {usePoolTransitionModal} from '~/features/Staking/Staking/PoolTransition/usePoolTransitionModal'
import {useStakingUpdateModal} from '~/features/Staking/Staking/StakingUpdateModal/useStakingUpdateModal'
import {useIsByronWallet} from '~/features/WalletManager/hooks/useIsByronWallet'
import {features} from '~/kernel/features'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {InfoBanner} from '~/ui/InfoBanner/InfoBanner'
import {Space} from '~/ui/Space/Space'

import {TxFilter} from '../TxList/TxFilterProvider'
import {TxList} from '../TxList/TxList'
import {useUtxoConsolidationBanner} from '../UtxoConsolidation/UtxoConsolidation/useUtxoConsolidationBanner'
import {ActionsBanner} from './ActionsBanner'
import {BalanceBanner} from './BalanceBanner'
import {useCardanoCardAnnouncementModal} from './CardanoCardAnnouncementModal/useCardanoCardAnnouncementModal'
import {CollapsibleHeader} from './CollapsibleHeader'
import {LockedDeposit} from './LockedDeposit'
import {useOnScroll} from './useOnScroll'
import {useTxFilterModal} from './useTxFilterModal'

export const TxHistory = () => {
  useGovernanceBanner()
  useBuyCryptoBanner()
  useUtxoConsolidationBanner()
  const {banner: earnRewardsBanner} = useEarnRewardsBanner()
  useAirdropBanner()

  const strings = useStrings()
  const {atoms: ta, palette: p, isDark} = useTheme()
  const navigation = useNavigation()
  const walletNavigation = useWalletNavigation()
  const insets = useSafeAreaInsets()

  const headerSpacing = React.useMemo(() => {
    const headerHeight = Platform.OS === 'ios' ? 44 : 56
    return insets.top + headerHeight + 8
  }, [insets.top])

  useRequestSystemNotifications({enabled: features.pushNotifications})

  const {wallet} = useSelectedWallet()
  const isByronWallet = useIsByronWallet()

  const {sync, isPending: isLoadingWallet} = useSync(wallet)
  const {isLoading: isLoadingPoolTransition} = usePoolTransitionModal()
  const {isLoading: isLoadingStakingUpdate} = useStakingUpdateModal()
  const {isLoading: isLoadingCardanoCardAnnouncement} =
    useCardanoCardAnnouncementModal()
  const isLoading =
    isLoadingWallet ||
    isLoadingPoolTransition ||
    isLoadingStakingUpdate ||
    isLoadingCardanoCardAnnouncement

  const [expanded, setExpanded] = React.useState(true)
  const onScroll = useOnScroll({
    onScrollUp: () => setExpanded(true),
    onScrollDown: () => setExpanded(false),
  })

  const handleOnRefresh = () => sync()

  const {filters, openFilterModal} = useTxFilterModal()

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (!navigation.canGoBack()) {
            walletNavigation.resetToWalletSelection()
            return true
          }
          return false
        },
      )

      return () => backHandler.remove()
    }
    return undefined
  }, [navigation, walletNavigation])

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (e.data.action.type === 'GO_BACK') {
        e.preventDefault()

        walletNavigation.resetToWalletSelection()
      }
    })

    return unsubscribe
  }, [navigation, walletNavigation])

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
      }
      start={{x: isDark ? 0.5 : 0.5, y: isDark ? 0 : 0.5}}
      end={{x: isDark ? 0 : 0, y: isDark ? 0.5 : 0}}
      style={{flex: 1}}
    >
      <View style={{height: headerSpacing}} />

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
        <Space.Height.lg />

        <View
          style={[a.flex_row, a.align_center, a.px_lg, {position: 'relative'}]}
        >
          <Text
            style={[
              a.body_1_lg_medium,
              {color: p.gray_900, textAlign: 'center', flex: 1},
            ]}
          >
            {strings.transactions.title}
          </Text>
          <View style={[a.absolute, {right: 16}]}>
            <Button
              type={ButtonType.SecondaryText}
              fgColorsOverride={{
                idle: p.primary_500,
                pressed: p.primary_600,
                disabled: p.primary_200,
              }}
              icon={Icon.Magnify}
              onPress={openFilterModal}
              testID="txFilterButton"
            />
          </View>
        </View>

        <Space.Height.xl />

        {isByronWallet && (
          <View style={[a.px_lg, a.pb_md]}>
            <InfoBanner
              title={strings.transactions.byronWalletNoticeTitle}
              content={strings.transactions.byronWalletNoticeMessage}
              iconSize={20}
            />
          </View>
        )}

        <LockedDeposit />

        <Space.Height.md />

        <TxFilter
          selectedOperations={filters.selectedOperations}
          metadataMemoSearch={filters.metadataMemoSearch}
          minAdaMoved={filters.minAdaMoved}
          maxAdaMoved={filters.maxAdaMoved}
        >
          <TxList
            onScroll={onScroll}
            refreshing={isLoading}
            onRefresh={handleOnRefresh}
            listHeaderComponent={earnRewardsBanner}
          />
        </TxFilter>
      </View>
    </LinearGradient>
  )
}
