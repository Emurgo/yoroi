import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Boundary, ResetErrorRef, Spacer} from '../components'
import {Icon} from '../components/Icon'
import {usePrivacyMode} from '../features/Settings/PrivacyMode/PrivacyMode'
import {formatTokenWithText, formatTokenWithTextWhenHidden} from '../legacy/format'
import {useSelectedWallet} from '../SelectedWallet'
import {COLORS} from '../theme'
import {Amounts} from '../yoroi-wallets/utils'
import {PairedBalance} from './PairedBalance'

export const BalanceBanner = React.forwardRef<ResetErrorRef>((_, ref) => {
  const wallet = useSelectedWallet()
  const primaryAmount = Amounts.getAmount(wallet.portfolio.primary.fts, wallet.primaryTokenInfo.id)
  const {isPrivacyOff, togglePrivacyMode} = usePrivacyMode()

  return (
    <View style={styles.banner}>
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
  const wallet = useSelectedWallet()

  const balance = isPrivacyOff
    ? formatTokenWithTextWhenHidden(hiddenBalance, wallet.primaryToken)
    : formatTokenWithText(
        Amounts.getAmount(wallet.portfolio.primary.fts, wallet.primaryToken.identifier).quantity,
        wallet.primaryToken,
      )

  return (
    <Row>
      <Text style={styles.balanceText} testID="balanceText">
        {balance}
      </Text>
    </Row>
  )
}

const Row = ({children}: {children: React.ReactNode}) => <View style={styles.centered}>{children}</View>

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.BACKGROUND_GRAY,
  },
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
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Rubik-Medium',
    color: COLORS.ERROR_TEXT_COLOR_DARK,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})
