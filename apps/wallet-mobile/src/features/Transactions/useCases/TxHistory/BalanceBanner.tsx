import {amountFormatter} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {ResetErrorRef, Spacer} from '../../../../components'
import {Icon} from '../../../../components/Icon'
import {PairedBalance} from '../../../../components/PairedBalance/PairedBalance'
import {usePortfolioPrimaryBalance} from '../../../Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {usePrivacyMode} from '../../../Settings/PrivacyMode/PrivacyMode'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'

export const BalanceBanner = React.forwardRef<ResetErrorRef>((_, ref) => {
  const {wallet, meta} = useSelectedWallet()
  const styles = useStyles()
  const primaryBalance = usePortfolioPrimaryBalance({wallet})
  const {togglePrivacyMode} = usePrivacyMode()

  return (
    <View>
      <Spacer height={14} />

      <CenteredRow>
        <Icon.WalletAvatar style={styles.walletIcon} image={meta.avatar} size={40} />
      </CenteredRow>

      <Spacer height={10} />

      <TouchableOpacity onPress={() => togglePrivacyMode()} style={styles.button}>
        <CenteredRow>
          <Balance amount={primaryBalance} />
        </CenteredRow>

        <CenteredRow>
          <PairedBalance amount={primaryBalance} ref={ref} />
        </CenteredRow>
      </TouchableOpacity>
    </View>
  )
})

type BalanceProps = {amount: Portfolio.Token.Amount; ignorePrivacy?: boolean}
const Balance = ({amount, ignorePrivacy}: BalanceProps) => {
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()
  const styles = useStyles()

  const balance = React.useMemo(
    () =>
      !isPrivacyActive || ignorePrivacy === true
        ? amountFormatter({template: '{{value}} {{ticker}}'})(amount)
        : amountFormatter({template: `${privacyPlaceholder} {{ticker}}`})(amount),
    [amount, ignorePrivacy, isPrivacyActive, privacyPlaceholder],
  )

  return (
    <CenteredRow>
      <Text style={styles.balanceText} testID="balanceText">
        {balance}
      </Text>
    </CenteredRow>
  )
}

const CenteredRow = ({children}: {children: React.ReactNode}) => {
  const styles = useStyles()
  return <View style={styles.centered}>{children}</View>
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    walletIcon: {
      height: 40,
      width: 40,
      borderRadius: 20,
    },
    button: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    balanceText: {
      ...atoms.body_1_lg_medium,
      color: color.gray_900,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  })

  return styles
}
