import {atoms as a, useTheme} from '@yoroi/theme'
import {useWalletManager} from '@yoroi/wallet-manager'

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {StackNavigationProp} from '@react-navigation/stack'
import {BigNumber} from 'bignumber.js'
import * as React from 'react'
import {ScrollView, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Address} from '~/common/Address/Address'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Accordion} from '~/ui/Accordion/Accordion'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'

import {useAirdropEligibility} from '../common/useAirdropEligibility'
import {useRedeemThaw} from '../common/useRedeemThaw'
import type {Thaw} from '../types'
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
  const route = useRoute<RouteProp<AirdropRoutes, 'airdrop-main'>>()
  const navigation = useNavigation<StackNavigationProp<AirdropRoutes>>()
  const {allocation} = route.params

  const walletManager = useWalletManager()
  const wallet = walletManager.selected.wallet
  const meta = walletManager.selected.meta ?? null

  const {buildTransaction, submitTransaction} = useRedeemThaw()
  const {navigateToTxReview} = useWalletNavigation()

  const isReadOnly = meta?.isReadOnly ?? false
  const isWalletInitialized = !!wallet

  const [isRedeeming, setIsRedeeming] = React.useState(false)
  const [detailsExpanded, setDetailsExpanded] = React.useState(true)
  const [timeRemaining, setTimeRemaining] = React.useState('')
  const [timerLabel, setTimerLabel] = React.useState(strings.airdrop.startsIn)

  // Get fresh allocation data from query instead of static route params
  const {allocations: freshAllocations} = useAirdropEligibility()
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

  const redeemableThaws = currentAllocation.schedule.thaws.filter(
    (t) => t.status === 'redeemable',
  )
  const canRedeem =
    redeemableThaws.length > 0 && !isReadOnly && isWalletInitialized

  React.useEffect(() => {
    if (!currentThaw) {
      setTimeRemaining('')
      return
    }

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
      } else {
        // Thaw hasn't started yet - show countdown
        setTimeRemaining(
          calculateTimeRemaining(currentThaw.thawing_period_start),
        )
        setTimerLabel(strings.airdrop.startsIn)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [currentThaw, strings])

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
            logger.error('handleRedeem: No signed transaction in callback')
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
          } catch (error) {
            logger.error('handleRedeem: Failed to submit transaction', {error})
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
          logger.error('handleRedeem: Transaction signing failed', {error})
          setIsRedeeming(false)
        },
      })
    } catch (error) {
      logger.error('handleRedeem: Failed to build transaction', {error})
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
          style={[
            a.p_lg,
            a.rounded_sm,
            {
              backgroundColor: p.bg_gradient_2[0],
            },
          ]}
        >
          <View style={[a.flex_row, a.justify_between, a.align_center]}>
            <View style={[a.flex_row, a.align_center, a.gap_xs]}>
              <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
                {strings.airdrop.redeemableNow}
              </Text>
              <Icon.InfoCircle size={16} color={p.gray_600} />
            </View>
          </View>

          <Space.Height.md />

          <Text style={[a.heading_1_medium, ta.text_gray_max]}>
            {formatAmount(currentAllocation.redeemableAmount)}
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
            style={[
              a.p_lg,
              a.rounded_sm,
              {
                borderWidth: 1,
                borderColor: p.gray_200,
              },
            ]}
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
            value={`${formatAmount(currentAllocation.totalAllocation)} NIGHT`}
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
}: {
  thaws: ReadonlyArray<Thaw>
  currentIndex: number | null
}) => {
  const {palette: p} = useTheme()

  if (currentIndex === null) {
    return null
  }

  return (
    <View style={[a.flex_row, a.align_center]}>
      {thaws.map((thaw, index) => {
        const isCompleted = thaw.status === 'confirmed'
        const isCurrent = index === currentIndex && thaw.status !== 'confirmed'

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
