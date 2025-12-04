import {atoms as a, useTheme} from '@yoroi/theme'
import {Explorers} from '@yoroi/types'

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {StackNavigationProp} from '@react-navigation/stack'
import {BigNumber} from 'bignumber.js'
import * as React from 'react'
import {Linking, ScrollView, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {usePromptRootKey} from '~/features/ReviewTx/common/hooks/usePromptRootKey'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {Accordion} from '~/ui/Accordion/Accordion'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'

import {useRedeemThaw} from '../common/useRedeemThaw'
import type {Thaw} from '../types'
import type {AirdropRoutes} from './types'

const NIGHT_DECIMALS = 6

const formatAmount = (amount: number): string => {
  const normalizationFactor = Math.pow(10, NIGHT_DECIMALS)
  const normalized = new BigNumber(amount).dividedBy(normalizationFactor)
  return normalized.toFormat(2)
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

    return `${days}d : ${hours}h : ${minutes}m : ${seconds}s`
  } catch {
    return ''
  }
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

export const AirdropMainScreen = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const route = useRoute<RouteProp<AirdropRoutes, 'airdrop-main'>>()
  const navigation = useNavigation<StackNavigationProp<AirdropRoutes>>()
  const {allocation} = route.params

  const walletManager = useWalletManager()
  const wallet = walletManager.selected.wallet
  const meta = walletManager.selected.meta ?? null

  const {redeemAsync} = useRedeemThaw()
  const {promptRootKey} = usePromptRootKey()

  const isReadOnly = meta?.isReadOnly ?? false
  const isWalletInitialized = !!wallet

  const [isRedeeming, setIsRedeeming] = React.useState(false)
  const [detailsExpanded, setDetailsExpanded] = React.useState(true)
  const [timeRemaining, setTimeRemaining] = React.useState('')

  const currentThawIndex = getCurrentThawIndex(allocation.schedule.thaws)
  const currentThaw = allocation.schedule.thaws[currentThawIndex]
  const totalThaws = allocation.schedule.thaws.length

  const redeemableThaws = allocation.schedule.thaws.filter(
    (t) => t.status === 'redeemable',
  )
  const canRedeem =
    redeemableThaws.length > 0 && !isReadOnly && isWalletInitialized

  React.useEffect(() => {
    if (!currentThaw) return

    const updateTimer = () => {
      setTimeRemaining(calculateTimeRemaining(currentThaw.thawing_period_start))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [currentThaw])

  const handleRedeem = () => {
    setIsRedeeming(true)
    promptRootKey({
      onSuccess: async (rootKey: string) => {
        try {
          await redeemAsync({destAddress: allocation.address, rootKey})
          setIsRedeeming(false)
        } catch (error) {
          setIsRedeeming(false)
          throw error
        }
      },
      onError: (error) => {
        logger.error('Failed to get root key', {error})
        setIsRedeeming(false)
      },
      onClose: () => {
        setIsRedeeming(false)
      },
      title: strings.airdrop.redeem,
      summary: strings.airdrop.enterPassword,
    })
  }

  const handleOpenThawSchedule = () => {
    navigation.navigate('airdrop-thaw-schedule', {allocation})
  }

  const getExplorerUrl = (explorer: 'cardanoscan' | 'adaex'): string => {
    if (!wallet) return ''
    const explorers = wallet.networkManager.explorers
    if (explorer === 'cardanoscan') {
      const exp = explorers[Explorers.Explorer.Cardanoscan]
      return exp ? exp.address(allocation.address) : ''
    }
    return `https://adaex.org/${allocation.address}`
  }

  const truncateAddress = (address: string): string => {
    if (address.length <= 24) return address
    return `${address.slice(0, 12)}...${address.slice(-8)}`
  }

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[ta.bg_color_max, a.flex_1]}
    >
      <ScrollView contentContainerStyle={[a.p_lg]} style={a.flex_1}>
        {/* Phase Announcement */}
        <View style={[a.flex_row, a.align_start, a.gap_sm]}>
          <Text style={[a.body_1_lg_regular, ta.text_gray_max, a.flex_1]}>
            <Text style={[a.body_1_lg_medium]}>
              🧩 Phase 3. Lost and Found NIGHT
            </Text>{' '}
            of midnight airdrop has started.
          </Text>
        </View>

        <Space.Height.xl />

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
            {formatAmount(allocation.redeemableAmount)}
            <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
              {' '}
              NIGHT
            </Text>
          </Text>

          <Space.Height.md />

          <View style={[a.flex_row, a.align_center, a.gap_sm]}>
            <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
              {strings.airdrop.destinationAddress}
            </Text>
            <Text style={[a.body_2_md_medium, ta.text_gray_max]}>
              {truncateAddress(allocation.address)}
            </Text>
          </View>
        </TouchableOpacity>

        <Space.Height.lg />

        {/* Current Thaw Card */}
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

          <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
            {strings.airdrop.endsIn}: {timeRemaining}
          </Text>

          <Space.Height.lg />

          {/* Progress Indicator */}
          <ThawProgressIndicator
            thaws={allocation.schedule.thaws}
            currentIndex={currentThawIndex}
          />

          <Space.Height.md />

          <Text style={[a.body_3_sm_regular, ta.text_gray_low]}>
            {strings.airdrop.thawInfo}
          </Text>
        </TouchableOpacity>

        <Space.Height.xl />

        {/* More Details Accordion */}
        <Accordion
          label={strings.airdrop.moreDetails}
          expanded={detailsExpanded}
          onChange={setDetailsExpanded}
        >
          <DetailRow
            label={strings.airdrop.allocationSize}
            value={`${formatAmount(allocation.totalAllocation)} NIGHT`}
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

          <Space.Height.md />

          {/* Explorer Links */}
          <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
            {strings.airdrop.detailsOn}
          </Text>
          <Space.Height.sm />
          <View style={[a.flex_row, a.gap_lg]}>
            <TouchableOpacity
              onPress={() => Linking.openURL(getExplorerUrl('cardanoscan'))}
            >
              <Text style={[a.body_2_md_medium, ta.el_primary_medium]}>
                Cardanoscan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL(getExplorerUrl('adaex'))}
            >
              <Text style={[a.body_2_md_medium, ta.el_primary_medium]}>
                Adaex
              </Text>
            </TouchableOpacity>
          </View>
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
  currentIndex: number
}) => {
  const {palette: p} = useTheme()

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
