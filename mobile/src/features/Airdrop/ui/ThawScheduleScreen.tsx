import {atoms as a, useTheme} from '@yoroi/theme'

import {RouteProp, useRoute} from '@react-navigation/native'
import {BigNumber} from 'bignumber.js'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {ScrollView, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {usePromptRootKey} from '~/features/ReviewTx/common/hooks/usePromptRootKey'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {Badge} from '~/ui/Badge/Badge'
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

export const ThawScheduleScreen = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const route = useRoute<RouteProp<AirdropRoutes, 'airdrop-thaw-schedule'>>()
  const {allocation} = route.params

  const walletManager = useWalletManager()
  const meta = walletManager.selected.meta ?? null

  const {redeemAsync} = useRedeemThaw()
  const {promptRootKey} = usePromptRootKey()

  const isReadOnly = meta?.isReadOnly ?? false
  const isWalletInitialized = !!walletManager.selected.wallet

  const [isRedeeming, setIsRedeeming] = React.useState(false)

  const thaws = allocation.schedule.thaws
  const totalThaws = thaws.length

  const redeemableThaws = thaws.filter((t) => t.status === 'redeemable')
  const canRedeem =
    redeemableThaws.length > 0 && !isReadOnly && isWalletInitialized

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

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[ta.bg_color_max, a.flex_1]}
    >
      <ScrollView contentContainerStyle={[a.p_lg]} style={a.flex_1}>
        <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
          {strings.airdrop.thawScheduleDescription}
        </Text>

        <Space.Height.xl />

        {thaws.map((thaw, index) => (
          <ThawItem
            key={index}
            thaw={thaw}
            index={index}
            totalThaws={totalThaws}
            isLast={index === thaws.length - 1}
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
}

const ThawItem = ({thaw, index, totalThaws, isLast}: ThawItemProps) => {
  const strings = useStrings()
  const intl = useIntl()
  const {atoms: ta, palette: p} = useTheme()

  const isCompleted = thaw.status === 'confirmed'
  const isRedeemable = thaw.status === 'redeemable'

  const formattedDate = intl.formatDate(
    new Date(thaw.thawing_period_start.replace(/\s/g, '')),
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  )

  const getStatusBadge = () => {
    if (isCompleted) {
      return {
        label: strings.airdrop.redeemed,
        color: p.secondary_600,
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
              backgroundColor: isCompleted ? p.primary_300 : p.gray_200,
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

        {/* Status badge */}
        <Badge label={badge.label} color={badge.color} />
      </View>
    </View>
  )
}
