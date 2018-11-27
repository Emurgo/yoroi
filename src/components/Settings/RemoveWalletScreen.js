// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'
import {withHandlers, withState} from 'recompose'
import {NavigationEvents} from 'react-navigation'

import {Button, Text, ValidatedTextInput} from '../UiKit'
import {withNavigationTitle} from '../../utils/renderUtils'
import {ROOT_ROUTES} from '../../RoutesList'
import {walletNameSelector} from '../../selectors'
import {removeCurrentWallet, showErrorDialog} from '../../actions'
import {ignoreConcurrentAsyncHandler} from '../../utils/utils'

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
  removeCurrentWallet,
}) => async (event) => {
  if (!verifyPassword(password)) {
    await showErrorDialog((dialogs) => dialogs.incorrectPassword)

    return
  }

  try {
    await removeCurrentWallet()

    navigation.navigate(ROOT_ROUTES.WALLET_SELECTION)
  } catch (err) {
    await showErrorDialog((dialogs) => dialogs.general)
  }
}

const handleOnDidBlur = ({setPassword}) => () => {
  setPassword('')
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
        <ValidatedTextInput
          secureTextEntry
          label={translations.password}
          value={password}
          onChange={setPassword}
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
  withHandlers({
    handleOnDidBlur,
    handleRemoveWallet: ignoreConcurrentAsyncHandler(handleRemoveWallet, 1000),
  }),
)(RemoveWalletScreen)
