import {useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import React from 'react'
import type {MessageDescriptor} from 'react-intl'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {
  DIALOG_BUTTONS,
  showConfirmationDialog,
} from '../../../../kernel/dialogs'
import {confirmationMessages} from '../../../../kernel/i18n/global-messages'
import {
  SettingsRouteNavigation,
  useWalletNavigation,
} from '../../../../kernel/navigation/navigation'
import {Icon} from '../../../../ui/Icon'
import {SettingsSwitch} from '../../../../ui/SettingsSwitch/SettingsSwitch'
import {Space} from '../../../../ui/Space/Space'
import {useResync} from '../../../../wallets/hooks'
import {useAuth} from '../../../Auth/context/AuthProvider'
import {useAuthSetting} from '../../../Auth/hooks'
import {useAddressMode} from '../../../WalletManager/hooks/useAddressMode'
import {useSelectedWallet} from '../../../WalletManager/hooks/useSelectedWallet'
import {useNavigateTo} from '../../common/navigation'
import {SettingsCollateralItem} from '../../SettingsCollateralItem'
import {
  NavigatedSettingsItem,
  SettingsBuildItem,
  SettingsItem,
  SettingsSection,
} from '../../SettingsItems'

export const WalletSettingsScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const {resetToWalletSelection, navigateToNotificationSettings} =
    useWalletNavigation()
  const authSetting = useAuthSetting()
  const addressMode = useAddressMode()

  const logout = useLogout()
  const settingsNavigation = useNavigation<SettingsRouteNavigation>()
  const {
    meta: {isEasyConfirmationEnabled, isHW, isReadOnly, implementation},
  } = useSelectedWallet()
  const navigateTo = useNavigateTo()

  const onToggleEasyConfirmation = () => {
    if (isEasyConfirmationEnabled) {
      navigateTo.disableEasyConfirmation()
    } else {
      navigateTo.enableEasyConfirmation()
    }
  }

  const onSwitchWallet = () => {
    resetToWalletSelection()
  }

  const iconProps = {
    color: p.gray_400,
    size: 23,
  }

  return (
    <SafeAreaView
      edges={['bottom', 'right', 'left']}
      style={[a.flex_row, ta.bg_color_max]}
    >
      <ScrollView bounces={false} style={[a.flex_1, a.p_lg]}>
        <SettingsSection title={strings.general}>
          <NavigatedSettingsItem
            icon={<Icon.WalletStack {...iconProps} />}
            label={strings.switchWallet}
            onNavigate={onSwitchWallet}
          />

          <NavigatedSettingsItem
            icon={<Icon.Logout {...iconProps} />}
            label={strings.logout}
            onNavigate={logout}
          />

          <NavigatedSettingsItem
            icon={<Icon.Wallet {...iconProps} />}
            label={strings.walletName}
            onNavigate={() => settingsNavigation.navigate('change-wallet-name')}
          />
        </SettingsSection>

        <Space.Height.xl />

        <SettingsSection title={strings.security}>
          <NavigatedSettingsItem
            icon={<Icon.Lock {...iconProps} />}
            label={strings.changePassword}
            onNavigate={() => settingsNavigation.navigate('change-password')}
            disabled={isReadOnly || isHW}
          />

          <SettingsItem
            icon={<Icon.Bio {...iconProps} />}
            label={strings.easyConfirmation}
            info={strings.easyConfirmationInfo}
            disabled={authSetting === 'pin' || isHW || isReadOnly}
          >
            <SettingsSwitch
              value={isEasyConfirmationEnabled}
              onValueChange={onToggleEasyConfirmation}
              disabled={authSetting === 'pin' || isHW || isReadOnly}
            />
          </SettingsItem>
        </SettingsSection>

        <Space.Height.xl />

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
          >
            <AddressModeSwitcher isSingle={addressMode.isSingle} />
          </SettingsItem>
        </SettingsSection>

        <Space.Height.xl />

        <SettingsSection title={strings.notifications}>
          <NavigatedSettingsItem
            icon={<Icon.Bell {...iconProps} />}
            label={strings.notifications}
            onNavigate={() => navigateToNotificationSettings()}
          />
        </SettingsSection>

        <Space.Height.xl />

        <SettingsSection title={strings.about}>
          <SettingsBuildItem
            label={strings.walletType}
            value={intl.formatMessage(getWalletType(implementation))}
          />
        </SettingsSection>

        <Space.Height.xl />
      </ScrollView>
    </SafeAreaView>
  )
}

const getWalletType = (
  implementation: Wallet.Implementation,
): MessageDescriptor => {
  if (implementation === 'cardano-bip44') return messages.byronWallet
  if (implementation === 'cardano-cip1852') return messages.shelleyWallet

  return messages.unknownWalletType
}

const ResyncButton = () => {
  const {wallet} = useSelectedWallet()
  const {palette: p} = useTheme()
  const strings = useStrings()
  const intl = useIntl()

  const {walletIdChanged} = useSetupWallet()
  const settingsNavigation = useNavigation<SettingsRouteNavigation>()
  const {resync, isLoading} = useResync(wallet, {
    onMutate: () => {
      settingsNavigation.navigate('settings-preparing-wallet')
    },
  })

  const onResync = async () => {
    const selection = await showConfirmationDialog(
      confirmationMessages.resync,
      intl,
    )
    if (selection === DIALOG_BUTTONS.YES) {
      walletIdChanged(wallet.id)
      resync()
    }
  }

  const iconProps = {
    color: p.gray_400,
    size: 23,
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
  const addressMode = useAddressMode()
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
    <SettingsSwitch
      value={!isSingleLocal}
      onValueChange={handleOnSwitchAddressMode}
    />
  )
}

const useLogout = () => {
  const {loggedOut} = useAuth()
  const intl = useIntl()

  return async () => {
    const selection = await showConfirmationDialog(
      confirmationMessages.logout,
      intl,
    )
    if (selection === DIALOG_BUTTONS.YES) {
      loggedOut() // triggers navigation to login
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
  easyConfirmationInfo: {
    id: 'components.settings.walletsettingscreen.easyConfirmationInfo',
    defaultMessage:
      '!!!Skip the password and approve transactions with biometrics',
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
    defaultMessage:
      '!!!By enabling this you can operate with more wallet addresses',
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
  inAppNotifications: {
    id: 'components.settings.walletsettingscreen.inAppNotifications',
    defaultMessage: '!!!In-app notifications',
  },
  allowNotifications: {
    id: 'components.settings.walletsettingscreen.allowNotifications',
    defaultMessage: '!!!Allow notifications',
  },
  displayDuration: {
    id: 'components.settings.walletsettingscreen.displayDuration',
    defaultMessage: '!!!Display duration',
  },
  notifications: {
    id: 'components.settings.walletsettingscreen.notifications',
    defaultMessage: '!!!Notifications',
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
    easyConfirmationInfo: intl.formatMessage(messages.easyConfirmationInfo),
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
    inAppNotifications: intl.formatMessage(messages.inAppNotifications),
    allowNotifications: intl.formatMessage(messages.allowNotifications),
    displayDuration: intl.formatMessage(messages.displayDuration),
    notifications: intl.formatMessage(messages.notifications),
  }
}
