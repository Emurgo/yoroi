import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useMutation} from 'react-query'
import {useDispatch, useSelector} from 'react-redux'

import {updateWallets} from '../../../legacy/actions'
import {Button, TextInput} from '../../../legacy/components/UiKit'
import walletManager from '../../../legacy/crypto/walletManager'
import globalMessages from '../../../legacy/i18n/global-messages'
import {walletNamesSelector} from '../../../legacy/selectors'
import {COLORS} from '../../../legacy/styles/config'
import {getWalletNameError, validateWalletName} from '../../../legacy/utils/validators'
import {useSelectedWalletMeta} from '../../SelectedWallet'

export const ChangeWalletName = () => {
  const strings = useStrings()
  const walletMeta = useSelectedWalletMeta()
  const walletNames = useSelector(walletNamesSelector)
  const [newWalletName, setNewWalletName] = React.useState(walletMeta?.name || '')
  const validationErrors = validateWalletName(newWalletName, walletMeta?.name, walletNames)
  const hasErrors = Object.keys(validationErrors).length > 0
  const errorText =
    getWalletNameError(
      {
        tooLong: strings.tooLong,
        nameAlreadyTaken: strings.nameAlreadyTaken,
        mustBeFilled: strings.mustBeFilled,
      },
      validationErrors,
    ) || undefined

  const navigation = useNavigation()
  const {renameWallet, isLoading} = useChangeWalletName({onSuccess: () => navigation.goBack()})

  return (
    <SafeAreaView style={styles.safeAreaView} edges={['left', 'right', 'bottom']}>
      <ScrollView
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps={'always'}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <WalletNameInput
          returnKeyType={'done'}
          errorDelay={0}
          enablesReturnKeyAutomatically
          autoFocus
          label={strings.walletNameInputLabel}
          value={newWalletName}
          onChangeText={setNewWalletName}
          errorText={errorText}
        />
      </ScrollView>

      <View style={styles.action}>
        <Button
          onPress={() => {
            if (hasErrors || !newWalletName) return
            renameWallet(newWalletName)
          }}
          title={strings.changeButton}
          disabled={hasErrors || isLoading}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: COLORS.BACKGROUND,
    flex: 1,
  },
  scrollContentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  action: {
    padding: 16,
    backgroundColor: COLORS.BACKGROUND,
  },
})

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

const useChangeWalletName = (options) => {
  const dispatch = useDispatch()
  const mutation = useMutation<void, Error, string>((newName) => walletManager.rename(newName), options)

  return {
    renameWallet: React.useCallback(
      (newName: string) => mutation.mutate(newName, {onSuccess: () => dispatch(updateWallets())}),
      [dispatch, mutation],
    ),
    ...mutation,
  }
}
