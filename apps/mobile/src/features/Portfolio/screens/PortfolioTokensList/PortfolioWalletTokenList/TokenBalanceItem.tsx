import {
  amountBreakdown,
  infoExtractName,
  isPrimaryToken,
} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {Text, TouchableOpacity, View} from 'react-native'

import {TokenInfoIcon} from '~/ui/TokenInfoIcon/TokenInfoIcon'
import {PairedBalance} from '~/components/PairedBalance/PairedBalance'
import {Space} from '~/components/Space/Space'
import {useCurrencyPairing} from '~/../../../Settings/useCases/changeAppSettings/Currency/CurrencyContext'
import {usePrivacyMode} from '~/../../../Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode'
import {
  formatPriceChange,
  priceChange,
} from '~/features/common/helpers/priceChange'
import {useNavigateTo} from '~/../../common/hooks/useNavigateTo'
import {usePortfolioTokenActivity} from '~/../../common/PortfolioTokenActivityProvider'
import {PnlTag} from '~/ui/PnlTag/PnlTag'

type Props = {
  amount: Portfolio.Token.Amount
}
export const TokenBalanceItem = ({amount}: Props) => {
  const {atoms: ta, palette: p} = useTheme()
  const navigationTo = useNavigateTo()
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()

  const {info} = amount
  const name = infoExtractName(info)
  const symbol = infoExtractName(info, {mode: 'currency'})
  const balanceFormatted = isPrivacyActive
    ? privacyPlaceholder
    : amountBreakdown(amount).bn.toFormat(2)

  const ptActivity = useCurrencyPairing().ptActivity

  const {tokenActivity} = usePortfolioTokenActivity()

  const secondaryActivity = tokenActivity?.[info.id]?.price

  const {close, open} = isPrimaryToken(info)
    ? ptActivity
    : {
        close: secondaryActivity?.close.toNumber(),
        open: secondaryActivity?.open.toNumber(),
      }

  const {changePercent, variantPnl} = priceChange(open ?? 0, close ?? 0)
  const isMissingPrices = close === undefined || open === undefined

  return (
    <TouchableOpacity
      onPress={() => navigationTo.tokenDetail({id: info.id})}
      style={[
        {backgroundColor: p.bg_color_max},
        a.flex_row,
        a.align_center,
        a.justify_between,
        a.gap_lg,
      ]}
    >
      <View style={[a.flex_row, a.align_center, a.justify_start, a.flex_1]}>
        <TokenInfoIcon info={info} size="lg" />

        <Space width={12} />

        <View style={[a.flex_col, a.align_start, {flex: 1}]}>
          <Text
            numberOfLines={1}
            ellipsizeMode="middle"
            style={[a.body_1_lg_medium, a.font_semibold, {color: p.gray_900}]}
          >
            {name}
          </Text>

          <PnlTag withIcon variant={variantPnl}>
            <Text>
              {isMissingPrices ? '— ' : formatPriceChange(changePercent)}%
            </Text>
          </PnlTag>
        </View>
      </View>

      <View>
        <Text
          style={[a.body_1_lg_regular, a.text_right, {color: p.gray_900}]}
        >{`${balanceFormatted} ${symbol}`}</Text>

        <PairedBalance
          hidePrimaryPair
          amount={amount}
          textStyle={[a.body_3_sm_regular, a.text_right, {color: p.gray_600}]}
        />
      </View>
    </TouchableOpacity>
  )
}
