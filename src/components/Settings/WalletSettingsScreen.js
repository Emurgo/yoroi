// @flow
import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {connect} from 'react-redux'
import {ScrollView, StyleSheet, Switch} from 'react-native'

import {ignoreConcurrentAsyncHandler} from '../../utils/utils'

import {closeWallet} from '../../actions'
import {WALLET_INIT_ROUTES, SETTINGS_ROUTES} from '../../RoutesList'
import {withNavigationTitle, withTranslations} from '../../utils/renderUtils'
import {
  systemAuthSupportSelector,
  easyConfirmationSelector,
  walletNameSelector,
} from '../../selectors'
import {
  SettingsItem,
  NavigatedSettingsItem,
  SettingsSection,
  PressableSettingsItem,
} from './SettingsItems'

import type {Navigation} from '../../types/navigation'
import type {ComponentType} from 'react'

const getTranslations = (state) => state.trans.SettingsScreen.WalletTab

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#fff',
  },
})

const WalletSettingsScreen = ({
  onToggleEasyConfirmation,
  isEasyConfirmationEnabled,
  isSystemAuthEnabled,
  translations,
  walletName,
  onSwitchWallet,
}) => (
  <ScrollView style={styles.scrollView}>
    <SettingsSection title={translations.switchWallet}>
      <PressableSettingsItem
        label={translations.switchWallet}
        onPress={onSwitchWallet}
        navigateTo={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
      />
    </SettingsSection>

    <SettingsSection title={translations.walletName}>
      <NavigatedSettingsItem
        label={walletName}
        navigateTo={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
      />
    </SettingsSection>

    <SettingsSection title={translations.privacy}>
      <NavigatedSettingsItem
        label={translations.changePassword}
        navigateTo={SETTINGS_ROUTES.CHANGE_PASSWORD}
      />

      <SettingsItem
        label={translations.easyConfirmation}
        disabled={!isSystemAuthEnabled}
      >
        <Switch
          value={isEasyConfirmationEnabled}
          onValueChange={onToggleEasyConfirmation}
          disabled={!isSystemAuthEnabled}
        />
      </SettingsItem>
    </SettingsSection>

    <SettingsSection>
      <NavigatedSettingsItem
        label={translations.removeWallet}
        navigateTo={SETTINGS_ROUTES.REMOVE_WALLET}
      />
    </SettingsSection>
  </ScrollView>
)

export default (compose(
  connect((state) => ({
    isSystemAuthEnabled: systemAuthSupportSelector(state),
    isEasyConfirmationEnabled: easyConfirmationSelector(state),
  })),
  withTranslations(getTranslations),
  withNavigationTitle(({translations}) => translations.title),
  withNavigationTitle(
    ({translations}) => translations.tabTitle,
    'walletTabTitle',
  ),
  connect(
    (state) => ({
      walletName: walletNameSelector(state),
    }),
    {
      closeWallet,
    },
  ),
  withHandlers({
    onToggleEasyConfirmation: ({isEasyConfirmationEnabled, navigation}) => () =>
      navigation.navigate(SETTINGS_ROUTES.EASY_COMFIRMATION),
  }),
  withHandlers({
    onSwitchWallet: ignoreConcurrentAsyncHandler(
      ({navigation, closeWallet}) => async () => {
        await closeWallet()
        navigation.navigate(WALLET_INIT_ROUTES.WALLET_SELECTION)
      },
      1000,
    ),
  }),
)(WalletSettingsScreen): ComponentType<{|navigation: Navigation|}>)
