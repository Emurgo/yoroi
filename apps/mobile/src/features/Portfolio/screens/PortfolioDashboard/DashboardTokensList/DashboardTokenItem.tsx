import {
  amountBreakdown,
  infoExtractName,
  isPrimaryToken,
} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import {PortfolioTokenAmount} from '@yoroi/types/lib/typescript/portfolio/amount'
import * as React from 'react'
import {Text, TouchableOpacity, View} from 'react-native'

import {
  formatPriceChange,
  priceChange,
} from '~/features/Portfolio/common/helpers/priceChange'
import {useNavigateTo} from '~/features/Portfolio/common/hooks/useNavigateTo'
import {usePortfolioTokenActivity} from '~/features/Portfolio/context/PortfolioTokenActivityProvider'
import {useCurrencyPairing} from '~/features/Settings/useCases/changeAppSettings/Currency/CurrencyContext'
import {usePrivacyMode} from '~/features/Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode'
import {PairedBalance} from '~/ui/PairedBalance/PairedBalance'
import {PnlTag} from '~/ui/PnlTag/PnlTag'
import {Space} from '~/ui/Space/Space'
import {TokenInfoIcon} from '~/ui/TokenInfoIcon/TokenInfoIcon'

type Props = {
  tokenInfo: PortfolioTokenAmount
}
export const DashboardTokenItem = ({tokenInfo}: Props) => {
  const {atoms: ta, palette: p} = useTheme()
  const navigationTo = useNavigateTo()
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()
  const formattedQuantity =
    isPrivacyActive === false
      ? amountBreakdown(tokenInfo).bn.toFormat(2)
      : privacyPlaceholder

  const {info} = tokenInfo ?? {}

  const ptActivity = useCurrencyPairing().ptActivity

  const {tokenActivity} = usePortfolioTokenActivity()

  const secondaryActivity = tokenActivity?.[info.id]?.price

  const {open, close} = isPrimaryToken(info)
    ? ptActivity
    : {
        close: secondaryActivity?.close.toNumber(),
        open: secondaryActivity?.open.toNumber(),
      }

  const {changePercent, variantPnl} = priceChange(open ?? 0, close ?? 0)
  const isMissingPrices = open === undefined || close === undefined

  return (
    <TouchableOpacity
      onPress={() => navigationTo.tokenDetail({id: info.id})}
      style={[a.h_full]}
    >
      <View
        style={[
          a.p_lg,
          a.rounded_sm,
          a.flex_col,
          a.align_start,
          a.border,
          a.flex_1,
          {borderColor: p.gray_300},
          a.h_full,
        ]}
      >
        <TokenInfo info={info} />

        <Space.Height.lg fill />

        <View style={[a.flex_col, a.align_start]}>
          <PnlTag withIcon variant={variantPnl}>
            <Text>
              {isMissingPrices ? '— ' : formatPriceChange(changePercent)}%
            </Text>
          </PnlTag>

          <Text
            ellipsizeMode="tail"
            numberOfLines={1}
            style={[a.heading_4_medium, a.font_semibold, {color: p.gray_max}]}
          >
            {formattedQuantity}
          </Text>

          <PairedBalance
            textStyle={{...a.body_3_sm_regular, color: p.gray_600}}
            amount={tokenInfo}
          />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const TokenInfo = ({info}: {info: Portfolio.Token.Info}) => {
  const {atoms: ta, palette: p} = useTheme()
  const name = infoExtractName(info)
  const isPrimary = isPrimaryToken(info)
  const detail = isPrimary ? info.description : info.fingerprint

  return (
    <View style={[a.flex_1, a.flex_row, a.align_center, a.gap_sm]}>
      <TokenInfoIcon info={info} size="lg" />

      <View style={[a.flex_1]}>
        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          style={[
            a.body_2_md_medium,
            a.font_semibold,
            {color: p.gray_max, textTransform: 'uppercase'},
          ]}
        >
          {name}
        </Text>

        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          style={[a.body_3_sm_regular, {color: p.gray_600}]}
        >
          {detail}
        </Text>
      </View>
    </View>
  )
}
