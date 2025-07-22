import {useNavigation} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import globalMessages from '../../../../../kernel/i18n/global-messages'
import {Button} from '../../../../../ui/Button/Button'
import {KeyboardAvoidingView} from '../../../../../ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {SpaceHeight} from '../../../../../ui/Space/Space'
import {TextInput} from '../../../../../ui/TextInput/TextInput'
import {isEmptyString} from '../../../../../wallets/utils/string'
import {getWalletNameError} from '../../../../../wallets/utils/validators'
import {useWalletManager} from '../../../../WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '../../../../WalletManager/hooks/useSelectedWallet'

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
  const validationErrors = walletManager.validateWalletName(
    newWalletName,
    walletName,
  )
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
      <SafeAreaView
        style={styles.safeAreaView}
        edges={['left', 'right', 'bottom']}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContentContainer}
          bounces={false}
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

        <SpaceHeight fill size={'lg'} />

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
  const {palette: p} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: p.bg_color_max,
      ...a.flex_1,
    },
    safeAreaView: {
      ...a.flex_1,
      ...a.pt_lg,
      ...a.pb_lg,
    },
    scrollContentContainer: {
      ...a.px_lg,
    },
    actions: {
      backgroundColor: p.bg_color_max,
      ...a.pt_lg,
      ...a.px_lg,
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
    nameAlreadyTaken: intl.formatMessage(
      globalMessages.walletNameErrorNameAlreadyTaken,
    ),
    mustBeFilled: intl.formatMessage(
      globalMessages.walletNameErrorMustBeFilled,
    ),
  }
}
