import {useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import React from 'react'
import {useIntl} from 'react-intl'
import {ScrollView} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useAuth} from '~/features/Auth/context/AuthProvider'
import {useAuthSetting} from '~/features/Auth/hooks/useAuthSetting'
import {useAddressMode} from '~/features/WalletManager/hooks/useAddressMode'
import {useResync} from '~/features/WalletManager/hooks/useResync'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {DIALOG_BUTTONS, showConfirmationDialog} from '~/kernel/dialogs'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {SettingsRouteNavigation} from '~/kernel/navigation/types'
import {Icon} from '~/ui/Icon'
import {SettingsSwitch} from '~/ui/SettingsSwitch/SettingsSwitch'
import {Space} from '~/ui/Space/Space'
import {useNavigateTo} from '../../common/navigation'
import {SettingsCollateralItem} from '../../SettingsCollateralItem'
import {
  NavigatedSettingsItem,
  SettingsBuildItem,
  SettingsItem,
  SettingsSection,
} from '../../SettingsItems'

export const WalletSettingsScreen = () => {
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
        <SettingsSection title={strings.settings.walletSettings.general}>
          <NavigatedSettingsItem
            icon={<Icon.WalletStack {...iconProps} />}
            label={strings.settings.walletSettings.switchWallet}
            onNavigate={onSwitchWallet}
          />

          <NavigatedSettingsItem
            icon={<Icon.Logout {...iconProps} />}
            label={strings.settings.walletSettings.logout}
            onNavigate={logout}
          />

          <NavigatedSettingsItem
            icon={<Icon.Wallet {...iconProps} />}
            label={strings.settings.walletSettings.walletName}
            onNavigate={() => settingsNavigation.navigate('change-wallet-name')}
          />
        </SettingsSection>

        <Space.Height.xl />

        <SettingsSection title={strings.settings.walletSettings.security}>
          <NavigatedSettingsItem
            icon={<Icon.Lock {...iconProps} />}
            label={strings.settings.walletSettings.changePassword}
            onNavigate={() => settingsNavigation.navigate('change-password')}
            disabled={isReadOnly || isHW}
          />

          <SettingsItem
            icon={<Icon.Bio {...iconProps} />}
            label={strings.settings.walletSettings.easyConfirmation}
            info={strings.settings.walletSettings.easyConfirmationInfo}
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

        <SettingsSection title={strings.settings.walletSettings.actions}>
          <NavigatedSettingsItem
            icon={<Icon.CrossCircle {...iconProps} />}
            label={strings.settings.walletSettings.removeWallet}
            onNavigate={() => settingsNavigation.navigate('remove-wallet')}
          />

          <ResyncButton />

          <SettingsCollateralItem
            icon={<Icon.Collateral {...iconProps} />}
            label={strings.settings.walletSettings.collateral}
            onNavigate={() => settingsNavigation.navigate('manage-collateral')}
          />

          <SettingsItem
            icon={<Icon.Qr {...iconProps} />}
            label={strings.settings.walletSettings.multipleAddresses}
            info={strings.settings.walletSettings.multipleAddressesInfo}
          >
            <AddressModeSwitcher isSingle={addressMode.isSingle} />
          </SettingsItem>
        </SettingsSection>

        <Space.Height.xl />

        <SettingsSection title={strings.settings.notifications}>
          <NavigatedSettingsItem
            icon={<Icon.Bell {...iconProps} />}
            label={strings.settings.notifications}
            onNavigate={() => navigateToNotificationSettings()}
          />
        </SettingsSection>

        <Space.Height.xl />

        <SettingsSection title={strings.settings.walletSettings.about}>
          <SettingsBuildItem
            label={strings.settings.walletSettings.walletType}
            value={getWalletType(implementation)}
          />
        </SettingsSection>

        <Space.Height.xl />
      </ScrollView>
    </SafeAreaView>
  )
}

const getWalletType = (implementation: Wallet.Implementation): string => {
  const strings = useStrings()
  if (implementation === 'cardano-bip44')
    return strings.settings.walletSettings.byronWallet
  if (implementation === 'cardano-cip1852')
    return strings.settings.walletSettings.shelleyWallet

  return strings.settings.walletSettings.unknownWalletType
}

const ResyncButton = () => {
  const {wallet} = useSelectedWallet()
  const {palette: p} = useTheme()
  const strings = useStrings()
  const intl = useIntl()

  const {walletIdChanged} = useSetupWallet()
  const settingsNavigation = useNavigation<SettingsRouteNavigation>()
  const {resync, isPending} = useResync(wallet, {
    onMutate: () => {
      settingsNavigation.navigate('settings-preparing-wallet')
    },
  })

  const {track} = useMetrics()

  const onResync = async () => {
    // track.walletSettingsResyncClicked()
    const selection = await showConfirmationDialog(
      {
        title: strings.global.confirmationMessages.title,
        message: strings.global.confirmationMessages.message,
        btnNoLabel: strings.global.confirmationMessages.noButton,
        btnYesLabel: strings.global.confirmationMessages.yesButton,
      },
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
      label={strings.settings.walletSettings.resync}
      onNavigate={onResync}
      disabled={isPending}
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
  const strings = useStrings()

  return async () => {
    const selection = await showConfirmationDialog(
      {
        title: strings.global.confirmationMessages.title,
        message: strings.global.confirmationMessages.message,
        btnNoLabel: strings.global.confirmationMessages.noButton,
        btnYesLabel: strings.global.confirmationMessages.yesButton,
      },
      intl,
    )
    if (selection === DIALOG_BUTTONS.YES) {
      loggedOut() // triggers navigation to login
    }
  }
}
