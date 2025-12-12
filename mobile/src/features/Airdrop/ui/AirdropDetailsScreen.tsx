import {atoms as a, useTheme} from '@yoroi/theme'
import {useWalletManager} from '@yoroi/wallet-manager'

import {
  CommonActions,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import {StackNavigationProp} from '@react-navigation/stack'
import {BigNumber} from 'bignumber.js'
import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Address} from '~/common/Address/Address'
import {useNavigateTo} from '~/features/ReviewTx/common/hooks/useNavigateTo'
import {isInsufficientBalanceError} from '~/features/Staking/Governance/common/transactionErrorHandling'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useResultNavigation} from '~/kernel/navigation/hooks/useResultNavigation'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Accordion} from '~/ui/Accordion/Accordion'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'

import {useAirdropEligibility} from '../common/useAirdropEligibility'
import {useRedeemThaw} from '../common/useRedeemThaw'
import type {Thaw} from '../types'
import {useRedeemableNowInfoModal} from './InfoModals'
import type {AirdropRoutes} from './types'

const NIGHT_DECIMALS = 6

const formatAmount = (amount: number): string => {
  const normalizationFactor = Math.pow(10, NIGHT_DECIMALS)
  const normalized = new BigNumber(amount).dividedBy(normalizationFactor)
  return normalized.toFormat(2)
}

const calculateTimeRemaining = (startDate: string): string => {
  try {
    const start = new Date(startDate.replace(/\s/g, ''))
    const now = new Date()
    const diff = start.getTime() - now.getTime()

    if (diff <= 0) return 'Started'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return `${days}d / ${hours}h / ${minutes}m / ${seconds}s`
  } catch {
    return ''
  }
}

const getCurrentThawIndex = (thaws: ReadonlyArray<Thaw>): number | null => {
  if (thaws.length === 0) {
    return null
  }

  const now = new Date()

  // First, try to find an active/redeemable thaw (started but not confirmed)
  for (let i = 0; i < thaws.length; i++) {
    const thaw = thaws[i]
    if (!thaw) continue
    const thawDate = new Date(thaw.thawing_period_start.replace(/\s/g, ''))
    // Active thaw: started and not confirmed
    if (thawDate <= now && thaw.status !== 'confirmed') {
      return i
    }
  }

  // If no active thaw, find the first upcoming thaw (next one to start)
  for (let i = 0; i < thaws.length; i++) {
    const thaw = thaws[i]
    if (!thaw) continue
    const thawDate = new Date(thaw.thawing_period_start.replace(/\s/g, ''))
    if (thawDate > now && thaw.status === 'upcoming') {
      return i
    }
  }

  // If all thaws are confirmed, return the last one
  // This shouldn't normally happen, but handle it gracefully
  return thaws.length - 1
}

export const AirdropDetailsScreen = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const {openRedeemableNowInfoModal} = useRedeemableNowInfoModal()
  const route = useRoute<RouteProp<AirdropRoutes, 'airdrop-main'>>()
  const navigation = useNavigation<StackNavigationProp<AirdropRoutes>>()
  const {allocation} = route.params

  const walletManager = useWalletManager()
  const wallet = walletManager.selected.wallet
  const meta = walletManager.selected.meta ?? null

  const {buildTransaction, submitTransaction} = useRedeemThaw()
  const {navigateToTxReview} = useWalletNavigation()
  const resultNavigation = useResultNavigation()
  const navigateTo = useNavigateTo()

  const isReadOnly = meta?.isReadOnly ?? false
  const isWalletInitialized = !!wallet

  const [isRedeeming, setIsRedeeming] = React.useState(false)
  const [detailsExpanded, setDetailsExpanded] = React.useState(true)
  const [timeRemaining, setTimeRemaining] = React.useState('')
  const [timerLabel, setTimerLabel] = React.useState(strings.airdrop.startsIn)

  // Get fresh allocation data from query instead of static route params
  const {allocations: freshAllocations, refetch: refetchEligibility} =
    useAirdropEligibility()
  const allocationFromQuery = freshAllocations.find(
    (a) => a.address === allocation.address,
  )
  const currentAllocation = allocationFromQuery ?? allocation

  const currentThawIndex = getCurrentThawIndex(currentAllocation.schedule.thaws)
  const currentThaw =
    currentThawIndex !== null
      ? currentAllocation.schedule.thaws[currentThawIndex]
      : null
  const totalThaws = currentAllocation.schedule.thaws.length

  // Calculate thaws that can be redeemed right now
  // Use backend's 'redeemable' status if available, otherwise include thaws that have started
  // but aren't confirmed/submitted/failed yet (in case backend hasn't updated status yet)
  const now = new Date()
  const redeemableThaws = currentAllocation.schedule.thaws.filter((thaw) => {
    const thawDate = new Date(thaw.thawing_period_start.replace(/\s/g, ''))
    const hasStarted = thawDate <= now
    const isRedeemable = thaw.status === 'redeemable'
    const isPendingRedeemable =
      thaw.status === 'upcoming' || thaw.status === 'queued'
    const isNotRedeemed =
      thaw.status !== 'confirmed' &&
      thaw.status !== 'confirming' &&
      thaw.status !== 'submitted' &&
      thaw.status !== 'failed'

    return isRedeemable || (hasStarted && isPendingRedeemable && isNotRedeemed)
  })

  // Calculate amount that can be redeemed right now
  const currentlyRedeemableAmount = redeemableThaws.reduce(
    (sum, thaw) => sum + thaw.amount,
    0,
  )

  const canRedeem =
    redeemableThaws.length > 0 && !isReadOnly && isWalletInitialized

  React.useEffect(() => {
    if (!currentThaw) {
      setTimeRemaining('')
      return
    }

    let lastRefetchTime = 0
    const REFETCH_INTERVAL_MS = 30000 // Refetch every 30 seconds when thaw has started

    const updateTimer = () => {
      const startDate = new Date(
        currentThaw.thawing_period_start.replace(/\s/g, ''),
      )
      const now = new Date()
      const diff = startDate.getTime() - now.getTime()

      if (diff <= 0) {
        // Thaw has started - show status instead
        if (currentThaw.status === 'redeemable') {
          setTimeRemaining(strings.airdrop.status.redeemable)
          setTimerLabel(strings.airdrop.active)
        } else if (currentThaw.status === 'confirmed') {
          setTimeRemaining(strings.airdrop.redeemed)
          setTimerLabel('')
        } else {
          setTimeRemaining(strings.airdrop.active)
          setTimerLabel('')
        }

        // Periodically refetch eligibility when thaw period has started
        // to get updated status (in case backend hasn't marked it as redeemable yet)
        const timeSinceLastRefetch = now.getTime() - lastRefetchTime
        if (
          currentThaw.status !== 'redeemable' &&
          currentThaw.status !== 'confirmed' &&
          timeSinceLastRefetch >= REFETCH_INTERVAL_MS
        ) {
          lastRefetchTime = now.getTime()
          refetchEligibility().catch((error) => {
            logger.error('Failed to refetch eligibility when thaw started', {
              error,
            })
          })
        }
      } else {
        // Thaw hasn't started yet - show countdown
        setTimeRemaining(
          calculateTimeRemaining(currentThaw.thawing_period_start),
        )
        setTimerLabel(strings.airdrop.startsIn)
        // Reset refetch time if thaw hasn't started yet
        lastRefetchTime = 0
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [currentThaw, strings, refetchEligibility])

  const handleRedeem = async () => {
    if (!canRedeem || isRedeeming) {
      return
    }

    setIsRedeeming(true)

    try {
      // Build transaction via API to get CBOR
      const cbor = await buildTransaction(currentAllocation.address)

      // Navigate to review transaction screen
      navigateToTxReview({
        cbor,
        preventSubmit: true,
        context: 'airdrop',
        onSuccessWithoutFeedback: async (args) => {
          if (!args?.signedTx) {
            logger.error('handleRedeem: No signed transaction in callback', {
              destAddress: currentAllocation.address,
            })
            setIsRedeeming(false)
            throw new Error('Failed to sign transaction')
          }

          try {
            // Submit signed transaction to redemption API
            await submitTransaction({
              destAddress: currentAllocation.address,
              signedTx: args.signedTx,
            })
            setIsRedeeming(false)
            navigateTo.showSubmittedTxScreen('default')
          } catch (error) {
            logger.error('handleRedeem: Failed to submit transaction', {
              destAddress: currentAllocation.address,
              txId: args.txId,
              error: error instanceof Error ? error.message : String(error),
            })
            setIsRedeeming(false)
            throw error
          }
        },
        onCancel: () => {
          setIsRedeeming(false)
        },
        onClose: () => {
          setIsRedeeming(false)
        },
        onErrorWithoutFeedback: (error) => {
          logger.error('handleRedeem: Transaction signing failed', {
            destAddress: currentAllocation.address,
            error: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
          })
          setIsRedeeming(false)
        },
      })
    } catch (error) {
      // Check if error is due to insufficient funds
      if (isInsufficientBalanceError(error)) {
        logger.info(
          'handleRedeem: Failed to build transaction (insufficient funds)',
          {error},
        )
        resultNavigation.showResultScreen({
          type: 'error',
          context: 'default',
          title: strings.airdrop.insufficientFunds,
          message: strings.airdrop.redeemError,
          primaryAction: {
            title: strings.txReview.failedTxButton,
            onPress: () => {
              setIsRedeeming(false)
              // Navigate back to airdrop screen - use reset which works with useBlockGoBack()
              // The navigation object from AirdropDetailsScreen is the AirdropNavigator navigation
              // We need to reset to remove result-screen from the stack
              // Use CommonActions.reset to ensure it works correctly
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'airdrop-main',
                      params: {allocation: currentAllocation},
                    },
                  ],
                }),
              )
            },
          },
        })
        return
      }

      setIsRedeeming(false)
    }
  }

  const handleOpenThawSchedule = () => {
    navigation.navigate('airdrop-thaw-schedule', {
      allocation: currentAllocation,
    })
  }

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[ta.bg_color_max, a.flex_1]}
    >
      <ScrollView contentContainerStyle={[a.p_lg]} style={a.flex_1}>
        {/* Redeemable Now Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[a.p_lg, a.rounded_sm, a.overflow_hidden]}
        >
          {currentlyRedeemableAmount > 0 ? (
            <LinearGradient
              colors={p.bg_gradient_1}
              start={{x: 1, y: 1}}
              end={{x: 0, y: 0}}
              style={[StyleSheet.absoluteFill]}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                a.border,
                a.rounded_sm,
                {borderColor: p.gray_100},
              ]}
            />
          )}
          <View style={[a.flex_row, a.justify_between, a.align_center]}>
            <View style={[a.flex_row, a.align_center, a.gap_xs]}>
              <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
                {strings.airdrop.redeemableNow}
              </Text>
              <TouchableOpacity
                onPress={openRedeemableNowInfoModal}
                hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}
              >
                <Icon.InfoCircle size={16} color={p.gray_600} />
              </TouchableOpacity>
            </View>
          </View>

          <Space.Height.md />

          <Text style={[a.heading_1_medium, ta.text_gray_max]}>
            {formatAmount(currentlyRedeemableAmount)}
            <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
              {' '}
              NIGHT
            </Text>
          </Text>

          <Space.Height.md />

          <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
            {strings.airdrop.destinationAddress}
          </Text>
          <Address
            address={currentAllocation.address}
            style={a.flex_1}
            textStyle={[a.body_2_md_regular, ta.text_gray_medium]}
          />
        </TouchableOpacity>

        <Space.Height.lg />

        {/* Current Thaw Card */}
        {currentThawIndex !== null && currentThaw && totalThaws > 0 && (
          <TouchableOpacity
            onPress={handleOpenThawSchedule}
            activeOpacity={0.8}
            style={[a.p_lg, a.rounded_sm, a.border, {borderColor: p.gray_200}]}
          >
            <View style={[a.flex_row, a.justify_between, a.align_center]}>
              <View style={[a.flex_row, a.align_center, a.gap_xs]}>
                <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
                  {strings.airdrop.currentThaw}: {currentThawIndex + 1}/
                  {totalThaws}
                </Text>
                <Icon.InfoCircle size={16} color={p.gray_600} />
              </View>
              <Icon.Chevron direction="right" size={24} color={p.gray_600} />
            </View>

            <Space.Height.xs />

            {timerLabel && timeRemaining && (
              <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
                {timerLabel}: {timeRemaining}
              </Text>
            )}

            <Space.Height.lg />

            {/* Progress Indicator */}
            <ThawProgressIndicator
              thaws={currentAllocation.schedule.thaws}
              currentIndex={currentThawIndex}
              redeemableThaws={redeemableThaws}
            />

            <Space.Height.md />

            <Text style={[a.body_3_sm_regular, ta.text_gray_low]}>
              {strings.airdrop.thawInfo}
            </Text>
          </TouchableOpacity>
        )}

        <Space.Height.xl />

        {/* More Details Accordion */}
        <Accordion
          label={strings.airdrop.moreDetails}
          expanded={detailsExpanded}
          onChange={setDetailsExpanded}
        >
          <DetailRow
            label={strings.airdrop.allocationSize}
            value={`${formatAmount(
              currentAllocation.schedule.numberOfClaimedAllocations > 0
                ? currentAllocation.totalAllocation /
                    currentAllocation.schedule.numberOfClaimedAllocations
                : currentAllocation.schedule.thaws.length > 0
                  ? currentAllocation.totalAllocation /
                    currentAllocation.schedule.thaws.length
                  : currentAllocation.totalAllocation,
            )} NIGHT`}
          />
          <DetailRow
            label={strings.airdrop.numberOfClaimedAllocations}
            value={currentAllocation.schedule.numberOfClaimedAllocations.toString()}
          />
          <DetailRow
            label={strings.airdrop.redeemedSoFar}
            value={`${formatAmount(currentAllocation.redeemedSoFar)} NIGHT`}
          />
          <DetailRow
            label={strings.airdrop.totalLeftToRedeem}
            value={`${formatAmount(currentAllocation.totalLeftToRedeem)} NIGHT`}
          />
          <DetailRow
            label={strings.airdrop.totalAllocation}
            value={`${formatAmount(currentAllocation.totalAllocation)} NIGHT`}
          />
        </Accordion>
      </ScrollView>

      {/* Bottom Button */}
      <View style={[a.p_lg, {paddingBottom: 24}]}>
        <Button
          title={
            isRedeeming ? strings.airdrop.redeeming : strings.airdrop.redeem
          }
          onPress={handleRedeem}
          disabled={isRedeeming || !canRedeem}
          size="M"
        />
      </View>
    </SafeAreaView>
  )
}

const ThawProgressIndicator = ({
  thaws,
  currentIndex,
  redeemableThaws,
}: {
  thaws: ReadonlyArray<Thaw>
  currentIndex: number | null
  redeemableThaws: ReadonlyArray<Thaw>
}) => {
  const {palette: p} = useTheme()

  if (currentIndex === null) {
    return null
  }

  // Check if a thaw is redeemable by checking if it's in the redeemableThaws array
  const isThawRedeemable = (thaw: Thaw) => {
    return redeemableThaws.some(
      (rt) =>
        rt.thawing_period_start === thaw.thawing_period_start &&
        rt.amount === thaw.amount,
    )
  }

  return (
    <View style={[a.flex_row, a.align_center]}>
      {thaws.map((thaw, index) => {
        const isCompleted = thaw.status === 'confirmed'
        // Only highlight as current if it's actually redeemable (not just started)
        const isRedeemable = isThawRedeemable(thaw)
        const isCurrent =
          index === currentIndex && thaw.status !== 'confirmed' && isRedeemable

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor:
                    isCompleted || isCurrent ? p.primary_500 : p.gray_300,
                }}
              />
            )}

            {isCompleted ? (
              <View
                style={[
                  a.align_center,
                  a.justify_center,
                  a.rounded_full,
                  {
                    width: 24,
                    height: 24,
                    backgroundColor: p.primary_300,
                  },
                ]}
              >
                <Icon.Check size={14} color={p.white_static} />
              </View>
            ) : isCurrent ? (
              <View
                style={[
                  a.align_center,
                  a.justify_center,
                  a.rounded_full,
                  {
                    width: 24,
                    height: 24,
                    backgroundColor: p.primary_500,
                  },
                ]}
              >
                <Text style={[a.body_3_sm_medium, {color: p.white_static}]}>
                  {index + 1}
                </Text>
              </View>
            ) : (
              <View
                style={[
                  a.align_center,
                  a.justify_center,
                  a.rounded_full,
                  {
                    width: 24,
                    height: 24,
                    borderWidth: 2,
                    borderColor: p.gray_300,
                  },
                ]}
              >
                <Text style={[a.body_3_sm_medium, {color: p.gray_400}]}>
                  {index + 1}
                </Text>
              </View>
            )}
          </React.Fragment>
        )
      })}
    </View>
  )
}

const DetailRow = ({label, value}: {label: string; value: string}) => {
  const {palette: p, atoms: ta} = useTheme()

  return (
    <View
      style={[
        a.flex_row,
        a.justify_between,
        a.align_center,
        {
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: p.gray_200,
        },
      ]}
    >
      <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>{label}</Text>
      <Text style={[a.body_2_md_medium, ta.text_gray_max]}>{value}</Text>
    </View>
  )
}
