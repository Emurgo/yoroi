import {amountFormatter} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, Text, View} from 'react-native'

import {Button, useModal} from '../../../components'
import globalMessages, {confirmationMessages} from '../../../kernel/i18n/global-messages'
import {catalystConfig} from '../../../yoroi-wallets/cardano/constants/catalyst-config'
import {usePortfolioPrimaryBalance} from '../../Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'

const formatter = amountFormatter({template: `{{value}} {{ticker}}`, dropTraillingZeros: true})

export const InsufficientFundsModal = () => {
  const strings = useStrings()
  const styles = useStyles()
  const {wallet} = useSelectedWallet()
  const {closeModal} = useModal()

  const primaryBalance = usePortfolioPrimaryBalance({wallet})
  const fmtMinPrimaryBalance = formatter({
    info: wallet.portfolioPrimaryTokenInfo,
    quantity: catalystConfig.displayedMinAda,
  })
  const fmtPrimaryBalance = formatter(primaryBalance)

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {strings.insufficientBalance({
          requiredBalance: fmtMinPrimaryBalance,
          currentBalance: fmtPrimaryBalance,
        })}
      </Text>

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
    container: {
      ...atoms.px_lg,
      ...atoms.flex_1,
      ...atoms.justify_between,
    },
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
