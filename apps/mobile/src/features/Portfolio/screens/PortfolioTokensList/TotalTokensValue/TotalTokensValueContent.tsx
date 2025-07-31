import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {Text, TouchableOpacity, View} from 'react-native'

import {
  formatPriceChange,
  priceChange,
} from '~/features/Portfolio/common/helpers/priceChange'
import {useStrings} from '~/features/Portfolio/common/hooks/useStrings'
import {
  PortfolioListTab,
  usePortfolio,
} from '~/features/Portfolio/context/PortfolioProvider'
import {useCurrencyPairing} from '~/features/Settings/useCases/changeAppSettings/Currency/CurrencyContext'
import {usePrivacyMode} from '~/features/Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode'
import {Icon} from '~/ui/Icon'
import {PnlTag} from '~/ui/PnlTag/PnlTag'
import {Space} from '~/ui/Space/Space'
import {Tooltip} from '~/ui/Tooltip/Tooltip'
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

      <Space.Height.xs />

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
