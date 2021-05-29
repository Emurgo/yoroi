// @flow
import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {connect} from 'react-redux'
import {ScrollView, StyleSheet, Switch} from 'react-native'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import {ignoreConcurrentAsyncHandler} from '../../utils/utils'
import {confirmationMessages} from '../../i18n/global-messages'

import {
  closeWallet,
  logout,
  showConfirmationDialog,
  DIALOG_BUTTONS,
} from '../../actions'
import {WALLET_ROOT_ROUTES, SETTINGS_ROUTES} from '../../RoutesList'
import {withNavigationTitle} from '../../utils/renderUtils'
import {
  isSystemAuthEnabledSelector,
  easyConfirmationSelector,
  walletNameSelector,
  languageSelector,
  isHWSelector,
  isReadOnlySelector,
  walletMetaSelector,
} from '../../selectors'
import {
  SettingsItem,
  SettingsBuildItem,
  NavigatedSettingsItem,
  SettingsSection,
  PressableSettingsItem,
} from './SettingsItems'
import {StatusBar} from '../UiKit'
import {isByron, isHaskellShelley} from '../../config/config'
import {getNetworkConfigById} from '../../config/networks'

import type {Navigation} from '../../types/navigation'
import type {ComponentType} from 'react'
import type {NetworkId, WalletImplementationId} from '../../config/types'
import type {MessageDescriptor} from 'react-intl'

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
  // note: moved here from application settings
  network: {
    id: 'components.settings.applicationsettingsscreen.network',
    defaultMessage: '!!!Network:',
  },
  walletType: {
    id: 'components.settings.walletsettingscreen.walletType',
    defaultMessage: '!!!Wallet type:',
  },
  byronWallet: {
    id: 'components.settings.walletsettingscreen.byronWallet',
    defaultMessage: '!!!Byron-era wallet',
  },
  shelleyWallet: {
    id: 'components.settings.walletsettingscreen.shelleyWallet',
    defaultMessage: '!!!Shelley-era wallet',
  },
})

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#fff',
  },
})

const _getNetworkName = (networkId: NetworkId) => {
  // note(v-almonacid): this throws when switching wallet
  try {
    const config = getNetworkConfigById(networkId)
    return config.MARKETING_NAME
  } catch (_e) {
    return '-'
  }
}

const _getWalletType = (implId: WalletImplementationId): ?MessageDescriptor => {
  if (isByron(implId)) return messages.byronWallet
  else if (isHaskellShelley(implId)) return messages.shelleyWallet
  else return null
}

type Props = {intl: IntlShape}  & Object /* TODO: type */ 

const WalletSettingsScreen = ({
  onToggleEasyConfirmation,
  isEasyConfirmationEnabled,
  isSystemAuthEnabled,
  intl,
  walletName,
  onSwitchWallet,
  onLogout,
  isHW,
  isReadOnly,
  walletMeta,
}: Props) => (
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
        disabled={isHW || isReadOnly}
      />

      <SettingsItem
        label={intl.formatMessage(messages.easyConfirmation)}
        disabled={!isSystemAuthEnabled || isHW || isReadOnly}
      >
        <Switch
          value={isEasyConfirmationEnabled}
          onValueChange={onToggleEasyConfirmation}
          disabled={!isSystemAuthEnabled || isHW || isReadOnly}
        />
      </SettingsItem>
    </SettingsSection>

    <SettingsSection>
      <NavigatedSettingsItem
        label={intl.formatMessage(messages.removeWallet)}
        navigateTo={SETTINGS_ROUTES.REMOVE_WALLET}
      />
    </SettingsSection>

    <SettingsSection title="About">
      <SettingsBuildItem
        label={intl.formatMessage(messages.network)}
        value={_getNetworkName(walletMeta.networkId)}
      />
      {_getWalletType(walletMeta.walletImplementationId) != null && (
        <SettingsBuildItem
          label={intl.formatMessage(messages.walletType)}
          value={intl.formatMessage(
            _getWalletType(walletMeta.walletImplementationId),
          )}
        />
      )}
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
    withNavigationTitle(({intl}: {intl: IntlShape}) =>
      intl.formatMessage(messages.title),
    ),
    withNavigationTitle(
      ({intl}: {intl: IntlShape}) => intl.formatMessage(messages.tabTitle),
      'walletTabTitle',
    ),
    connect(
      (state) => ({
        walletName: walletNameSelector(state),
        isHW: isHWSelector(state),
        isReadOnly: isReadOnlySelector(state),
        walletMeta: walletMetaSelector(state),
      }),
      {
        closeWallet,
        logout,
      },
    ),
    withHandlers({
      onToggleEasyConfirmation: ({navigation}) => () => {
        navigation.navigate(SETTINGS_ROUTES.EASY_COMFIRMATION)
      },
    }),
    withHandlers({
      onSwitchWallet: ignoreConcurrentAsyncHandler(
        ({navigation, closeWallet}) => async () => {
          await closeWallet()
          navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)
        },
        1000,
      ),
      onLogout: ignoreConcurrentAsyncHandler(
        ({logout, intl}: {intl: IntlShape, logout: any}) => async () => {
          const selection = await showConfirmationDialog(
            // $FlowFixMe
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
    intl: IntlShape,
  |}>),
)
