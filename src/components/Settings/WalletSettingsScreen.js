// @flow
import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {connect} from 'react-redux'
import {ScrollView, StyleSheet, Switch} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {ignoreConcurrentAsyncHandler} from '../../utils/utils'
import {confirmationMessages} from '../../i18n/global-messages'

import {
  closeWallet,
  logout,
  showConfirmationDialog,
  DIALOG_BUTTONS,
} from '../../actions'
import {WALLET_INIT_ROUTES, SETTINGS_ROUTES} from '../../RoutesList'
import {withNavigationTitle} from '../../utils/renderUtils'
import {
  isSystemAuthEnabledSelector,
  easyConfirmationSelector,
  walletNameSelector,
  languageSelector,
  isHWSelector,
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

const messages = defineMessages({
  title: {
    id: 'components.settings.walletsettingscreen.title',
    defaultMessage: 'Settings',
  },
  tabTitle: {
    id: 'components.settings.walletsettingscreen.tabTitle',
    defaultMessage: 'Wallet',
  },
  switchWallet: {
    id: 'components.settings.walletsettingscreen.switchWallet',
    defaultMessage: 'Switch wallet',
  },
  logout: {
    id: 'components.settings.walletsettingscreen.logout',
    defaultMessage: 'Logout',
    description: 'some desc',
  },
  walletName: {
    id: 'components.settings.walletsettingscreen.walletName',
    defaultMessage: 'Wallet name',
    description: 'some desc',
  },
  security: {
    id: 'components.settings.walletsettingscreen.security',
    defaultMessage: 'Security',
    description: 'some desc',
  },
  changePassword: {
    id: 'components.settings.walletsettingscreen.changePassword',
    defaultMessage: 'Change password',
    description: 'some desc',
  },
  easyConfirmation: {
    id: 'components.settings.walletsettingscreen.easyConfirmation',
    defaultMessage: '!!!Easy transaction confirmation',
    description: 'some desc',
  },
  removeWallet: {
    id: 'components.settings.walletsettingscreen.removeWallet',
    defaultMessage: '!!!Remove wallet',
  },
})

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#fff',
  },
})

const WalletSettingsScreen = ({
  onToggleEasyConfirmation,
  isEasyConfirmationEnabled,
  isSystemAuthEnabled,
  intl,
  walletName,
  onSwitchWallet,
  onLogout,
  isHW,
}) => (
  <ScrollView style={styles.scrollView}>
    <StatusBar type="dark" />

    <SettingsSection>
      <PressableSettingsItem
        label={intl.formatMessage(messages.switchWallet)}
        onPress={onSwitchWallet}
      />

      <PressableSettingsItem
        label={intl.formatMessage(messages.logout)}
        onPress={onLogout}
      />
    </SettingsSection>

    <SettingsSection title={intl.formatMessage(messages.walletName)}>
      <NavigatedSettingsItem
        label={walletName}
        navigateTo={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
      />
    </SettingsSection>

    <SettingsSection title={intl.formatMessage(messages.security)}>
      <NavigatedSettingsItem
        label={intl.formatMessage(messages.changePassword)}
        navigateTo={SETTINGS_ROUTES.CHANGE_PASSWORD}
        disabled={isHW}
      />

      <SettingsItem
        label={intl.formatMessage(messages.easyConfirmation)}
        disabled={!isSystemAuthEnabled || isHW}
      >
        <Switch
          value={isEasyConfirmationEnabled}
          onValueChange={onToggleEasyConfirmation}
          disabled={!isSystemAuthEnabled || isHW}
        />
      </SettingsItem>
    </SettingsSection>

    <SettingsSection>
      <NavigatedSettingsItem
        label={intl.formatMessage(messages.removeWallet)}
        navigateTo={SETTINGS_ROUTES.REMOVE_WALLET}
      />
    </SettingsSection>
  </ScrollView>
)

export default injectIntl(
  (compose(
    connect((state) => ({
      isSystemAuthEnabled: isSystemAuthEnabledSelector(state),
      isEasyConfirmationEnabled: easyConfirmationSelector(state),
      key: languageSelector(state),
    })),
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withNavigationTitle(
      ({intl}) => intl.formatMessage(messages.tabTitle),
      'walletTabTitle',
    ),
    connect(
      (state) => ({
        walletName: walletNameSelector(state),
        isHW: isHWSelector(state),
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
        ({logout, intl}) => async () => {
          const selection = await showConfirmationDialog(
            confirmationMessages.logout,
            intl,
          )

          if (selection === DIALOG_BUTTONS.YES) {
            await logout()
          }
        },
        500,
      ),
    }),
  )(WalletSettingsScreen): ComponentType<{|
    navigation: Navigation,
    intl: intlShape,
  |}>),
)
