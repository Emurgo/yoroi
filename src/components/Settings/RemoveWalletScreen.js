// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Alert, View, TextInput} from 'react-native'
import {withHandlers, withState} from 'recompose'
import {NavigationEvents} from 'react-navigation'

import {Button, Text} from '../UiKit'
import {withNavigationTitle} from '../../utils/renderUtils'
import {ROOT_ROUTES} from '../../RoutesList'
import {walletNameSelector} from '../../selectors'
import {removeCurrentWallet} from '../../actions'

import styles from './styles/RemoveWalletScreen.style'

import type {State} from '../../state'
import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state: State) => state.trans.RemoveWalletScreen

// TODO actually implement password verification
const verifyPassword = ({password}) => true

const handleRemoveWallet = ({
  translations,
  navigation,
  password,
  isRemovingWallet,
  setIsRemovingWallet,
  removeCurrentWallet,
}) => async (event) => {
  if (isRemovingWallet) {
    return
  }

  const dialogTranslations = translations.ErrorDialogs

  setIsRemovingWallet(true)

  if (!verifyPassword(password)) {
    setIsRemovingWallet(false)
    Alert.alert(
      dialogTranslations.VerificationError.title,
      dialogTranslations.VerificationError.text,
      [{text: dialogTranslations.okButton}],
    )
    return
  }

  try {
    await removeCurrentWallet()
    navigation.navigate(ROOT_ROUTES.WALLET_SELECTION)
  } catch (err) {
    setIsRemovingWallet(false)
    Alert.alert(
      dialogTranslations.WalletRemovalError.title,
      dialogTranslations.WalletRemovalError.text,
      [{text: dialogTranslations.okButton}],
    )
  }
}

const handleOnDidBlur = ({setPassword, setIsRemovingWallet}) => () => {
  setPassword('')
  setIsRemovingWallet(false)
}

type Prop = {
  translations: SubTranslation<typeof getTranslations>,
  walletName: string,
  password: string,
  isRemovingWallet: boolean,
  setPassword: (string) => mixed,
  handleOnDidBlur: () => void,
  handleRemoveWallet: () => void,
}

const RemoveWalletScreen = ({
  translations,
  walletName,
  password,
  isRemovingWallet,
  setPassword,
  handleOnDidBlur,
  handleRemoveWallet,
}: Prop) => {
  const disabled = isRemovingWallet || !password
  return (
    <View style={styles.container}>
      <NavigationEvents onDidBlur={handleOnDidBlur} />
      <Text style={styles.description}>{translations.description}</Text>
      <View style={styles.wallet}>
        <Text>{translations.walletName}</Text>
        <Text>{walletName}</Text>
        <Text>{translations.password}</Text>
        <TextInput
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.password}
        />
      </View>
      <Button
        onPress={handleRemoveWallet}
        title={translations.remove}
        style={styles.removeButton}
        disabled={disabled}
      />
    </View>
  )
}

export default compose(
  connect(
    (state: State) => ({
      translations: getTranslations(state),
      walletName: walletNameSelector(state),
    }),
    {
      removeCurrentWallet,
    },
  ),
  withNavigationTitle(({translations}) => translations.title),
  withState('password', 'setPassword', ''),
  withState('isRemovingWallet', 'setIsRemovingWallet', false),
  withHandlers({
    handleOnDidBlur,
    handleRemoveWallet,
  }),
)(RemoveWalletScreen)
