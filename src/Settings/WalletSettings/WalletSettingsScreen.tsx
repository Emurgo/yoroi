import React from 'react'
import type {MessageDescriptor} from 'react-intl'
import {defineMessages, useIntl} from 'react-intl'
import {InteractionManager, ScrollView, StyleSheet, Switch, View} from 'react-native'
import {ActivityIndicator} from 'react-native-paper'
import {UseMutationOptions} from 'react-query'
import {useSelector} from 'react-redux'

import {useAuth} from '../../auth/AuthProvider'
import {StatusBar} from '../../components'
import {useCloseWallet, useEasyConfirmationEnabled, useResync, useWalletName} from '../../hooks'
import {confirmationMessages} from '../../i18n/global-messages'
import {DIALOG_BUTTONS, showConfirmationDialog} from '../../legacy/actions'
import {isByron, isHaskellShelley} from '../../legacy/config'
import {getNetworkConfigById} from '../../legacy/networks'
import {isSystemAuthEnabledSelector} from '../../legacy/selectors'
import {useWalletNavigation} from '../../navigation'
import {useSelectedWallet, useSetSelectedWallet, useSetSelectedWalletMeta} from '../../SelectedWallet'
import {NetworkId, WalletImplementationId} from '../../yoroi-wallets'
import {
  NavigatedSettingsItem,
  PressableSettingsItem,
  SettingsBuildItem,
  SettingsItem,
  SettingsSection,
} from '../SettingsItems'

export const WalletSettingsScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
  const {navigation, resetToWalletSelection, resetToTxHistory} = useWalletNavigation()
  const isSystemAuthEnabled = useSelector(isSystemAuthEnabledSelector)
  const wallet = useSelectedWallet()
  const walletName = useWalletName(wallet)
  const easyConfirmationEnabled = useEasyConfirmationEnabled(wallet)
  const {resync, isLoading: isResyncLoading} = useResync(wallet, {
    onSuccess: () => resetToTxHistory(),
  })

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

  const onResync = async () => {
    const selection = await showConfirmationDialog(confirmationMessages.resync, intl)
    if (selection === DIALOG_BUTTONS.YES) {
      resync()
    }
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
          disabled={!isSystemAuthEnabled || wallet.isHW || wallet.isReadOnly}
        >
          <Switch
            value={easyConfirmationEnabled}
            onValueChange={easyConfirmationEnabled ? onDisableEasyConfirmation : onEnableEasyConfirmation}
            disabled={!isSystemAuthEnabled || wallet.isHW || wallet.isReadOnly}
          />
        </SettingsItem>
      </SettingsSection>

      <SettingsSection>
        <NavigatedSettingsItem label={strings.removeWallet} navigateTo="remove-wallet" />
        <ResyncButton onClick={onResync} isLoading={isResyncLoading} />
      </SettingsSection>

      <SettingsSection title={strings.about}>
        <SettingsBuildItem label={strings.network} value={getNetworkName(wallet.networkId)} />

        <SettingsBuildItem
          label={strings.walletType}
          value={intl.formatMessage(getWalletType(wallet.walletImplementationId))}
        />
      </SettingsSection>
      <LoadingOverlay loading={isResyncLoading} />
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
  const {logoutWithConfirmation, isLoading} = useLogout()

  return <PressableSettingsItem label={strings.logout} onPress={logoutWithConfirmation} disabled={isLoading} />
}

const ResyncButton = ({onClick, isLoading}: {onClick: () => void; isLoading: boolean}) => {
  const strings = useStrings()

  return <PressableSettingsItem label={strings.resync} onPress={onClick} disabled={isLoading} />
}

const LoadingOverlay = ({loading}: {loading: boolean}) => {
  return loading ? (
    <View style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, styles.loadingOverlayBackground]} />

      <View style={[StyleSheet.absoluteFill, styles.loadingOverlayIcon]}>
        <ActivityIndicator animating size="large" color="black" />
      </View>
    </View>
  ) : null
}

const useLogout = (options?: UseMutationOptions<void, Error>) => {
  const {logout} = useAuth()
  const intl = useIntl()
  const setSelectedWallet = useSetSelectedWallet()
  const setSelectedWalletMeta = useSetSelectedWalletMeta()
  const {closeWallet, ...mutation} = useCloseWallet({
    onSuccess: () => {
      setSelectedWallet(undefined)
      setSelectedWalletMeta(undefined)
    },
    ...options,
  })

  return {
    logout: () => {
      logout() // triggers navigation to login
      InteractionManager.runAfterInteractions(() => {
        closeWallet()
      })
    },
    logoutWithConfirmation: async () => {
      const selection = await showConfirmationDialog(confirmationMessages.logout, intl)
      if (selection === DIALOG_BUTTONS.YES) {
        logout() // triggers navigation to login
        InteractionManager.runAfterInteractions(() => {
          closeWallet()
        })
      }
    },
    ...mutation,
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
  loadingOverlayBackground: {
    opacity: 0.5,
  },
  loadingOverlayIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
