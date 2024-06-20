import {amountFormatter} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, Text, View} from 'react-native'

import {StandardModal} from '../../components'
import {usePortfolioPrimaryBalance} from '../../features/Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {useSelectedWallet} from '../../features/WalletManager/common/hooks/useSelectedWallet'
import globalMessages, {confirmationMessages} from '../../kernel/i18n/global-messages'
import {catalystConfig} from '../../yoroi-wallets/cardano/constants/common'

export const InsufficientFundsModal = ({visible, onRequestClose}: {visible: boolean; onRequestClose: () => void}) => {
  const strings = useStrings()
  const styles = useStyles()
  const wallet = useSelectedWallet()

  const primaryBalance = usePortfolioPrimaryBalance({wallet})
  const fmtMinPrimaryBalance = amountFormatter()({
    info: wallet.portfolioPrimaryTokenInfo,
    quantity: catalystConfig.displayedMinAda,
  })
  const fmtPrimaryBalance = amountFormatter()(primaryBalance)

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
            requiredBalance: fmtMinPrimaryBalance,
            currentBalance: fmtPrimaryBalance,
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
