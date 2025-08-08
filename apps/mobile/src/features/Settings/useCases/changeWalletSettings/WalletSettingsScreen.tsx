import {useNavigation} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Alert, ScrollView, Text, TouchableOpacity, View} from 'react-native'

import {
  NavigatedSettingsItem,
  SettingsItem,
  SettingsSection,
} from '~/features/Settings/SettingsItems'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {SettingsRouteNavigation} from '~/kernel/navigation/types'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'

export const WalletSettingsScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {wallet, meta} = useSelectedWallet()
  const {walletManager} = useWalletManager()
  const {resetToWalletSelection} = useWalletNavigation()
  const {track} = useMetrics()
  const navigation = useNavigation<SettingsRouteNavigation>()

  const onToggleEasyConfirmation = () => {
    if (meta.isEasyConfirmationEnabled) {
      navigation.navigate('disable-easy-confirmation')
    } else {
      navigation.navigate('enable-easy-confirmation')
    }
  }

  const onSwitchWallet = () => {
    resetToWalletSelection()
  }

  const onLogout = () => {
    Alert.alert(
      strings.settings.walletSettings.logout,
      strings.settings.walletSettings.logout,
      [
        {
          text: strings.settings.walletSettings.logout,
          onPress: () => {
            walletManager.removeWallet(wallet.id)
            resetToWalletSelection()
          },
        },
        {
          text: strings.global.cancel,
          style: 'cancel',
        },
      ],
    )
  }

  const onResync = () => {
    Alert.alert(
      strings.settings.walletSettings.resync,
      strings.settings.walletSettings.resync,
      [
        {
          text: strings.global.cancel,
          style: 'cancel',
        },
        {
          text: strings.settings.walletSettings.resync,
          onPress: async () => {
            try {
              await wallet.sync({isForced: true})
              track.settingsPageViewed()
            } catch (error) {
              console.error('Resync failed:', error)
            }
          },
        },
      ],
    )
  }

  const getWalletType = (implementation: string): string => {
    switch (implementation) {
      case 'byron':
        return strings.settings.walletSettings.byronWallet
      case 'shelley':
        return strings.settings.walletSettings.shelleyWallet
      default:
        return strings.settings.walletSettings.unknownWalletType
    }
  }

  return (
    <ScrollView style={[a.flex_1, {backgroundColor: p.bg_color_max}]}>
      <View style={[a.p_lg, a.gap_lg]}>
        <SettingsSection title={strings.settings.walletSettings.general}>
          <SettingsItem
            label={strings.settings.walletSettings.walletName}
            icon={<Icon.Wallet size={24} color={p.gray_600} />}
          >
            <View style={[a.flex_row, a.align_center]}>
              <Text style={[a.body_1_lg_regular, {color: p.gray_500}]}>
                {meta.name}
              </Text>
              <Space.Width.md />
              <Icon.Chevron direction="right" size={28} color={p.el_gray_min} />
            </View>
          </SettingsItem>

          <SettingsItem
            label={strings.settings.walletSettings.network}
            icon={<Icon.Cardano size={24} color={p.gray_600} />}
          >
            <View style={[a.flex_row, a.align_center]}>
              <Text style={[a.body_1_lg_regular, {color: p.gray_500}]}>
                {meta.implementation}
              </Text>
              <Space.Width.md />
              <Icon.Chevron direction="right" size={28} color={p.el_gray_min} />
            </View>
          </SettingsItem>

          <SettingsItem
            label={strings.settings.walletSettings.walletType}
            icon={<Icon.WalletStack size={24} color={p.gray_600} />}
          >
            <View style={[a.flex_row, a.align_center]}>
              <Text style={[a.body_1_lg_regular, {color: p.gray_500}]}>
                {getWalletType(meta.implementation)}
              </Text>
              <Space.Width.md />
              <Icon.Chevron direction="right" size={28} color={p.el_gray_min} />
            </View>
          </SettingsItem>
        </SettingsSection>

        <SettingsSection title={strings.settings.walletSettings.security}>
          <NavigatedSettingsItem
            label={strings.settings.walletSettings.changePassword}
            onNavigate={() => navigation.navigate('change-password')}
            icon={<Icon.Lock size={24} color={p.gray_600} />}
          />

          <TouchableOpacity onPress={onToggleEasyConfirmation}>
            <SettingsItem
              label={strings.settings.walletSettings.easyConfirmation}
              info={strings.settings.walletSettings.easyConfirmationInfo}
              icon={<Icon.Pin size={24} color={p.gray_600} />}
            >
              <View style={[a.flex_row, a.align_center]}>
                <Icon.Chevron
                  direction="right"
                  size={28}
                  color={p.el_gray_min}
                />
              </View>
            </SettingsItem>
          </TouchableOpacity>
        </SettingsSection>

        <SettingsSection title={strings.settings.walletSettings.actions}>
          <TouchableOpacity onPress={onSwitchWallet}>
            <SettingsItem
              label={strings.settings.walletSettings.switchWallet}
              icon={<Icon.Switch size={24} color={p.gray_600} />}
            >
              <View style={[a.flex_row, a.align_center]}>
                <Icon.Chevron
                  direction="right"
                  size={28}
                  color={p.el_gray_min}
                />
              </View>
            </SettingsItem>
          </TouchableOpacity>

          <NavigatedSettingsItem
            label={strings.settings.walletSettings.removeWallet}
            onNavigate={() => navigation.navigate('remove-wallet')}
            icon={<Icon.Delete size={24} color={p.gray_600} />}
          />

          <NavigatedSettingsItem
            label={strings.settings.walletSettings.about}
            onNavigate={() => navigation.navigate('about')}
            icon={<Icon.Info size={24} color={p.gray_600} />}
          />

          <TouchableOpacity onPress={onResync}>
            <SettingsItem
              label={strings.settings.walletSettings.resync}
              icon={<Icon.Resync size={24} color={p.gray_600} />}
            >
              <View style={[a.flex_row, a.align_center]}>
                <Icon.Chevron
                  direction="right"
                  size={28}
                  color={p.el_gray_min}
                />
              </View>
            </SettingsItem>
          </TouchableOpacity>
        </SettingsSection>

        <SettingsSection title={strings.settings.walletSettings.notifications}>
          <NavigatedSettingsItem
            label={strings.settings.walletSettings.inAppNotifications}
            onNavigate={() => navigation.navigate('manage-notifications')}
            icon={<Icon.Bell size={24} color={p.gray_600} />}
          />

          <NavigatedSettingsItem
            label={strings.settings.walletSettings.displayDuration}
            onNavigate={() =>
              navigation.navigate('manage-notifications', {
                screen: 'manage-notification-display-duration',
              })
            }
            icon={<Icon.Time size={24} color={p.gray_600} />}
          />
        </SettingsSection>

        <SettingsSection title={strings.settings.walletSettings.collateral}>
          <NavigatedSettingsItem
            label={strings.settings.walletSettings.multipleAddresses}
            onNavigate={() => navigation.navigate('manage-collateral')}
            icon={<Icon.Collateral size={24} color={p.gray_600} />}
          />

          <NavigatedSettingsItem
            label={strings.settings.walletSettings.singleAddress}
            onNavigate={() => navigation.navigate('manage-collateral')}
            icon={<Icon.Wallet size={24} color={p.gray_600} />}
          />
        </SettingsSection>

        <Space.Height.lg />

        <Button
          title={strings.settings.walletSettings.logout}
          onPress={onLogout}
        />
      </View>
    </ScrollView>
  )
}
