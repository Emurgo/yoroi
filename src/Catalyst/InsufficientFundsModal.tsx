import * as React from 'react'
import {useIntl} from 'react-intl'
import {Text, View} from 'react-native'

import {StandardModal} from '../components'
import {useBalances} from '../hooks'
import globalMessages, {confirmationMessages} from '../i18n/global-messages'
import {CONFIG} from '../legacy/config'
import {formatTokenWithText} from '../legacy/format'
import {useSelectedWallet} from '../SelectedWallet'
import {Amounts, asQuantity} from '../yoroi-wallets/utils'

export const InsufficientFundsModal = ({visible, onRequestClose}: {visible: boolean; onRequestClose: () => void}) => {
  const strings = useStrings()
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
        <Text>
          {strings.insufficientBalance({
            requiredBalance: formatTokenWithText(asQuantity(CONFIG.CATALYST.DISPLAYED_MIN_ADA), wallet.primaryToken),
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
    insufficientBalance: ({requiredBalance, currentBalance}) =>
      intl.formatMessage(globalMessages.insufficientBalance, {
        requiredBalance,
        currentBalance,
      }),
    attention: intl.formatMessage(globalMessages.attention),
    back: intl.formatMessage(confirmationMessages.commonButtons.backButton),
  }
}
