import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, Text, View} from 'react-native'

import {StandardModal} from '../components'
import {useSelectedWallet} from '../features/WalletManager/Context'
import globalMessages, {confirmationMessages} from '../i18n/global-messages'
import {formatTokenWithText} from '../legacy/format'
import {CATALYST} from '../yoroi-wallets/cardano/utils'
import {useBalances} from '../yoroi-wallets/hooks'
import {Amounts, asQuantity} from '../yoroi-wallets/utils'

export const InsufficientFundsModal = ({visible, onRequestClose}: {visible: boolean; onRequestClose: () => void}) => {
  const strings = useStrings()
  const styles = useStyles()
  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)

  return (
    <StandardModal
      visible={visible}
      title={strings.attention}
      onRequestClose={onRequestClose}
      primaryButton={{
        label: strings.back,
        onPress: onRequestClose,
      }}
      showCloseIcon
    >
      <View>
        <Text style={styles.text}>
          {strings.insufficientBalance({
            requiredBalance: formatTokenWithText(asQuantity(CATALYST.DISPLAYED_MIN_ADA), wallet.primaryToken),
            currentBalance: formatTokenWithText(
              Amounts.getAmount(balances, wallet.primaryToken.identifier).quantity,
              wallet.primaryToken,
            ),
          })}
        </Text>
      </View>
    </StandardModal>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    insufficientBalance: ({requiredBalance, currentBalance}: {requiredBalance: string; currentBalance: string}) =>
      intl.formatMessage(globalMessages.insufficientBalance, {
        requiredBalance,
        currentBalance,
      }),
    attention: intl.formatMessage(globalMessages.attention),
    back: intl.formatMessage(confirmationMessages.commonButtons.backButton),
  }
}

const useStyles = () => {
  const {color} = useTheme()

  const styles = StyleSheet.create({
    text: {
      color: color.gray_cmax,
    },
  })

  return styles
}
