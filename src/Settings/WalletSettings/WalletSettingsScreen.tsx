import React from 'react'
import type {MessageDescriptor} from 'react-intl'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, Switch} from 'react-native'
import {useMutation, UseMutationOptions} from 'react-query'
import {useDispatch, useSelector} from 'react-redux'

import {StatusBar} from '../../components'
import {useCloseWallet, useWalletName} from '../../hooks'
import {confirmationMessages} from '../../i18n/global-messages'
import {DIALOG_BUTTONS, showConfirmationDialog, signout} from '../../legacy/actions'
import {isByron, isHaskellShelley} from '../../legacy/config'
import {getNetworkConfigById} from '../../legacy/networks'
import {easyConfirmationSelector, isSystemAuthEnabledSelector} from '../../legacy/selectors'
import {useWalletNavigation} from '../../navigation'
import {useSelectedWallet, useSetSelectedWallet, useSetSelectedWalletMeta} from '../../SelectedWallet'
import {NetworkId, WalletImplementationId, walletManager} from '../../yoroi-wallets'
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
  const {navigation, resetToWalletSelection} = useWalletNavigation()
  const isSystemAuthEnabled = useSelector(isSystemAuthEnabledSelector)
  const isEasyConfirmationEnabled = useSelector(easyConfirmationSelector)
  const wallet = useSelectedWallet()
  const walletName = useWalletName(wallet)

  const onSwitchWallet = () => {
    resetToWalletSelection()
  }

  const onToggleEasyConfirmation = () => {
    navigation.navigate('app-root', {
      screen: 'settings',
      params: {
        screen: 'easy-confirmation',
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
        <NavigatedSettingsItem label={walletName || ''} navigateTo="change-wallet-name" />
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
            value={isEasyConfirmationEnabled}
            onValueChange={onToggleEasyConfirmation}
            disabled={!isSystemAuthEnabled || wallet.isHW || wallet.isReadOnly}
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

const useLogout = (options?: UseMutationOptions<void, Error>) => {
  const intl = useIntl()
  const dispatch = useDispatch()
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
      dispatch(signout()) // triggers navigation to login
      setTimeout(() => closeWallet(), 1000) // wait for navigation to finish
    },
    logoutWithConfirmation: async () => {
      const selection = await showConfirmationDialog(confirmationMessages.logout, intl)
      if (selection === DIALOG_BUTTONS.YES) {
        dispatch(signout()) // triggers navigation to login
        setTimeout(() => closeWallet(), 1000) // wait for navigation to finish
      }
    },
    ...mutation,
  }
}

const LogoutButton = () => {
  const strings = useStrings()
  const {logoutWithConfirmation, isLoading} = useLogout()

  return <PressableSettingsItem label={strings.logout} onPress={logoutWithConfirmation} disabled={isLoading} />
}

const useResync = (options?: UseMutationOptions<void, Error>) => {
  const intl = useIntl()
  const {resetToWalletSelection} = useWalletNavigation()
  const mutation = useMutation({
    mutationFn: () => walletManager.resyncWallet(),
    ...options,
  })

  return {
    resyncWithConfirmation: async () => {
      const selection = await showConfirmationDialog(confirmationMessages.resync, intl)
      if (selection === DIALOG_BUTTONS.YES) {
        resetToWalletSelection({reopen: true})
        setTimeout(() => {
          mutation.mutate()
        }, 200) // wait for navigation to finish
      }
    },
    ...mutation,
  }
}

const ResyncButton = () => {
  const strings = useStrings()
  const {resyncWithConfirmation, isLoading} = useResync()

  return <PressableSettingsItem label={strings.resync} onPress={resyncWithConfirmation} disabled={isLoading} />
}
