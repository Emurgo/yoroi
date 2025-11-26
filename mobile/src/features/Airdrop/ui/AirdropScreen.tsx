import {atoms as a, useTheme} from '@yoroi/theme'
import {Explorers} from '@yoroi/types'

import {BigNumber} from 'bignumber.js'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {usePromptRootKey} from '~/features/ReviewTx/common/hooks/usePromptRootKey'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {Button} from '~/ui/Button/Button'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'

import {useAirdropEligibility} from '../common/useAirdropEligibility'
import {useRedeemThaw} from '../common/useRedeemThaw'
import type {Thaw, ThawStatus} from '../types'

// NIGHT token has 6 decimals
const NIGHT_DECIMALS = 6

// Format NIGHT amount (6 decimals)
const formatAmount = (amount: number): string => {
  const normalizationFactor = Math.pow(10, NIGHT_DECIMALS)
  const normalized = new BigNumber(amount).dividedBy(normalizationFactor)
  return normalized.toFormat(NIGHT_DECIMALS)
}

const getStatusLabel = (
  status: ThawStatus,
  strings: ReturnType<typeof useStrings>,
): string => {
  const statusMap: Record<ThawStatus, string> = {
    upcoming: strings.airdrop.status.upcoming,
    queued: strings.airdrop.status.queued,
    redeemable: strings.airdrop.status.redeemable,
    submitted: strings.airdrop.status.submitted,
    failed: strings.airdrop.status.failed,
    confirming: strings.airdrop.status.confirming,
    confirmed: strings.airdrop.status.confirmed,
    skipped: strings.airdrop.status.skipped,
  }
  return statusMap[status] || status
}

const calculateTimeRemaining = (endDate: string): string => {
  try {
    const end = new Date(endDate.replace(/\s/g, ''))
    const now = new Date()
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return 'Ended'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return `${days}d / ${hours}h / ${minutes}m / ${seconds}s`
  } catch {
    return ''
  }
}

export const AirdropScreen = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const intl = useIntl()
  const walletManager = useWalletManager()
  const wallet = walletManager.selected.wallet
  const meta = walletManager.selected.meta ?? null

  const {allocations, isLoading, isError} = useAirdropEligibility()
  const {redeemAsync} = useRedeemThaw()
  const {promptRootKey} = usePromptRootKey()

  const isReadOnly = meta?.isReadOnly ?? false
  const isWalletInitialized = !!wallet

  const [redeemingAddress, setRedeemingAddress] = React.useState<string | null>(
    null,
  )

  const handleRedeem = (address: string) => {
    setRedeemingAddress(address)
    promptRootKey({
      onSuccess: async (rootKey: string) => {
        try {
          await redeemAsync({destAddress: address, rootKey})
          // Success - the eligibility hook will refetch
          // Modal will be closed automatically after async operation completes
          setRedeemingAddress(null)
        } catch (error) {
          // Re-throw error so usePromptRootKey can handle it
          setRedeemingAddress(null)
          throw error
        }
      },
      onError: (error) => {
        logger.error('Failed to get root key', {error})
        setRedeemingAddress(null)
      },
      onClose: () => {
        setRedeemingAddress(null)
      },
      title: strings.airdrop.redeem,
      summary: strings.airdrop.enterPassword,
    })
  }

  const getCurrentThawIndex = (thaws: ReadonlyArray<Thaw>): number => {
    const now = new Date()
    for (let i = 0; i < thaws.length; i++) {
      const thaw = thaws[i]
      if (!thaw) continue
      const thawDate = new Date(thaw.thawing_period_start.replace(/\s/g, ''))
      if (thawDate <= now && thaw.status !== 'confirmed') {
        return i
      }
    }
    return thaws.length - 1
  }

  const getExplorerUrl = (address: string): string => {
    if (!wallet) return ''
    const explorers = wallet.networkManager.explorers
    // Use Cardanoscan as default, fallback to first available explorer
    const explorer =
      explorers[Explorers.Explorer.Cardanoscan] ?? Object.values(explorers)[0]
    if (!explorer) return ''
    return explorer.address(address)
  }

  if (isLoading) {
    return (
      <SafeAreaView
        edges={['left', 'right']}
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
        >
          <View style={[a.align_center]}>
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
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={[ta.bg_color_max, a.flex_1]}>
      <ScrollView contentContainerStyle={[a.p_lg, a.gap_md]}>
        <Text style={[a.heading_2_medium, ta.text_gray_max]}>
          {strings.airdrop.title}
        </Text>
        <Space.Height.lg />

        {allocations.map((allocation) => {
          const currentThawIndex = getCurrentThawIndex(
            allocation.schedule.thaws,
          )
          const currentThaw = allocation.schedule.thaws[currentThawIndex]
          const redeemableThaws = allocation.schedule.thaws.filter(
            (t) => t.status === 'redeemable',
          )
          const canRedeem =
            redeemableThaws.length > 0 && !isReadOnly && isWalletInitialized
          const isRedeemingThis = redeemingAddress === allocation.address

          return (
            <View
              key={allocation.address}
              style={[
                ta.bg_color_min,
                a.p_md,
                {
                  borderRadius: 12,
                },
              ]}
            >
              {/* Address Header */}
              <View style={[a.flex_row, a.justify_between, a.align_center]}>
                <View style={[a.flex_1]}>
                  <Text style={[a.body_2_md_medium, ta.text_gray_medium]}>
                    {strings.airdrop.address}
                  </Text>
                  <Space.Height.xs />
                  <Copiable text={allocation.address}>
                    <View style={{flex: 1}}>
                      <Text numberOfLines={1} ellipsizeMode="middle">
                        <Text
                          style={[a.body_2_md_regular, ta.text_gray_medium]}
                        >
                          {allocation.address.slice(0, -6)}
                        </Text>
                        <Text
                          style={[a.body_2_md_medium, ta.el_primary_medium]}
                        >
                          {' '}
                          {allocation.address.slice(-6)}
                        </Text>
                      </Text>
                    </View>
                  </Copiable>
                </View>
              </View>

              <Space.Height.lg />

              {/* Current Thaw Status */}
              {currentThaw && (
                <View
                  style={[
                    a.p_md,
                    a.rounded_md,
                    a.border,
                    {borderColor: p.el_gray_min},
                  ]}
                >
                  <View style={[a.flex_row, a.justify_between, a.align_center]}>
                    <View style={[a.flex_row, a.align_center]}>
                      <Text style={[a.body_2_md_medium, ta.text_gray_medium]}>
                        {strings.airdrop.currentThaw}: {currentThawIndex + 1}/
                        {allocation.schedule.thaws.length}
                      </Text>
                      <Space.Width.xs />
                      <Icon.QuestionMark size={16} color={p.el_gray_min} />
                    </View>
                    {currentThaw.status === 'upcoming' && (
                      <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
                        {strings.airdrop.endsIn}:{' '}
                        {calculateTimeRemaining(
                          currentThaw.thawing_period_start,
                        )}
                      </Text>
                    )}
                  </View>
                  <Space.Height.xs />
                  <View style={[a.flex_row, a.align_center]}>
                    <Icon.InfoCircle size={14} color={p.el_gray_min} />
                    <Space.Width.xs />
                    <Text style={[a.body_3_sm_regular, ta.text_gray_low]}>
                      {strings.airdrop.thawInfo}
                    </Text>
                  </View>
                </View>
              )}
              {currentThaw && <Space.Height.sm />}

              {/* Redeemable Amount */}
              {allocation.redeemableAmount > 0 && (
                <View style={[ta.bg_color_max, a.p_md, a.rounded_md]}>
                  <View style={[a.flex_row, a.justify_between, a.align_center]}>
                    <View>
                      <Text style={[a.body_2_md_medium, ta.text_gray_medium]}>
                        {strings.airdrop.redeemableNow}
                      </Text>
                      <Space.Height.xs />
                      <Text style={[a.heading_2_medium, ta.el_primary_medium]}>
                        {formatAmount(allocation.redeemableAmount)} NIGHT
                      </Text>
                    </View>
                  </View>
                  <Space.Height.md />
                  {isReadOnly && (
                    <>
                      <Text
                        style={[
                          a.body_3_sm_regular,
                          ta.text_gray_medium,
                          {textAlign: 'center'},
                        ]}
                      >
                        Readonly wallets cannot sign transactions. Please use a
                        full wallet to redeem tokens.
                      </Text>
                      <Space.Height.xs />
                    </>
                  )}
                  {!isWalletInitialized && (
                    <>
                      <Text
                        style={[
                          a.body_3_sm_regular,
                          ta.text_gray_medium,
                          {textAlign: 'center'},
                        ]}
                      >
                        Wallet is not initialized. Please wait for the wallet to
                        sync.
                      </Text>
                      <Space.Height.xs />
                    </>
                  )}
                  <Button
                    title={
                      isRedeemingThis
                        ? strings.airdrop.redeeming
                        : strings.airdrop.redeem
                    }
                    onPress={() => handleRedeem(allocation.address)}
                    disabled={isRedeemingThis || !canRedeem}
                    style={{width: '100%'}}
                  />
                </View>
              )}
              {allocation.redeemableAmount > 0 && <Space.Height.sm />}

              {/* Details */}
              <View style={[a.pt_md]}>
                <View style={[a.flex_row, a.justify_between, a.align_center]}>
                  <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
                    {strings.airdrop.details}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      const url = getExplorerUrl(allocation.address)
                      if (url) Linking.openURL(url)
                    }}
                    style={[a.flex_row, a.align_center]}
                  >
                    <Text style={[a.body_2_md_medium, ta.el_primary_medium]}>
                      {strings.airdrop.viewTransactions}
                    </Text>
                    <Space.Width.xs />
                    <Icon.ExternalLink size={16} color={p.el_primary_medium} />
                  </TouchableOpacity>
                </View>

                <DetailRow
                  label={strings.airdrop.destinationAddress}
                  value={allocation.address}
                  isAddress={true}
                />
                <DetailRow
                  label={strings.airdrop.numberOfClaimedAllocations}
                  value={allocation.schedule.number_of_claimed_allocations.toString()}
                />
                <DetailRow
                  label={strings.airdrop.redeemedSoFar}
                  value={`${formatAmount(allocation.redeemedSoFar)} NIGHT`}
                />
                <DetailRow
                  label={strings.airdrop.totalLeftToRedeem}
                  value={`${formatAmount(allocation.totalLeftToRedeem)} NIGHT`}
                />
                <DetailRow
                  label={strings.airdrop.totalAllocation}
                  value={`${formatAmount(allocation.totalAllocation)} NIGHT`}
                />

                {/* Thaw Schedule */}
                <Space.Height.md />
                <Text style={[a.body_2_md_medium, ta.text_gray_medium]}>
                  Thaw Schedule:
                </Text>
                <Space.Height.xs />
                {allocation.schedule.thaws.map((thaw, thawIndex) => (
                  <React.Fragment key={thawIndex}>
                    <View
                      style={[
                        a.py_xs,
                        a.px_sm,
                        {
                          backgroundColor:
                            thaw.status === 'redeemable'
                              ? p.el_primary_min
                              : thaw.status === 'confirmed'
                                ? p.el_gray_min
                                : 'transparent',
                          borderRadius: 6,
                        },
                      ]}
                    >
                      <View style={[a.flex_row, a.justify_between]}>
                        <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
                          Thaw {thawIndex + 1}: {formatAmount(thaw.amount)}{' '}
                          NIGHT
                        </Text>
                        <Text
                          style={[
                            a.body_2_md_medium,
                            {
                              color:
                                thaw.status === 'redeemable'
                                  ? p.el_primary_medium
                                  : thaw.status === 'confirmed'
                                    ? p.el_gray_medium
                                    : p.el_gray_min,
                            },
                          ]}
                        >
                          {getStatusLabel(thaw.status, strings)}
                        </Text>
                      </View>
                      <Text style={[a.body_3_sm_regular, ta.text_gray_low]}>
                        {intl.formatDate(
                          new Date(
                            thaw.thawing_period_start.replace(/\s/g, ''),
                          ),
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </Text>
                    </View>
                    <Space.Height.xs />
                  </React.Fragment>
                ))}
              </View>
            </View>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  )
}

const DetailRow = ({
  label,
  value,
  isAddress = false,
}: {
  label: string
  value: string
  isAddress?: boolean
}) => {
  const {palette: p, atoms: ta} = useTheme()
  return (
    <View
      style={[
        a.flex_row,
        a.justify_between,
        {
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: p.el_gray_min,
        },
      ]}
    >
      <Text style={[a.body_2_md_regular, ta.text_gray_medium, {flex: 1}]}>
        {label}:
      </Text>
      {isAddress ? (
        <View style={{flex: 1}}>
          <Text
            numberOfLines={1}
            ellipsizeMode="middle"
            style={{textAlign: 'right'}}
          >
            <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
              {value.slice(0, -6)}
            </Text>
            <Text style={[a.body_2_md_medium, ta.el_primary_medium]}>
              {' '}
              {value.slice(-6)}
            </Text>
          </Text>
        </View>
      ) : (
        <Text
          style={[
            a.body_2_md_medium,
            ta.text_gray_max,
            {flex: 1, textAlign: 'right'},
          ]}
        >
          {value}
        </Text>
      )}
    </View>
  )
}
