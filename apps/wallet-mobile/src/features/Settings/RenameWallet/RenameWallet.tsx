import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, KeyboardAvoidingView, Spacer, TextInput} from '../../../components'
import globalMessages from '../../../kernel/i18n/global-messages'
import {isEmptyString} from '../../../kernel/utils'
import {getWalletNameError, validateWalletName} from '../../../yoroi-wallets/utils/validators'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useSelectedWalletMeta} from '../../WalletManager/common/hooks/useSelectedWalletMeta'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'

export const RenameWallet = () => {
  const strings = useStrings()
  const styles = useStyles()
  const navigation = useNavigation()

  const {wallet} = useSelectedWallet()
  const {name: walletName} = useSelectedWalletMeta()

  const {walletManager} = useWalletManager()
  const walletNames = Array.from(walletManager.walletMetas.values()).map(({name}) => name)
  const [newWalletName, setNewWalletName] = React.useState(walletName)
  const validationErrors = validateWalletName(newWalletName, walletName, walletNames)
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
    <SafeAreaView style={styles.safeAreaView} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView style={{flex: 1}}>
        <Spacer height={40} />

        <ScrollView
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.scrollContentContainer}
        >
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

        <View style={styles.action}>
          <Button
            onPress={handleOnRename}
            title={strings.changeButton}
            disabled={hasErrors || isEmptyString(newWalletName)}
            shelleyTheme
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      backgroundColor: color.gray_cmin,
      flex: 1,
    },
    scrollContentContainer: {
      ...atoms.px_lg,
    },
    action: {
      ...atoms.p_lg,
      backgroundColor: color.gray_cmin,
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
