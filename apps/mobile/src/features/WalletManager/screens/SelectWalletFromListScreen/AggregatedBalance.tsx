import {infoExtractName, isFt, isNft} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'

import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {Text, View} from 'react-native'

import {usePairing} from '~/features/Pairing/context/PairingProvider'
import {aggregatePrimaryAmount} from '~/features/Portfolio/common/helpers/aggregatePrimaryAmount'
import {usePortfolioTokenActivity} from '~/features/Portfolio/context/PortfolioTokenActivityProvider'
import {BalanceCardContent} from '~/ui/BalanceCardContent/BalanceCardContent'
import {BalanceCardSkeleton} from '~/ui/BalanceCardSkeleton/BalanceCardSkeleton'
import {BalanceHeaderCard} from '~/ui/BalanceHeaderCard/BalanceHeaderCard'
import {Space} from '~/ui/Space/Space'

import {useSelectedNetwork} from '../../hooks/useSelectedNetwork'

export const AggregatedBalance = () => {
  const {palette: p, atoms: ta} = useTheme()

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
  const tokens = React.useMemo(() => {
    return {
      nfts: Object.values(aggregatedBalances ?? {}).filter(({info}) =>
        isNft(info),
      ),
      fts: Object.values(aggregatedBalances ?? {}).filter(({info}) =>
        isFt(info),
      ),
    }
  }, [aggregatedBalances])

  return (
    <View style={[a.px_lg]}>
      {isLoading ? (
        <BalanceCardSkeleton />
      ) : (
        <LinearGradient style={[a.p_lg, a.rounded_sm]} colors={p.bg_gradient_3}>
          <BalanceCardContent
            amount={amount}
            headerCard={
              <BalanceHeaderCard rate={price} name={name} hasDApps={false} />
            }
          />
        </LinearGradient>
      )}

      <Space.Width.lg />

      <View style={[a.flex_row, a.justify_center]}>
        <Text style={[ta.text_gray_max, a.monospace, a.p_xs, a.rounded_sm]}>
          {tokens.nfts.length} NFT
        </Text>

        <Space.Width.lg />

        <Text style={[ta.text_gray_max, a.monospace, a.p_xs, a.rounded_sm]}>
          {tokens.fts.length} FT
        </Text>
      </View>

      <Space.Width.lg />
    </View>
  )
}
