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
import * as React from 'react'
import {useIntl} from 'react-intl'
import {Pressable, ScrollView, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useNavigateTo} from '~/features/ReviewTx/common/hooks/useNavigateTo'
import {isInsufficientBalanceError} from '~/features/Staking/Governance/common/transactionErrorHandling'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useResultNavigation} from '~/kernel/navigation/hooks/useResultNavigation'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Badge} from '~/ui/Badge/Badge'
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

/**
 * Parse error message to extract and format POSIX timestamps into human-readable dates
 */
const formatErrorMessage = (
  errorMessage: string,
  intl: {
    formatDate: (
      date: Date,
      options?: {
        year?: 'numeric' | '2-digit'
        month?: 'short' | 'long' | 'numeric' | '2-digit'
        day?: 'numeric' | '2-digit'
        hour?: '2-digit'
        minute?: '2-digit'
      },
    ) => string
  },
): string => {
  // Check if error contains POSIX timestamps
  const posixTimeRegex = /getPOSIXTime\s*=\s*(\d+)/g
  const matches = Array.from(errorMessage.matchAll(posixTimeRegex))

  if (matches.length === 0) {
    return errorMessage
  }

  // Extract nextThaw and now timestamps
  let formattedMessage = errorMessage

  // Try to find nextThaw timestamp
  const nextThawMatch = errorMessage.match(
    /nextThaw\s*=\s*POSIXTime\s*\{\s*getPOSIXTime\s*=\s*(\d+)\s*\}/,
  )
  const nowMatch = errorMessage.match(
    /now\s*=\s*POSIXTime\s*\{\s*getPOSIXTime\s*=\s*(\d+)\s*\}/,
  )

  if (nextThawMatch && nowMatch && nextThawMatch[1] && nowMatch[1]) {
    const nextThawTimestamp = parseInt(nextThawMatch[1], 10)
    const nowTimestamp = parseInt(nowMatch[1], 10)

    // Convert POSIX timestamps (milliseconds) to Date objects
    const nextThawDate = new Date(nextThawTimestamp)
    const nowDate = new Date(nowTimestamp)

    // Format dates using intl
    const formattedNextThaw = intl.formatDate(nextThawDate, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    // Create a more user-friendly error message
    if (errorMessage.includes('NoRedeemableThaws')) {
      formattedMessage = `There are no redeemable thaws available. The next thaw will be available on ${formattedNextThaw}.`
    } else {
      // For other errors, replace timestamps with formatted dates
      formattedMessage = errorMessage
        .replace(
          /nextThaw\s*=\s*POSIXTime\s*\{\s*getPOSIXTime\s*=\s*\d+\s*\}/,
          `nextThaw = ${formattedNextThaw}`,
        )
        .replace(
          /now\s*=\s*POSIXTime\s*\{\s*getPOSIXTime\s*=\s*\d+\s*\}/,
          `now = ${intl.formatDate(nowDate, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}`,
        )
    }
  }

  return formattedMessage
}

export const ThawScheduleScreen = () => {
  const strings = useStrings()
  const intl = useIntl()
  const {atoms: ta} = useTheme()
  const route = useRoute<RouteProp<AirdropRoutes, 'airdrop-thaw-schedule'>>()
  const navigation = useNavigation<StackNavigationProp<AirdropRoutes>>()
  const {allocation: allocationFromParams} = route.params

  const walletManager = useWalletManager()
  const meta = walletManager.selected.meta ?? null

  // Get fresh allocation data from query instead of static route params
  const {allocations: freshAllocations, refetch: refetchEligibility} =
    useAirdropEligibility()
  const allocationFromQuery = freshAllocations.find(
    (a) => a.address === allocationFromParams.address,
  )
  const allocation = allocationFromQuery ?? allocationFromParams

  const {buildTransaction, submitTransaction} = useRedeemThaw()
  const {navigateToTxReview} = useWalletNavigation()
  const resultNavigation = useResultNavigation()
  const navigateTo = useNavigateTo()

  const isReadOnly = meta?.isReadOnly ?? false
  const isWalletInitialized = !!walletManager.selected.wallet

  const [isRedeeming, setIsRedeeming] = React.useState(false)

  const thaws = allocation.schedule.thaws
  const totalThaws = thaws.length

  // Calculate thaws that can be redeemed right now
  // Use backend's 'redeemable' status if available, otherwise include thaws that have started
  // but aren't confirmed/submitted/failed yet (in case backend hasn't updated status yet)
  const now = new Date()
  const redeemableThaws = thaws.filter((thaw) => {
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

  const canRedeem =
    redeemableThaws.length > 0 && !isReadOnly && isWalletInitialized

  // Periodically refetch eligibility when there are thaws that should be redeemable
  // but haven't been marked as such yet
  React.useEffect(() => {
    const now = new Date()
    const thawsThatShouldBeRedeemable = thaws.filter((thaw) => {
      const thawDate = new Date(thaw.thawing_period_start.replace(/\s/g, ''))
      return (
        thawDate <= now &&
        thaw.status !== 'redeemable' &&
        thaw.status !== 'confirmed'
      )
    })

    if (thawsThatShouldBeRedeemable.length === 0) {
      return
    }

    // Refetch every 30 seconds if there are thaws that should be redeemable
    const interval = setInterval(() => {
      refetchEligibility().catch((error) => {
        logger.error('Failed to refetch eligibility for thaw schedule', {
          error,
        })
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [thaws, refetchEligibility])

  const handleRedeem = async () => {
    // Allow retry even if canRedeem is false (for failed/completed thaws)
    if (isRedeeming) {
      return
    }

    setIsRedeeming(true)

    try {
      // Build transaction via API to get CBOR
      const cbor = await buildTransaction(allocation.address)

      // Navigate to review transaction screen
      navigateToTxReview({
        cbor,
        preventSubmit: true,
        context: 'airdrop',
        onSuccessWithoutFeedback: async (args) => {
          if (!args?.signedTx) {
            logger.error('handleRedeem: No signed transaction in callback', {
              destAddress: allocation.address,
            })
            setIsRedeeming(false)
            throw new Error('Failed to sign transaction')
          }

          try {
            // Submit signed transaction to redemption API
            await submitTransaction({
              destAddress: allocation.address,
              signedTx: args.signedTx,
            })
            setIsRedeeming(false)
            navigateTo.showSubmittedTxScreen('default')
          } catch (error) {
            logger.error('handleRedeem: Failed to submit transaction', {
              destAddress: allocation.address,
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
            destAddress: allocation.address,
            error: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
          })
          setIsRedeeming(false)
        },
      })
    } catch (error) {
      logger.error('handleRedeem: Failed to redeem', {
        destAddress: allocation.address,
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      })

      // Check if error is due to insufficient funds
      if (isInsufficientBalanceError(error)) {
        logger.info(
          'handleRedeem: Failed to build transaction (insufficient funds)',
          {error},
        )
        resultNavigation.showResultScreen({
          type: 'error',
          context: 'airdrop',
          title: strings.airdrop.insufficientFunds,
          message: strings.airdrop.redeemError,
          primaryAction: {
            title: strings.txReview.failedTxButton,
            onPress: () => {
              setIsRedeeming(false)
              // Navigate back to thaw schedule screen - use reset which works with useBlockGoBack()
              // Use CommonActions.reset to ensure it works correctly
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'airdrop-thaw-schedule',
                      params: {allocation},
                    },
                  ],
                }),
              )
            },
          },
        })
        return
      }

      // Show error message for other build failures (e.g., already redeemed, no redeemable thaws)
      const rawErrorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to build redemption transaction'
      const formattedErrorMessage = formatErrorMessage(rawErrorMessage, intl)

      // Use more specific title for "NoRedeemableThaws" errors
      const errorTitle = rawErrorMessage.includes('NoRedeemableThaws')
        ? strings.airdrop.noRedeemableThaws
        : strings.airdrop.redeemError

      resultNavigation.showResultScreen({
        type: 'error',
        context: 'airdrop',
        title: errorTitle,
        message: formattedErrorMessage,
        primaryAction: {
          title: strings.txReview.failedTxButton,
          onPress: () => {
            setIsRedeeming(false)
            // Navigate back to thaw schedule screen
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: 'airdrop-thaw-schedule',
                    params: {allocation},
                  },
                ],
              }),
            )
          },
        },
      })
    }
  }

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[ta.bg_color_max, a.flex_1]}
    >
      <ScrollView contentContainerStyle={[a.p_lg]} style={a.flex_1}>
        {thaws.map((thaw, index) => (
          <ThawItem
            key={index}
            thaw={thaw}
            index={index}
            totalThaws={totalThaws}
            isLast={index === thaws.length - 1}
            thaws={thaws}
            onRetryFailed={handleRedeem}
            isReadOnly={isReadOnly}
            isWalletInitialized={isWalletInitialized}
            isRedeeming={isRedeeming}
          />
        ))}
      </ScrollView>

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

type ThawItemProps = {
  thaw: Thaw
  index: number
  totalThaws: number
  isLast: boolean
  thaws: ReadonlyArray<Thaw>
  onRetryFailed: () => Promise<void>
  isReadOnly: boolean
  isWalletInitialized: boolean
  isRedeeming: boolean
}

const ThawItem = ({
  thaw,
  index,
  totalThaws,
  isLast,
  thaws,
  onRetryFailed,
  isReadOnly,
  isWalletInitialized,
  isRedeeming,
}: ThawItemProps) => {
  const strings = useStrings()
  const intl = useIntl()
  const {atoms: ta, palette: p} = useTheme()

  const now = new Date()
  const thawDate = new Date(thaw.thawing_period_start.replace(/\s/g, ''))
  const hasStarted = thawDate <= now

  const isCompleted =
    thaw.status === 'confirmed' || thaw.status === 'confirming'
  const isRedeemableBackend = thaw.status === 'redeemable'
  const isPendingRedeemable =
    thaw.status === 'upcoming' || thaw.status === 'queued'
  const isNotRedeemed =
    thaw.status !== 'confirmed' &&
    thaw.status !== 'confirming' &&
    thaw.status !== 'submitted' &&
    thaw.status !== 'failed'

  // Thaw is redeemable if:
  // 1. Backend marked it as 'redeemable', OR
  // 2. Thaw period has started and status suggests it should be redeemable
  const isRedeemable =
    isRedeemableBackend || (hasStarted && isPendingRedeemable && isNotRedeemed)

  const formattedDate = intl.formatDate(thawDate, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const isFailed = thaw.status === 'failed'

  const getStatusBadge = () => {
    if (isCompleted) {
      return {
        label: strings.airdrop.redeemed,
        color: p.secondary_600,
      }
    }
    if (isFailed) {
      return {
        label: strings.airdrop.status.failed,
        color: p.sys_magenta_500,
      }
    }
    if (isRedeemable) {
      return {
        label: strings.airdrop.status.redeemable,
        color: p.bg_gradient_4,
      }
    }
    return {
      label: strings.airdrop.noAvailableYet,
      color: p.gray_600,
    }
  }

  const badge = getStatusBadge()

  // Color the line primary if the current thaw's date has passed
  // The line comes AFTER the current thaw and connects to the next one
  const hasCurrentThawDatePassed = hasStarted

  return (
    <View style={[a.flex_row]}>
      {/* Timeline indicator */}
      <View style={[a.align_center, {width: 32}]}>
        {/* Circle or checkmark */}
        {isCompleted ? (
          <View
            style={[
              a.align_center,
              a.justify_center,
              a.rounded_full,
              {
                width: 28,
                height: 28,
                backgroundColor: '#A0B3F2',
              },
            ]}
          >
            <Icon.Check size={16} color={p.white_static} />
          </View>
        ) : isFailed ? (
          <View
            style={[
              a.align_center,
              a.justify_center,
              a.rounded_full,
              {
                width: 28,
                height: 28,
                backgroundColor: p.sys_magenta_500,
              },
            ]}
          >
            <Icon.Close size={16} color={p.white_static} />
          </View>
        ) : isRedeemable ? (
          <View
            style={[
              a.align_center,
              a.justify_center,
              a.rounded_full,
              {
                width: 28,
                height: 28,
                backgroundColor: p.primary_500,
              },
            ]}
          >
            <Text style={[a.body_2_md_medium, {color: p.white_static}]}>
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
                width: 28,
                height: 28,
                borderWidth: 2,
                borderColor: p.gray_300,
                backgroundColor: p.gray_min,
              },
            ]}
          >
            <Text style={[a.body_2_md_medium, {color: p.gray_400}]}>
              {index + 1}
            </Text>
          </View>
        )}

        {/* Connecting line */}
        {!isLast && (
          <View
            style={{
              width: 2,
              flex: 1,
              backgroundColor: hasCurrentThawDatePassed
                ? p.primary_500
                : p.gray_200,
              marginVertical: 4,
            }}
          />
        )}
      </View>

      <Space.Width.md />

      {/* Content */}
      <View style={[a.flex_1, {paddingBottom: isLast ? 0 : 24}]}>
        <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
          {strings.airdrop.thawNumber
            .replace('{current}', String(index + 1))
            .replace('{total}', String(totalThaws))}
        </Text>

        <Space.Height._2xs />

        <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
          {formattedDate}
        </Text>

        <Space.Height.md />

        <Text style={[a.heading_3_medium, ta.text_gray_max]}>
          {formatAmount(thaw.amount)}
          <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}> NIGHT</Text>
        </Text>

        <Space.Height.sm />

        {/* Status badge and Try again button for failed thaws */}
        <View style={[a.flex_row, a.align_center, a.gap_sm]}>
          <Badge label={badge.label} color={badge.color} />
          {isFailed && !isReadOnly && isWalletInitialized && (
            <Pressable
              onPress={onRetryFailed}
              disabled={isRedeeming}
              style={({pressed}) => [
                {
                  borderRadius: 999,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  backgroundColor: pressed
                    ? p.primary_600
                    : isRedeeming
                      ? p.gray_400
                      : p.primary_500,
                  opacity: isRedeeming ? 0.6 : 1,
                },
              ]}
            >
              <Text style={[a.body_3_sm_regular, {color: p.white_static}]}>
                {strings.airdrop.tryAgain}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  )
}
