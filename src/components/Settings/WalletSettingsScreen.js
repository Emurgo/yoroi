// @flow
import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {connect} from 'react-redux'
import {ScrollView, StyleSheet, Switch} from 'react-native'

import {ignoreConcurrentAsyncHandler} from '../../utils/utils'

import {
  closeWallet,
  logout,
  showConfirmationDialog,
  DIALOG_BUTTONS,
} from '../../actions'
import {WALLET_INIT_ROUTES, SETTINGS_ROUTES} from '../../RoutesList'
import {withNavigationTitle, withTranslations} from '../../utils/renderUtils'
import {
  isSystemAuthEnabledSelector,
  easyConfirmationSelector,
  walletNameSelector,
} from '../../selectors'
import {
  SettingsItem,
  NavigatedSettingsItem,
  SettingsSection,
  PressableSettingsItem,
} from './SettingsItems'
import {StatusBar} from '../UiKit'

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
  onLogout,
}) => (
  <ScrollView style={styles.scrollView}>
    <StatusBar type="dark" />

    <SettingsSection>
      <PressableSettingsItem
        label={translations.switchWallet}
        onPress={onSwitchWallet}
      />

      <PressableSettingsItem label={translations.logout} onPress={onLogout} />
    </SettingsSection>

    <SettingsSection title={translations.walletName}>
      <NavigatedSettingsItem
        label={walletName}
        navigateTo={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
      />
    </SettingsSection>

    <SettingsSection title={translations.security}>
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
    isSystemAuthEnabled: isSystemAuthEnabledSelector(state),
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
      logout,
    },
  ),
  withHandlers({
    onToggleEasyConfirmation: ({
      isEasyConfirmationEnabled,
      navigation,
    }) => () => {
      navigation.navigate(SETTINGS_ROUTES.EASY_COMFIRMATION)
    },
  }),
  withHandlers({
    onSwitchWallet: ignoreConcurrentAsyncHandler(
      ({navigation, closeWallet}) => async () => {
        await closeWallet()
        navigation.navigate(WALLET_INIT_ROUTES.WALLET_SELECTION)
      },
      1000,
    ),
    onLogout: ignoreConcurrentAsyncHandler(
      ({logout}) => async () => {
        const selection = await showConfirmationDialog(
          (dialogs) => dialogs.logout,
        )

        if (selection === DIALOG_BUTTONS.YES) {
          await logout()
        }
      },
      500,
    ),
  }),
)(WalletSettingsScreen): ComponentType<{|navigation: Navigation|}>)
