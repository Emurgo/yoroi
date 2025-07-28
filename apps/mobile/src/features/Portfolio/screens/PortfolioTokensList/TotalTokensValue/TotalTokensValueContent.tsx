import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {Text, TouchableOpacity, View} from 'react-native'

import {Icon} from '~/components/Icon'
import {Space} from '~/components/Space/Space'
import {Tooltip} from '~/components/Tooltip/Tooltip'
import {usePrivacyMode} from '~/Settings/changeAppSettings/PrivacyMode/PrivacyMode'
import {useCurrencyPairing} from '~/Settings/useCases/changeAppSettings/Currency/CurrencyContext'
import {
  formatPriceChange,
  priceChange,
} from '~/features/common/helpers/priceChange'
import {useStrings} from '~/features/common/hooks/useStrings'
import {
  PortfolioListTab,
  usePortfolio,
} from '~/features/Portfolio/context/PortfolioProvider'
import {PnlTag} from '~/ui/PnlTag/PnlTag'
import {SkeletonQuantityChange} from './SkeletonQuantityChange'
import {TokenValueBalance} from './TokenValueBalance'
import {TokenValuePairedBalance} from './TokenValuePairedBalance'

type Props = {
  amount: Portfolio.Token.Amount
  headerCard: React.ReactNode
}

export const TotalTokensValueContent = ({amount, headerCard}: Props) => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()
  const {
    currency,
    config,
    ptActivity: {close, open},
    isLoading,
  } = useCurrencyPairing()
  const {isPrimaryTokenActive, setIsPrimaryTokenActive, listTab} =
    usePortfolio()
  const {togglePrivacyMode} = usePrivacyMode()

  const {changePercent, changeValue, variantPnl} = priceChange(open, close)

  return (
    <View>
      {headerCard}

      <Space height={6} />

      <View style={[a.gap_2xs]}>
        <View style={[a.flex_row, a.gap_2xs, a.align_end]}>
          <TouchableOpacity
            style={[a.flex_row, a.gap_2xs, a.align_end]}
            onPress={() => togglePrivacyMode()}
          >
            <TokenValueBalance
              rate={close}
              amount={amount}
              isFetching={isLoading}
              isPrimaryTokenActive={isPrimaryTokenActive}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[a.p_sm]}
            onPress={() => setIsPrimaryTokenActive(!isPrimaryTokenActive)}
          >
            <Icon.Change color={p.el_gray_max} />
          </TouchableOpacity>
        </View>

        <View style={[a.flex_row, a.justify_between, a.align_center]}>
          <TokenValuePairedBalance
            amount={amount}
            isFetching={isLoading}
            isPrimaryTokenActive={isPrimaryTokenActive}
          />

          <Tooltip
            title={
              listTab === PortfolioListTab.Dapps
                ? strings.totalDAppsValueTooltip
                : strings.totalWalletValueTooltip
            }
          >
            <View style={[a.flex_row, a.gap_xs, a.align_stretch]}>
              {isLoading ? (
                <SkeletonQuantityChange />
              ) : (
                <PnlTag variant={variantPnl} withIcon>
                  <Text>{formatPriceChange(changePercent)}%</Text>
                </PnlTag>
              )}

              {isLoading ? (
                <SkeletonQuantityChange />
              ) : (
                <PnlTag variant={variantPnl}>
                  <Text>{`${changeValue > 0 ? '+' : ''}${formatPriceChange(
                    changeValue,
                    config.decimals,
                  )} ${currency}`}</Text>
                </PnlTag>
              )}
            </View>
          </Tooltip>
        </View>
      </View>
    </View>
  )
}
