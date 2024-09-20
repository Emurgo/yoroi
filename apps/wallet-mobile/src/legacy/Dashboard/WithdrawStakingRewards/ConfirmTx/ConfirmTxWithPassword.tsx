import {useTheme} from '@yoroi/theme'
import React from 'react'
import {useIntl} from 'react-intl'
import {ActivityIndicator, StyleSheet, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {Button} from '../../../../components/Button/Button'
import {Space} from '../../../../components/Space/Space'
import {TextInput} from '../../../../components/TextInput/TextInput'
import {debugWalletInfo, features} from '../../../../kernel/features'
import {confirmationMessages, txLabels} from '../../../../kernel/i18n/global-messages'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useSignWithPasswordAndSubmitTx} from '../../../../yoroi-wallets/hooks'
import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types/yoroi'
import {TransferSummary} from '../TransferSummary/TransferSummary'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onCancel: () => void
  onSuccess: () => void
}

export const ConfirmTxWithPassword = ({wallet, onSuccess, onCancel, unsignedTx}: Props) => {
  const strings = useStrings()
  const {color} = useTheme()
  const [password, setPassword] = React.useState(features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '')
  const intl = useIntl()
  const {styles} = useStyles()

  const {signAndSubmitTx, isLoading} = useSignWithPasswordAndSubmitTx(
    {wallet}, //
    {submitTx: {onSuccess}},
  )

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} bounces={false}>
        <TransferSummary wallet={wallet} unsignedTx={unsignedTx} />

        <PasswordInput
          autoComplete="off"
          autoFocus
          onChangeText={setPassword}
          secureTextEntry
          value={password}
          label={strings.password}
          disabled={isLoading}
          testID="walletPasswordInput"
        />
      </ScrollView>

      <View style={styles.buttons}>
        <Button
          block
          shelleyTheme
          outlineOnLight
          onPress={() => onCancel()}
          title={intl.formatMessage(confirmationMessages.commonButtons.cancelButton)}
          disabled={isLoading}
          testID="cancelTxButton"
        />

        <Space width="md" />

        <Button
          block
          shelleyTheme
          onPress={() => signAndSubmitTx({unsignedTx, password})}
          title={strings.confirmButton}
          disabled={isLoading}
          testID="confirmTxButton"
        />
      </View>

      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={color.gray_900} />
        </View>
      )}
    </View>
  )
}

const PasswordInput = TextInput

const useStrings = () => {
  const intl = useIntl()

  return {
    confirmButton: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
    confirmTx: intl.formatMessage(txLabels.confirmTx),
    password: intl.formatMessage(txLabels.password),
  }
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.relative,
    },
    loading: {
      ...atoms.absolute,
      ...atoms.h_full,
      ...atoms.w_full,
      ...atoms.align_center,
      ...atoms.justify_center,
    },
    buttons: {
      backgroundColor: color.bg_color_max,
      ...atoms.p_lg,
      ...atoms.flex_row,
    },
    scroll: {
      ...atoms.flex_1,
      ...atoms.px_lg,
    },
  })

  return {styles} as const
}
