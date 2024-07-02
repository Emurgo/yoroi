import {amountFormatter} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, Text, View} from 'react-native'

import {Button, useModal} from '../../components'
import {Space} from '../../components/Space/Space'
import {usePortfolioPrimaryBalance} from '../../features/Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {useSelectedWallet} from '../../features/WalletManager/common/hooks/useSelectedWallet'
import globalMessages, {confirmationMessages} from '../../kernel/i18n/global-messages'
import {catalystConfig} from '../../yoroi-wallets/cardano/constants/catalyst-config'

export const InsufficientFundsModal = () => {
  const strings = useStrings()
  const styles = useStyles()
  const {wallet} = useSelectedWallet()
  const {closeModal} = useModal()

  const primaryBalance = usePortfolioPrimaryBalance({wallet})
  const fmtMinPrimaryBalance = amountFormatter()({
    info: wallet.portfolioPrimaryTokenInfo,
    quantity: catalystConfig.displayedMinAda,
  })
  const fmtPrimaryBalance = amountFormatter()(primaryBalance)

  return (
    <View>
      <Text style={styles.text}>
        {strings.insufficientBalance({
          requiredBalance: fmtMinPrimaryBalance,
          currentBalance: fmtPrimaryBalance,
        })}
      </Text>

      <Space height="md" />

      <Button shelleyTheme title={strings.back} onPress={closeModal} textStyles={styles.button} />
    </View>
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
    back: intl.formatMessage(confirmationMessages.commonButtons.backButton),
  }
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    text: {
      color: color.gray_cmax,
      ...atoms.body_1_lg_regular,
    },
    button: {
      ...atoms.button_1_lg,
    },
  })

  return styles
}
