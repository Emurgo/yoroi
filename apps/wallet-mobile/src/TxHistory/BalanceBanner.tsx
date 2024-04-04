import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Boundary, ResetErrorRef, Spacer} from '../components'
import {Icon} from '../components/Icon'
import {PairedBalance} from '../components/PairedBalance/PairedBalance'
import {useSelectedWallet} from '../features/AddWallet/common/Context'
import {usePrivacyMode} from '../features/Settings/PrivacyMode/PrivacyMode'
import {formatTokenWithText, formatTokenWithTextWhenHidden} from '../legacy/format'
import {useBalances} from '../yoroi-wallets/hooks'
import {Amounts} from '../yoroi-wallets/utils'

export const BalanceBanner = React.forwardRef<ResetErrorRef>((_, ref) => {
  const wallet = useSelectedWallet()
  const styles = useStyles()
  const balances = useBalances(wallet)
  const primaryAmount = Amounts.getAmount(balances, wallet.primaryTokenInfo.id)
  const {isPrivacyOff, togglePrivacyMode} = usePrivacyMode()

  return (
    <View>
      <Spacer height={14} />

      <Row>
        <Icon.WalletAccount style={styles.walletIcon} iconSeed={wallet.checksum.ImagePart} scalePx={7} />
      </Row>

      <Spacer height={10} />

      <TouchableOpacity onPress={() => togglePrivacyMode()} style={styles.button}>
        <Row>
          <Boundary loading={{size: 'small'}} error={{size: 'inline'}}>
            <Balance isPrivacyOff={isPrivacyOff} />
          </Boundary>
        </Row>

        <Row>
          <PairedBalance isPrivacyOff={isPrivacyOff} amount={primaryAmount} ref={ref} />
        </Row>
      </TouchableOpacity>
    </View>
  )
})

const hiddenBalance = '*.******'
const Balance = ({isPrivacyOff}: {isPrivacyOff: boolean}) => {
  const styles = useStyles()
  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)

  const balance = isPrivacyOff
    ? formatTokenWithTextWhenHidden(hiddenBalance, wallet.primaryToken)
    : formatTokenWithText(Amounts.getAmount(balances, wallet.primaryToken.identifier).quantity, wallet.primaryToken)

  return (
    <Row>
      <Text style={styles.balanceText} testID="balanceText">
        {balance}
      </Text>
    </Row>
  )
}

const Row = ({children}: {children: React.ReactNode}) => {
  const styles = useStyles()
  return <View style={styles.centered}>{children}</View>
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme
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
      ...typography['body-1-l-medium'],
      color: color.gray[900],
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  })

  return styles
}
