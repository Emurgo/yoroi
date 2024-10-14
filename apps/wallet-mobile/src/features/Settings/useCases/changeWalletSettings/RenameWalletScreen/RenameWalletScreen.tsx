import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../../components/Button/Button'
import {KeyboardAvoidingView} from '../../../../../components/KeyboardAvoidingView/KeyboardAvoidingView'
import {Spacer} from '../../../../../components/Spacer/Spacer'
import {TextInput} from '../../../../../components/TextInput/TextInput'
import globalMessages from '../../../../../kernel/i18n/global-messages'
import {isEmptyString} from '../../../../../kernel/utils'
import {getWalletNameError} from '../../../../../yoroi-wallets/utils/validators'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../../WalletManager/context/WalletManagerProvider'

export const RenameWalletScreen = () => {
  const strings = useStrings()
  const styles = useStyles()
  const navigation = useNavigation()

  const {
    wallet,
    meta: {name: walletName},
  } = useSelectedWallet()

  const {walletManager} = useWalletManager()
  const [newWalletName, setNewWalletName] = React.useState(walletName)
  const validationErrors = walletManager.validateWalletName(newWalletName, walletName)
  const hasErrors = Object.keys(validationErrors).length > 0
  const errorText = getWalletNameError(
    {
      tooLong: strings.tooLong,
      nameAlreadyTaken: strings.nameAlreadyTaken,
      mustBeFilled: strings.mustBeFilled,
    },
    validationErrors,
  )
  const handleOnRename = () => {
    walletManager.renameWallet(wallet.id, newWalletName.trim())
    navigation.goBack()
  }

  return (
    <KeyboardAvoidingView style={styles.root}>
      <SafeAreaView style={styles.safeAreaView} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContentContainer} bounces={false}>
          <WalletNameInput
            returnKeyType="done"
            errorDelay={0}
            enablesReturnKeyAutomatically
            autoFocus
            label={strings.walletNameInputLabel}
            value={newWalletName}
            onChangeText={(walletName: string) => setNewWalletName(walletName)}
            errorText={!isEmptyString(errorText) ? errorText : undefined}
            autoComplete="off"
          />
        </ScrollView>

        <Spacer fill />

        <View style={styles.actions}>
          <Button
            onPress={handleOnRename}
            title={strings.changeButton}
            disabled={hasErrors || isEmptyString(newWalletName)}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_max,
      ...atoms.flex_1,
    },
    safeAreaView: {
      ...atoms.flex_1,
      ...atoms.pt_lg,
      ...atoms.pb_lg,
    },
    scrollContentContainer: {
      ...atoms.px_lg,
    },
    actions: {
      backgroundColor: color.bg_color_max,
      ...atoms.pt_lg,
      ...atoms.px_lg,
    },
  })
  return styles
}

const WalletNameInput = TextInput

const messages = defineMessages({
  changeButton: {
    id: 'components.settings.changewalletname.changeButton',
    defaultMessage: '!!!Change name',
  },
  walletNameInputLabel: {
    id: 'components.settings.changewalletname.walletNameInputLabel',
    defaultMessage: '!!!Wallet name',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    changeButton: intl.formatMessage(messages.changeButton),
    walletNameInputLabel: intl.formatMessage(messages.walletNameInputLabel),
    tooLong: intl.formatMessage(globalMessages.walletNameErrorTooLong),
    nameAlreadyTaken: intl.formatMessage(globalMessages.walletNameErrorNameAlreadyTaken),
    mustBeFilled: intl.formatMessage(globalMessages.walletNameErrorMustBeFilled),
  }
}
