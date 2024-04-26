import {amountFormatter} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {ResetErrorRef, Spacer} from '../components'
import {Icon} from '../components/Icon'
import {PairedBalance} from '../components/PairedBalance/PairedBalance'
import {usePrimaryBalance} from '../features/Portfolio/common/hooks/usePrimaryBalance'
import {usePrivacyMode} from '../features/Settings/PrivacyMode/PrivacyMode'
import {useSelectedWallet} from '../features/WalletManager/Context'
import {asQuantity} from '../yoroi-wallets/utils'

export const BalanceBanner = React.forwardRef<ResetErrorRef>((_, ref) => {
  const wallet = useSelectedWallet()
  const styles = useStyles()
  const primaryBalance = usePrimaryBalance({wallet})
  const {isPrivacyOff, togglePrivacyMode, privacyPlaceholder} = usePrivacyMode()

  return (
    <View>
      <Spacer height={14} />

      <CenteredRow>
        <Icon.WalletAccount style={styles.walletIcon} iconSeed={wallet.checksum.ImagePart} scalePx={7} />
      </CenteredRow>

      <Spacer height={10} />

      <TouchableOpacity onPress={() => togglePrivacyMode()} style={styles.button}>
        <CenteredRow>
          <PrimaryBalance
            isPrivacyOff={isPrivacyOff}
            primaryBalance={primaryBalance}
            privacyPlaceholder={privacyPlaceholder}
          />
        </CenteredRow>

        <CenteredRow>
          <PairedBalance
            isPrivacyOff={isPrivacyOff}
            amount={{
              quantity: asQuantity(primaryBalance.quantity.toString()),
              tokenId: primaryBalance.info.id,
            }}
            ref={ref}
          />
        </CenteredRow>
      </TouchableOpacity>
    </View>
  )
})

type PrimaryBalanceProps = {isPrivacyOff: boolean; primaryBalance: Portfolio.Token.Amount; privacyPlaceholder: string}
const PrimaryBalance = ({isPrivacyOff, primaryBalance, privacyPlaceholder}: PrimaryBalanceProps) => {
  const styles = useStyles()

  const balance = isPrivacyOff
    ? amountFormatter({template: '{{value}} {{symbol}}'})(primaryBalance)
    : amountFormatter({template: `${privacyPlaceholder} {{symbol}}`})(primaryBalance)

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
      color: color.gray_c900,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  })

  return styles
}
