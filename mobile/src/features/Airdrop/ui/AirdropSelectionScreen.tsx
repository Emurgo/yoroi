import {atoms as a, useTheme} from '@yoroi/theme'

import {useNavigation} from '@react-navigation/native'
import {StackNavigationProp} from '@react-navigation/stack'
import {useQueryClient} from '@tanstack/react-query'
import {BigNumber} from 'bignumber.js'
import * as React from 'react'
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {persistPrefixKeyword} from '~/kernel/connection/ConnectionProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'

import {useAirdropAddressCache} from '../common/airdropAddressCache'
import {scheduleThawNotifications} from '../common/scheduleThawNotifications'
import {useAirdropEligibility} from '../common/useAirdropEligibility'
import type {AddressAllocation} from '../types'
import {useManualAddressModal} from './ManualAddressModal'
import {NotificationsScheduledModal} from './NotificationsScheduledModal'
import type {AirdropRoutes} from './types'

// NIGHT token has 6 decimals
const NIGHT_DECIMALS = 6

const formatAmount = (amount: number): string => {
  const normalizationFactor = Math.pow(10, NIGHT_DECIMALS)
  const normalized = new BigNumber(amount).dividedBy(normalizationFactor)
  return normalized.toFormat(2)
}

export const AirdropSelectionScreen = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const navigation = useNavigation<StackNavigationProp<AirdropRoutes>>()
  const {openModal} = useModal()
  const {navigateToNotificationSettings} = useWalletNavigation()
  const queryClient = useQueryClient()
  const {openManualAddressModal} = useManualAddressModal()

  const {allocations, isLoading, isError, hardRefresh} = useAirdropEligibility()
  const addressCache = useAirdropAddressCache()
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [isSchedulingNotifications, setIsSchedulingNotifications] =
    React.useState(false)

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true)
    try {
      await hardRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }, [hardRefresh])

  const handleSelectAddress = (allocation: AddressAllocation) => {
    navigation.navigate('airdrop-main', {allocation})
  }

  const handleOpenManualAddress = React.useCallback(() => {
    openManualAddressModal()
  }, [openManualAddressModal])

  const handleRemoveExternalAddress = React.useCallback(
    async (address: string) => {
      try {
        // Remove from external addresses cache
        await addressCache.removeExternalAddress(address)

        // Also remove from eligible cache if it exists there
        await addressCache.removeEligibleAddress(address)

        // Invalidate and refetch queries to update the list
        await queryClient.invalidateQueries({
          queryKey: [persistPrefixKeyword, 'airdropEligibility'],
        })
        await queryClient.refetchQueries({
          queryKey: [persistPrefixKeyword, 'airdropEligibility'],
        })
      } catch (error) {
        logger.error('Failed to remove external address', {address, error})
      }
    },
    [addressCache, queryClient],
  )

  const handleScheduleNotifications = React.useCallback(async () => {
    if (isSchedulingNotifications || allocations.length === 0) {
      return
    }

    setIsSchedulingNotifications(true)
    try {
      const result = await scheduleThawNotifications(allocations)
      if (result.scheduled > 0 || result.skipped > 0) {
        openModal({
          content: (
            <NotificationsScheduledModal.Content
              scheduled={result.scheduled}
              skipped={result.skipped}
            />
          ),
          footer: (
            <NotificationsScheduledModal.Footer
              onViewNotifications={() => {
                navigateToNotificationSettings()
              }}
            />
          ),
          title: strings.manageNotifications.scheduledNotifications,
          height: 300,
          canDiscard: true,
        })
      }
    } catch (error) {
      logger.error('Failed to schedule notifications', {error})
    } finally {
      setIsSchedulingNotifications(false)
    }
  }, [
    allocations,
    isSchedulingNotifications,
    openModal,
    strings,
    navigateToNotificationSettings,
  ])

  if (isLoading) {
    return (
      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        style={[ta.bg_color_max, a.flex_1]}
      >
        <View style={[a.flex_1, a.justify_center, a.align_center]}>
          <ActivityIndicator size="large" color={p.el_primary_medium} />
          <Space.Height.lg />
          <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
            {strings.airdrop.loading}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  if (isError || allocations.length === 0) {
    return (
      <SafeAreaView
        edges={['left', 'right']}
        style={[ta.bg_color_max, a.flex_1]}
      >
        <ScrollView
          contentContainerStyle={[a.p_lg, a.flex_1, a.justify_center]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing || isLoading}
              onRefresh={handleRefresh}
              tintColor={p.primary_600}
              colors={[p.primary_600]}
            />
          }
        >
          <View style={[a.align_center, a.flex_1, a.justify_center]}>
            <Icon.Info size={48} color={p.el_gray_min} />
            <Space.Height.xl />
            <Text
              style={[
                a.heading_3_medium,
                ta.text_gray_max,
                {textAlign: 'center'},
              ]}
            >
              {strings.airdrop.noAllocations}
            </Text>
            <Space.Height.md />
            <Text
              style={[
                a.body_1_lg_regular,
                ta.text_gray_medium,
                {textAlign: 'center'},
              ]}
            >
              {strings.airdrop.noAllocationsDescription}
            </Text>
          </View>
        </ScrollView>

        {/* Manual Address Button - fixed at bottom with safe area */}
        <SafeArea.Footer>
          <Button
            onPress={handleOpenManualAddress}
            title={strings.airdrop.manualAddress}
            icon={(props) => <Icon.Plus {...props} />}
          />
        </SafeArea.Footer>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={[ta.bg_color_max, a.flex_1]}>
      <ScrollView
        contentContainerStyle={[a.p_lg, a.gap_md, {paddingBottom: 0}]}
        style={a.flex_1}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || isLoading}
            onRefresh={handleRefresh}
            tintColor={p.primary_600}
            colors={[p.primary_600]}
          />
        }
      >
        {/* Phase Announcement */}
        <View style={[a.flex_row, a.align_start, a.gap_sm]}>
          <Text style={[a.body_1_lg_regular, ta.text_gray_max, a.flex_1]}>
            {strings.airdrop.phaseAnnouncement}
          </Text>
        </View>

        <Space.Height.md />

        {/* Notification Button */}
        <Button
          onPress={handleScheduleNotifications}
          type={ButtonType.Secondary}
          disabled={isSchedulingNotifications || allocations.length === 0}
          title={
            isSchedulingNotifications
              ? strings.airdrop.schedulingNotifications
              : strings.airdrop.scheduleThawNotifications
          }
          icon={(props) => <Icon.Bell {...props} />}
          isLoading={isSchedulingNotifications}
        />

        <Space.Height.lg />

        {allocations.map((allocation, index) => (
          <AddressCard
            key={allocation.address}
            allocation={allocation}
            index={index + 1}
            onPress={() => handleSelectAddress(allocation)}
            onRemove={
              allocation.isExternal
                ? () => handleRemoveExternalAddress(allocation.address)
                : undefined
            }
          />
        ))}
      </ScrollView>

      {/* Manual Address Button - fixed at bottom with safe area */}
      <SafeArea.Footer style={[a.p_lg]}>
        <Button
          onPress={handleOpenManualAddress}
          title={strings.airdrop.manualAddress}
          icon={(props) => <Icon.Plus {...props} />}
        />
      </SafeArea.Footer>
    </SafeAreaView>
  )
}

type AddressCardProps = {
  allocation: AddressAllocation
  index: number
  onPress: () => void
  onRemove?: () => void
}

const AddressCard = ({
  allocation,
  index,
  onPress,
  onRemove,
}: AddressCardProps) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()

  const redeemableAmount = formatAmount(allocation.redeemableAmount)
  const totalToRedeem = formatAmount(allocation.totalLeftToRedeem)
  const hasRedeemable = allocation.redeemableAmount > 0

  const handleRemove = (e: GestureResponderEvent) => {
    e.stopPropagation()
    if (onRemove) {
      onRemove()
    }
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        a.rounded_sm,
        a.overflow_hidden,
        ta.bg_color_max,
        a.border,
        {borderColor: p.gray_200},
      ]}
    >
      {({pressed}) => (
        <View
          style={[
            a.flex_row,
            {
              backgroundColor:
                pressed || hasRedeemable ? p.bg_gradient_1[0] : 'transparent',
            },
          ]}
        >
          <View style={[a.flex_1, a.p_lg]}>
            {/* Header row */}
            <View style={[a.flex_row, a.justify_between, a.align_center]}>
              <View style={[a.flex_row, a.align_center, a.gap_xs]}>
                <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
                  {allocation.isExternal
                    ? strings.airdrop.externalAddress
                    : strings.airdrop.destinationAddressNumber.replace(
                        '{number}',
                        String(index),
                      )}
                </Text>
                {allocation.isExternal && (
                  <Icon.ExternalLink size={16} color={p.gray_600} />
                )}
                {!allocation.isExternal && (
                  <Icon.InfoCircle size={16} color={p.gray_600} />
                )}
              </View>
              <View style={[a.flex_row, a.align_center, a.gap_md]}>
                {onRemove && (
                  <TouchableOpacity
                    onPress={handleRemove}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  >
                    <Icon.Delete size={20} color={p.gray_600} />
                  </TouchableOpacity>
                )}
                <Icon.Chevron direction="right" size={24} color={p.gray_600} />
              </View>
            </View>

            <Space.Height.md />

            {/* Address */}
            <Text
              style={[a.body_2_md_regular, ta.text_gray_max, {lineHeight: 22}]}
              numberOfLines={3}
            >
              {allocation.address}
            </Text>

            <Space.Height.lg />

            {/* Redeemable row */}
            <View style={[a.flex_row, a.justify_between, a.align_center]}>
              <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
                {strings.airdrop.status.redeemable}
              </Text>
              <Text style={[a.body_2_md_medium, ta.text_gray_max]}>
                {redeemableAmount} NIGHT
              </Text>
            </View>

            <Space.Height.sm />

            {/* Total to redeem row */}
            <View style={[a.flex_row, a.justify_between, a.align_center]}>
              <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
                {strings.airdrop.totalLeftToRedeem}
              </Text>
              <Text style={[a.body_2_md_medium, ta.text_gray_max]}>
                {totalToRedeem} NIGHT
              </Text>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  )
}
