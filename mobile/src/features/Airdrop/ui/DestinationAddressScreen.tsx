import {atoms as a, useTheme} from '@yoroi/theme'

import {BigNumber} from 'bignumber.js'
import * as React from 'react'
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'

import {useAirdropEligibility} from '../common/useAirdropEligibility'
import type {AddressAllocation} from '../types'

// NIGHT token has 6 decimals
const NIGHT_DECIMALS = 6

const formatAmount = (amount: number): string => {
  const normalizationFactor = Math.pow(10, NIGHT_DECIMALS)
  const normalized = new BigNumber(amount).dividedBy(normalizationFactor)
  return normalized.toFormat(2)
}

type Props = {
  onSelectAddress: (allocation: AddressAllocation) => void
}

export const DestinationAddressScreen = ({onSelectAddress}: Props) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()

  const {allocations, isLoading, isError} = useAirdropEligibility()
  const [selectedAddress, setSelectedAddress] = React.useState<string | null>(
    null,
  )

  // Auto-select first address if available
  React.useEffect(() => {
    if (allocations.length > 0 && !selectedAddress) {
      setSelectedAddress(allocations[0]?.address ?? null)
    }
  }, [allocations, selectedAddress])

  const handleApply = () => {
    const selectedAllocation = allocations.find(
      (a) => a.address === selectedAddress,
    )
    if (selectedAllocation) {
      onSelectAddress(selectedAllocation)
    }
  }

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
        edges={['left', 'right', 'bottom']}
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
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[ta.bg_color_max, a.flex_1]}
    >
      <ScrollView contentContainerStyle={[a.p_lg, a.gap_md]} style={a.flex_1}>
        {allocations.map((allocation, index) => {
          const isSelected = selectedAddress === allocation.address
          return (
            <AddressCard
              key={allocation.address}
              allocation={allocation}
              index={index + 1}
              isSelected={isSelected}
              onPress={() => setSelectedAddress(allocation.address)}
            />
          )
        })}
      </ScrollView>

      <View style={[a.p_lg, {paddingBottom: 24}]}>
        <Button
          title={strings.airdrop.apply}
          onPress={handleApply}
          disabled={!selectedAddress}
          size="M"
        />
      </View>
    </SafeAreaView>
  )
}

type AddressCardProps = {
  allocation: AddressAllocation
  index: number
  isSelected: boolean
  onPress: () => void
}

const AddressCard = ({
  allocation,
  index,
  isSelected,
  onPress,
}: AddressCardProps) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()

  const redeemableAmount = formatAmount(allocation.redeemableAmount)
  const totalToRedeem = formatAmount(allocation.totalLeftToRedeem)

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        a.rounded_sm,
        {
          backgroundColor: p.gray_min,
          borderWidth: isSelected ? 0 : 1,
          borderColor: p.gray_200,
          overflow: 'hidden',
        },
      ]}
    >
      <View style={[a.flex_row]}>
        {/* Left accent border for selected state */}
        <View
          style={{
            width: 4,
            backgroundColor: isSelected ? p.primary_500 : 'transparent',
          }}
        />

        <View style={[a.flex_1, a.p_lg]}>
          {/* Header row */}
          <View style={[a.flex_row, a.justify_between, a.align_center]}>
            <View style={[a.flex_row, a.align_center, a.gap_xs]}>
              <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
                {strings.airdrop.destinationAddressNumber.replace(
                  '{number}',
                  String(index),
                )}
              </Text>
              <Icon.InfoCircle size={16} color={p.gray_600} />
            </View>
            <Icon.Chevron direction="right" size={24} color={p.gray_600} />
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
              {strings.airdrop.statusRedeemable}
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
    </TouchableOpacity>
  )
}
