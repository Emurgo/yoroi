// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View, ScrollView} from 'react-native'
import {withHandlers, withStateHandlers} from 'recompose'

import {Button, Text, Checkbox, ValidatedTextInput, StatusBar} from '../UiKit'
import {withNavigationTitle} from '../../utils/renderUtils'
import {WALLET_INIT_ROUTES} from '../../RoutesList'
import {walletNameSelector} from '../../selectors'
import {removeCurrentWallet} from '../../actions'
import {ignoreConcurrentAsyncHandler} from '../../utils/utils'

import styles from './styles/RemoveWalletScreen.style'

import type {State} from '../../state'
import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state: State) => state.trans.RemoveWalletScreen

const handleRemoveWallet = ({navigation, removeCurrentWallet}) => async () => {
  await removeCurrentWallet()
  navigation.navigate(WALLET_INIT_ROUTES.WALLET_SELECTION)
}

type Prop = {
  translations: SubTranslation<typeof getTranslations>,
  walletName: string,
  typedWalletName: string,
  setTypedWalletName: (string) => mixed,
  isRemovingWallet: boolean,
  handleRemoveWallet: () => void,
  setHasMnemonicWrittenDown: (boolean) => mixed,
  hasMnemonicWrittenDown: boolean,
}

const RemoveWalletScreen = ({
  translations,
  walletName,
  isRemovingWallet,
  handleRemoveWallet,
  hasMnemonicWrittenDown,
  setHasMnemonicWrittenDown,
  typedWalletName,
  setTypedWalletName,
}: Prop) => {
  const disabled =
    isRemovingWallet ||
    !hasMnemonicWrittenDown ||
    walletName !== typedWalletName

  return (
    <View style={styles.container}>
      <StatusBar type="dark" />

      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          {translations.description.paragraph1}
        </Text>
        <Text style={styles.description}>
          {translations.description.paragraph2}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.screenContainer}
        keyboardDismissMode="on-drag"
      >
        <View style={styles.walletInfo}>
          <Text style={styles.walletNameLabel}>{translations.walletName}</Text>
          <Text style={styles.walletName}>{walletName}</Text>

          <ValidatedTextInput
            label={translations.walletNameInput}
            value={typedWalletName}
            onChangeText={setTypedWalletName}
          />
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Checkbox
          checked={hasMnemonicWrittenDown}
          text={translations.hasWrittenDownMnemonic}
          onChange={setHasMnemonicWrittenDown}
        />

        <Button
          onPress={handleRemoveWallet}
          title={translations.remove}
          style={styles.removeButton}
          disabled={disabled}
        />
      </View>
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
  withStateHandlers(
    {
      hasMnemonicWrittenDown: false,
      typedWalletName: '',
    },
    {
      setHasMnemonicWrittenDown: (state) => (value) => ({
        hasMnemonicWrittenDown: value,
      }),
      setTypedWalletName: (state) => (value) => ({typedWalletName: value}),
    },
  ),
  withHandlers({
    handleRemoveWallet: ignoreConcurrentAsyncHandler(handleRemoveWallet, 1000),
  }),
)(RemoveWalletScreen)
