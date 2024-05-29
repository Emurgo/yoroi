import {infoExtractName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {usePortfolioPrimaryBalance} from '../../../../../features/Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {useCurrencyContext} from '../../../../../features/Settings/Currency'
import {useSelectedWallet} from '../../../../../features/WalletManager/context/SelectedWalletContext'
import {useStrings} from '../../../common/useStrings'
import {useTokenExchangeRate} from '../../../common/useTokenExchangeRate'
import {BalanceCardContent} from './BalanceCardContent'
import {BalanceCardSkeleton} from './BalanceCardSkeleton'

export const BalanceCard = () => {
  const strings = useStrings()
  const {styles, colors} = useStyles()

  const wallet = useSelectedWallet()
  const primaryBalance = usePortfolioPrimaryBalance({wallet})
  const name = infoExtractName(primaryBalance.info)
  const rate = useTokenExchangeRate()
  const isLoading = rate === undefined

  return (
    <View style={styles.root}>
      {isLoading ? (
        <BalanceCardSkeleton />
      ) : (
        <LinearGradient style={styles.gradientRoot} colors={colors.gradientColor}>
          <BalanceCardContent
            rate={rate}
            amount={primaryBalance}
            name={name}
            headerCard={
              <View style={styles.rowBetween}>
                <Text style={[styles.textWhite, styles.normalText]}>{strings.totalWalletValue}</Text>

                <Rate rate={rate} name={name} />
              </View>
            }
          />
        </LinearGradient>
      )}
    </View>
  )
}

type RateProps = {rate: number; name: string}
const Rate = ({rate, name}: RateProps) => {
  const {styles} = useStyles()
  const {currency} = useCurrencyContext()

  return (
    <Text style={[styles.boxExchange]}>
      <Text style={[styles.textWhite, styles.normalText]}>1 {name} = </Text>

      <Text style={[styles.textWhite, styles.normalText, styles.usdExchangeText]}>{rate.toFixed(2)}</Text>

      <Text style={[styles.textWhite, styles.usdExchangeFiat]}>{currency}</Text>
    </Text>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.px_lg,
    },
    gradientRoot: {
      ...atoms.p_lg,
      borderRadius: 9,
    },
    textWhite: {
      color: color.white_static,
    },
    normalText: {
      ...atoms.body_2_md_regular,
    },
    rowBetween: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    boxExchange: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    usdExchangeText: {
      ...atoms.font_semibold,
    },
    usdExchangeFiat: {
      ...atoms.body_3_sm_regular,
    },
  })

  const colors = {
    gradientColor: color.bg_gradient_3,
  }

  return {styles, colors} as const
}
