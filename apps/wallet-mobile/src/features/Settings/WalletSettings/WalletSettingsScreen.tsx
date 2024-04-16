import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import type {MessageDescriptor} from 'react-intl'
import {defineMessages, useIntl} from 'react-intl'
import {InteractionManager, ScrollView, StyleSheet, Switch} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useAuth} from '../../../auth/AuthProvider'
import {Icon, Spacer} from '../../../components'
import {DIALOG_BUTTONS, showConfirmationDialog} from '../../../dialogs'
import {confirmationMessages} from '../../../i18n/global-messages'
import {SettingsRouteNavigation, useWalletNavigation} from '../../../navigation'
import {lightPalette} from '../../../theme'
import {useAddressModeManager} from '../../../wallet-manager/useAddressModeManager'
import {useAuthSetting} from '../../../yoroi-wallets/auth'
import {getNetworkConfigById} from '../../../yoroi-wallets/cardano/networks'
import {isByron, isHaskellShelley} from '../../../yoroi-wallets/cardano/utils'
import {useEasyConfirmationEnabled, useResync} from '../../../yoroi-wallets/hooks'
import {NetworkId, WalletImplementationId} from '../../../yoroi-wallets/types'
import {useSelectedWallet, useSetSelectedWallet} from '../../WalletManager/Context/SelectedWalletContext'
import {useSetSelectedWalletMeta} from '../../WalletManager/Context/SelectedWalletMetaContext'
import {useNavigateTo} from '../common/navigation'
import {
  NavigatedSettingsItem,
  SettingsBuildItem,
  SettingsCollateralItem,
  SettingsItem,
  SettingsSection,
} from '../SettingsItems'

const iconProps = {
  color: lightPalette.gray['600'],
  size: 23,
}

export const WalletSettingsScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
  const styles = useStyles()
  const {resetToWalletSelection} = useWalletNavigation()
  const wallet = useSelectedWallet()
  const authSetting = useAuthSetting()
  const addressMode = useAddressModeManager()

  const logout = useLogout()
  const settingsNavigation = useNavigation<SettingsRouteNavigation>()
  const easyConfirmationEnabled = useEasyConfirmationEnabled(wallet)
  const navigateTo = useNavigateTo()

  const onToggleEasyConfirmation = () => {
    if (easyConfirmationEnabled) {
      navigateTo.disableEasyConfirmation()
    } else {
      navigateTo.enableEasyConfirmation()
    }
  }

  const onSwitchWallet = () => {
    resetToWalletSelection()
  }

  return (
    <SafeAreaView edges={['bottom', 'right', 'left']} style={styles.root}>
      <ScrollView bounces={false} style={styles.settings}>
        <SettingsSection title={strings.general}>
          <NavigatedSettingsItem
            icon={<Icon.WalletStack {...iconProps} />}
            label={strings.switchWallet}
            onNavigate={onSwitchWallet}
          />

          <NavigatedSettingsItem icon={<Icon.Logout {...iconProps} />} label={strings.logout} onNavigate={logout} />

          <NavigatedSettingsItem
            icon={<Icon.Wallet {...iconProps} />}
            label={strings.walletName}
            onNavigate={() => settingsNavigation.navigate('change-wallet-name')}
          />
        </SettingsSection>

        <Spacer height={24} />

        <SettingsSection title={strings.security}>
          <NavigatedSettingsItem
            icon={<Icon.Lock {...iconProps} />}
            label={strings.changePassword}
            onNavigate={() => settingsNavigation.navigate('change-password')}
            disabled={wallet.isReadOnly || wallet.isHW}
          />

          <SettingsItem
            icon={<Icon.Bio {...iconProps} />}
            label={strings.easyConfirmation}
            disabled={authSetting === 'pin' || wallet.isHW || wallet.isReadOnly}
          >
            <Switch
              value={easyConfirmationEnabled}
              onValueChange={onToggleEasyConfirmation}
              disabled={authSetting === 'pin' || wallet.isHW || wallet.isReadOnly}
            />
          </SettingsItem>
        </SettingsSection>

        <Spacer height={24} />

        <SettingsSection title={strings.actions}>
          <NavigatedSettingsItem
            icon={<Icon.CrossCircle {...iconProps} />}
            label={strings.removeWallet}
            onNavigate={() => settingsNavigation.navigate('remove-wallet')}
          />

          <ResyncButton />

          <SettingsCollateralItem
            icon={<Icon.Collateral {...iconProps} />}
            label={strings.collateral}
            onNavigate={() => settingsNavigation.navigate('manage-collateral')}
          />

          <SettingsItem
            icon={<Icon.Qr {...iconProps} />}
            label={strings.multipleAddresses}
            info={strings.multipleAddressesInfo}
            disabled={addressMode.isToggleLoading}
          >
            <AddressModeSwitcher isSingle={addressMode.isSingle} />
          </SettingsItem>
        </SettingsSection>

        <Spacer height={24} />

        <SettingsSection title={strings.about}>
          <SettingsBuildItem label={strings.network} value={getNetworkName(wallet.networkId)} />

          <SettingsBuildItem
            label={strings.walletType}
            value={intl.formatMessage(getWalletType(wallet.walletImplementationId))}
          />
        </SettingsSection>

        <Spacer height={24} />
      </ScrollView>
    </SafeAreaView>
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

  return (
    <NavigatedSettingsItem
      icon={<Icon.Resync {...iconProps} />}
      label={strings.resync}
      onNavigate={onResync}
      disabled={isLoading}
    />
  )
}

const AddressModeSwitcher = (props: {isSingle: boolean}) => {
  const addressMode = useAddressModeManager()
  const [isSingleLocal, setIsSingleLocal] = React.useState(props.isSingle)

  const handleOnSwitchAddressMode = () => {
    setIsSingleLocal((prevState) => {
      if (prevState) {
        addressMode.enableMultipleMode()
      } else {
        addressMode.enableSingleMode()
      }

      return !prevState
    })
  }

  return (
    <Switch value={!isSingleLocal} onValueChange={handleOnSwitchAddressMode} disabled={addressMode.isToggleLoading} />
  )
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
  general: {
    id: 'components.settings.walletsettingscreen.general',
    defaultMessage: '!!!General',
  },
  actions: {
    id: 'components.settings.walletsettingscreen.actions',
    defaultMessage: '!!!Actions',
  },
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
    defaultMessage: '!!!Change spending password',
  },
  easyConfirmation: {
    id: 'components.settings.walletsettingscreen.easyConfirmation',
    defaultMessage: '!!!Easy transaction confirmation',
  },
  removeWallet: {
    id: 'components.settings.walletsettingscreen.removeWallet',
    defaultMessage: '!!!Remove wallet',
  },
  collateral: {
    id: 'global.collateral',
    defaultMessage: '!!!Collateral',
  },
  multipleAddresses: {
    id: 'global.multipleAddresses',
    defaultMessage: '!!!Multiple addresses',
  },
  singleAddress: {
    id: 'global.singleAddress',
    defaultMessage: '!!!Single address',
  },
  multipleAddressesInfo: {
    id: 'global.multipleAddressesInfo',
    defaultMessage: '!!!By enabling this you can operate with more wallet addresses',
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
    general: intl.formatMessage(messages.general),
    actions: intl.formatMessage(messages.actions),
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
    collateral: intl.formatMessage(messages.collateral),
    multipleAddresses: intl.formatMessage(messages.multipleAddresses),
    singleAddress: intl.formatMessage(messages.singleAddress),
    multipleAddressesInfo: intl.formatMessage(messages.multipleAddressesInfo),
  }
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.gray.min,
    },
    settings: {
      flex: 1,
      padding: 16,
    },
  })
  return styles
}
