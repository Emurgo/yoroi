// @flow

import React from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {ScrollView, StyleSheet, Switch} from 'react-native'
import {useIntl, defineMessages} from 'react-intl'
import {useNavigation} from '@react-navigation/native'

import {ignoreConcurrentAsyncHandler} from '../../utils/utils'
import {confirmationMessages} from '../../i18n/global-messages'

import {closeWallet, logout, showConfirmationDialog, DIALOG_BUTTONS} from '../../actions'
import {WALLET_ROOT_ROUTES, SETTINGS_ROUTES} from '../../RoutesList'
import {
  isSystemAuthEnabledSelector,
  easyConfirmationSelector,
  walletNameSelector,
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

import type {NetworkId, WalletImplementationId} from '../../config/types'
import type {MessageDescriptor} from 'react-intl'

const messages = defineMessages({
  switchWallet: {
    id: 'components.settings.walletsettingscreen.switchWallet',
    defaultMessage: '!!!Switch wallet',
  },
  logout: {
    id: 'components.settings.walletsettingscreen.logout',
    defaultMessage: '!!!Logout',
  },
  walletName: {
    id: 'components.settings.walletsettingscreen.walletName',
    defaultMessage: '!!!Wallet name',
  },
  security: {
    id: 'components.settings.walletsettingscreen.security',
    defaultMessage: '!!!Security',
  },
  changePassword: {
    id: 'components.settings.walletsettingscreen.changePassword',
    defaultMessage: '!!!Change password',
  },
  easyConfirmation: {
    id: 'components.settings.walletsettingscreen.easyConfirmation',
    defaultMessage: '!!!Easy transaction confirmation',
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
  unknownWalletType: {
    id: 'components.settings.walletsettingscreen.unknownWalletType',
    defaultMessage: '!!!Unknown Wallet Type',
  },
  about: {
    id: 'components.settings.walletsettingscreen.about',
    defaultMessage: '!!!About',
  },
})

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#fff',
  },
})

const getNetworkName = (networkId: NetworkId) => {
  // note(v-almonacid): this throws when switching wallet
  try {
    const config = getNetworkConfigById(networkId)
    return config.MARKETING_NAME
  } catch (_e) {
    return '-'
  }
}

const getWalletType = (implementationId: WalletImplementationId): MessageDescriptor => {
  if (isByron(implementationId)) return messages.byronWallet
  if (isHaskellShelley(implementationId)) return messages.shelleyWallet

  return messages.unknownWalletType
}

const WalletSettingsScreen = () => {
  const intl = useIntl()
  const navigation = useNavigation()
  const isSystemAuthEnabled = useSelector(isSystemAuthEnabledSelector)
  const isEasyConfirmationEnabled = useSelector(easyConfirmationSelector)
  const walletName = useSelector(walletNameSelector)
  const isHW = useSelector(isHWSelector)
  const isReadOnly = useSelector(isReadOnlySelector)
  const walletMeta = useSelector(walletMetaSelector)

  const dispatch = useDispatch()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onLogout = React.useCallback(
    ignoreConcurrentAsyncHandler(
      () => async () => {
        const selection = await showConfirmationDialog(
          // $FlowFixMe
          confirmationMessages.logout,
          intl,
        )

        if (selection === DIALOG_BUTTONS.YES) {
          await dispatch(logout())
        }
      },
      500,
    )(),
    [],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSwitchWallet = React.useCallback(
    ignoreConcurrentAsyncHandler(
      () => async () => {
        await dispatch(closeWallet())
        navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)
      },
      1000,
    )(),
    [navigation],
  )

  const onToggleEasyConfirmation = () => {
    navigation.navigate(SETTINGS_ROUTES.EASY_CONFIRMATION)
  }

  return (
    <ScrollView bounces={false} style={styles.scrollView}>
      <StatusBar type="dark" />

      <SettingsSection>
        <PressableSettingsItem label={intl.formatMessage(messages.switchWallet)} onPress={onSwitchWallet} />
        <PressableSettingsItem label={intl.formatMessage(messages.logout)} onPress={onLogout} />
      </SettingsSection>

      <SettingsSection title={intl.formatMessage(messages.walletName)}>
        <NavigatedSettingsItem label={walletName} navigateTo={SETTINGS_ROUTES.CHANGE_WALLET_NAME} />
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

      <SettingsSection title={intl.formatMessage(messages.about)}>
        <SettingsBuildItem label={intl.formatMessage(messages.network)} value={getNetworkName(walletMeta.networkId)} />

        <SettingsBuildItem
          label={intl.formatMessage(messages.walletType)}
          value={intl.formatMessage(getWalletType(walletMeta.walletImplementationId))}
        />
      </SettingsSection>
    </ScrollView>
  )
}

export default WalletSettingsScreen
