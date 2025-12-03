import {infoExtractName} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'

import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {View} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'

import {usePairing} from '~/features/Pairing/context/PairingProvider'
import {aggregatePrimaryAmount} from '~/features/Portfolio/common/helpers/aggregatePrimaryAmount'
import {usePortfolioTokenActivity} from '~/features/Portfolio/context/PortfolioTokenActivityProvider'
import {BalanceCardContent} from '~/ui/BalanceCardContent/BalanceCardContent'
import {BalanceCardSkeleton} from '~/ui/BalanceCardSkeleton/BalanceCardSkeleton'
import {BalanceHeaderCard} from '~/ui/BalanceHeaderCard/BalanceHeaderCard'
import {Space} from '~/ui/Space/Space'

import {useSelectedNetwork} from '@yoroi/wallet-manager'

export const AggregatedBalance = () => {
  const {palette: p} = useTheme()

  const {
    networkManager: {primaryTokenInfo},
  } = useSelectedNetwork()
  const {aggregatedBalances, tokenActivity, isLoading} =
    usePortfolioTokenActivity()
  const name = infoExtractName(primaryTokenInfo)
  const price = usePairing().ptActivity.close

  const amount = React.useMemo(
    () =>
      aggregatePrimaryAmount({
        primaryTokenInfo,
        tokenActivity,
        tokenAmountRecords: aggregatedBalances,
      }),
    [aggregatedBalances, primaryTokenInfo, tokenActivity],
  )

  const fadeAnim = useSharedValue(0)
  const scaleAnim = useSharedValue(0.95)

  React.useEffect(() => {
    if (!isLoading) {
      fadeAnim.value = withDelay(100, withTiming(1, {duration: 600}))
      scaleAnim.value = withDelay(100, withTiming(1, {duration: 600}))
    } else {
      fadeAnim.value = withTiming(0, {duration: 200})
      scaleAnim.value = withTiming(0.95, {duration: 200})
    }
  }, [isLoading, fadeAnim, scaleAnim])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{scale: scaleAnim.value}],
  }))

  return (
    <View style={[a.px_lg]}>
      {isLoading ? (
        <BalanceCardSkeleton />
      ) : (
        <Animated.View style={animatedStyle}>
          <LinearGradient
            style={[a.p_lg, a.rounded_sm]}
            colors={p.bg_gradient_3}
          >
            <BalanceCardContent
              amount={amount}
              headerCard={
                <BalanceHeaderCard rate={price} name={name} hasDApps={false} />
              }
            />
          </LinearGradient>
        </Animated.View>
      )}

      <Space.Width.lg />
    </View>
  )
}
