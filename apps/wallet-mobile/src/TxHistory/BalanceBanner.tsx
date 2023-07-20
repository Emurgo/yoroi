import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Boundary, ResetErrorRef, Spacer} from '../components'
import {Icon} from '../components/Icon'
import {formatTokenWithText, formatTokenWithTextWhenHidden} from '../legacy/format'
import {useSelectedWallet} from '../SelectedWallet'
import {PrivacyMode, usePrivacyMode, useSetPrivacyMode} from '../Settings/PrivacyMode/PrivacyMode'
import {COLORS} from '../theme'
import {useBalances} from '../yoroi-wallets/hooks'
import {Amounts} from '../yoroi-wallets/utils'
import {PairedBalance} from './PairedBalance'

export const BalanceBanner = React.forwardRef<ResetErrorRef>((_, ref) => {
  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)
  const primaryAmount = Amounts.getAmount(balances, wallet.primaryTokenInfo.id)
  const setPrivacyMode = useSetPrivacyMode()
  const privacyMode = usePrivacyMode()

  return (
    <View style={styles.banner}>
      <Spacer height={14} />

      <Row>
        <Icon.WalletAccount style={styles.walletIcon} iconSeed={wallet.checksum.ImagePart} scalePx={7} />
      </Row>

      <Spacer height={10} />

      <TouchableOpacity
        onPress={() => setPrivacyMode(privacyMode === 'SHOWN' ? 'HIDDEN' : 'SHOWN')}
        style={styles.button}
      >
        <Row>
          <Boundary loading={{size: 'small'}} error={{size: 'inline'}}>
            <Balance privacyMode={privacyMode} />
          </Boundary>
        </Row>

        <Row>
          <PairedBalance privacyMode={privacyMode} amount={primaryAmount} ref={ref} />
        </Row>
      </TouchableOpacity>
    </View>
  )
})

const hiddenBalance = '*.******'
const Balance = ({privacyMode}: {privacyMode: PrivacyMode}) => {
  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)

  const balance =
    privacyMode === 'HIDDEN'
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
