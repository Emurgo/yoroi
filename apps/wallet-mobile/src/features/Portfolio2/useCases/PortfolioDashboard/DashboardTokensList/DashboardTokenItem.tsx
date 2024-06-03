import {amountFormatter, infoExtractName, isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import {PortfolioTokenAmount} from '@yoroi/types/lib/typescript/portfolio/amount'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {PairedBalance} from '../../../../../components/PairedBalance/PairedBalance'
import {TokenInfoIcon} from '../../../../../features/Portfolio/common/TokenAmountItem/TokenInfoIcon'
import {usePrivacyMode} from '../../../../../features/Settings/PrivacyMode/PrivacyMode'
import {PnlTag} from '../../../common/PnlTag/PnlTag'
import {useGetQuantityChange} from '../../../common/useGetQuantityChange'
import {useNavigateTo} from '../../../common/useNavigateTo'
import {useQuantityChange} from '../../../common/useQuantityChange'

type Props = {
  tokenInfo: PortfolioTokenAmount
}
export const DashboardTokenItem = ({tokenInfo}: Props) => {
  const {styles} = useStyles()
  const navigationTo = useNavigateTo()
  const {isPrivacyOff, privacyPlaceholder} = usePrivacyMode()

  const {info, quantity} = tokenInfo ?? {}
  const name = infoExtractName(info, {mode: 'currency'})

  const quantityChangeData = useGetQuantityChange({name, quantity})
  const {previousQuantity} = quantityChangeData ?? {}

  const formattedQuantity = isPrivacyOff ? amountFormatter({dropTraillingZeros: true})(tokenInfo) : privacyPlaceholder

  const {quantityChangePercent, variantPnl} = useQuantityChange({previousQuantity, quantity, decimals: info.decimals})

  return (
    <TouchableOpacity onPress={() => navigationTo.tokenDetail({id: info.id, name: name})}>
      <View style={styles.root}>
        <TokenInfo info={info} />

        <Spacer height={16} />

        <View style={styles.quantityContainer}>
          <PnlTag variant={variantPnl} withIcon>
            <Text>{quantityChangePercent}%</Text>
          </PnlTag>

          <Text style={styles.tokenValue}>{formattedQuantity}</Text>

          <PairedBalance textStyle={styles.pairedTokenValue} amount={tokenInfo} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const TokenInfo = ({info}: {info: Portfolio.Token.Info}) => {
  const {styles} = useStyles()
  const name = infoExtractName(info)
  const isPrimary = isPrimaryToken(info)
  const detail = isPrimary ? info.description : info.fingerprint

  return (
    <View style={styles.tokenInfoContainer}>
      <TokenInfoIcon info={info} size="md" />

      <View style={styles.flexFull}>
        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.symbol}>
          {name}
        </Text>

        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.name}>
          {detail}
        </Text>
      </View>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.p_lg,
      ...atoms.rounded_sm,
      ...atoms.flex_col,
      ...atoms.align_start,
      ...atoms.border,
      ...atoms.flex_1,
      borderColor: color.gray_c300,
      width: 164,
      ...atoms.h_full,
    },
    symbol: {
      ...atoms.body_2_md_medium,
      ...atoms.font_semibold,
      color: color.gray_cmax,
      textTransform: 'uppercase',
    },
    name: {
      ...atoms.body_3_sm_regular,
      color: color.gray_c600,
    },
    tokenValue: {
      ...atoms.heading_4_medium,
      ...atoms.font_semibold,
      color: color.gray_cmax,
    },
    pairedTokenValue: {
      ...atoms.body_3_sm_regular,
      color: color.gray_c600,
    },
    tokenInfoContainer: {
      ...atoms.flex_1,
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.gap_sm,
    },
    flexFull: {
      ...atoms.flex_1,
    },
    quantityContainer: {
      ...atoms.flex_col,
      ...atoms.align_start,
    },
  })

  return {styles} as const
}
