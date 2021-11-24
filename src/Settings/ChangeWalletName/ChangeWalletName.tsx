import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {changeWalletName} from '../../../legacy/actions'
import {Button, TextInput} from '../../../legacy/components/UiKit'
import globalMessages from '../../../legacy/i18n/global-messages'
import {walletNameSelector, walletNamesSelector} from '../../../legacy/selectors'
import {COLORS} from '../../../legacy/styles/config'
import {getWalletNameError, validateWalletName} from '../../../legacy/utils/validators'

export const ChangeWalletName = () => {
  const strings = useStrings()
  const navigation = useNavigation()
  const oldWalletName = useSelector(walletNameSelector)
  const walletNames = useSelector(walletNamesSelector)
  const [newWalletName, setNewWalletName] = React.useState(oldWalletName)
  const validationErrors = validateWalletName(newWalletName, oldWalletName, walletNames)
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

  const dispatch = useDispatch()
  const changeAndNavigate = async () => {
    if (hasErrors) return

    await dispatch(changeWalletName(newWalletName))
    navigation.goBack()
  }

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
        <Button onPress={changeAndNavigate} title={strings.changeButton} disabled={hasErrors} />
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
