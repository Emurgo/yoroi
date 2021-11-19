import {useNavigation} from '@react-navigation/native'
import React from 'react'
import type {MessageDescriptor} from 'react-intl'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, Switch} from 'react-native'
import {useDispatch, useSelector} from 'react-redux'

import {DIALOG_BUTTONS, logout, showConfirmationDialog, updateWallets} from '../../legacy/actions'
import VotingBanner from '../../legacy/components/Catalyst/VotingBanner'
import {
  NavigatedSettingsItem,
  PressableSettingsItem,
  SettingsBuildItem,
  SettingsItem,
  SettingsSection,
} from '../../legacy/components/Settings/SettingsItems'
import {StatusBar} from '../../legacy/components/UiKit'
import {isByron, isHaskellShelley} from '../../legacy/config/config'
import {getNetworkConfigById} from '../../legacy/config/networks'
import type {NetworkId, WalletImplementationId} from '../../legacy/config/types'
import walletManager from '../../legacy/crypto/walletManager'
import {confirmationMessages} from '../../legacy/i18n/global-messages'
import {CATALYST_ROUTES, SETTINGS_ROUTES, WALLET_ROOT_ROUTES} from '../../legacy/RoutesList'
import {
  easyConfirmationSelector,
  isHWSelector,
  isReadOnlySelector,
  isSystemAuthEnabledSelector,
  walletMetaSelector,
  walletNameSelector,
} from '../../legacy/selectors'
import {ignoreConcurrentAsyncHandler} from '../../legacy/utils/utils'

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

export const WalletSettingsScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
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

  const [pending, setPending] = React.useState(false)
  const onSwitchWallet = async () => {
    setPending(true)
    navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)
    await walletManager.closeWallet()
    dispatch(updateWallets())
  }

  const onToggleEasyConfirmation = () => {
    navigation.navigate(SETTINGS_ROUTES.EASY_CONFIRMATION)
  }

  return (
    <ScrollView bounces={false} style={styles.scrollView}>
      <StatusBar type="dark" />

      <SettingsSection>
        <PressableSettingsItem label={strings.switchWallet} onPress={onSwitchWallet} disabled={pending} />
        <PressableSettingsItem label={strings.logout} onPress={onLogout} />
      </SettingsSection>

      <SettingsSection title={strings.walletName}>
        <NavigatedSettingsItem label={walletName} navigateTo={SETTINGS_ROUTES.CHANGE_WALLET_NAME} />
      </SettingsSection>

      <SettingsSection title={strings.security}>
        <NavigatedSettingsItem
          label={strings.changePassword}
          navigateTo={SETTINGS_ROUTES.CHANGE_PASSWORD}
          disabled={isHW || isReadOnly}
        />

        <SettingsItem label={strings.easyConfirmation} disabled={!isSystemAuthEnabled || isHW || isReadOnly}>
          <Switch
            value={isEasyConfirmationEnabled}
            onValueChange={onToggleEasyConfirmation}
            disabled={!isSystemAuthEnabled || isHW || isReadOnly}
          />
        </SettingsItem>
      </SettingsSection>

      <SettingsSection>
        <NavigatedSettingsItem label={strings.removeWallet} navigateTo={SETTINGS_ROUTES.REMOVE_WALLET} />
      </SettingsSection>

      <SettingsSection title={strings.about}>
        <SettingsBuildItem label={strings.network} value={getNetworkName(walletMeta.networkId)} />

        <SettingsBuildItem
          label={strings.walletType}
          value={intl.formatMessage(getWalletType(walletMeta.walletImplementationId))}
        />
      </SettingsSection>

      <SettingsSection>
        <VotingBanner
          onPress={() => {
            navigation.navigate(CATALYST_ROUTES.ROOT)
          }}
          disabled={false}
        />
      </SettingsSection>
    </ScrollView>
  )
}

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

const useStrings = () => {
  const intl = useIntl()

  return {
    switchWallet: intl.formatMessage(messages.switchWallet),
    logout: intl.formatMessage(messages.logout),
    walletName: intl.formatMessage(messages.walletName),
    security: intl.formatMessage(messages.security),
    changePassword: intl.formatMessage(messages.changePassword),
    easyConfirmation: intl.formatMessage(messages.easyConfirmation),
    removeWallet: intl.formatMessage(messages.removeWallet),
    network: intl.formatMessage(messages.network),
    walletType: intl.formatMessage(messages.walletType),
    byronWallet: intl.formatMessage(messages.byronWallet),
    shelleyWallet: intl.formatMessage(messages.shelleyWallet),
    unknownWalletType: intl.formatMessage(messages.unknownWalletType),
    about: intl.formatMessage(messages.about),
  }
}
