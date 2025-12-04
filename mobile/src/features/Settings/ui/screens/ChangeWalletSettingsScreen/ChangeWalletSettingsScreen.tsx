import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import {useAddressMode} from '@yoroi/wallet-manager'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {ScrollView} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useDisableEasyConfirmation} from '~/common/hooks/useDisableEasyConfirmation'
import {useAuth} from '~/features/Auth/context/AuthProvider'
import {useAuthSetting} from '~/features/Auth/hooks/useAuthSetting'
import {DIALOG_BUTTONS, showConfirmationDialog} from '~/kernel/dialogs'
import {confirmationMessages} from '~/kernel/i18n/messages/global'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {SettingsRouteNavigation} from '~/kernel/navigation/types'
import {Icon} from '~/ui/Icon'
import {SettingsSwitch} from '~/ui/SettingsSwitch/SettingsSwitch'

import {useIsPartialReadOnlyWallet} from '../../../hooks/useIsPartialReadOnlyWallet'
import {useNavigateTo} from '../../../hooks/useNavigateTo'
import {SettingsCollateralItem} from '../../navigation/SettingsCollateralItem'
import {
  NavigatedSettingsItem,
  SettingsBuildItem,
  SettingsItem,
  SettingsSection,
} from '../../shared/SettingsItems'

const dialogOptions = {
  resync: {
    title: confirmationMessages.resync.title,
    message: confirmationMessages.resync.message,
    btnNoLabel: confirmationMessages.resync.noButton,
    btnYesLabel: confirmationMessages.resync.yesButton,
  },
  logout: {
    title: confirmationMessages.logout.title,
    message: confirmationMessages.logout.message,
    btnNoLabel: confirmationMessages.logout.noButton,
    btnYesLabel: confirmationMessages.logout.yesButton,
  },
}

export const ChangeWalletSettingsScreen = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const {resetToWalletSelection, navigateToNotificationSettings} =
    useWalletNavigation()
  const authSetting = useAuthSetting()
  const addressMode = useAddressMode()
  const {wallet} = useSelectedWallet()
  const intl = useIntl()
  const {walletIdChanged} = useSetupWallet()

  const logout = useLogout()
  const settingsNavigation = useNavigation<SettingsRouteNavigation>()
  const {
    meta: {isEasyConfirmationEnabled, isHW, isReadOnly, implementation},
  } = useSelectedWallet()
  const navigateTo = useNavigateTo()
  const walletType = useWalletType(implementation)
  const {disableEasyConfirmation} = useDisableEasyConfirmation()
  const isPartialReadOnly = useIsPartialReadOnlyWallet()

  const handleOnToggleEasyConfirmation = () => {
    if (isEasyConfirmationEnabled) {
      disableEasyConfirmation()
    } else {
      navigateTo.enableEasyConfirmation()
    }
  }

  const iconProps = {
    color: p.gray_400,
    size: 23,
  }

  return (
    <SafeAreaView
      edges={['bottom', 'right', 'left']}
      style={[ta.bg_color_max, a.flex_1, a.pt_lg]}
    >
      <ScrollView
        bounces={false}
        style={a.flex_1}
        contentContainerStyle={[a.px_lg, a.gap_lg]}
      >
        <SettingsSection title={strings.settings.walletSettings.general}>
          <NavigatedSettingsItem
            icon={<Icon.WalletStack {...iconProps} />}
            label={strings.settings.walletSettings.switchWallet}
            onNavigate={resetToWalletSelection}
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

          {meta?.multisigMeta && (
            <NavigatedSettingsItem
              icon={<Icon.WalletStack {...iconProps} />}
              label="Multisig Wallet Details"
              onNavigate={() =>
                settingsNavigation.navigate('multisig-wallet-details')
              }
            />
          )}
        </SettingsSection>

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
              onValueChange={handleOnToggleEasyConfirmation}
              disabled={authSetting === 'pin' || isHW || isReadOnly}
            />
          </SettingsItem>
        </SettingsSection>

        {!isPartialReadOnly && (
          <SettingsSection title={strings.settings.walletSettings.shareWallet}>
            <NavigatedSettingsItem
              icon={<Icon.Share {...iconProps} />}
              label={strings.settings.walletSettings.shareWallet}
              onNavigate={() => navigateTo.shareWallet()}
            />
          </SettingsSection>
        )}

        <SettingsSection title={strings.settings.walletSettings.actions}>
          <NavigatedSettingsItem
            icon={<Icon.CrossCircle {...iconProps} />}
            label={strings.settings.walletSettings.removeWallet}
            onNavigate={() => settingsNavigation.navigate('remove-wallet')}
          />

          <NavigatedSettingsItem
            icon={<Icon.Resync {...iconProps} />}
            label={strings.settings.walletSettings.resync}
            onNavigate={async () => {
              const selection = await showConfirmationDialog(
                dialogOptions.resync,
                intl,
              )
              if (selection === DIALOG_BUTTONS.YES) {
                logger.info('resync', {
                  origin: 'ChangeWalletSettingsScreen',
                  walletId: wallet.id,
                })
                walletIdChanged(wallet.id)
                await wallet.clear()
                settingsNavigation.navigate('settings-preparing-wallet')
              }
            }}
          />

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

        <SettingsSection title={strings.settings.notifications}>
          <NavigatedSettingsItem
            icon={<Icon.Bell {...iconProps} />}
            label={strings.settings.notifications}
            onNavigate={() => navigateToNotificationSettings()}
          />
        </SettingsSection>

        <SettingsSection title={strings.settings.walletSettings.about}>
          <SettingsBuildItem
            label={strings.settings.walletSettings.walletType}
            value={walletType}
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  )
}

const useWalletType = (implementation: Wallet.Implementation): string => {
  const strings = useStrings()
  if (implementation === 'cardano-bip44')
    return strings.settings.walletSettings.byronWallet
  if (implementation === 'cardano-cip1852')
    return strings.settings.walletSettings.shelleyWallet

  return strings.settings.walletSettings.unknownWalletType
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
    const selection = await showConfirmationDialog(dialogOptions.logout, intl)
    if (selection === DIALOG_BUTTONS.YES) {
      loggedOut()
    }
  }
}
