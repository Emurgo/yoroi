import {useTheme} from '@yoroi/theme'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {BalanceCardSkeleton} from '../../useCases/PortfolioDashboard/BalanceCard/BalanceCardSkeleton'
import {useStrings} from '../useStrings'
import {TotalTokensValueContent} from './TotalTokensValueContent'

type Props = {
  balance: BigNumber
  oldBalance: BigNumber
  usdExchangeRate: number
  isLoading: boolean
  cardType: 'wallet' | 'dapps'
}

export const TotalTokensValue = ({isLoading, balance, oldBalance, usdExchangeRate, cardType}: Props) => {
  const strings = useStrings()
  const {styles} = useStyles()
  const isWallet = cardType === 'wallet'
  const title = isWallet ? strings.totalWalletValue : strings.totalDAppValue

  return (
    <View style={styles.root}>
      {isLoading ? (
        <BalanceCardSkeleton />
      ) : (
        <TotalTokensValueContent
          balance={balance}
          oldBalance={oldBalance}
          usdExchangeRate={usdExchangeRate}
          cardType={cardType}
          headerCard={
            <View style={styles.rowBetween}>
              <View>
                <Text style={[styles.normalText]}>{title}</Text>
              </View>
            </View>
          }
        />
      )}
    </View>
  )
}
const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.py_lg,
    },
    normalText: {
      ...atoms.body_2_md_regular,
    },
    rowBetween: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
  })

  return {styles} as const
}
