import React from 'react'
import type {MessageDescriptor} from 'react-intl'
import {defineMessages, useIntl} from 'react-intl'
import {InteractionManager, ScrollView, StyleSheet, Switch} from 'react-native'

import {useAuth} from '../../../auth/AuthProvider'
import {StatusBar} from '../../../components'
import {DIALOG_BUTTONS, showConfirmationDialog} from '../../../dialogs'
import {confirmationMessages} from '../../../i18n/global-messages'
import {
  NavigatedSettingsItem,
  PressableSettingsItem,
  SettingsBuildItem,
  SettingsItem,
  SettingsSection,
} from '../../../legacy/SettingItems'
import {useWalletNavigation} from '../../../navigation'
import {useSelectedWallet, useSetSelectedWallet, useSetSelectedWalletMeta} from '../../../SelectedWallet'
import {useAuthSetting} from '../../../yoroi-wallets/auth'
import {getNetworkConfigById} from '../../../yoroi-wallets/cardano/networks'
import {isByron, isHaskellShelley} from '../../../yoroi-wallets/cardano/utils'
import {useEasyConfirmationEnabled, useResync, useWalletName} from '../../../yoroi-wallets/hooks'
import {NetworkId, WalletImplementationId} from '../../../yoroi-wallets/types'

export const WalletSettingsScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
  const {navigation, resetToWalletSelection} = useWalletNavigation()
  const wallet = useSelectedWallet()
  const walletName = useWalletName(wallet)
  const easyConfirmationEnabled = useEasyConfirmationEnabled(wallet)
  const authSetting = useAuthSetting()

  const onSwitchWallet = () => {
    resetToWalletSelection()
  }

  const onEnableEasyConfirmation = () => {
    navigation.navigate('app-root', {
      screen: 'settings',
      params: {
        screen: 'enable-easy-confirmation',
      },
    })
  }

  const onDisableEasyConfirmation = () => {
    navigation.navigate('app-root', {
      screen: 'settings',
      params: {
        screen: 'disable-easy-confirmation',
      },
    })
  }

  return (
    <ScrollView bounces={false} style={styles.scrollView}>
      <StatusBar type="dark" />

      <SettingsSection>
        <PressableSettingsItem label={strings.switchWallet} onPress={onSwitchWallet} />

        <LogoutButton />
      </SettingsSection>

      <SettingsSection title={strings.walletName}>
        <NavigatedSettingsItem label={walletName ?? ''} navigateTo="change-wallet-name" />
      </SettingsSection>

      <SettingsSection title={strings.security}>
        <NavigatedSettingsItem
          label={strings.changePassword}
          navigateTo="change-password"
          disabled={wallet.isHW || wallet.isReadOnly}
        />

        <SettingsItem
          label={strings.easyConfirmation}
          disabled={authSetting === 'pin' || wallet.isHW || wallet.isReadOnly}
        >
          <Switch
            value={easyConfirmationEnabled}
            onValueChange={easyConfirmationEnabled ? onDisableEasyConfirmation : onEnableEasyConfirmation}
            disabled={authSetting === 'pin' || wallet.isHW || wallet.isReadOnly}
          />
        </SettingsItem>
      </SettingsSection>

      <SettingsSection>
        <NavigatedSettingsItem label={strings.removeWallet} navigateTo="remove-wallet" />

        <ResyncButton />
      </SettingsSection>

      <SettingsSection title={strings.about}>
        <SettingsBuildItem label={strings.network} value={getNetworkName(wallet.networkId)} />

        <SettingsBuildItem
          label={strings.walletType}
          value={intl.formatMessage(getWalletType(wallet.walletImplementationId))}
        />
      </SettingsSection>
    </ScrollView>
  )
}

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

const LogoutButton = () => {
  const strings = useStrings()
  const logout = useLogout()

  return <PressableSettingsItem label={strings.logout} onPress={logout} />
}

const ResyncButton = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {navigateToTxHistory} = useWalletNavigation()
  const intl = useIntl()
  const {resync, isLoading} = useResync(wallet, {
    onMutate: () => navigateToTxHistory(),
  })

  const onResync = async () => {
    const selection = await showConfirmationDialog(confirmationMessages.resync, intl)
    if (selection === DIALOG_BUTTONS.YES) {
      resync()
    }
  }

  return <PressableSettingsItem label={strings.resync} onPress={onResync} disabled={isLoading} />
}

const useLogout = () => {
  const {logout} = useAuth()
  const intl = useIntl()
  const setSelectedWallet = useSetSelectedWallet()
  const setSelectedWalletMeta = useSetSelectedWalletMeta()

  return async () => {
    const selection = await showConfirmationDialog(confirmationMessages.logout, intl)
    if (selection === DIALOG_BUTTONS.YES) {
      logout() // triggers navigation to login

      InteractionManager.runAfterInteractions(() => {
        setSelectedWallet(undefined)
        setSelectedWalletMeta(undefined)
      })
    }
  }
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
    id: 'global.network',
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
  resync: {
    id: 'components.settings.walletsettingscreen.resyncWallet',
    defaultMessage: '!!!Resync',
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
    resync: intl.formatMessage(messages.resync),
  }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#fff',
  },
})
