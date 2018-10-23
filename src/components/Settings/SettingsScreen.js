// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View} from 'react-native'

import Screen from '../../components/Screen'
import {SETTINGS_ROUTES} from '../../RoutesList'
import SettingsItemWithNavigation from './SettingsItemWithNavigation'
import SettingsLabelWithNavigation from './SettingsLabelWithNavigation'

import styles from './styles/SettingsScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslation = (state) => state.trans.settings


type Props = {
  navigateToChangeWalletName: () => void,
  navigateToSupport: () => void,
  translation: SubTranslation<typeof getTranslation>,
};

const SettingsScreen = ({
  navigateToChangeWalletName,
  navigateToSupport,
  translation,
}: Props) => (
  <View style={styles.root}>
    <Screen scroll>
      <SettingsItemWithNavigation
        label={translation.walletName}
        text={'getWalletName()'}
        navigateTo={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
      />

      <SettingsItemWithNavigation
        label={translation.privacy}
        text={translation.changePin}
        navigateTo={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
      />

      <SettingsItemWithNavigation
        label={''}
        text={translation.changePassword}
        navigateTo={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
      />

      <SettingsItemWithNavigation
        label={translation.downloadLogs}
        text={translation.downloadLogsText}
        navigateTo={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
      />

      <SettingsLabelWithNavigation
        label={translation.removeWallet}
        navigateTo={SETTINGS_ROUTES.SUPPORT}
      />

      <SettingsItemWithNavigation
        label={translation.language}
        text={'getLanguage()'}
        navigateTo={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
      />

      <SettingsLabelWithNavigation
        label={translation.termsOfUse}
        navigateTo={SETTINGS_ROUTES.SUPPORT}
      />

      <SettingsLabelWithNavigation
        label={translation.support}
        navigateTo={SETTINGS_ROUTES.SUPPORT}
      />
    </Screen>
  </View>
)

export default compose(
  connect((state) => ({
    translation: getTranslation(state),
  })),
)(SettingsScreen)
